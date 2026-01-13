const vscode = require('vscode');
const { languages } = require('./languages');
const i18n = require('./i18n');

class TranslatePanel {
    static currentPanel = undefined;

    constructor(panel, extensionUri, translator) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._translator = translator;
        this._disposables = [];

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        this._setWebviewMessageListener(this._panel.webview);
    }

    static createOrShow(extensionUri, translator, initialText = '') {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (TranslatePanel.currentPanel) {
            TranslatePanel.currentPanel._panel.reveal(column);
            if (initialText) {
                TranslatePanel.currentPanel._panel.webview.postMessage({
                    type: 'setText',
                    text: initialText
                });
            }
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'bingTranslator',
            'Bing Translator',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        TranslatePanel.currentPanel = new TranslatePanel(panel, extensionUri, translator);

        if (initialText) {
            setTimeout(() => {
                panel.webview.postMessage({
                    type: 'setText',
                    text: initialText
                });
            }, 100);
        }
    }

    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'translate':
                        await this._handleTranslate(message.text, message.sourceLang, message.targetLang);
                        break;
                    case 'replace':
                        await this._handleReplace(message.text);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    async _handleTranslate(text, sourceLang, targetLang) {
        try {
            const translation = await this._translator.translate(text, sourceLang, targetLang);
            this._panel.webview.postMessage({
                type: 'translationResult',
                result: translation
            });
        } catch (error) {
            console.error('Translation error:', error);
            let errorMessage = i18n.getMessage('error.failed');

            if (error.message.includes('captcha')) {
                errorMessage = i18n.getMessage('error.captcha');
            } else if (error.message.includes('limit exceeded') || error.message.includes('401')) {
                errorMessage = i18n.getMessage('error.limitExceeded');
            } else if (error.message.includes('network') || error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
                errorMessage = i18n.getMessage('error.network');
            } else if (error.message.includes('config')) {
                errorMessage = i18n.getMessage('error.config');
            }

            this._panel.webview.postMessage({
                type: 'translationError',
                error: errorMessage
            });
        }
    }

    async _handleReplace(text) {
        const editor = vscode.window.activeTextEditor;
        if (editor && !editor.selection.isEmpty) {
            await editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, text);
            });
            vscode.window.showInformationMessage(i18n.getMessage('replace.success'));
        }
    }

    _getHtmlForWebview(webview) {
        const locale = vscode.env.language.toLowerCase().startsWith('zh') ? 'zh-cn' : 'en';
        const config = vscode.workspace.getConfiguration('bing-translator');
        const defaultSourceLang = config.get('sourceLanguage', 'en');
        const defaultTargetLang = config.get('targetLanguage', 'zh-Hans');

        const languageOptions = languages.map(lang => {
            const name = locale === 'zh-cn' ? lang.nameZh : lang.name;
            return `<option value="${lang.code}">${name}</option>`;
        }).join('');

        const isZh = locale === 'zh-cn';

        return `<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bing Translator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 20px;
        }

        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .language-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            align-items: center;
        }

        .language-group {
            flex: 1;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-size: 13px;
            font-weight: 500;
        }

        select {
            width: 100%;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-size: 13px;
        }

        select:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }

        .swap-button {
            margin-top: 20px;
            padding: 8px 12px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 16px;
        }

        .swap-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .text-area-group {
            margin-bottom: 20px;
        }

        textarea {
            width: 100%;
            min-height: 150px;
            padding: 10px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            font-size: 13px;
            font-family: var(--vscode-editor-font-family);
            resize: vertical;
        }

        textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }

        .button-group {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
        }

        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .secondary-button {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .secondary-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .result-area {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            padding: 10px;
            min-height: 150px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
        }

        .result-area.empty {
            color: var(--vscode-input-placeholderForeground);
        }

        .error {
            color: var(--vscode-errorForeground);
        }

        .loading {
            color: var(--vscode-input-placeholderForeground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${isZh ? 'Bing 翻译' : 'Bing Translator'}</h1>
        </div>

        <div class="language-selector">
            <div class="language-group">
                <label for="sourceLang">${isZh ? '源语言' : 'Source Language'}</label>
                <select id="sourceLang">
                    ${languageOptions}
                </select>
            </div>

            <button class="swap-button" id="swapBtn" title="${isZh ? '交换语言' : 'Swap languages'}">⇄</button>

            <div class="language-group">
                <label for="targetLang">${isZh ? '目标语言' : 'Target Language'}</label>
                <select id="targetLang">
                    ${languageOptions}
                </select>
            </div>
        </div>

        <div class="text-area-group">
            <label for="sourceText">${isZh ? '要翻译的文本' : 'Text to Translate'}</label>
            <textarea id="sourceText" placeholder="${isZh ? '在此输入要翻译的文本...' : 'Enter text to translate...'}"></textarea>
        </div>

        <div class="button-group">
            <button id="translateBtn">${isZh ? '翻译' : 'Translate'}</button>
            <button id="clearBtn" class="secondary-button">${isZh ? '清除' : 'Clear'}</button>
        </div>

        <div class="text-area-group">
            <label for="resultText">${isZh ? '翻译结果' : 'Translation Result'}</label>
            <div id="resultText" class="result-area empty">${isZh ? '翻译结果将显示在这里...' : 'Translation result will appear here...'}</div>
        </div>

        <div class="button-group">
            <button id="copyBtn" class="secondary-button" disabled>${isZh ? '复制结果' : 'Copy Result'}</button>
            <button id="replaceBtn" class="secondary-button" disabled>${isZh ? '替换选中文本' : 'Replace Selection'}</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        const sourceLangSelect = document.getElementById('sourceLang');
        const targetLangSelect = document.getElementById('targetLang');
        const sourceTextArea = document.getElementById('sourceText');
        const resultDiv = document.getElementById('resultText');
        const translateBtn = document.getElementById('translateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const copyBtn = document.getElementById('copyBtn');
        const replaceBtn = document.getElementById('replaceBtn');
        const swapBtn = document.getElementById('swapBtn');

        let currentResult = '';

        // Set default languages
        sourceLangSelect.value = '${defaultSourceLang}';
        targetLangSelect.value = '${defaultTargetLang}';

        // Swap languages
        swapBtn.addEventListener('click', () => {
            const temp = sourceLangSelect.value;
            sourceLangSelect.value = targetLangSelect.value;
            targetLangSelect.value = temp;
        });

        // Translate
        translateBtn.addEventListener('click', () => {
            const text = sourceTextArea.value.trim();
            if (!text) {
                resultDiv.textContent = '${isZh ? '请输入要翻译的文本' : 'Please enter text to translate'}';
                resultDiv.className = 'result-area error';
                return;
            }

            translateBtn.disabled = true;
            resultDiv.textContent = '${isZh ? '正在翻译...' : 'Translating...'}';
            resultDiv.className = 'result-area loading';

            vscode.postMessage({
                type: 'translate',
                text: text,
                sourceLang: sourceLangSelect.value,
                targetLang: targetLangSelect.value
            });
        });

        // Clear
        clearBtn.addEventListener('click', () => {
            sourceTextArea.value = '';
            resultDiv.textContent = '${isZh ? '翻译结果将显示在这里...' : 'Translation result will appear here...'}';
            resultDiv.className = 'result-area empty';
            currentResult = '';
            copyBtn.disabled = true;
            replaceBtn.disabled = true;
        });

        // Copy result
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentResult);
        });

        // Replace selection
        replaceBtn.addEventListener('click', () => {
            vscode.postMessage({
                type: 'replace',
                text: currentResult
            });
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;

            switch (message.type) {
                case 'translationResult':
                    currentResult = message.result;
                    resultDiv.textContent = currentResult;
                    resultDiv.className = 'result-area';
                    translateBtn.disabled = false;
                    copyBtn.disabled = false;
                    replaceBtn.disabled = false;
                    break;

                case 'translationError':
                    resultDiv.textContent = message.error;
                    resultDiv.className = 'result-area error';
                    translateBtn.disabled = false;
                    currentResult = '';
                    copyBtn.disabled = true;
                    replaceBtn.disabled = true;
                    break;

                case 'setText':
                    sourceTextArea.value = message.text;
                    break;
            }
        });

        // Enable translate on Enter (Ctrl+Enter)
        sourceTextArea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                translateBtn.click();
            }
        });
    </script>
</body>
</html>`;
    }

    dispose() {
        TranslatePanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}

module.exports = TranslatePanel;
