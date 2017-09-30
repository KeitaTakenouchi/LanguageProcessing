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
}
