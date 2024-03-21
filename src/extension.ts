// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as findInFiles from 'find-in-files';
import * as fs from 'fs';
import * as path from 'path';
import { TextParser } from './utils/text-parser';
import { FactoryMatcBuilder } from './utils/factory-match-builder';
import { TypeSetter } from './utils/type-setter';
import { FunctionTypeEnum } from './utils/function-type.enum';

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
                let fileContent = fs.readFileSync(filePath, 'utf-8');
				const match = /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g.exec(fileContent);
				if(match){
					try{
						const mParser = new TextParser(fileContent);
						mParser.factoryMatchs?.forEach((factoryMatch)=>{
							if(factoryMatch.functionType !== FunctionTypeEnum.REFERENCED_FUNCTION){
								fileContent = TypeSetter.extractFunction(fileContent, factoryMatch);
							}
							fileContent = TypeSetter.exportType(fileContent, factoryMatch);
						});
						fs.writeFileSync(filePath, fileContent, 'utf-8');
					}catch(e: any){
						vscode.window.showErrorMessage(e.message);
					}
				}
				
            });
        });
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
