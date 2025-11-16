# 🎯 ZeeBlocker - Focus & Safety Chrome Extension

A comprehensive Chrome extension designed to boost productivity, ensure child safety, and enforce organizational policies through intelligent website blocking and task management.

## ✨ Features

### 🎯 Core Features
- **Focus Mode**: Block distracting websites to maintain productivity
- **Task Management**: Create tasks with allocated time slots
- **Dark Mode**: Easy on the eyes with beautiful dark theme
- **Idle Time Monitoring**: Get notified when you've been idle too long
- **Real-time Stats**: Track blocked sites and focus time

### 🛡️ Child Safety
- **+18 Site Blocking**: Automatically block adult content
- **Parent Notifications**: Send alerts to parents when restricted sites are accessed
- **Access Attempt Logging**: Keep track of all restricted site access attempts
- **COPPA Compliant**: Designed with children's privacy regulations in mind

### 🏢 Organization Mode
- **Company Policy Enforcement**: Deploy on office laptops to block distracting sites
- **Disable Notifications**: Get notified when employees disable the extension
- **Usage Statistics**: Track blocked sites and productivity metrics
- **Centralized Management**: Configure settings across multiple machines

### 🔗 Third-Party Integrations
- **Jira**: Sync tasks from Jira projects
- **ClickUp**: Import tasks from ClickUp workspaces
- **Trello**: Sync cards from Trello boards

## 📦 Installation

### Method 1: Chrome Web Store (Recommended)
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Follow the on-screen instructions

### Method 2: Developer Mode (For Testing)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `zeeblocker` folder
6. The extension icon should appear in your toolbar

### Generating Icons
Before loading the extension in developer mode, you need to generate the icon files:
1. Open `icons/generate-icons.html` in your browser
2. The icons will be automatically downloaded
3. Place them in the `icons/` folder

## 🚀 Getting Started

### For Personal Use
1. Click the ZeeBlocker icon in your toolbar
2. Toggle "Focus Mode" to start blocking distracting sites
3. Add tasks with time slots to stay organized
4. Customize your blocklist in Settings

### For Parents
1. Open Settings (gear icon in popup)
2. Navigate to "Child Safety" tab
3. Enable "Child Safety Mode"
4. Enter your email address for notifications
5. Add additional restricted sites as needed

### For Organizations
1. Install the extension on employee laptops
2. Open Settings > Organization tab
3. Enable "Organization Mode"
4. Enter admin email for notifications
5. Configure blocked sites and policies
6. Communicate the policy to all employees (required by law)

## 📋 Usage Guide

### Managing Tasks
- Click "+ Add Task" in the popup
- Enter task title, start time, end time, and optional description
- Mark tasks complete with the checkmark icon
- Delete tasks with the trash icon

### Managing Blocklist
- Open Settings > Blocklist
- Enter domain name (e.g., `facebook.com`)
- Click "Add Site"
- Remove sites anytime by clicking "Remove"

### Setting Up Integrations
1. Open Settings > Integrations
2. Toggle on your desired integration (Jira, ClickUp, or Trello)
3. Enter API credentials
4. Click "Test Connection" to verify
5. Click "Sync All Integrations" to import tasks

## ⚖️ Legal & Privacy

### General Compliance
This extension is designed to comply with applicable laws, but proper usage requires adherence to legal requirements:

### Child Safety & COPPA Compliance
- **Parental Consent Required**: You MUST obtain explicit consent from parents/guardians before enabling Child Safety mode
- **Data Collection**: The extension logs access attempts but does NOT transmit personal information without consent
- **Age Verification**: Ensure users are of appropriate age or have parental permission
- **COPPA (USA)**: Complies with the Children's Online Privacy Protection Act when proper consent is obtained
- **GDPR (EU)**: Data processing complies with GDPR requirements when configured properly

### Organization/Workplace Monitoring
- **Employee Notification**: You MUST inform employees about monitoring before deployment
- **Consent**: Obtain written consent from employees where required by local law
- **Purpose Limitation**: Only use collected data for stated productivity purposes
- **Data Security**: Implement proper security measures to protect employee data
- **Local Laws**: Compliance with employment laws varies by jurisdiction - consult legal counsel

### Privacy Commitments
- ✅ No data is sent to external servers without explicit configuration
- ✅ Email notifications only sent when explicitly enabled
- ✅ All settings stored locally in Chrome's sync storage
- ✅ No tracking, analytics, or third-party data sharing
- ✅ Open source and auditable code

