const vscode = require('vscode');

const messages = {
    'en': {
        'translate.prompt': 'Enter text to translate ({0} → {1})',
        'translate.placeholder': 'Type your text here...',
        'translate.validateEmpty': 'Please enter text to translate',
        'translate.progress': 'Translating...',
        'translate.result': 'Translation result (press Esc to close, or copy the text)',
        'translateSelection.progress': 'Translating selection...',
        'translateSelection.result': 'Translation result (press Esc to close, Enter to replace selection)',
        'translateSelection.noEditor': 'No active editor found',
        'translateSelection.noSelection': 'No text selected',

        'statusBar.text': 'Translate',
        'statusBar.tooltip': 'Translate text ({0} → {1})\nClick or press Ctrl+Shift+T',

        'selectLanguage.source': 'Select source language',
        'selectLanguage.target': 'Select target language',

        'error.failed': 'Failed to translate text',
        'error.captcha': 'Translation service requires verification. Please try again later.',
        'error.limitExceeded': 'Translation limit exceeded. Please try again later.',
        'error.network': 'Failed to connect to translation service. Check your internet connection.',
        'error.config': 'Failed to initialize translation service. Please try again.',

        'replace.success': 'Text replaced successfully'
    },
    'zh-cn': {
        'translate.prompt': '输入要翻译的文本 ({0} → {1})',
        'translate.placeholder': '在此输入文本...',
        'translate.validateEmpty': '请输入要翻译的文本',
        'translate.progress': '正在翻译...',
        'translate.result': '翻译结果（按 Esc 关闭，或复制文本）',
        'translateSelection.progress': '正在翻译选中内容...',
        'translateSelection.result': '翻译结果（按 Esc 关闭，按 Enter 替换选中内容）',
        'translateSelection.noEditor': '未找到活动编辑器',
        'translateSelection.noSelection': '未选中文本',

        'statusBar.text': '翻译',
        'statusBar.tooltip': '翻译文本 ({0} → {1})\n点击或按 Ctrl+Shift+T',

        'selectLanguage.source': '选择源语言',
        'selectLanguage.target': '选择目标语言',

        'error.failed': '翻译文本失败',
        'error.captcha': '翻译服务需要验证。请稍后再试。',
        'error.limitExceeded': '翻译次数超限。请稍后再试。',
        'error.network': '无法连接到翻译服务。请检查您的网络连接。',
        'error.config': '初始化翻译服务失败。请重试。',

        'replace.success': '文本替换成功'
    }
};

function getLanguage() {
    const locale = vscode.env.language.toLowerCase();
    if (locale.startsWith('zh')) {
        return 'zh-cn';
    }
    return 'en';
}

function getMessage(key, ...args) {
    const lang = getLanguage();
    const langMessages = messages[lang] || messages['en'];
    let message = langMessages[key] || messages['en'][key] || key;

    args.forEach((arg, index) => {
        message = message.replace(`{${index}}`, arg);
    });

    return message;
}

module.exports = {
    getMessage,
    getLanguage
};
