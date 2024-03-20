// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as findInFiles from 'find-in-files';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const anonymousFunctionPattern = /function\s+\w*\s*\((\s*\$?\w+,?)+\)\s?\{[\s\n.\w\W]*(\}])$/g;
	let disposable = vscode.commands.registerCommand('tservice.typeAll', () => {
        const rootPath = vscode.workspace.rootPath;
        if (!rootPath) {
            vscode.window.showErrorMessage('No workspace opened.');
            return;
        }
		const pattern = /\.ts$/;
        vscode.workspace.findFiles('**/*.ts', '**/node_modules/**').then((files) => {
            files.forEach((file) => {
                const filePath = file.fsPath;
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                const regex = /(?:\.factory\(')(\w+)'/g;
                let match;
                while (match = regex.exec(fileContent)) {
                    const serviceName = match[1];
                    const factoryRegex = /\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*function[\n\s]\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}[\n\s]*][\n\s]*\)[\n\s]*;/;
					const functionRegex = 
                    const factoryMatch = factoryRegex.exec(fileContent);
                    if (factoryMatch) {
                        const [, ,dependencies, params, , body] = factoryMatch;
                        const paramList = params.split(',').map((param: string) => param.trim()).join(', ');
                        const functionName = serviceName;
                        const replacement = `function ${functionName}(${paramList}) { ${body} }`;
                        const newContent = fileContent.replace(factoryRegex, replacement);
                        fs.writeFileSync(filePath, newContent, 'utf-8');
                    }
                }
            });
        });
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
