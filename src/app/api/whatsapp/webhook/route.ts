import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBusinessContent } from '@/lib/gemini';
import { generateSlug, getStoreUrl } from '@/lib/utils';

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

    const collectedData = (session.collectedData as any) || {};

    let replyText = '';
    let nextStep = session.step;

    switch (session.step) {
      case 'start':
        replyText = `🙏 *Namaste! Welcome to DukaanHai!*\n\nMein aapko ek minute mein online store banana mein help karunga! 🚀\n\n*Apni dukaan ka naam batao:*`;
        nextStep = 'collect_name';
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
        replyText = `Excellent! 🌟\n\n*Aapka WhatsApp number kya hai?*\n(Customers aapko is number pe contact karenge)\n\nFormat: +91XXXXXXXXXX`;
        nextStep = 'collect_whatsapp';
        break;

      case 'collect_whatsapp':
        collectedData.whatsapp = text;
        replyText = `Almost done! ⚡\n\n*Website template choose karo:*\n\n1️⃣ *Minimal* - Clean & Elegant\n2️⃣ *Bold* - Vibrant & Energetic\n3️⃣ *Catalog* - Mobile Optimized\n\nReply with 1, 2, or 3`;
        nextStep = 'collect_template';
        break;

      case 'collect_template':
        const templateMap: Record<string, string> = { '1': 'minimal', '2': 'bold', '3': 'catalog' };
        collectedData.template = templateMap[text] || 'minimal';

        replyText = `🤖 *AI aapka store bana raha hai...*\n\n✅ Business profile create ho raha hai\n✅ AI content generate ho raha hai\n✅ Website ready ho rahi hai\n\nEk minute wait karo! ⏳`;
        nextStep = 'creating';

        // Create business (async)
        createBusinessFromWhatsApp(phoneNumber, collectedData).then(async (storeUrl) => {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dukaanhai.com';
          await sendWhatsAppMessage(
            phoneNumber,
            `🎉 *Badhai ho! Aapka store ready hai!*\n\n🔗 *Store Link:* ${storeUrl}\n\nAbhi share karo apne customers ke saath! 🚀\n\n_Dashboard ke liye visit karo:_ ${appUrl}/login`
          );
          await prisma.whatsappSession.update({
            where: { phoneNumber },
            data: { step: 'completed', collectedData: {} },
          });
        }).catch(async () => {
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.com';
          await sendWhatsAppMessage(phoneNumber, `❌ Kuch problem aa gayi. Kripya ${rootDomain} pe manually try karo.`);
        });
        break;

      case 'completed':
        replyText = `Aapka store already ready hai! 🎉\n\nNaya store banana hai? Reply *RESET* likhke.`;
        if (text.toUpperCase() === 'RESET') {
          nextStep = 'start';
          replyText = `✅ Reset ho gaya!\n\n*Apni nayi dukaan ka naam batao:*`;
        }
        break;

      default:
        replyText = `Mujhe samajh nahi aaya. *RESET* likhke nayi shuruwaat karo.`;
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

async function createBusinessFromWhatsApp(phoneNumber: string, data: any): Promise<string> {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'dukaanhai.com';
  const dummyEmail = `wa_${phoneNumber.replace('+', '')}@${rootDomain}`;

  // Find or create a placeholder user for WhatsApp users
  let user = await prisma.user.findFirst({
    where: { email: dummyEmail },
  });

  if (!user) {
    const bcrypt = await import('bcryptjs');
    const randomPwd = Math.random().toString(36) + Math.random().toString(36);
    user = await prisma.user.create({
      data: {
        email: dummyEmail,
        password: await bcrypt.hash(randomPwd, 10),

        name: data.name,
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

  return getStoreUrl(business.slug);
}
