import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBusinessContent, generateSeoHeadline, generateSeoDescription, generateProductDescription } from '@/lib/gemini';
import { generateSlug, getStoreUrl } from '@/lib/utils';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const WA_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID!;

const AI_MAX_CREDITS = 2;

// Webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// Incoming messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: 'ok' });
    }

    const phoneNumber = message.from;
    const text = message.text?.body?.trim() || '';

    // Get or create session
    let session = await prisma.whatsappSession.upsert({
      where: { phoneNumber },
      create: { phoneNumber, step: 'start', collectedData: {} },
      update: { updatedAt: new Date() },
    });

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';
    const dummyEmail = `wa_${phoneNumber.replace('+', '')}@${rootDomain}`;

    const msgUpper = text.toUpperCase();

    // -- Global Command Interceptor --
    if (['DASHBOARD', 'RESET', 'MENU', 'HELP'].includes(msgUpper)) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: dummyEmail },
            { phoneNumber }
          ]
        },
        include: { businesses: true }
      });
      const existingBusiness = existingUser?.businesses?.[0];

      if (msgUpper === 'HELP') {
        const helpText = `🛠️ *DukaanHai Help Menu*\n\nHere are some main commands you can use at any time:\n\n*MENU* or *RESET* - Return to the main menu.\n*DASHBOARD* - Get a direct secure link to your store dashboard.\n*HELP* - View this help list.\n\n_Note: If you are creating a new site, please answer the questions directly._`;
        await sendWhatsAppMessage(phoneNumber, helpText);
        return NextResponse.json({ status: 'ok' });
      }

      if (msgUpper === 'DASHBOARD') {
        if (!existingUser) {
          await sendWhatsAppMessage(phoneNumber, `No account found. Please create your store first by typing *RESET*.`);
          return NextResponse.json({ status: 'ok' });
        }

        if (existingUser.password && existingUser.password.length > 0) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
          await sendWhatsAppMessage(phoneNumber, `You already have dashboard access.\n\nVisit: ${appUrl}/login`);
          return NextResponse.json({ status: 'ok' });
        }

        const crypto = await import('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.loginToken.create({
          data: { phoneNumber, token, expiresAt }
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
        await sendWhatsAppMessage(phoneNumber, `Click this secure link to access your dashboard:\n\n${appUrl}/dashboard-access?token=${token}\n\nThis link expires in 10 minutes.`);

        await prisma.whatsappSession.update({
          where: { phoneNumber },
          data: { step: 'completed' }
        });

        return NextResponse.json({ status: 'ok' });
      }

      if (msgUpper === 'RESET' || msgUpper === 'MENU') {
        if (existingBusiness) {
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'main_menu', collectedData: { businessId: existingBusiness.id } },
          });
          const replyText = `Welcome back! 🏪\n\nWhat would you like to change in your store?\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n5️⃣ Edit Website Template\n\nReply with 1, 2, 3, 4, or 5.`;
          await sendWhatsAppMessage(phoneNumber, `✅ Menu returned!\n\n${replyText}`);
          return NextResponse.json({ status: 'ok' });
        } else {
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'start', collectedData: {} },
          });
          await sendWhatsAppMessage(phoneNumber, `✅ Reset successful!\n\n*Please enter your new store name:*`);
          return NextResponse.json({ status: 'ok' });
        }
      }
    }

    // Detect Returning Users
    if (session.step === 'start') {
      const existingUser = await prisma.user.findFirst({
        where: { email: dummyEmail },
        include: { businesses: true }
      });
      const existingBusiness = existingUser?.businesses?.[0];

      if (existingBusiness) {
        session = await prisma.whatsappSession.update({
          where: { phoneNumber },
          data: { step: 'main_menu', collectedData: { businessId: existingBusiness.id } }
        });
        if (msgUpper !== 'RESET' && msgUpper !== 'MENU') {
          const replyText = `Welcome back! 🏪\n\nWhat would you like to change in your store?\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n5️⃣ Edit Website Template\n\nReply with 1, 2, 3, 4, or 5.`;
          await sendWhatsAppMessage(phoneNumber, replyText);
          return NextResponse.json({ status: 'ok' });
        }
      }
    }

    const collectedData = (session.collectedData as any) || {};

    let replyText = '';
    let nextStep = session.step;

    switch (session.step) {
      case 'start':
        replyText = `🙏 *Welcome to DukaanHai!*\n\nI will help you build your online store in just a minute! 🚀\n\n*Please enter your store name:*`;
        nextStep = 'collect_name';
        break;

      case 'main_menu':
        replyText = `Welcome back! 🏪\n\nWhat would you like to change in your store?\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n5️⃣ Edit Website Template\n\nReply with 1, 2, 3, 4, or 5.`;
        nextStep = 'handle_menu_choice';
        break;

      case 'handle_menu_choice':
        if (text === '1') {
          replyText = `✏️ Please send your new store tagline or description:`;
          nextStep = 'edit_store_desc';
        } else if (text === '2') {
          replyText = `Great! 📝 Enter your new product's *Name*:`;
          nextStep = 'collect_product_name';
        } else if (text === '3') {
          // Fetch products
          const products = await prisma.product.findMany({ where: { businessId: collectedData.businessId } });
          if (products.length === 0) {
            replyText = `You don't have any products in your store.\n\nType *MENU* to go back.`;
            nextStep = 'handle_menu_choice';
          } else {
            let pList = `Your Products:\n\n`;
            products.forEach((p, idx) => {
              pList += `${idx + 1}. ${p.name} (₹${p.price})\n`;
            });
            pList += `\nWhich product do you want to edit? (Reply with a number, e.g., 1)`;
            replyText = pList;
            collectedData.tmpProducts = products.map(p => p.id);
            nextStep = 'select_edit_product';
          }
        } else if (text === '4') {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
          replyText = `You can only create and manage one site via WhatsApp.\n\nTo create a new site, please log in to the website:\n${appUrl}/login\n\nType *MENU* to go back to the menu.`;
          nextStep = 'handle_menu_choice';
        } else if (text === '5') {
          const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
          replyText = `🎨 *Select a new template for your website:*\n\n1️⃣ *Minimal* - Clean & Elegant\n🔗 Demo: ${appDomain}/demo/minimal\n\n2️⃣ *Bold* - Vibrant & Energetic\n🔗 Demo: ${appDomain}/demo/bold\n\n3️⃣ *Catalog* - Mobile Optimized\n🔗 Demo: ${appDomain}/demo/catalog\n\nReply with 1, 2, or 3`;
          nextStep = 'save_website_template';
        } else {
          replyText = `Please reply with 1, 2, 3, 4, or 5.\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n5️⃣ Edit Website Template`;
          nextStep = 'handle_menu_choice';
        }
        break;

      case 'save_website_template': {
        const templates: Record<string, string> = { '1': 'minimal', '2': 'bold', '3': 'catalog' };
        if (templates[text]) {
          await prisma.business.update({
            where: { id: collectedData.businessId },
            data: { templateType: templates[text] }
          });
          replyText = `✅ Website template successfully updated to *${templates[text]}*!\n\nType *MENU* to return to the main menu.`;
          nextStep = 'completed';
        } else {
          replyText = `Please reply with 1, 2, or 3.`;
          nextStep = 'save_website_template';
        }
        break;
      }

      case 'edit_store_desc':
        await prisma.business.update({
          where: { id: collectedData.businessId },
          data: { description: text }
        });
        replyText = `✅ Store description updated successfully!\n\nType *MENU* to go back to the main menu.`;
        nextStep = 'completed';
        break;

      case 'select_edit_product': {
        const idx = parseInt(text) - 1;
        const pIds = collectedData.tmpProducts || [];
        if (isNaN(idx) || idx < 0 || idx >= pIds.length) {
          replyText = `Please reply with a valid number (e.g., 1).`;
          nextStep = 'select_edit_product';
        } else {
          collectedData.editProductId = pIds[idx];
          replyText = `What would you like to edit?\n\n1️⃣ Name\n2️⃣ Price\n3️⃣ Description\n4️⃣ Delete Product\n\nReply with a number:`;
          nextStep = 'choose_product_field';
        }
        break;
      }

      case 'choose_product_field':
        if (text === '1') {
          replyText = `🏷️ Enter the new product name:`;
          collectedData.editField = 'name';
          nextStep = 'save_product_field';
        } else if (text === '2') {
          replyText = `💰 Enter the new price (e.g. 500):`;
          collectedData.editField = 'price';
          nextStep = 'save_product_field';
        } else if (text === '3') {
          replyText = `📝 Enter the new description:`;
          collectedData.editField = 'description';
          nextStep = 'save_product_field';
        } else if (text === '4') {
          await prisma.product.delete({ where: { id: collectedData.editProductId } });
          replyText = `🗑️ Product deleted successfully!\n\nType *MENU* to go back.`;
          nextStep = 'completed';
        } else {
          replyText = `Please reply with 1, 2, 3, or 4.`;
          nextStep = 'choose_product_field';
        }
        break;

      case 'save_product_field': {
        let updateData: any = {};
        if (collectedData.editField === 'name') updateData.name = text;
        if (collectedData.editField === 'description') updateData.description = text;
        if (collectedData.editField === 'price') {
          const num = parseFloat(text.replace(/[^0-9.]/g, ''));
          if (isNaN(num)) {
            replyText = `Please reply with numbers only.\nEnter the price:`;
            nextStep = 'save_product_field';
            break;
          }
          updateData.price = num;
        }

        await prisma.product.update({
          where: { id: collectedData.editProductId },
          data: updateData
        });

        replyText = `✅ Product updated successfully!\n\nType *MENU* to go back to the main menu.`;
        nextStep = 'completed';
        break;
      }

      case 'collect_name':
        collectedData.name = text;
        replyText = `Wow! *${text}* - that's a great name! 🎉\n\n*What do you sell?* (Enter Category)\n\nExamples: Groceries, Fashion, Food, Electronics, Handicrafts, etc.`;
        nextStep = 'collect_category';
        break;

      case 'collect_category':
        collectedData.category = text;
        replyText = `Perfect! ✅\n\n*Where do you operate from?* (City/Location)`;
        nextStep = 'collect_location';
        break;

      case 'collect_location':
        collectedData.location = text;
        replyText = `*${text}* - great location! 📍\n\n*Please provide a short description about your store:*\n(2-3 sentences are enough)`;
        nextStep = 'collect_description';
        break;

      case 'collect_description':
        collectedData.description = text;
        collectedData.whatsapp = phoneNumber;
        // AI credits per field (2 each, independent)
        collectedData.aiCredits = { headline: AI_MAX_CREDITS, desc: AI_MAX_CREDITS };
        collectedData.aiGenerations = { headline: [], desc: [] };
        replyText = `Great! 🎉\n\nNow let's set up your *Store Headline* (the big text visitors see on your homepage).\n\n🤖 Would you like AI to generate an SEO-friendly headline for you?\n\n1️⃣ *Yes, generate AI headline*\n2️⃣ *No, I'll write my own*\n\nReply with 1 or 2.`;
        nextStep = 'ask_headline_ai';
        break;

      // ─────────────── HEADLINE AI FLOW ───────────────

      case 'ask_headline_ai':
        if (text === '1') {
          // Generate and show headline
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ai_headline_pending', collectedData },
          });
          const generationIndex = AI_MAX_CREDITS - collectedData.aiCredits.headline;
          const generated = await generateSeoHeadline(
            { name: collectedData.name, category: collectedData.category, location: collectedData.location, description: collectedData.description },
            generationIndex
          );
          collectedData.aiGenerations.headline.push(generated);
          collectedData.aiCredits.headline -= 1;
          const creditsLeft = collectedData.aiCredits.headline;
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ai_headline_pending', collectedData },
          });
          const creditNote = creditsLeft > 0
            ? `_(You have ${creditsLeft} regeneration${creditsLeft > 1 ? 's' : ''} left for headline)_`
            : `_(No regenerations left — this is your last option)_`;
          await sendWhatsAppMessage(
            phoneNumber,
            `✨ *Here's your AI-generated headline:*\n\n"${generated}"\n\n${creditNote}\n\nReply:\n✅ *YES* - Use this headline\n🔄 *REGENERATE* - Generate a different one`
          );
          return NextResponse.json({ status: 'ok' });
        } else if (text === '2') {
          replyText = `📝 Please type your store headline:\n(The main heading visitors will see on your homepage)`;
          nextStep = 'collect_own_headline';
        } else {
          replyText = `Please reply with *1* (AI generate) or *2* (write my own).`;
          nextStep = 'ask_headline_ai';
        }
        break;

      case 'ai_headline_pending': {
        const upperText = text.toUpperCase();
        if (upperText === 'YES') {
          // Accept the last generated headline
          const accepted = collectedData.aiGenerations.headline[collectedData.aiGenerations.headline.length - 1];
          collectedData.headline = accepted;
          // Reset desc credits
          collectedData.aiCredits.desc = AI_MAX_CREDITS;
          collectedData.aiGenerations.desc = [];
          replyText = `✅ Headline saved!\n\n_"${accepted}"_\n\nNow let's set up your *Store Description.*\n\n🤖 Would you like AI to generate an SEO-friendly description for you?\n\n1️⃣ *Yes, generate AI description*\n2️⃣ *No, I'll write my own*\n\nReply with 1 or 2.`;
          nextStep = 'ask_desc_ai';
        } else if (upperText === 'REGENERATE') {
          if (collectedData.aiCredits.headline <= 0) {
            // No credits left — show both options
            const opts = collectedData.aiGenerations.headline;
            replyText = `⚠️ *You've used all your headline regenerations!*\n\nHere are both versions I generated:\n\n1️⃣ "${opts[0]}"\n\n2️⃣ "${opts[1]}"\n\nReply:\n*1* - Use option 1\n*2* - Use option 2\n*Or type your own headline*`;
            nextStep = 'ai_headline_choose_option';
          } else {
            // Re-generate
            await prisma.whatsappSession.update({
              where: { phoneNumber },
              data: { step: 'ai_headline_pending', collectedData },
            });
            const generationIndex = AI_MAX_CREDITS - collectedData.aiCredits.headline;
            const regen = await generateSeoHeadline(
              { name: collectedData.name, category: collectedData.category, location: collectedData.location, description: collectedData.description },
              generationIndex
            );
            collectedData.aiGenerations.headline.push(regen);
            collectedData.aiCredits.headline -= 1;
            const creditsLeft = collectedData.aiCredits.headline;
            await prisma.whatsappSession.update({
              where: { phoneNumber },
              data: { step: 'ai_headline_pending', collectedData },
            });
            const creditNote = creditsLeft > 0
              ? `_(You have ${creditsLeft} regeneration${creditsLeft > 1 ? 's' : ''} left for headline)_`
              : `_(No regenerations left — this is your last one. Reply YES to accept or REGENERATE to see your options.)_`;
            await sendWhatsAppMessage(
              phoneNumber,
              `🔄 *Here's a new AI-generated headline:*\n\n"${regen}"\n\n${creditNote}\n\nReply:\n✅ *YES* - Use this headline\n🔄 *REGENERATE* - ${creditsLeft > 0 ? 'Generate another' : 'Show all options'}`
            );
            return NextResponse.json({ status: 'ok' });
          }
        } else {
          replyText = `Please reply *YES* to accept the headline or *REGENERATE* to get a new one.`;
          nextStep = 'ai_headline_pending';
        }
        break;
      }

      case 'ai_headline_choose_option': {
        const opts = collectedData.aiGenerations.headline;
        if (text === '1' && opts[0]) {
          collectedData.headline = opts[0];
        } else if (text === '2' && opts[1]) {
          collectedData.headline = opts[1];
        } else {
          // User typed their own
          collectedData.headline = text;
        }
        collectedData.aiCredits.desc = AI_MAX_CREDITS;
        collectedData.aiGenerations.desc = [];
        replyText = `✅ Headline saved!\n\n_"${collectedData.headline}"_\n\nNow let's set up your *Store Description.*\n\n🤖 Would you like AI to generate an SEO-friendly description for you?\n\n1️⃣ *Yes, generate AI description*\n2️⃣ *No, I'll write my own*\n\nReply with 1 or 2.`;
        nextStep = 'ask_desc_ai';
        break;
      }

      case 'collect_own_headline':
        collectedData.headline = text;
        collectedData.aiCredits.desc = AI_MAX_CREDITS;
        collectedData.aiGenerations.desc = [];
        replyText = `✅ Headline saved!\n\n_"${text}"_\n\nNow let's set up your *Store Description.*\n\n🤖 Would you like AI to generate an SEO-friendly description for you?\n\n1️⃣ *Yes, generate AI description*\n2️⃣ *No, I'll write my own*\n\nReply with 1 or 2.`;
        nextStep = 'ask_desc_ai';
        break;

      // ─────────────── STORE DESCRIPTION AI FLOW ───────────────

      case 'ask_desc_ai':
        if (text === '1') {
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ai_desc_pending', collectedData },
          });
          const generationIndex = AI_MAX_CREDITS - collectedData.aiCredits.desc;
          const generated = await generateSeoDescription(
            { name: collectedData.name, category: collectedData.category, location: collectedData.location, description: collectedData.description },
            generationIndex
          );
          collectedData.aiGenerations.desc.push(generated);
          collectedData.aiCredits.desc -= 1;
          const creditsLeft = collectedData.aiCredits.desc;
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ai_desc_pending', collectedData },
          });
          const creditNote = creditsLeft > 0
            ? `_(You have ${creditsLeft} regeneration${creditsLeft > 1 ? 's' : ''} left for description)_`
            : `_(No regenerations left — this is your last option)_`;
          await sendWhatsAppMessage(
            phoneNumber,
            `✨ *Here's your AI-generated store description:*\n\n"${generated}"\n\n${creditNote}\n\nReply:\n✅ *YES* - Use this description\n🔄 *REGENERATE* - Generate a different one`
          );
          return NextResponse.json({ status: 'ok' });
        } else if (text === '2') {
          replyText = `📝 Please type your store description:\n(2-3 sentences about what makes your store special)`;
          nextStep = 'collect_own_desc';
        } else {
          replyText = `Please reply with *1* (AI generate) or *2* (write my own).`;
          nextStep = 'ask_desc_ai';
        }
        break;

      case 'ai_desc_pending': {
        const upperText = text.toUpperCase();
        if (upperText === 'YES') {
          const accepted = collectedData.aiGenerations.desc[collectedData.aiGenerations.desc.length - 1];
          collectedData.description = accepted;
          const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
          replyText = `✅ Description saved!\n\n*Please choose a website template:*\n\n1️⃣ *Minimal* - Clean & Elegant\n🔗 Demo: ${appDomain}/demo/minimal\n\n2️⃣ *Bold* - Vibrant & Energetic\n🔗 Demo: ${appDomain}/demo/bold\n\n3️⃣ *Catalog* - Mobile Optimized\n🔗 Demo: ${appDomain}/demo/catalog\n\nReply with 1, 2, or 3`;
          nextStep = 'collect_template';
        } else if (upperText === 'REGENERATE') {
          if (collectedData.aiCredits.desc <= 0) {
            const opts = collectedData.aiGenerations.desc;
            replyText = `⚠️ *You've used all your description regenerations!*\n\nHere are both versions I generated:\n\n1️⃣ "${opts[0]}"\n\n2️⃣ "${opts[1]}"\n\nReply:\n*1* - Use option 1\n*2* - Use option 2\n*Or type your own description*`;
            nextStep = 'ai_desc_choose_option';
          } else {
            await prisma.whatsappSession.update({
              where: { phoneNumber },
              data: { step: 'ai_desc_pending', collectedData },
            });
            const generationIndex = AI_MAX_CREDITS - collectedData.aiCredits.desc;
            const regen = await generateSeoDescription(
              { name: collectedData.name, category: collectedData.category, location: collectedData.location, description: collectedData.description },
              generationIndex
            );
            collectedData.aiGenerations.desc.push(regen);
            collectedData.aiCredits.desc -= 1;
            const creditsLeft = collectedData.aiCredits.desc;
            await prisma.whatsappSession.update({
              where: { phoneNumber },
              data: { step: 'ai_desc_pending', collectedData },
            });
            const creditNote = creditsLeft > 0
              ? `_(You have ${creditsLeft} regeneration${creditsLeft > 1 ? 's' : ''} left for description)_`
              : `_(No regenerations left — this is your last one. Reply YES to accept or REGENERATE to see your options.)_`;
            await sendWhatsAppMessage(
              phoneNumber,
              `🔄 *Here's a new AI-generated description:*\n\n"${regen}"\n\n${creditNote}\n\nReply:\n✅ *YES* - Use this description\n🔄 *REGENERATE* - ${creditsLeft > 0 ? 'Generate another' : 'Show all options'}`
            );
            return NextResponse.json({ status: 'ok' });
          }
        } else {
          replyText = `Please reply *YES* to accept the description or *REGENERATE* to get a new one.`;
          nextStep = 'ai_desc_pending';
        }
        break;
      }

      case 'ai_desc_choose_option': {
        const opts = collectedData.aiGenerations.desc;
        if (text === '1' && opts[0]) {
          collectedData.description = opts[0];
        } else if (text === '2' && opts[1]) {
          collectedData.description = opts[1];
        } else {
          collectedData.description = text;
        }
        const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
        replyText = `✅ Description saved!\n\n*Please choose a website template:*\n\n1️⃣ *Minimal* - Clean & Elegant\n🔗 Demo: ${appDomain}/demo/minimal\n\n2️⃣ *Bold* - Vibrant & Energetic\n🔗 Demo: ${appDomain}/demo/bold\n\n3️⃣ *Catalog* - Mobile Optimized\n🔗 Demo: ${appDomain}/demo/catalog\n\nReply with 1, 2, or 3`;
        nextStep = 'collect_template';
        break;
      }

      case 'collect_own_desc': {
        collectedData.description = text;
        const appDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
        replyText = `✅ Description saved!\n\n*Please choose a website template:*\n\n1️⃣ *Minimal* - Clean & Elegant\n🔗 Demo: ${appDomain}/demo/minimal\n\n2️⃣ *Bold* - Vibrant & Energetic\n🔗 Demo: ${appDomain}/demo/bold\n\n3️⃣ *Catalog* - Mobile Optimized\n🔗 Demo: ${appDomain}/demo/catalog\n\nReply with 1, 2, or 3`;
        nextStep = 'collect_template';
        break;
      }

      // ─────────────── TEMPLATE & BUSINESS CREATION ───────────────

      case 'collect_template': {
        const templateMap: Record<string, string> = { '1': 'minimal', '2': 'bold', '3': 'catalog' };
        collectedData.template = templateMap[text] || 'minimal';

        replyText = `🤖 *AI is building your store...*\n\n✅ Creating business profile\n✅ Applying your headline & description\n✅ Preparing your website\n\nPlease wait a moment! ⏳`;
        nextStep = 'creating';

        // Create business (async)
        createBusinessFromWhatsApp(phoneNumber, collectedData).then(async ({ storeUrl, businessId }) => {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
          await sendWhatsAppMessage(
            phoneNumber,
            `🎉 *Congratulations! Your store is ready!*\n\n🔗 *Store Link:* ${storeUrl}\n\nShare it with your customers now! 🚀\n\n_Visit your dashboard here:_ ${appUrl}/login`
          );
          await new Promise(r => setTimeout(r, 2000));
          await sendWhatsAppMessage(
            phoneNumber,
            `Would you like to add a new product to your store?\nReply *YES* to add or *NO* to skip.`
          );
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ask_add_product', collectedData: { businessId } },
          });
        }).catch(async (e) => {
          console.error('Error creating business:', e);
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';
          await sendWhatsAppMessage(phoneNumber, `❌ Something went wrong. Please try creating manually on ${rootDomain}.`);
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'start', collectedData: {} },
          });
        });
        break;
      }

      case 'ask_add_product':
        if (text.toUpperCase() === 'YES' || text.toUpperCase() === 'HAAN' || text === '1') {
          replyText = `Great! 📝 Enter your new product's *Name*:`;
          nextStep = 'collect_product_name';
        } else {
          replyText = `Your store is ready! 🎉\n\nType *MENU* to go back to the main menu.`;
          nextStep = 'completed';
        }
        break;

      case 'collect_product_name':
        collectedData.productName = text;
        replyText = `Nice name! 🏷️\n\nNow enter the product's *Price* (numbers only, e.g., 500):`;
        nextStep = 'collect_product_price';
        break;

      case 'collect_product_price': {
        const price = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (isNaN(price)) {
          replyText = `Please reply with numbers only (e.g., 500).\nEnter the price:`;
          nextStep = 'collect_product_price';
        } else {
          collectedData.productPrice = price;
          // Reset product desc AI credits for this product
          collectedData.aiCredits = { ...(collectedData.aiCredits || {}), productDesc: AI_MAX_CREDITS };
          collectedData.aiGenerations = { ...(collectedData.aiGenerations || {}), productDesc: [] };
          replyText = `Price set: ₹${price} 💰\n\n🤖 Would you like AI to generate an SEO-friendly product description for you?\n\n1️⃣ *Yes, generate AI description*\n2️⃣ *No, I'll write my own*\n3️⃣ *Skip (no description)*\n\nReply with 1, 2, or 3.`;
          nextStep = 'ask_product_desc_ai';
        }
        break;
      }

      // ─────────────── PRODUCT DESCRIPTION AI FLOW ───────────────

      case 'ask_product_desc_ai':
        if (text === '1') {
          // Need business name for description generation
          let bizName = collectedData.name || '';
          if (!bizName && collectedData.businessId) {
            const biz = await prisma.business.findUnique({ where: { id: collectedData.businessId }, select: { name: true, category: true } });
            bizName = biz?.name || '';
            if (!collectedData.category && biz?.category) collectedData.category = biz.category;
          }
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ai_product_desc_pending', collectedData },
          });
          const generationIndex = AI_MAX_CREDITS - (collectedData.aiCredits?.productDesc ?? AI_MAX_CREDITS);
          const generated = await generateProductDescription(
            { name: collectedData.productName, price: collectedData.productPrice, businessName: bizName, category: collectedData.category || 'General' },
            generationIndex
          );
          if (!collectedData.aiGenerations) collectedData.aiGenerations = {};
          collectedData.aiGenerations.productDesc = collectedData.aiGenerations.productDesc || [];
          collectedData.aiGenerations.productDesc.push(generated);
          if (!collectedData.aiCredits) collectedData.aiCredits = {};
          collectedData.aiCredits.productDesc = (collectedData.aiCredits.productDesc ?? AI_MAX_CREDITS) - 1;
          const creditsLeft = collectedData.aiCredits.productDesc;
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ai_product_desc_pending', collectedData },
          });
          const creditNote = creditsLeft > 0
            ? `_(You have ${creditsLeft} regeneration${creditsLeft > 1 ? 's' : ''} left for this product)_`
            : `_(No regenerations left)_`;
          await sendWhatsAppMessage(
            phoneNumber,
            `✨ *Here's your AI-generated product description:*\n\n"${generated}"\n\n${creditNote}\n\nReply:\n✅ *YES* - Use this description\n🔄 *REGENERATE* - Generate a different one`
          );
          return NextResponse.json({ status: 'ok' });
        } else if (text === '2') {
          replyText = `📝 Please describe the product (1-2 lines):`;
          nextStep = 'collect_product_desc';
        } else if (text === '3') {
          collectedData.productDesc = '';
          replyText = `Done! 📸\n\nFinal step: Please send a *Photo (Image)* of the product.`;
          nextStep = 'collect_product_image';
        } else {
          replyText = `Please reply with *1* (AI generate), *2* (write my own), or *3* (skip).`;
          nextStep = 'ask_product_desc_ai';
        }
        break;

      case 'ai_product_desc_pending': {
        const upperText = text.toUpperCase();
        if (upperText === 'YES') {
          const accepted = collectedData.aiGenerations.productDesc[collectedData.aiGenerations.productDesc.length - 1];
          collectedData.productDesc = accepted;
          replyText = `✅ Description saved!\n\nDone! 📸\n\nFinal step: Please send a *Photo (Image)* of the product.`;
          nextStep = 'collect_product_image';
        } else if (upperText === 'REGENERATE') {
          if ((collectedData.aiCredits?.productDesc ?? 0) <= 0) {
            const opts = collectedData.aiGenerations.productDesc;
            replyText = `⚠️ *You've used all your product description regenerations!*\n\nHere are both versions I generated:\n\n1️⃣ "${opts[0]}"\n\n2️⃣ "${opts[1]}"\n\nReply:\n*1* - Use option 1\n*2* - Use option 2\n*Or type your own description*`;
            nextStep = 'ai_product_desc_choose_option';
          } else {
            let bizName = collectedData.name || '';
            if (!bizName && collectedData.businessId) {
              const biz = await prisma.business.findUnique({ where: { id: collectedData.businessId }, select: { name: true, category: true } });
              bizName = biz?.name || '';
              if (!collectedData.category && biz?.category) collectedData.category = biz.category;
            }
            await prisma.whatsappSession.update({
              where: { phoneNumber },
              data: { step: 'ai_product_desc_pending', collectedData },
            });
            const generationIndex = AI_MAX_CREDITS - (collectedData.aiCredits?.productDesc ?? 0);
            const regen = await generateProductDescription(
              { name: collectedData.productName, price: collectedData.productPrice, businessName: bizName, category: collectedData.category || 'General' },
              generationIndex
            );
            collectedData.aiGenerations.productDesc.push(regen);
            collectedData.aiCredits.productDesc -= 1;
            const creditsLeft = collectedData.aiCredits.productDesc;
            await prisma.whatsappSession.update({
              where: { phoneNumber },
              data: { step: 'ai_product_desc_pending', collectedData },
            });
            const creditNote = creditsLeft > 0
              ? `_(You have ${creditsLeft} regeneration${creditsLeft > 1 ? 's' : ''} left for this product)_`
              : `_(No regenerations left — Reply YES to accept or REGENERATE to see all options.)_`;
            await sendWhatsAppMessage(
              phoneNumber,
              `🔄 *Here's a new AI-generated product description:*\n\n"${regen}"\n\n${creditNote}\n\nReply:\n✅ *YES* - Use this description\n🔄 *REGENERATE* - ${creditsLeft > 0 ? 'Generate another' : 'Show all options'}`
            );
            return NextResponse.json({ status: 'ok' });
          }
        } else {
          replyText = `Please reply *YES* to accept or *REGENERATE* to get a new description.`;
          nextStep = 'ai_product_desc_pending';
        }
        break;
      }

      case 'ai_product_desc_choose_option': {
        const opts = collectedData.aiGenerations?.productDesc || [];
        if (text === '1' && opts[0]) {
          collectedData.productDesc = opts[0];
        } else if (text === '2' && opts[1]) {
          collectedData.productDesc = opts[1];
        } else {
          collectedData.productDesc = text;
        }
        replyText = `✅ Description saved!\n\nDone! 📸\n\nFinal step: Please send a *Photo (Image)* of the product.`;
        nextStep = 'collect_product_image';
        break;
      }

      case 'collect_product_desc':
        collectedData.productDesc = text.toLowerCase() === 'skip' ? '' : text;
        replyText = `Done! 📸\n\nFinal step: Please send a *Photo (Image)* of the product.`;
        nextStep = 'collect_product_image';
        break;

      case 'collect_product_image': {
        const image = message.image;
        if (!image && message.type !== 'image') {
          replyText = `Please send an actual *Photo (Image)*, not text. 📸`;
          nextStep = 'collect_product_image';
        } else {
          replyText = `⏳ Adding product...\nPlease wait a moment.`;
          nextStep = 'adding_product';

          // Async product creation
          handleAddProduct(phoneNumber, Object.assign({}, collectedData), message).catch(console.error);
        }
        break;
      }

      case 'adding_product':
        replyText = `⏳ Please wait, your product is being added...`;
        nextStep = 'adding_product';
        break;

      case 'completed':
        replyText = `Task completed successfully! 🎉\n\nType *MENU* to go back.`;
        if (text.toUpperCase() === 'RESET' || text.toUpperCase() === 'MENU') {
          nextStep = 'start';
          replyText = `✅ Returned to previous step! Type again if unresponsive.`;
        }
        break;

      default:
        replyText = `I didn't understand that. Type *MENU* to start over.`;
        nextStep = 'start';
    }

    // Update session
    await prisma.whatsappSession.update({
      where: { phoneNumber },
      data: { step: nextStep, collectedData },
    });

    // Send reply (skip for collect_template since creation is async)
    if (replyText && session.step !== 'collect_template') {
      await sendWhatsAppMessage(phoneNumber, replyText);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

async function sendWhatsAppMessage(to: string, text: string) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WA_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}

