import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBusinessContent } from '@/lib/gemini';
import { generateSlug, getStoreUrl } from '@/lib/utils';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const WA_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID!;

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

    // -- Dashboard Command Interceptor --
    if (msgUpper === 'DASHBOARD') {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: dummyEmail },
            { phoneNumber }
          ]
        },
        include: { businesses: true }
      });

      console.log("INTERCEPTED DASHBOARD:", { hasUser: !!existingUser, pwdLen: existingUser?.password?.length });

      if (!existingUser) {
        await sendWhatsAppMessage(phoneNumber, `No account found. Please create your store first by typing *RESET*.`);
        return NextResponse.json({ status: 'ok' });
      }

      if (existingUser.password && existingUser.password.length > 0) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
        await sendWhatsAppMessage(phoneNumber, `You already have dashboard access.\n\nVisit: ${appUrl}/login`);
        return NextResponse.json({ status: 'ok' });
      }

      // Generate secure token
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      await prisma.loginToken.create({
        data: {
          phoneNumber,
          token,
          expiresAt
        }
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
      await sendWhatsAppMessage(phoneNumber, `Click this secure link to access your dashboard:\n\n${appUrl}/dashboard-access?token=${token}\n\nThis link expires in 10 minutes.`);

      await prisma.whatsappSession.update({
        where: { phoneNumber },
        data: { step: 'completed' }
      });

      return NextResponse.json({ status: 'ok' });
    }

    // Detect Returning Users
    if (session.step === 'start') {
      const existingUser = await prisma.user.findFirst({
        where: { email: dummyEmail },
        include: { businesses: true }
      });
      const existingBusiness = existingUser?.businesses?.[0];

      if (existingBusiness && existingBusiness.customDomain) { // Assume it's fully created if it exists
        session = await prisma.whatsappSession.update({
          where: { phoneNumber },
          data: { step: 'main_menu', collectedData: { businessId: existingBusiness.id } }
        });
        // We need to send the main menu immediately if we just bumped them here
        if (text.toUpperCase() !== 'RESET') {
          // It's the first message of the session bumping them to main menu
          const replyText = `Welcome back! 🏪 (v2)\n\nAapko apne store mein kya change karna hai?\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n\nReply with 1, 2, 3 or 4.`;
          await sendWhatsAppMessage(phoneNumber, replyText);
          return NextResponse.json({ status: 'ok' });
        }
      } else if (existingBusiness) {
        session = await prisma.whatsappSession.update({
          where: { phoneNumber },
          data: { step: 'main_menu', collectedData: { businessId: existingBusiness.id } }
        });
        if (text.toUpperCase() !== 'RESET') {
          const replyText = `Welcome back! 🏪 (v2)\n\nAapko apne store mein kya change karna hai?\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n\nReply with 1, 2, 3 or 4.`;
          await sendWhatsAppMessage(phoneNumber, replyText);
          return NextResponse.json({ status: 'ok' });
        }
      }
    }

    const collectedData = (session.collectedData as any) || {};

    if (msgUpper === 'RESET') {
      const existingUser = await prisma.user.findFirst({
        where: { email: dummyEmail },
        include: { businesses: true }
      });
      const existingBusiness = existingUser?.businesses?.[0];

      if (existingBusiness) {
        await prisma.whatsappSession.update({
          where: { phoneNumber },
          data: { step: 'main_menu', collectedData: { businessId: existingBusiness.id } },
        });
        const replyText = `Welcome back! 🏪 (v2)\n\nAapko apne store mein kya change karna hai?\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n\nReply with 1, 2, 3 or 4.`;
        await sendWhatsAppMessage(phoneNumber, `✅ Menu pe wapas aa gaye! (v2)\n\n${replyText}`);
        return NextResponse.json({ status: 'ok' });
      } else {
        await prisma.whatsappSession.update({
          where: { phoneNumber },
          data: { step: 'start', collectedData: {} },
        });
        await sendWhatsAppMessage(phoneNumber, `✅ Reset ho gaya! (v2)\n\n*Apni nayi dukaan ka naam batao:*`);
        return NextResponse.json({ status: 'ok' });
      }
    }

    let replyText = '';
    let nextStep = session.step;

    switch (session.step) {
      case 'start':
        replyText = `🙏 *Namaste! Welcome to DukaanHai! (v2)*\n\nMein aapko ek minute mein online store banana mein help karunga! 🚀\n\n*Apni dukaan ka naam batao:*`;
        nextStep = 'collect_name';
        break;

      case 'main_menu':
        replyText = `Welcome back! 🏪 (v2)\n\nAapko apne store mein kya change karna hai?\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site\n\nReply with 1, 2, 3 or 4.`;
        nextStep = 'handle_menu_choice';
        break;

      case 'handle_menu_choice':
        if (text === '1') {
          replyText = `✏️ Apne store ki nayi tag line ya description bhejein:`;
          nextStep = 'edit_store_desc';
        } else if (text === '2') {
          replyText = `Great! 📝 Apne naye product ka *Naam* likho:`;
          nextStep = 'collect_product_name';
        } else if (text === '3') {
          // Fetch products
          const products = await prisma.product.findMany({ where: { businessId: collectedData.businessId } });
          if (products.length === 0) {
            replyText = `Aapke store mein koi products nahi hain.\n\nType *RESET* to go back.`;
            nextStep = 'handle_menu_choice';
          } else {
            let pList = `Aapke Products:\n\n`;
            products.forEach((p, idx) => {
              pList += `${idx + 1}. ${p.name} (₹${p.price})\n`;
            });
            pList += `\nKonsa product edit karna hai? (Reply with number, eg: 1)`;
            replyText = pList;
            collectedData.tmpProducts = products.map(p => p.id); // Store IDs mapping to indexes
            nextStep = 'select_edit_product';
          }
        } else if (text === '4') {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
          replyText = `Aap WhatsApp se sirf ek hi site bana sakte hain aur manage kar sakte hain.\n\nNayi site banane ke liye kripya website par login karein:\n${appUrl}/login\n\nType *RESET* to go back to the menu.`;
          nextStep = 'handle_menu_choice';
        } else {
          replyText = `Kripya 1, 2, 3 ya 4 reply karein.\n\n1️⃣ Edit Store Description\n2️⃣ Add New Product\n3️⃣ Edit Existing Product\n4️⃣ Create New Site`;
          nextStep = 'handle_menu_choice';
        }
        break;

      case 'edit_store_desc':
        await prisma.business.update({
          where: { id: collectedData.businessId },
          data: { description: text }
        });
        replyText = `✅ Store description update ho gayi!\n\nType *RESET* to go back to main menu.`;
        nextStep = 'completed';
        break;

      case 'select_edit_product':
        const idx = parseInt(text) - 1;
        const pIds = collectedData.tmpProducts || [];
        if (isNaN(idx) || idx < 0 || idx >= pIds.length) {
          replyText = `Kripya sahi number reply karein (eg: 1).`;
          nextStep = 'select_edit_product';
        } else {
          collectedData.editProductId = pIds[idx];
          replyText = `Aap kya edit karna chahte hain?\n\n1️⃣ Name\n2️⃣ Price\n3️⃣ Description\n4️⃣ Delete Product\n\nReply with number:`;
          nextStep = 'choose_product_field';
        }
        break;

      case 'choose_product_field':
        if (text === '1') {
          replyText = `🏷️ Naya product naam likho:`;
          collectedData.editField = 'name';
          nextStep = 'save_product_field';
        } else if (text === '2') {
          replyText = `💰 Nayi price likho (e.g. 500):`;
          collectedData.editField = 'price';
          nextStep = 'save_product_field';
        } else if (text === '3') {
          replyText = `📝 Nayi description likho:`;
          collectedData.editField = 'description';
          nextStep = 'save_product_field';
        } else if (text === '4') {
          await prisma.product.delete({ where: { id: collectedData.editProductId } });
          replyText = `🗑️ Product delete ho gaya!\n\nType *RESET* to go back.`;
          nextStep = 'completed';
        } else {
          replyText = `Kripya 1, 2, 3 ya 4 reply karein.`;
          nextStep = 'choose_product_field';
        }
        break;

      case 'save_product_field':
        let updateData: any = {};
        if (collectedData.editField === 'name') updateData.name = text;
        if (collectedData.editField === 'description') updateData.description = text;
        if (collectedData.editField === 'price') {
          const num = parseFloat(text.replace(/[^0-9.]/g, ''));
          if (isNaN(num)) {
            replyText = `Kripya sirf number likho.\nPrice batao:`;
            nextStep = 'save_product_field';
            break;
          }
          updateData.price = num;
        }

        await prisma.product.update({
          where: { id: collectedData.editProductId },
          data: updateData
        });

        replyText = `✅ Product update ho gaya!\n\nType *RESET* to go back to main menu.`;
        nextStep = 'completed';
        break;

      case 'collect_name':
        collectedData.name = text;
        replyText = `Wah! *${text}* - bahut accha naam hai! 🎉\n\n*Aap kya bechte ho?* (Category batao)\n\nJaise: Kirana, Fashion, Food, Electronics, Handicrafts, etc.`;
        nextStep = 'collect_category';
        break;

      case 'collect_category':
        collectedData.category = text;
        replyText = `Perfect! ✅\n\n*Aap kahan se operate karte ho?* (City/Location)`;
        nextStep = 'collect_location';
        break;

      case 'collect_location':
        collectedData.location = text;
        replyText = `*${text}* - great location! 📍\n\n*Thodi si description do apni dukaan ke baare mein:*\n(2-3 sentences enough hai)`;
        nextStep = 'collect_description';
        break;

      case 'collect_description':
        collectedData.description = text;
        collectedData.whatsapp = phoneNumber;
        replyText = `Excellent! 🌟\n\n*Website template choose karo:*\n\n1️⃣ *Minimal* - Clean & Elegant\n2️⃣ *Bold* - Vibrant & Energetic\n3️⃣ *Catalog* - Mobile Optimized\n\nReply with 1, 2, or 3`;
        nextStep = 'collect_template';
        break;

      case 'collect_template':
        const templateMap: Record<string, string> = { '1': 'minimal', '2': 'bold', '3': 'catalog' };
        collectedData.template = templateMap[text] || 'minimal';

        replyText = `🤖 *AI aapka store bana raha hai...*\n\n✅ Business profile create ho raha hai\n✅ AI content generate ho raha hai\n✅ Website ready ho rahi hai\n\nEk minute wait karo! ⏳`;
        nextStep = 'creating';

        // Create business (async)
        createBusinessFromWhatsApp(phoneNumber, collectedData).then(async ({ storeUrl, businessId }) => {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.in';
          await sendWhatsAppMessage(
            phoneNumber,
            `🎉 *Badhai ho! Aapka store ready hai!*\n\n🔗 *Store Link:* ${storeUrl}\n\nAbhi share karo apne customers ke saath! 🚀\n\n_Dashboard ke liye visit karo:_ ${appUrl}/login`
          );
          await new Promise(r => setTimeout(r, 2000));
          await sendWhatsAppMessage(
            phoneNumber,
            `Kya aap apne store mein naya product add karna chahte hain?\nReply *YES* haan ke liye, ya *NO* nahi ke liye.`
          );
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'ask_add_product', collectedData: { businessId } },
          });
        }).catch(async (e) => {
          console.error('Error creating business:', e);
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.in';
          await sendWhatsAppMessage(phoneNumber, `❌ Kuch problem aa gayi. Kripya ${rootDomain} pe manually try karo.`);
          // Unstick the user from 'creating' so they can try again
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'start', collectedData: {} },
          });
        });
        break;

      case 'ask_add_product':
        if (text.toUpperCase() === 'YES' || text.toUpperCase() === 'HAAN' || text === '1') {
          replyText = `Great! 📝 Apne naye product ka *Naam* likho:`;
          nextStep = 'collect_product_name';
        } else {
          replyText = `Aapka store ready hai! 🎉\n\nMain Menu pe aane ke liye type: *RESET*.`;
          nextStep = 'completed';
        }
        break;

      case 'collect_product_name':
        collectedData.productName = text;
        replyText = `Accha naam hai! 🏷️\n\nAb product ki *Price (Kimat)* batao (sirf number likho, jaise: 500):`;
        nextStep = 'collect_product_price';
        break;

      case 'collect_product_price':
        const price = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (isNaN(price)) {
          replyText = `Kripya sirf number likho (jaise: 500).\nPrice batao:`;
          nextStep = 'collect_product_price';
        } else {
          collectedData.productPrice = price;
          replyText = `Price set: ₹${price} 💰\n\nProduct ko thoda *describe* karo (1-2 lines mein, ya 'skip' likho):`;
          nextStep = 'collect_product_desc';
        }
        break;

      case 'collect_product_desc':
        collectedData.productDesc = text.toLowerCase() === 'skip' ? '' : text;
        replyText = `Done! 📸\n\nAb aakhiri step: Product ki ek *Photo (Image)* bhejo.`;
        nextStep = 'collect_product_image';
        break;

      case 'collect_product_image':
        const image = message.image;
        if (!image && message.type !== 'image') {
          replyText = `Kripya text nahi, ek *Photo (Image)* bhejo. 📸`;
          nextStep = 'collect_product_image';
        } else {
          replyText = `⏳ Product add ho raha hai...\nKripya thodi der pratiksha karein.`;
          nextStep = 'adding_product';

          // Async product creation
          handleAddProduct(phoneNumber, Object.assign({}, collectedData), message).catch(console.error);
        }
        break;

      case 'adding_product':
        replyText = `⏳ Kirpya pratiksha karein, product add ho raha hai...`;
        nextStep = 'adding_product';
        break;

      case 'completed':
        replyText = `Yeh task pura ho gaya hai. 🎉\n\nType *RESET* to go back.`;
        if (text.toUpperCase() === 'RESET') {
          nextStep = 'start';
          replyText = `✅ Piche aagaye! Type again if unresponsive.`;
        }
        break;

      default:
        replyText = `Mujhe samajh nahi aaya. *RESET* likhke nayi shuruwaat karo.`;
        nextStep = 'start';
    }

    // Update session
    await prisma.whatsappSession.update({
      where: { phoneNumber },
      data: { step: nextStep, collectedData },
    });

    // Send reply
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

  // Find or create a placeholder user for WhatsApp users
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

  const aiContent = await generateBusinessContent({
    name: data.name,
    description: data.description || '',
    category: data.category || 'General',
    location: data.location || 'India',
  });

  const business = await prisma.business.create({
    data: {
      userId: user.id,
      name: data.name,
      slug,
      description: data.description,
      whatsappNumber: data.whatsapp || phoneNumber,
      location: data.location,
      category: data.category,
      templateType: data.template || 'minimal',
      headline: aiContent.headline,
      tagline: aiContent.tagline,
      about: aiContent.about,
      marketingDesc: aiContent.marketingDesc,
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

    await sendWhatsAppMessage(phoneNumber, `✅ Product successfully add ho gaya!\n\nKya aap ek aur product add karna chahte hain? Reply *YES* or *NO*.`);
    await prisma.whatsappSession.update({
      where: { phoneNumber },
      data: { step: 'ask_add_product', collectedData: { businessId: data.businessId } },
    });
  } catch (error) {
    console.error('Error adding product:', error);
    await sendWhatsAppMessage(phoneNumber, `❌ Kuch error aa gaya product add karne mein. Kripya baad mein try karein.\n\nKya aap koi aur product try karna chahte hain? Reply *YES* or *NO*.`);
    await prisma.whatsappSession.update({
      where: { phoneNumber },
      data: { step: 'ask_add_product', collectedData: { businessId: data.businessId } },
    });
  }
}
