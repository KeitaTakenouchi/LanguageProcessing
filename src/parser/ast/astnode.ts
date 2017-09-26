import { SyntaxKind } from "../scanner";

export interface ASTNode
{
    king: SyntaxKind;
    parent: ASTNode;
    children: ASTNode;
}