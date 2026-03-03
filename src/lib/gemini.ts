import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export async function generateBusinessContent(business: {
  name: string;
  description: string;
  category: string;
  location: string;
}) {
  const prompt = `You are a marketing copywriter for small Indian local businesses. Generate compelling content for this business:

Business Name: ${business.name}
Category: ${business.category}
Location: ${business.location}
Description: ${business.description}

Generate the following in JSON format (no markdown, pure JSON):
{
  "headline": "A punchy 8-12 word headline for the homepage",
  "tagline": "A memorable 4-8 word tagline/slogan",
  "about": "3-4 sentences about the business story and values",
  "vision": "A 1-2 sentence inspiring vision statement for the future of the business",
  "mission": "A 1-2 sentence mission statement explaining what the business does and why",
  "marketingDesc": "A 2-3 sentence marketing description for social media"
}

Keep the tone warm, local, and authentic. Use simple English that works for Indian audiences.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini content generation error:', error);
    return {
      headline: `Welcome to ${business.name} - Your Trusted Local Store`,
      tagline: 'Quality you can trust, service you deserve',
      about: `${business.name} is a proud local business in ${business.location}. We are dedicated to serving our community with the best ${business.category} products and services. Our commitment to quality and customer satisfaction sets us apart.`,
      vision: `To be the most trusted and preferred choice for ${business.category} in ${business.location}.`,
      mission: `To provide high-quality ${business.category} products and exceptional service that delights our customers every day.`,
      marketingDesc: `Discover ${business.name} - your go-to destination for ${business.category} in ${business.location}. We bring you quality products at great prices.`,
    };
  }
}

export async function generateSeoHeadline(
  business: { name: string; category: string; location: string; description: string },
  variationSeed: number = 0
): Promise<string> {
  const variations = ['catchy and bold', 'warm and inviting', 'professional and trustworthy', 'fun and energetic'];
  const tone = variations[variationSeed % variations.length];
  const prompt = `You are an SEO copywriter for Indian local businesses.

Write a ${tone} homepage headline for this store. It should be 8-12 words, SEO-friendly, and appeal to Indian customers.

Store Name: ${business.name}
Category: ${business.category}
Location: ${business.location}
Description: ${business.description}

Return ONLY the headline text. No quotes, no punctuation at the end, no explanation.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Gemini headline error:', error);
    return `Welcome to ${business.name} - Your Trusted ${business.category} Store`;
  }
}

export async function generateSeoDescription(
  business: { name: string; category: string; location: string; description: string },
  variationSeed: number = 0
): Promise<string> {
  const angles = [
    'focus on quality and trust',
    'focus on the local community and personal service',
    'focus on the best value and deals',
    'focus on the story and passion behind the business',
  ];
  const angle = angles[variationSeed % angles.length];
  const prompt = `You are an SEO copywriter for Indian local businesses.

Write a 2-3 sentence SEO-friendly store description. ${angle}. Keep it warm, conversational, and appealing to Indian customers.

Store Name: ${business.name}
Category: ${business.category}
Location: ${business.location}
User's own description: ${business.description}

Return ONLY the description text. No extra commentary.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini description error:', error);
    return `${business.name} is your go-to destination for ${business.category} in ${business.location}. We are committed to quality, great service, and making every customer feel at home.`;
  }
}

export async function generateProductDescription(product: {
  name: string;
  price: number;
  businessName: string;
  category: string;
}, variationSeed: number = 0): Promise<string> {
  const angles = [
    'focus on quality and appeal',
    'focus on value for money',
    'focus on who this product is perfect for',
  ];
  const angle = angles[variationSeed % angles.length];
  const prompt = `Generate a compelling product description for an Indian local store product. ${angle}.

Product Name: ${product.name}
Price: ₹${product.price}
Store: ${product.businessName}
Category: ${product.category}

Write 2-3 sentences that highlight the product's appeal, quality, and value. Keep it conversational and appealing to Indian customers. Return ONLY the description text, no JSON.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Gemini product description error:', error);
    return `Premium quality ${product.name} available at ${product.businessName}. Get the best value at just ₹${product.price}.`;
  }
}

export async function generateSlugSuggestion(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return base;
}

/**
 * Generates a professional product placement image from a user's uploaded photo.
 * Uses Gemini image generation to remove background and place the product on
 * a clean white/neutral gradient studio background.
 * Returns the generated image as a Buffer (JPEG/PNG).
 */
export async function generateProductImage(
  imageBuffer: Buffer,
  productName: string
): Promise<Buffer> {
  const imageGenModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({
    model: 'gemini-3.1-flash-image-preview',
  });

  const base64Image = imageBuffer.toString('base64');

  const prompt = `You are a professional product photographer. Take this product image of "${productName}" and:
1. Remove the existing background completely
2. Place the product on a clean, bright white studio background with a very soft shadow underneath
3. Make it look like a professional e-commerce product photo
4. Keep the product exactly as-is, only enhance the background and lighting
5. Output a high-quality product image suitable for an online store

Return only the enhanced product image.`;

  const result = await imageGenModel.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    },
    { text: prompt },
  ]);

  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  throw new Error('Gemini did not return an image in the response');
}

