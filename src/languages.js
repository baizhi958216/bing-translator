const languages = [
    { code: 'auto-detect', name: 'Auto Detect', nameZh: '自动检测' },
    { code: 'en', name: 'English', nameZh: '英语' },
    { code: 'zh-Hans', name: 'Chinese Simplified', nameZh: '简体中文' },
    { code: 'zh-Hant', name: 'Chinese Traditional', nameZh: '繁体中文' },
    { code: 'ja', name: 'Japanese', nameZh: '日语' },
    { code: 'ko', name: 'Korean', nameZh: '韩语' },
    { code: 'fr', name: 'French', nameZh: '法语' },
    { code: 'de', name: 'German', nameZh: '德语' },
    { code: 'es', name: 'Spanish', nameZh: '西班牙语' },
    { code: 'ru', name: 'Russian', nameZh: '俄语' },
    { code: 'pt', name: 'Portuguese', nameZh: '葡萄牙语' },
    { code: 'it', name: 'Italian', nameZh: '意大利语' },
    { code: 'ar', name: 'Arabic', nameZh: '阿拉伯语' },
    { code: 'th', name: 'Thai', nameZh: '泰语' },
    { code: 'vi', name: 'Vietnamese', nameZh: '越南语' },
    { code: 'id', name: 'Indonesian', nameZh: '印尼语' },
    { code: 'ms', name: 'Malay', nameZh: '马来语' },
    { code: 'hi', name: 'Hindi', nameZh: '印地语' },
    { code: 'tr', name: 'Turkish', nameZh: '土耳其语' },
    { code: 'pl', name: 'Polish', nameZh: '波兰语' },
    { code: 'nl', name: 'Dutch', nameZh: '荷兰语' },
    { code: 'sv', name: 'Swedish', nameZh: '瑞典语' },
    { code: 'da', name: 'Danish', nameZh: '丹麦语' },
    { code: 'fi', name: 'Finnish', nameZh: '芬兰语' },
    { code: 'no', name: 'Norwegian', nameZh: '挪威语' },
    { code: 'cs', name: 'Czech', nameZh: '捷克语' },
    { code: 'el', name: 'Greek', nameZh: '希腊语' },
    { code: 'he', name: 'Hebrew', nameZh: '希伯来语' },
    { code: 'hu', name: 'Hungarian', nameZh: '匈牙利语' },
    { code: 'ro', name: 'Romanian', nameZh: '罗马尼亚语' },
    { code: 'uk', name: 'Ukrainian', nameZh: '乌克兰语' }
];

function getLanguageQuickPickItems(locale = 'en') {
    return languages.map(lang => ({
        label: locale === 'zh-cn' ? lang.nameZh : lang.name,
        description: lang.code,
        code: lang.code
    }));
}

function getLanguageName(code, locale = 'en') {
    const lang = languages.find(l => l.code === code);
    if (!lang) return code;
    return locale === 'zh-cn' ? lang.nameZh : lang.name;
}

module.exports = {
    languages,
    getLanguageQuickPickItems,
    getLanguageName
};
