const vscode = require('vscode');
const i18n = require('./i18n');

class StatusBarManager {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'bing-translator.translate';
        this.statusBarItem.text = `$(globe) ${i18n.getMessage('statusBar.text')}`;
        this.statusBarItem.tooltip = this.getTooltip();
    }

    getTooltip() {
        const config = vscode.workspace.getConfiguration('bing-translator');
        const sourceLang = config.get('sourceLanguage', 'en');
        const targetLang = config.get('targetLanguage', 'zh-Hans');
        return i18n.getMessage('statusBar.tooltip', sourceLang, targetLang);
    }

    update() {
        this.statusBarItem.tooltip = this.getTooltip();
    }

    show() {
        this.statusBarItem.show();
    }

    hide() {
        this.statusBarItem.hide();
    }

    dispose() {
        this.statusBarItem.dispose();
    }
}

module.exports = StatusBarManager;
