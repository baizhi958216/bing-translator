const vscode = require('vscode');
const TranslatePanel = require('./translate-panel');
const i18n = require('./i18n');
const { getLanguageQuickPickItems } = require('./languages');

class Commands {
    constructor(translator, statusBarManager, extensionUri) {
        this.translator = translator;
        this.statusBarManager = statusBarManager;
        this.extensionUri = extensionUri;
    }

    register(context) {
        context.subscriptions.push(
            vscode.commands.registerCommand('bing-translator.translate', () => this.translate())
        );

        context.subscriptions.push(
            vscode.commands.registerCommand('bing-translator.translateSelection', () => this.translateSelection())
        );
    }

    async selectLanguage(promptMessage, defaultLang, locale = 'en') {
        const items = getLanguageQuickPickItems(locale);

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: promptMessage,
            matchOnDescription: true
        });

        return selected ? selected.code : null;
    }

    async translate() {
        const config = vscode.workspace.getConfiguration('bing-translator');
        const useWebviewUI = config.get('useWebviewUI', true);

        if (useWebviewUI) {
            TranslatePanel.createOrShow(this.extensionUri, this.translator);
        } else {
            await this.translateWithQuickPick();
        }
    }

    async translateWithQuickPick() {
        try {
            const config = vscode.workspace.getConfiguration('bing-translator');
            const defaultSourceLang = config.get('sourceLanguage', 'en');
            const defaultTargetLang = config.get('targetLanguage', 'zh-Hans');
            const locale = vscode.env.language;

            // Select source language
            const sourceLang = await this.selectLanguage(
                i18n.getMessage('selectLanguage.source'),
                defaultSourceLang,
                locale
            );

            if (!sourceLang) {
                return;
            }

            // Select target language
            const targetLang = await this.selectLanguage(
                i18n.getMessage('selectLanguage.target'),
                defaultTargetLang,
                locale
            );

            if (!targetLang) {
                return;
            }

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
        const useWebviewUI = config.get('useWebviewUI', true);

        if (useWebviewUI) {
            TranslatePanel.createOrShow(this.extensionUri, this.translator, selectedText);
        } else {
            await this.translateSelectionWithQuickPick(editor, selection, selectedText);
        }
    }

    async translateSelectionWithQuickPick(editor, selection, selectedText) {
        try {
            const config = vscode.workspace.getConfiguration('bing-translator');
            const defaultSourceLang = config.get('sourceLanguage', 'en');
            const defaultTargetLang = config.get('targetLanguage', 'zh-Hans');
            const locale = vscode.env.language;

            // Select source language
            const sourceLang = await this.selectLanguage(
                i18n.getMessage('selectLanguage.source'),
                defaultSourceLang,
                locale
            );

            if (!sourceLang) {
                return;
            }

            // Select target language
            const targetLang = await this.selectLanguage(
                i18n.getMessage('selectLanguage.target'),
                defaultTargetLang,
                locale
            );

            if (!targetLang) {
                return;
            }

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