async function createBusinessFromWhatsApp(phoneNumber: string, data: any): Promise<{ storeUrl: string, businessId: string }> {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';
  const dummyEmail = `wa_${phoneNumber.replace('+', '')}@${rootDomain}`;

  let user = await prisma.user.findFirst({
    where: { email: dummyEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: dummyEmail,
        name: data.name,
        createdVia: 'whatsapp'
      },
    });
  }

  let slug = generateSlug(data.name);
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  // Use the user-selected/AI headline & description if available, otherwise fall back to auto-generate
  let headline = data.headline || null;
  let description = data.description || null;
  let tagline: string | null = null;
  let about: string | null = null;
  let marketingDesc: string | null = null;

  if (!headline || !description) {
    // Fallback: auto-generate all content
    const aiContent = await generateBusinessContent({
      name: data.name,
      description: data.description || '',
      category: data.category || 'General',
      location: data.location || 'India',
    });
    headline = headline || aiContent.headline;
    description = description || aiContent.marketingDesc;
    tagline = aiContent.tagline;
    about = aiContent.about;
    marketingDesc = aiContent.marketingDesc;
  }

  const business = await prisma.business.create({
    data: {
      userId: user.id,
      name: data.name,
      slug,
      description,
      whatsappNumber: data.whatsapp || phoneNumber,
      location: data.location,
      category: data.category,
      templateType: data.template || 'minimal',
      headline,
      tagline,
      about,
      marketingDesc,
    },
  });

  return { storeUrl: getStoreUrl(business.slug), businessId: business.id };
}

