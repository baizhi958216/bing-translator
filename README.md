# Bing Translator

A simple and efficient VSCode extension for translating text using Bing Translator API.

## Features

- **Quick Translation**: Translate text with keyboard shortcuts, context menu, or status bar button
- **Dynamic Language Selection**: Choose source and target languages on-the-fly when translating
- **Two UI Modes**:
  - **Webview Mode** (default): Modern unified interface with all options in one panel
  - **QuickPick Mode**: Multi-step interface with separate language selection dialogs
- **Two Translation Modes**:
  - **Input Box Mode** (Ctrl+Shift+T): Enter text in a dialog and view translation
  - **Selection Mode** (Ctrl+Alt+T or right-click): Translate selected text in editor and optionally replace it
- **Context Menu Integration**: Right-click on selected text to translate
- **Configurable Languages**: Set your preferred default source and target languages
- **Status Bar Integration**: Click the globe icon to translate, with dynamic tooltip showing current language pair
- **Auto-detect**: Supports automatic language detection
- **Smart Error Handling**: User-friendly error messages for common issues
- **Multi-language Interface**: Supports English and Chinese UI

## Usage

### Webview Mode (Default)

When using Webview mode, you'll get a modern translation panel with all options in one place:

1. Press `Ctrl+Shift+T` or click the status bar button to open the translation panel
2. Select source language from the dropdown (or use auto-detect)
3. Select target language from the dropdown
4. Use the swap button (⇄) to quickly reverse source and target languages
5. Enter or paste text to translate
6. Click "Translate" button or press `Ctrl+Enter`
7. View the translation result
8. Use "Copy Result" to copy the translation
9. Use "Replace Selection" to replace selected text in editor (when translating selection)

### QuickPick Mode

To use the classic multi-step interface:

1. Open Settings (File > Preferences > Settings)
2. Search for "Bing Translator"
3. Uncheck "Use Webview UI"
4. Now when you translate, you'll be prompted to select languages step-by-step

### Method 1: Input Box Translation (Ctrl+Shift+T)
1. Press `Ctrl+Shift+T` (Windows/Linux) or `Cmd+Shift+T` (Mac)
2. Select source and target languages (or use defaults)
3. Enter the text you want to translate
4. Press Enter to see the translation result
5. Copy the translation or press Esc to close

### Method 2: Selection Translation (Ctrl+Alt+T)
1. Select text in your editor
2. Press `Ctrl+Alt+T` (Windows/Linux) or `Cmd+Alt+T` (Mac)
3. Select source and target languages (or use defaults)
4. View the translation result
5. Press Enter to replace the selection with translation, or Esc to keep original

### Method 3: Context Menu Translation (Right-click)
1. Select text in your editor
2. Right-click on the selected text
3. Click "Translate Selection" (or "翻译选中内容" in Chinese)
4. Select source and target languages (or use defaults)
5. View the translation result
6. Press Enter to replace the selection with translation, or Esc to keep original

### Method 4: Status Bar Button
1. Click the "$(globe) Translate" button in the status bar (bottom right)
2. Select source and target languages (or use defaults)
3. Enter the text you want to translate
4. Press Enter to see the translation result

## Configuration

You can configure the extension in VSCode settings:

1. Open Settings (File > Preferences > Settings)
2. Search for "Bing Translator"
3. Available settings:
   - **Source Language**: Default source language (default: `en`)
   - **Target Language**: Default target language (default: `zh-Hans`)
   - **Use Webview UI**: Use unified Webview interface (default: `true`)
     - When enabled: Modern panel with all options in one place
     - When disabled: Multi-step QuickPick interface

### Supported Language Codes

Common language codes:
- `en` - English
- `zh-Hans` - Chinese Simplified
- `zh-Hant` - Chinese Traditional
- `ja` - Japanese
- `ko` - Korean
- `fr` - French
- `de` - German
- `es` - Spanish
- `ru` - Russian
- `ar` - Arabic
- `pt` - Portuguese
- `it` - Italian
- `auto-detect` - Auto-detect source language

For a complete list of 180+ supported languages, see [src/languages.json](src/languages.json).

### Example Configuration

Add to your `settings.json`:

```json
{
  "bing-translator.sourceLanguage": "en",
  "bing-translator.targetLanguage": "zh-Hans"
}
```

## Commands

- **Translate Text** (`bing-translator.translate`): Open input box to translate text
- **Translate Selection** (`bing-translator.translateSelection`): Translate selected text in editor

## Keyboard Shortcuts

- `Ctrl+Shift+T` (Mac: `Cmd+Shift+T`): Open translation input box
- `Ctrl+Alt+T` (Mac: `Cmd+Alt+T`): Translate selected text (when text is selected)

## Installation

### From Source

1. Clone or download this repository
2. Open the folder in VSCode
3. Press F5 to run the extension in a new Extension Development Host window
4. Test the translation feature

### Package and Install

1. Install vsce: `npm install -g @vscode/vsce`
2. Package the extension: `npm run build`
3. Install the .vsix file: Extensions > Install from VSIX

## Requirements

- VSCode version 1.96.0 or higher
- Internet connection (for Bing Translator API)

## Known Limitations

- Requires active internet connection
- Subject to Bing Translator rate limits
- May require captcha verification if used too frequently
- Maximum text length: ~1000 characters (Bing Translator limit)

## Troubleshooting

### "Translation limit exceeded"
This means you've hit Bing Translator's rate limit. Wait a few minutes and try again.

### "Failed to connect to translation service"
Check your internet connection and firewall settings. Ensure you can access bing.com.

### "Translation service requires verification"
Bing Translator is asking for captcha verification. Wait a while before trying again.

### Status bar not showing
The extension activates on startup. If the status bar doesn't appear, try reloading VSCode.

## Development

### Building
```bash
npm run package
```

### Publishing
```bash
npm run publish
```
