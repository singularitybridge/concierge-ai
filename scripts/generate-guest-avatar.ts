/**
 * Generate avatar for the Guest Concierge
 */
import * as fs from 'fs';
import * as path from 'path';

const FAL_KEY = process.env.FAL_KEY || 'e2e2ab87-8716-4f47-9e17-4d9fafcf49f8:2ec9112b05c8525e74f32216995bb25d';

async function generateAvatar() {
  console.log('🖼️  Generating Guest Concierge avatar...\n');

  const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'Professional headshot portrait of a friendly Japanese woman in her late 20s, luxury hotel concierge uniform with elegant navy blazer and gold name tag, warm genuine smile, approachable and helpful demeanor, soft studio lighting, clean neutral background, high-end hospitality professional, welcoming expression, square crop portrait photography',
      image_size: 'square',
      num_inference_steps: 4,
      num_images: 1
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate avatar: ${error}`);
  }

  const result = await response.json();
  const imageUrl = result.images?.[0]?.url;

  if (!imageUrl) {
    throw new Error('No image URL in response');
  }

  console.log('  Downloading image...');

  // Download the image
  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Save to public/avatars folder
  const outputDir = path.join(process.cwd(), 'public', 'avatars');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'guest-avatar.jpg');
  fs.writeFileSync(outputPath, buffer);

  console.log('  ✅ Saved: /avatars/guest-avatar.jpg');
  console.log('\n🎉 Avatar generated!');
}

generateAvatar().catch(console.error);
