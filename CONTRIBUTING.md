# 🤝 Contributing to ZeeBlocker

Thank you for your interest in contributing to ZeeBlocker! This document provides guidelines for contributing to the project.

## Code of Conduct

### Our Pledge
- Be respectful and inclusive
- Welcome newcomers
- Focus on what's best for the community
- Show empathy towards others

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**
1. Check existing issues to avoid duplicates
2. Verify the bug exists in the latest version
3. Test in a clean Chrome profile if possible

**Submitting a bug report:**
1. Use the GitHub issue tracker
2. Provide a clear title and description
3. Include steps to reproduce
4. Specify Chrome version and OS
5. Add screenshots if applicable
6. Include console errors (F12 > Console)

### Suggesting Features

**Before suggesting:**
1. Check if it's already been proposed
2. Consider if it fits the extension's purpose
3. Think about privacy implications

**Making a suggestion:**
1. Open a GitHub issue with "Feature Request" label
2. Explain the use case clearly
3. Describe the proposed solution
4. Consider alternatives
5. Be open to feedback

### Contributing Code

#### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/zeeblocker.git
   cd zeeblocker
   ```

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Load unpacked extension

3. **Make changes**
   - Edit files
   - Reload extension to test

#### Coding Standards

**JavaScript:**
- Use modern ES6+ syntax
- Use async/await over promises when possible
- Add comments for complex logic
- Use descriptive variable names
- Follow existing code style

**HTML/CSS:**
- Use semantic HTML
- Maintain consistent indentation (2 spaces)
- Use CSS variables for theming
- Ensure dark mode compatibility
- Keep accessibility in mind

**Git Commits:**
- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove)
- Reference issue numbers when applicable
- Keep commits focused and atomic

Examples:
```
✅ Add idle time threshold configuration
✅ Fix dark mode toggle in settings
✅ Update Jira integration API
❌ Fixed stuff
❌ WIP
```

#### Pull Request Process

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean code
   - Test thoroughly
   - Update documentation if needed

3. **Test your changes**
   - Test in both light and dark modes
   - Test all affected features
   - Check console for errors
   - Test in different scenarios (focus mode on/off, etc.)

4. **Submit PR**
   - Push to your fork
   - Create pull request to main branch
   - Fill out PR template
   - Reference related issues
   - Describe changes clearly

5. **Code Review**
   - Respond to feedback
   - Make requested changes
   - Keep discussion professional

6. **Merge**
   - Maintainers will merge after approval
   - PR may be squashed or rebased

### Areas for Contribution

#### High Priority
- 🐛 Bug fixes
- 📝 Documentation improvements
- ♿ Accessibility enhancements
- 🌐 Internationalization (i18n)
- 🔒 Security improvements

#### Medium Priority
- ✨ New features (discuss first)
- 🎨 UI/UX improvements
- ⚡ Performance optimizations
- 🧪 Test coverage

#### Low Priority
- 🎉 Nice-to-have features
- 🔧 Code refactoring
- 📊 Additional integrations

## Project Structure

```
zeeblocker/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Main popup interface
├── popup.js              # Popup logic
├── background.js         # Service worker
├── content.js            # Content script for blocking
├── blocked.html          # Blocked site page
├── blocked.js            # Blocked page logic
├── settings.html         # Settings page
├── settings.js           # Settings logic
├── styles/
│   ├── popup.css        # Popup styles
│   └── settings.css     # Settings styles
├── icons/               # Extension icons
└── README.md            # Main documentation
```

## Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Focus Mode blocks sites correctly
- [ ] Child Safety Mode works
- [ ] Organization Mode functions
- [ ] Tasks can be created/edited/deleted
- [ ] Settings save and load correctly
- [ ] Dark mode toggle works
- [ ] Integrations connect properly
- [ ] Notifications appear
- [ ] Blocked page displays correctly
- [ ] No console errors
- [ ] Works in incognito (if enabled)

### Browser Testing
- Chrome (latest version)
- Chrome Beta (if available)
- Edge (Chromium-based)

## Documentation

### When to Update Documentation

Update docs when you:
- Add new features
- Change existing behavior
- Fix significant bugs
- Add configuration options
- Change permissions

### Documentation Files
- **README.md**: Main documentation
- **INSTALLATION.md**: Installation guide
- **PRIVACY.md**: Privacy policy
- **This file**: Contribution guidelines
- **Code comments**: For complex logic

## Legal Considerations

### Privacy
- Don't add tracking or analytics
- Don't collect unnecessary data
- Respect user privacy
- Document data usage

### Licensing
- All contributions are MIT licensed
- Don't submit copyrighted code
- Credit third-party code/resources
- Ensure compatibility with MIT license

### Compliance
- Consider COPPA implications
- Consider GDPR implications
- Consider workplace monitoring laws
- Don't add legally problematic features

## Community

### Getting Help
- Open an issue for questions
- Join discussions on GitHub
- Be patient and respectful

### Recognition
- Contributors will be listed in README
- Significant contributions will be highlighted
- All help is appreciated!

## Review Process

### What We Look For
- ✅ Code quality
- ✅ Test coverage
- ✅ Documentation
- ✅ Privacy implications
- ✅ User experience
- ✅ Performance impact

### Timeline
- Initial review: Within 7 days
- Follow-up: As needed
- Merge: After approval from maintainers

## Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search closed issues
3. Open a discussion on GitHub
4. Ask in your PR/issue

## Thank You!

Every contribution helps make ZeeBlocker better. Whether you're fixing a typo, reporting a bug, or adding a major feature - thank you for taking the time to contribute! 🎉

---

**Happy coding! 🚀**

