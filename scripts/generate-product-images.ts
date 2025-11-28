/**
 * Generate product images for The 1898 Boutique using fal.ai
 */
import * as fs from 'fs';
import * as path from 'path';

const FAL_KEY = process.env.FAL_KEY || 'e2e2ab87-8716-4f47-9e17-4d9fafcf49f8:2ec9112b05c8525e74f32216995bb25d';

const products = [
  {
    id: 'royce-collection',
    prompt: 'Product photography of luxury Japanese Royce chocolate gift box, Hokkaido famous Nama chocolate collection, elegant gold and brown packaging, 24 pieces assortment visible, soft studio lighting, white marble background, high-end confectionery, professional commercial photography, 4k quality'
  },
  {
    id: 'whisky-yoichi',
    prompt: 'Product photography of Nikka Yoichi single malt whisky bottle, Japanese premium whisky, amber liquid in crystal glass beside bottle, aged 12 years label, dark wood background with Japanese aesthetic, warm moody lighting, luxury spirits commercial photography, 4k quality'
  },
  {
    id: 'onsen-salts',
    prompt: 'Product photography of Japanese onsen bath salts set, 5 elegant glass jars with different colored mineral salts arranged beautifully, hinoki yuzu lavender matcha sulfur varieties, traditional Japanese spa aesthetic, bamboo tray, soft natural lighting, wellness product photography, 4k quality'
  },
  {
    id: 'in-room-massage',
    prompt: 'Luxury Japanese shiatsu massage in upscale hotel suite, professional massage therapist performing relaxing treatment, warm ambient lighting, traditional Japanese interior with modern touches, aromatherapy oils and warm towels visible, spa wellness experience photography, 4k quality'
  },
  {
    id: 'private-chef',
    prompt: 'Private chef kaiseki dinner experience in luxury Japanese hotel suite, chef in white uniform preparing elegant 8-course meal, beautiful presentation on traditional Japanese ceramics, intimate setting with mountain view through window, warm candlelit atmosphere, fine dining photography, 4k quality'
  }
];

async function generateImage(product: typeof products[0]): Promise<string> {
  console.log(`  Generating: ${product.id}...`);

  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: product.prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 4,
      num_images: 1
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate ${product.id}: ${error}`);
  }

  const result = await response.json();
  const imageUrl = result.images?.[0]?.url;

  if (!imageUrl) {
    throw new Error(`No image URL in response for ${product.id}`);
  }

  // Download the image
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Save to public/products folder
  const outputDir = path.join(process.cwd(), 'public', 'products');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${product.id}.jpg`);
  fs.writeFileSync(outputPath, buffer);

  console.log(`  ✅ Saved: /products/${product.id}.jpg`);
  return `/products/${product.id}.jpg`;
}

async function main() {
  console.log('🖼️  Generating product images for The 1898 Boutique...\n');

  const results: Record<string, string> = {};

  for (const product of products) {
    try {
      results[product.id] = await generateImage(product);
    } catch (error) {
      console.error(`  ❌ Failed: ${product.id}`, error);
    }
  }

  console.log('\n🎉 Image generation complete!');
  console.log('\nGenerated images:');
  for (const [id, path] of Object.entries(results)) {
    console.log(`  ${id}: ${path}`);
  }
  console.log('\nUpdate shop/page.tsx to use these image paths.');
}

main().catch(console.error);
