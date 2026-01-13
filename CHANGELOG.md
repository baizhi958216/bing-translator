# Changelog

All notable changes to the "bing-translator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-01-13

### Added
- **Dynamic Language Selection**: Users can now select source and target languages when translating, instead of relying solely on settings
- **Unified Webview Translation Interface**: New modern translation panel with all options in one place
  - Source and target language dropdowns
  - Language swap button for quick reversal
  - Text input area with multi-line support
  - Translation result display area
  - Copy result and replace selection buttons
  - Ctrl+Enter keyboard shortcut for quick translation
- **UI Mode Configuration**: New `useWebviewUI` setting to switch between interface modes
  - Webview mode (default): Unified interface with all options in one panel
  - QuickPick mode: Multi-step interface with separate language selection dialogs
- **Language List Module**: Added comprehensive language list with 30+ common languages
  - Support for both English and Chinese language names
  - Auto-detect option for source language

### Improved
- Enhanced internationalization support
  - All user-facing strings now properly localized
  - Fixed hardcoded English strings in commands.js
  - Added language selection prompts to i18n module
- Better user experience with flexible translation workflow
- Automatic language name display based on VS Code language settings

## [1.0.3] - 2026-01-10

### Fixed
- Fixed initialization failure when Bing Translator redirects to regional domains (e.g., cn.bing.com)
- Added HTTP redirect handling in configuration fetching process
- Made hostname dynamic to support all regional Bing domains automatically

### Improved
- Enhanced `fetchGlobalConfig()` method to follow HTTP 302 redirects
- Added `hostname` property to track the final regional domain after redirects
- Updated translation API requests to use the correct regional hostname

## [1.0.2] - 2026-01-10

### Added
- Context menu integration: Right-click on selected text to translate
- "Translate Selection" option in editor context menu (appears when text is selected)

### Changed
- Enhanced user experience with additional translation access method

## [1.0.1] - 2026-01-10

### Added
- Multi-language interface support (Chinese and English)
- Auto-detect VSCode language settings and display corresponding interface
- Chinese localization file (package.nls.zh-cn.json)
- English localization file (package.nls.json)
- Internationalization module (src/i18n.js)
- Chinese README (README.zh-CN.md)
- Chinese CHANGELOG (CHANGELOG.zh-CN.md)

### Improved
- All user interface text is now localized
- Command titles support multiple languages
- Configuration descriptions support multiple languages
- Error messages support multiple languages
- Status bar text and tooltips support multiple languages

### Technical Improvements
- Added i18n module for runtime string localization
- Use VSCode standard package.nls mechanism for extension metadata localization
- Support automatic user language detection via vscode.env.language

## [1.0.0] - 2026-01-09

### Added
- Initial release of Bing Translator
- Input box translation mode with Ctrl+Shift+T keyboard shortcut
- Selection translation mode with Ctrl+Alt+T keyboard shortcut
- Status bar integration with globe icon
- Configurable source and target languages
- Support for 180+ languages via Bing Translator API
- Auto-detect source language support
- Smart error handling with user-friendly messages
- Dynamic status bar tooltip showing current language pair
- Configuration change listener for real-time updates
- Modular architecture with separate StatusBarManager and Commands classes
- Simplified Bing Translator API client with token management