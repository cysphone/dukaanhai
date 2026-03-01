import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

export async function generateProductDescription(product: {
  name: string;
  price: number;
  businessName: string;
  category: string;
}) {
  const prompt = `Generate a compelling product description for an Indian local store product.

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
