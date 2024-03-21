import { FactoryMatch } from "./factory-match";
import { FunctionTypeEnum } from "./function-type.enum";

export class TypeSetter {
  constructor() {}

  static exportType(argContent: string, factoryMatch: FactoryMatch): string {
    let content = argContent;
    const type = this.getType(factoryMatch);
    content += `\n\n/*\n* Export type ${type}\n*/\n\n`;
    
    content += `export type ${type} = ReturnType<typeof ${ factoryMatch.functionType === FunctionTypeEnum.REFERENCED_FUNCTION? factoryMatch.functionString : factoryMatch.functionName}>`;
    return content;
  }

  static extractFunction(
    argContent: string,
    factoryMatch: FactoryMatch
  ): string {
    let content = argContent;
    content = content.replace(
      factoryMatch.functionString,
      factoryMatch.functionName
    );
    content += `\n\n/*\n* Function ${factoryMatch.functionName}\n*/\n\n`;
    content += factoryMatch.functionType === FunctionTypeEnum.ANONYMOUS_FUCTION ? factoryMatch.functionString.replace('function', 'function '+factoryMatch.functionName) : factoryMatch.functionString;
    content += "\n\n";
    return content;
  }

  static getType(factoryMatch: FactoryMatch): string{
    return 'I'+factoryMatch.factory.replace(
        /^\w/,
        (c: string) => c.toUpperCase()
      );
  }
}
