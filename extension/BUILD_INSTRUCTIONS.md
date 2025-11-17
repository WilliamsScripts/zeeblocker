# Extension Build Instructions for Different Browsers

The ZeeBlocker extension works on Chrome, Firefox, Brave, Arc, and Edge with minimal changes.

## 🌐 Chrome / Brave / Edge / Arc

These browsers all use the same extension format (Manifest V3).

**Files to use:**
- `manifest.json` (already configured)
- All other files as-is

**Loading for testing:**
1. Open `chrome://extensions/` (or `brave://extensions/`, `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `/extension` folder

**Packaging for store:**
```bash
cd extension
zip -r zeeblocker-chrome.zip . -x "*.git*" -x "*.DS_Store" -x "manifest-firefox.json" -x "BUILD_INSTRUCTIONS.md"
```

## 🦊 Firefox

Firefox uses Manifest V2 and has some differences.

**Files to use:**
- Rename `manifest-firefox.json` to `manifest.json` (backup the original)
- OR use web-ext tool (recommended)

**Method 1: Manual (for testing)**
1. Temporarily rename files:
   ```bash
   mv manifest.json manifest-chrome.json
   mv manifest-firefox.json manifest.json
   ```
2. Open `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select any file in `/extension` folder

**Method 2: Using web-ext (recommended)**
```bash
# Install web-ext
npm install -g web-ext

# Run in Firefox (keeps both manifests)
cd extension
web-ext run --source-dir . --firefox-manifest manifest-firefox.json

# Package for Firefox
web-ext build --source-dir . --firefox-manifest manifest-firefox.json
```

**Packaging for Firefox Add-ons:**
```bash
cd extension

# Temporarily swap manifests
mv manifest.json manifest-chrome.json
mv manifest-firefox.json manifest.json

# Create zip
zip -r zeeblocker-firefox.zip . -x "*.git*" -x "*.DS_Store" -x "manifest-chrome.json" -x "BUILD_INSTRUCTIONS.md"

# Restore
mv manifest.json manifest-firefox.json
mv manifest-chrome.json manifest.json
```

## 🔧 Cross-Browser Compatibility

The extension includes cross-browser compatibility code at the top of each JavaScript file:

```javascript
// Cross-browser compatibility
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  globalThis.chrome = browser
}
```

This allows Firefox (which uses the `browser` namespace) to work with Chrome API calls.

## 📋 Key Differences

### Chrome vs Firefox

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest Version | V3 | V2 |
| Background | service_worker | background.scripts |
| Action | action | browser_action |
| Host Permissions | host_permissions | permissions array |
| Options Page | options_page | options_ui |
| Browser Namespace | chrome | browser |

### Manifest Files

**Chrome** (`manifest.json`):
```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.js"
  },
  "action": { ... }
}
```

**Firefox** (`manifest-firefox.json`):
```json
{
  "manifest_version": 2,
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "browser_action": { ... }
}
```

## 🧪 Testing on Each Browser

### Chrome
```bash
# Open extension page
open -a "Google Chrome" chrome://extensions/

# Or via CLI
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --load-extension=/path/to/extension
```

### Firefox
```bash
# Using web-ext (best method)
cd extension
web-ext run --firefox-manifest manifest-firefox.json

# Shows live reload when you edit files
```

### Brave
```bash
# Same as Chrome
open -a "Brave Browser" brave://extensions/
```

### Edge
```bash
# Same as Chrome
open -a "Microsoft Edge" edge://extensions/
```

### Arc
Arc uses Chrome extensions directly. Load the same way as Chrome.

## 📦 Distribution Checklist

### Before Publishing:

1. ✅ Test on all target browsers
2. ✅ Update version number in both manifests
3. ✅ Create proper screenshots (1280x800)
4. ✅ Write clear description
5. ✅ Include privacy policy link
6. ✅ Test with production API URL
7. ✅ Remove any development/debug code
8. ✅ Verify all icons are included
9. ✅ Check permissions are minimal
10. ✅ Test on different OS (Mac, Windows, Linux)

### Store-Specific Requirements:

**Chrome Web Store:**
- Screenshots: 1280x800 or 640x400
- Promotional images: 440x280 (small), 920x680 (large), 1400x560 (marquee)
- One-time $5 developer fee
- Review time: 1-3 days

**Firefox Add-ons:**
- Screenshots: minimum 640x480
- Icon: 128x128 required
- No fees
- Review time: 1-7 days

**Edge Add-ons:**
- Same as Chrome (uses same format)
- Microsoft Partner Center account required
- Review time: 1-3 days

## 🚀 Automated Build Script

Create a `build.sh` script:

```bash
#!/bin/bash

# Build for Chrome/Brave/Edge/Arc
echo "Building for Chrome-based browsers..."
cd extension
zip -r ../zeeblocker-chrome-v1.0.0.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "manifest-firefox.json" \
  -x "BUILD_INSTRUCTIONS.md" \
  -x "build.sh"

# Build for Firefox
echo "Building for Firefox..."
mv manifest.json manifest-chrome-backup.json
mv manifest-firefox.json manifest.json

zip -r ../zeeblocker-firefox-v1.0.0.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "manifest-chrome-backup.json" \
  -x "BUILD_INSTRUCTIONS.md" \
  -x "build.sh"

# Restore
mv manifest.json manifest-firefox.json
mv manifest-chrome-backup.json manifest.json

cd ..
echo "Done! Created:"
echo "  - zeeblocker-chrome-v1.0.0.zip"
echo "  - zeeblocker-firefox-v1.0.0.zip"
```

Make it executable:
```bash
chmod +x extension/build.sh
./extension/build.sh
```

## 🔍 Debugging

### Chrome DevTools
```javascript
// In background.js
console.log('Background script loaded')

// View logs
chrome://extensions/ > Inspect service worker
```

### Firefox DevTools
```javascript
// In background.js
console.log('Background script loaded')

// View logs
about:debugging > This Firefox > Inspect
```

### Common Issues

**Issue: Extension doesn't load**
- Check manifest.json syntax
- Verify all file paths exist
- Check browser console for errors

**Issue: Chrome API doesn't work in Firefox**
- Ensure compatibility shim is at top of file
- Use `browser` namespace in Firefox if needed

**Issue: Background script not running**
- Chrome: Check if service worker is active
- Firefox: Check if background.scripts is correct

## 📝 Notes

- **Chrome, Brave, Edge, Arc**: Use same build (Manifest V3)
- **Firefox**: Needs separate build (Manifest V2)
- **Cross-browser code**: Already included in all JS files
- **API URL**: Update in production before building
- **Version**: Update in both manifest files

## ✅ Ready for Production

The extension is already configured with cross-browser support. Just:
1. Update API URL in `extension/config.js` (when you create it)
2. Test on each browser
3. Build using instructions above
4. Submit to stores

All the compatibility code is already in place! 🎉

