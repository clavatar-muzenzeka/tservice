// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as findInFiles from "find-in-files";
import * as fs from "fs";
import * as path from "path";
import { TextParser } from "./utils/text-parser";
import { FactoryMatcBuilder } from "./utils/factory-match-builder";
import { TypeSetter } from "./utils/type-setter";
import { FunctionTypeEnum } from "./utils/function-type.enum";
import { register } from "module";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const anonymousFunctionPattern =
    /function\s+\w*\s*\((\s*\$?\w+,?)+\)\s?\{[\s\n.\w\W]*(\}])$/g;
  let extractTypesDisposable = vscode.commands.registerCommand(
    "tservice.extractTypes",
    extractTypes
  );
  context.subscriptions.push(extractTypesDisposable);
}

function extractTypes() {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Progress",
      cancellable: false,
    },
    async (progress, token) => {
      const rootPath = vscode.workspace.rootPath;
      if (!rootPath) {
        vscode.window.showErrorMessage("No workspace opened.");
        return;
      }
      const pattern = /\.ts$/;
      vscode.workspace
        .findFiles("**/*.ts", "**/node_modules/**")
        .then((files) => {
          const total = files.length;
          let count = 0;
          files.forEach((file) => {
            count = count + 1;
            progress.report({
              increment: (count * 100) / total,
              message: "Processing file: " + file.fsPath,
            });
            const filePath = file.fsPath;
            let fileContent = fs.readFileSync(filePath, "utf-8");
            const match =
              /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g.exec(
                fileContent
              );
            if (match) {
              try {
                const mParser = new TextParser(fileContent);
                mParser.factoryMatchs?.forEach((factoryMatch) => {
                  if (
                    factoryMatch.functionType !==
                    FunctionTypeEnum.REFERENCED_FUNCTION
                  ) {
                    fileContent = TypeSetter.extractFunction(
                      fileContent,
                      factoryMatch
                    );
                  }
                  fileContent = TypeSetter.exportType(
                    fileContent,
                    factoryMatch
                  );
                  assignType(
                    factoryMatch.factory,
                    TypeSetter.getType(factoryMatch)
                  );
                });
                fs.writeFileSync(filePath, fileContent, "utf-8");
              } catch (e: any) {
                vscode.window.showErrorMessage(e.message);
              }
            }

            return progress;
          });
        });

      // Report progress (100%)
      //progress.report({ increment: 100, message: 'Completed!' });
    }
  );
}

function assignType(serviceName: string, type: string) {
  const rootPath = vscode.workspace.rootPath;
  if (!rootPath) {
    vscode.window.showErrorMessage("No workspace opened.");
    return;
  }
  const pattern = /\.ts$/;
  vscode.workspace.findFiles("**/*.ts", "**/node_modules/**").then((files) => {
    console.log("Before file open ");
    console.log(files.length);
    files.forEach((file) => {
      console.log("File: " + file.fsPath);
      const filePath = file.fsPath;
      let fileContent = fs.readFileSync(filePath, "utf-8");
      console.log("Read complete:", fileContent);
      const regexStr = `\\[(\\s*[\\'\\"]\\s*\\$?\\w+\\s*[\\'\\"]\\s*,?)+\\s*function\\s*\\w*\\s*\\((\\s*\\$?\w*\\s*,?)*\\s*(${serviceName})\\s*,?(\\s*\\$?\\w*,?)*\\)\\s*`;
      const regex = new RegExp(regexStr);
      console.log("Regex: ", regex);
      const match = regex.exec(fileContent);
      console.log("Regex executed with results: ", match?.length);
      if (match) {
        console.log("Match");
        let matchParts = match[0].split("function")[1];
        try {
          fileContent = fileContent.replace(
            matchParts,
            matchParts.replace(match[3], match[3] + ": " + type)
          );
          fs.writeFileSync(filePath, fileContent, "utf-8");
        } catch (e: any) {
          vscode.window.showErrorMessage(e.message);
        }
      } else {
        console.log("No match");
        // match component name
        const match = /(\w+)\s*\.\$inject\s*=\s*\[/g.exec(fileContent);
        console.log("Match: ", match);
        if (match) {
          const componentName = match[1];
          //find componentFuction

          // 1. Named function
          const namedFunctionMatch = new RegExp(
            `function[\\n\\s]*${componentName}[\\n\\s]*\\((([\\n\\s]*\\$?\\w*\\:?[\\n\\s]*,?)*[\\n\\s]*)*`,
            "g"
          ).exec(fileContent);
          console.log(namedFunctionMatch);
          if (namedFunctionMatch) {
            let params = namedFunctionMatch[1];
            fileContent = fileContent.replace(
              params,
              params.replace(serviceName, serviceName + ": " + type)
            );
            fs.writeFileSync(filePath, fileContent, "utf-8");
          }
        }
      }
    });
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
