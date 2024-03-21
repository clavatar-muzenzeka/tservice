import { FactoryMatch } from "./factory-match";
import { FunctionTypeEnum } from "./function-type.enum";

export class FactoryMatcBuilder {
  static readonly anonymousFunctionPattern =
    /function[\n\s]+\w*\s*\((\s*\$?\w+,?)+\)\s?\{[\s\n.\w\W]*(\}])$/g;
  static readonly namedFunctionPattern =
    /function[\n\s](\w+)[\n\s]\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}/g;
  static readonly referencedFunctionPattern = /[\n\s]*\w+[\n\s]*\]/g;

  static readonly factoryRegex =
    /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g;
  static readonly factoryRegea =
    /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g;

  static readonly serviceNameRegex = /(?:\.factory\(')(\w+)'/g;
  constructor() {}

  private static _checkFunctionType(functionString: string): FunctionTypeEnum {
    let factoryFunctionType: FunctionTypeEnum =
      FunctionTypeEnum.REFERENCED_FUNCTION;
    try {
      let matchAnonymous =
        /^([\n\s]*function)[\n\s]+\((\s*\$?\w+,?)+\)[\s\n]*\{[\s\n.\w\W]*(\}[\s\n]*)$/.exec(
          functionString
        );
      let matchNamed =
        /^([\n\s]*function)[\n\s]+\w+[\n\s]*\((\s*\$?\w+,?)+\)[\s\n]*\{[\s\n.\w\W]*(\}[\s\n]*)$/.exec(
          functionString
        );
      if (matchAnonymous) {
        factoryFunctionType = FunctionTypeEnum.ANONYMOUS_FUCTION;
      } else if (matchNamed) {
        factoryFunctionType = FunctionTypeEnum.NAMED_FUNCTION;
      }
    } catch (e: any) {
      console.log("Regex error");
    }

    return factoryFunctionType;
  }

  private static _getDependencies(factoryMatchStr: string): string {
    let matchedDependencies = "";
    let matchs =
      /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[(([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+)[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g.exec(
        factoryMatchStr
      );
    if (matchs) {
      const [, , dependencies, params, , body] = matchs;
      matchedDependencies = dependencies;
    }
    return matchedDependencies;
  }

  private static _getFunctionName(
    functionType: FunctionTypeEnum,
    factoryMatchStr: string,
    functionStr: string
  ): string {
    let functionName = "";
    if (functionType === FunctionTypeEnum.ANONYMOUS_FUCTION) {
      const match =  /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[(([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+)[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/.exec(factoryMatchStr);
      if (match) {
        functionName = match[1];
      }
    } else if (functionType === FunctionTypeEnum.NAMED_FUNCTION) {
      let match = /^([\n\s]*function)[\n\s]+(\w+)[\n\s]*\((\s*\$?\w+,?)+\)[\s\n]*\{[\s\n.\w\W]*(\}[\s\n]*)$/.exec(functionStr);
      if (match) {
        functionName = match[2];
      }
    } else {
      const match =
        /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g.exec(
          factoryMatchStr
        );
      if (match) {
        functionName = match[1];
      }
    }
    return functionName;
  }

  private static _getFunctionString(factoryMatchStr: string) {
    const match =
      /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g.exec(
        factoryMatchStr
      );
    let functionStr;
    if (match && match.length > 0) {
      functionStr = match[3];
    }
    return functionStr;
  }

  static build(factoryMatchStr: string): FactoryMatch {
    const functionStr = this._getFunctionString(factoryMatchStr);
    if (functionStr !== undefined) {
        const factory = this._getFactoryName(factoryMatchStr);
      const functionType = this._checkFunctionType(functionStr);
      const dependencies = this._getDependencies(factoryMatchStr);
      const functionName = this._getFunctionName(
        functionType,
        factoryMatchStr,
        functionStr
      );
      return new FactoryMatch(
        factory!,
        functionType,
        functionName,
        functionStr,
        dependencies
      );
    } else {
      throw new Error("Parse error: function string not found.");
    }
  }
    private static _getFactoryName(factoryMatchStr: string) {
        let factory ;
        const match =
      /[\s\n]*\w+[\s\n]*\.factory\([\s\n]*[\'\"][\s\n]*(\w+)[\n\s]*[\'\"][\n\s]*,[\n\s]*\[([\n\s]*[\'\"][\n\s]*\$?\w+[\n\s]*[\'\"][\n\s]*,?)+[\n\s]*(\w+|(function[\n\s]+(\w)*[\n\s]*\((([\n\s]*\$?\w+[\n\s]*,?)+)\)[\n\s]*\{([\s\n.\w\W]*)\}))[\n\s]*][\n\s]*\)[\n\s]*(;?|[\s\n]*)/g.exec(
        factoryMatchStr
      );
      if(match){
          factory = match[1];
      }
      return factory;
    }
}
