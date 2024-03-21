import { FactoryMatch } from "./factory-match";
import { FactoryMatcBuilder } from "./factory-match-builder";

export class TextParser{
    input: string;
    factoryMatchs?: Array<FactoryMatch>;
    factoryStrings : Array<string>;
    constructor(input: string){
        this.input = input;
        this.factoryStrings = input.split(this.factorySplitPattern).filter(currentFactoryStr=>currentFactoryStr.trim().length);
        this.factoryMatchs = this.factoryStrings.map(
            currentFactoryStr=>this._generateFactoryMatchs(currentFactoryStr+'}]);'))
        ;
    }
    
    readonly factorySplitPattern = /\}[\n\s]*\][\n\s]*\)[\n\s]*;?/;

    private _generateFactoryMatchs(fcatoryStr: string): FactoryMatch {
        return FactoryMatcBuilder.build(fcatoryStr);
    }
}