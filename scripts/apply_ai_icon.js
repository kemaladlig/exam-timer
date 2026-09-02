import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processIcon() {
  const sourcePath = 'C:/Users/kemal/.gemini/antigravity-ide/brain/fb3cc549-2f87-4250-9279-d01f12f25cf2/exam_timer_established_a_1788365062462.jpg';
  const publicDir = path.resolve('public');

  // Let's create an elegant, seamless background that blends with the source image's dark navy gradient.
  // We will create a vignette / feathered alpha mask for the inner resized image so its edges smoothly fade into the canvas background.
  const innerSize = 420;
  
  // Feather mask SVG: solid white in center, fading to transparent at outer 10px
  const maskSvg = `
  <svg width="${innerSize}" height="${innerSize}">
    <defs>
      <radialGradient id="fade" cx="50%" cy="50%" r="50%">
        <stop offset="85%" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="98%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${innerSize}" height="${innerSize}" fill="url(#fade)"/>
  </svg>`;
  
  const maskBuffer = Buffer.from(maskSvg);

  const innerResized = await sharp(sourcePath)
    .resize(innerSize, innerSize, { fit: 'cover' })
    .toBuffer();

  // Apply feather mask to inner image
  const featheredInner = await sharp(innerResized)
    .composite([{
      input: await sharp(maskBuffer).toFormat('png').toBuffer(),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  // Create background with matching deep blue radial gradient
  const bgSvg = `
  <svg width="512" height="512">
    <defs>
      <radialGradient id="bgGradient" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="#14264b"/>
        <stop offset="70%" stop-color="#0e172e"/>
        <stop offset="100%" stop-color="#080e1c"/>
      </radialGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bgGradient)"/>
  </svg>`;

  const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  const finalIcon = await sharp(bgBuffer)
    .composite([{
      input: featheredInner,
      gravity: 'center'
    }])
    .png({ quality: 100 })
    .toBuffer();

  // Write to public/app-icon.png
  fs.writeFileSync(path.join(publicDir, 'app-icon.png'), finalIcon);
  fs.writeFileSync(path.join(publicDir, 'app-icon.jpg'), await sharp(finalIcon).jpeg({ quality: 95 }).toBuffer());

  // Also create a preview in brain folder so we can view it
  const previewPath = 'C:/Users/kemal/.gemini/antigravity-ide/brain/fb3cc549-2f87-4250-9279-d01f12f25cf2/final_app_icon_preview.png';
  fs.writeFileSync(previewPath, finalIcon);

  console.log('App icon feathered and rendered seamlessly!');
}

processIcon().catch(console.error);
