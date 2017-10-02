import { TSymbol } from "./parsergen/grammers";
import { SyntaxKind } from "./scanner";

export class Token {
    public code: string;
    public kind: SyntaxKind;
    public line: number;

    constructor(kind: SyntaxKind, code: string, line: number) {
        this.line = line;
        this.code = code;
        this.kind = kind;
    }

    public getNTSymbol(): TSymbol {
        return new TSymbol(this.code);
    }
}