### Data Storage
- **Sync Storage**: Settings, tasks, and site lists (synced across devices)
- **Local Storage**: Stats, access logs (local only)
- **No External Storage**: No data sent to external servers unless integrations are enabled

## 🔐 Permissions Explained

This extension requires the following permissions:

- **`storage`**: Save your settings, tasks, and preferences
- **`tabs`**: Detect which websites you visit to apply blocking rules
- **`notifications`**: Show alerts for focus mode, idle time, and safety notifications
- **`idle`**: Detect when you've been inactive
- **`alarms`**: Schedule periodic checks and notifications
- **`webNavigation`**: Monitor page navigation for blocking
- **`<all_urls>`**: Check websites against your blocklist (only active when focus mode is on)

## 🛠️ Configuration

### Default Blocked Sites (Focus Mode)
- facebook.com
- twitter.com / x.com
- instagram.com
- tiktok.com
- youtube.com
- reddit.com
- netflix.com
- twitch.tv
- pinterest.com

### Default Restricted Sites (Child Safety)
The extension includes a predefined list of adult content sites. Parents can add additional sites as needed.

## 🔧 Troubleshooting

### Extension Not Blocking Sites
1. Ensure Focus Mode or Child Safety Mode is enabled
2. Check that the site is in your blocklist
3. Try refreshing the page
4. Restart Chrome if issues persist

### Notifications Not Working
1. Check Chrome notification permissions
2. Ensure the extension has notification permission
3. Check your system's notification settings

### Integration Sync Issues
1. Verify API credentials are correct
2. Test connection before syncing
3. Check API rate limits
4. Ensure stable internet connection

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

### Legal Disclaimer
This extension is provided "as is" without warranty of any kind. The developers are not liable for:
- Misuse of the extension
- Non-compliance with local laws
- Data loss or security issues
- Employment disputes arising from use

### Responsibility
- **Parents**: You are responsible for monitoring your children's internet usage
- **Organizations**: You are responsible for compliance with employment and privacy laws
- **Users**: You are responsible for understanding and complying with terms of service of blocked websites

### Not Legal Advice
This README provides general information about legal compliance but is NOT legal advice. Consult with a qualified attorney regarding:
- COPPA compliance for child safety features
- Employment law compliance for workplace monitoring
- Privacy law compliance (GDPR, CCPA, etc.)
- Industry-specific regulations

## 🆘 Support

### Frequently Asked Questions

**Q: Can websites detect that they're being blocked?**  
A: No, the extension redirects before the page loads. Websites cannot detect the extension.

**Q: Does this work in Incognito mode?**  
A: Only if you enable it in Chrome's extension settings (chrome://extensions/).

**Q: Can blocked websites be bypassed?**  
A: Users can disable the extension or use another browser. For true enforcement, combine with network-level filtering.

**Q: Are parent notifications sent via email?**  
A: Currently, notifications are browser-based. Email integration requires additional backend setup (not included).

**Q: How do I uninstall?**  
A: Go to chrome://extensions/, find ZeeBlocker, and click "Remove".

### Contact
For support, bug reports, or feature requests:
- Create an issue on GitHub
- Email: support@zeeblocker.example.com (update with actual email)

## 🗺️ Roadmap

- [ ] Email notification backend
- [ ] Mobile app for parents/admins
- [ ] Advanced analytics dashboard
- [ ] More integration options (Asana, Monday.com)
- [ ] Custom scheduling (weekend modes, work hours)
- [ ] Multi-user profiles
- [ ] Export/import settings
- [ ] Browser sync across devices

## 🎉 Acknowledgments

Built with modern web technologies:
- Manifest V3 (Chrome Extensions)
- Vanilla JavaScript (no frameworks needed)
- Modern CSS with CSS Variables
- Service Workers for background processing

## 📊 Version History

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ Focus mode with site blocking
- ✅ Task management with time slots
- ✅ Child safety mode with parent notifications
- ✅ Organization mode with admin features
- ✅ Dark mode support
- ✅ Idle time monitoring
- ✅ Third-party integrations (Jira, ClickUp, Trello)
- ✅ Real-time statistics
- ✅ Comprehensive settings page

---

**Made with ❤️ for productivity, safety, and focus**

*Remember: Technology should serve humanity, not distract from it.*

