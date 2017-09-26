import { SyntaxKind } from "./scanner";

export class Token
{
    code: string;
    kind: SyntaxKind;
    line: number;

    constructor(kind: SyntaxKind, code: string, line: number)
    {
        this.line = line;
        this.code = code;
        this.kind = kind;
    }
}
