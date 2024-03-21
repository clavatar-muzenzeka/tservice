import { FunctionTypeEnum } from "./function-type.enum";

export class FactoryMatch{
    factory: string;
    functionType: FunctionTypeEnum;
    dependencies?: string;
    functionString: string;
    functionName: string;
    constructor(
        argFactory: string, argFunctionType: FunctionTypeEnum , argFunctionName: string, argFuctionString: string, argDependencies?: string
    ){
        this.factory = argFactory;
        this.functionType = argFunctionType;
        this.functionString = argFuctionString;
        this.dependencies = argDependencies;
        this.functionName = argFunctionName;
    }
}