# 🚀 ZeeBlocker Installation Guide

This guide will walk you through installing ZeeBlocker step-by-step.

## Prerequisites

- Google Chrome browser (version 88 or higher)
- Basic computer knowledge

## Installation Methods

### Option 1: Developer Mode (Recommended for Testing)

#### Step 1: Download the Extension
1. Download the ZeeBlocker folder to your computer
2. Extract it if it's in a ZIP file
3. Remember the location (e.g., `Downloads/zeeblocker`)

#### Step 2: Generate Icons
Before loading the extension, you need to create the icon files:

1. Navigate to the `icons` folder in the zeeblocker directory
2. Open `generate-icons.html` in your Chrome browser
3. Three PNG files will automatically download:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
4. Move these files into the `icons` folder, replacing the placeholder files

#### Step 3: Load the Extension
1. Open Chrome browser
2. Type `chrome://extensions/` in the address bar and press Enter
3. Toggle on **"Developer mode"** in the top right corner
4. Click the **"Load unpacked"** button that appears
5. Navigate to and select the `zeeblocker` folder
6. Click **"Select"** or **"Open"**

#### Step 4: Verify Installation
1. You should see ZeeBlocker appear in your extensions list
2. A 🎯 icon should appear in your Chrome toolbar
3. Click the icon to open the popup and verify it loads correctly

### Option 2: Chrome Web Store (Coming Soon)

Once ZeeBlocker is published to the Chrome Web Store:

1. Visit the Chrome Web Store
2. Search for "ZeeBlocker"
3. Click "Add to Chrome"
4. Confirm the installation
5. Done!

## Initial Setup

### For Personal Use

1. **Click the ZeeBlocker icon** in your toolbar
2. The popup will open showing Focus Mode and Tasks
3. **Optional**: Click the ⚙️ icon to open Settings
4. Configure your preferences:
   - Enable Dark Mode if desired
   - Set idle time threshold
   - Customize your blocklist
5. **Start using**: Toggle Focus Mode to begin blocking distracting sites

### For Parents (Child Safety)

1. **Open Settings**: Click ⚙️ in the popup
2. **Navigate to Child Safety tab**
3. **Enable Child Safety Mode**
4. **Enter your email** for notifications
5. **Review restricted sites** list and add more if needed
6. **Important**: Discuss internet safety with your child
7. **Legal**: Ensure you have proper consent and authority to monitor

### For Organizations

1. **Install on all employee laptops** using the same method
2. **Open Settings** on one machine to configure
3. **Navigate to Organization tab**
4. **Enable Organization Mode**
5. **Enter admin email** for notifications
6. **Configure blocklist** according to company policy
7. **Critical**: 
   - Inform all employees about monitoring
   - Obtain necessary consents
   - Document your policy
   - Consult legal counsel for compliance

## Configuring Integrations

### Jira Integration

1. Open Settings > Integrations
2. Toggle on Jira
3. Enter your Jira domain (e.g., `yourcompany.atlassian.net`)
4. Generate an API key:
   - Log into Jira
   - Go to Account Settings > Security > API tokens
   - Create a new token
   - Copy and paste it into ZeeBlocker
5. Click "Test Connection"
6. Click "Sync All Integrations" to import tasks

### ClickUp Integration

1. Open Settings > Integrations
2. Toggle on ClickUp
3. Get your API key:
   - Log into ClickUp
   - Go to Settings > Apps
   - Generate an API token
   - Copy and paste it into ZeeBlocker
4. Click "Test Connection"
5. Click "Sync All Integrations"

### Trello Integration

1. Open Settings > Integrations
2. Toggle on Trello
3. Get your API credentials:
   - Visit https://trello.com/app-key
   - Copy your API Key
   - Generate a Token (click the link on that page)
   - Copy both into ZeeBlocker
4. Click "Test Connection"
5. Click "Sync All Integrations"

## Enabling in Incognito Mode (Optional)

If you want ZeeBlocker to work in Incognito/Private windows:

1. Go to `chrome://extensions/`
2. Find ZeeBlocker
3. Click "Details"
4. Scroll down to "Allow in Incognito"
5. Toggle it ON

## Troubleshooting Installation

### Extension Won't Load

**Problem**: "Manifest file is missing or unreadable"  
**Solution**: 
- Ensure you selected the correct folder (the one containing `manifest.json`)
- Check that all files were extracted properly
- Verify the `manifest.json` file exists and is not corrupted

**Problem**: "Icons are missing"  
**Solution**:
- Generate icons using `icons/generate-icons.html`
- Ensure PNG files are in the `icons` folder
- Temporarily, Chrome may show a gray icon but the extension will still work

### Extension Loads but Doesn't Work

**Problem**: Sites aren't being blocked  
**Solution**:
1. Ensure Focus Mode is toggled ON in the popup
2. Verify the site is in your blocklist (Settings > Blocklist)
3. Try refreshing the webpage
4. Check that the extension is enabled in `chrome://extensions/`

**Problem**: Popup won't open  
**Solution**:
1. Right-click the extension icon > Inspect popup
2. Check the console for errors
3. Try disabling and re-enabling the extension
4. Reload the extension (click the refresh icon in chrome://extensions/)

### Permissions Issues

**Problem**: Extension asks for too many permissions  
**Explanation**: 
- `storage`: Needed to save your settings
- `tabs`: Required to check which sites to block
- `<all_urls>`: Only used when Focus Mode is active
- See README.md "Permissions Explained" for full details

## Updating the Extension

### Developer Mode Updates

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on ZeeBlocker's card
4. Test the changes

### Chrome Web Store Updates

Updates will happen automatically when published to the store.

## Uninstalling

If you need to remove ZeeBlocker:

1. Go to `chrome://extensions/`
2. Find ZeeBlocker
3. Click "Remove"
4. Confirm the removal

**Note**: This will delete all your settings, tasks, and data.

## Data Backup (Optional)

To backup your settings:

1. Open Chrome DevTools (F12)
2. Go to Application > Storage > Chrome Storage
3. Copy the data
4. Save to a text file

To restore:
1. Reinstall the extension
2. Open DevTools
3. Manually re-enter the data

## Next Steps

After installation:

1. ✅ Read the [README.md](README.md) for full feature documentation
2. ✅ Review the legal and privacy information
3. ✅ Customize your blocklist
4. ✅ Create your first task
5. ✅ Enable Focus Mode and start being productive!

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting-installation) section above
2. Review the main README.md file
3. Check the browser console for errors (F12 > Console)
4. Create an issue on GitHub with details:
   - Chrome version
   - Operating system
   - Error messages
   - Steps to reproduce

---

**Enjoy using ZeeBlocker! 🎯**

*Stay focused. Stay safe. Stay productive.*

