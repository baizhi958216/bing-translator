const vscode = require('vscode');
const BingTranslator = require('./src/translator');
const StatusBarManager = require('./src/status-bar');
const Commands = require('./src/commands');

let translator;
let statusBarManager;
let commands;

async function activate(context) {
    console.log('Bing Translator extension is now active');

    translator = new BingTranslator();

    statusBarManager = new StatusBarManager();
    context.subscriptions.push(statusBarManager);
    statusBarManager.show();

    commands = new Commands(translator, statusBarManager, context.extensionUri);
    commands.register(context);

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (event) => {
            if (event.affectsConfiguration('bing-translator')) {
                statusBarManager.update();
            }
        })
    );
}

function deactivate() {
    if (statusBarManager) {
        statusBarManager.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};
