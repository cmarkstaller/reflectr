# Reflectr PWA

A Progressive Web App built for Vercel hosting.

## Setup Instructions

### 1. Create Icons

You need to create app icons in the following sizes and place them in the `/icons` directory:

**Required Icons:**
- `icon-16x16.png` (16x16 pixels)
- `icon-32x32.png` (32x32 pixels)
- `icon-72x72.png` (72x72 pixels)
- `icon-96x96.png` (96x96 pixels)
- `icon-128x128.png` (128x128 pixels)
- `icon-144x144.png` (144x144 pixels)
- `icon-152x152.png` (152x152 pixels)
- `icon-192x192.png` (192x192 pixels)
- `icon-384x384.png` (384x384 pixels)
- `icon-512x512.png` (512x512 pixels)
- `apple-touch-icon.png` (180x180 pixels - for iOS)

### 2. Icon Creation Tools

You can use these tools to generate all icon sizes from a single source image:

- **PWA Asset Generator**: https://github.com/onderceylan/pwa-asset-generator
- **RealFaviconGenerator**: https://realfavicongenerator.net/
- **PWA Builder**: https://www.pwabuilder.com/imageGenerator

**Recommended workflow:**
1. Create a square source image (at least 512x512 pixels, preferably 1024x1024)
2. Use one of the tools above to generate all required sizes
3. Place all generated icons in the `/icons` directory

### 3. Directory Structure

After adding icons, your project should look like this:

```
reflectr/
├── icons/
│   ├── icon-16x16.png
│   ├── icon-32x32.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
├── index.html
├── manifest.json
├── sw.js
├── app.js
├── styles.css
├── package.json
├── vercel.json
└── README.md
```

### 4. Testing Locally

Before deploying to Vercel, test locally:

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

### 5. Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Vercel will automatically detect the static site configuration

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

### 6. PWA Testing

After deployment, test your PWA:

1. **Chrome DevTools**: 
   - Open DevTools → Application tab
   - Check "Service Workers" and "Manifest"
   - Use "Lighthouse" to audit PWA features

2. **Mobile Testing**:
   - Visit your site on a mobile device
   - Use "Add to Home Screen" option
   - Verify the app opens in standalone mode

## Features Included

✅ Web App Manifest  
✅ Service Worker (offline support)  
✅ Responsive design  
✅ Vercel configuration  
✅ PWA meta tags for iOS  

## Next Steps

Once icons are added, you can:
1. Customize the theme color in `manifest.json` and `index.html`
2. Update the app name and description
3. Add your actual app content
4. Enhance the service worker with more caching strategies

