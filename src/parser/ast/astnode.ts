import { SyntaxKind } from "../scanner";

export interface IASTNode {
    king: SyntaxKind;
    parent: IASTNode;
    children: IASTNode;
}
