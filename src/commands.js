const vscode = require('vscode');
const i18n = require('./i18n');

class Commands {
    constructor(translator, statusBarManager) {
        this.translator = translator;
        this.statusBarManager = statusBarManager;
    }

    register(context) {
        context.subscriptions.push(
            vscode.commands.registerCommand('bing-translator.translate', () => this.translate())
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('bing-translator.translateSelection', () => this.translateSelection())
        );
    }

    async translate() {
        try {
            const config = vscode.workspace.getConfiguration('bing-translator');
            const sourceLang = config.get('sourceLanguage', 'en');
            const targetLang = config.get('targetLanguage', 'zh-Hans');

            const sourceText = await vscode.window.showInputBox({
                prompt: i18n.getMessage('translate.prompt', sourceLang, targetLang),
                placeHolder: i18n.getMessage('translate.placeholder'),
                validateInput: (text) => {
                    return text.trim() ? null : i18n.getMessage('translate.validateEmpty');
                }
            });

            if (!sourceText) {
                return;
            }

            const translation = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: i18n.getMessage('translate.progress'),
                cancellable: false
            }, async () => {
                return await this.translator.translate(sourceText.trim(), sourceLang, targetLang);
            });

            await vscode.window.showInputBox({
                prompt: i18n.getMessage('translate.result'),
                value: translation,
                valueSelection: [0, translation.length]
            });

        } catch (error) {
            this.handleError(error);
        }
    }

    async translateSelection() {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage(i18n.getMessage('translateSelection.noEditor'));
                return;
            }

            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            if (!selectedText.trim()) {
                vscode.window.showWarningMessage(i18n.getMessage('translateSelection.noSelection'));
                return;
            }

            const config = vscode.workspace.getConfiguration('bing-translator');
            const sourceLang = config.get('sourceLanguage', 'en');
            const targetLang = config.get('targetLanguage', 'zh-Hans');

            const translation = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: i18n.getMessage('translateSelection.progress'),
                cancellable: false
            }, async () => {
                return await this.translator.translate(selectedText.trim(), sourceLang, targetLang);
            });

            const action = await vscode.window.showInputBox({
                prompt: i18n.getMessage('translateSelection.result'),
                value: translation,
                valueSelection: [0, translation.length]
            });

            // If user pressed Enter, replace the selection
            if (action !== undefined) {
                await editor.edit(editBuilder => {
                    editBuilder.replace(selection, translation);
                });
            }

        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
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

        vscode.window.showErrorMessage(errorMessage);
    }
}

module.exports = Commands;