async function handleAddProduct(phoneNumber: string, data: any, message: any) {
  try {
    let imageUrl = '';
    const image = message.image;

    if (image && image.id) {
      const waMediaUrl = `https://graph.facebook.com/v20.0/${image.id}`;
      const mediaRes = await fetch(waMediaUrl, {
        headers: { Authorization: `Bearer ${WA_TOKEN}` }
      });
      const mediaData = await mediaRes.json();

      if (mediaData.url) {
        const imageRes = await fetch(mediaData.url, {
          headers: { Authorization: `Bearer ${WA_TOKEN}` }
        });
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        imageUrl = await uploadImageToCloudinary(buffer, `dukaanhai/products/${data.businessId}`);
      }
    }

    await prisma.product.create({
      data: {
        businessId: data.businessId,
        name: data.productName,
        price: data.productPrice,
        description: data.productDesc,
        imageUrl: imageUrl || null,
        inStock: true
      }
    });

    await sendWhatsAppMessage(phoneNumber, `✅ Product added successfully!\n\nWould you like to add another product? Reply *YES* or *NO*.`);
    await prisma.whatsappSession.update({
      where: { phoneNumber },
      data: { step: 'ask_add_product', collectedData: { businessId: data.businessId } },
    });
  } catch (error) {
    console.error('Error adding product:', error);
    await sendWhatsAppMessage(phoneNumber, `❌ Failed to add product. Please try again later.\n\nWould you like to try adding another product? Reply *YES* or *NO*.`);
    await prisma.whatsappSession.update({
      where: { phoneNumber },
      data: { step: 'ask_add_product', collectedData: { businessId: data.businessId } },
    });
  }
}
