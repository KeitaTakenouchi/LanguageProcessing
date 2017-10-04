import C = require("typescript-collections");
import { Action, ActionKind, EntryNTSymbol, ExitTSymbol, GSymbol, NTSymbol, Rule, TSymbol } from "./parsergen/grammers";
import { LRTable } from "./parsergen/lrtable";
import { SyntaxKind } from "./scanner";
import { Token } from "./token";

export class LRParser {
    private table: LRTable;

    constructor(rules?: Rule[]) {
        rules = (rules) ? rules : this.loadGrammer();
        if (rules.length === 0) throw Error("No rules");
        this.table = new LRTable(rules);
    }

    public getTable() {
        return this.table;
    }

    public parse(tokens: Token[]) {
        let inputs: TSymbol[] = [];
        tokens.forEach((t) => {
            inputs.push(t.getNTSymbol());
        });
        inputs.push(new ExitTSymbol());
        let stateStack = new C.Stack<number>();
        let symbolStack = new C.Stack<GSymbol>();
        stateStack.push(0);

        let i = 0;
        for (; ;) {
            dumpStacks();
            let input: TSymbol = inputs[i];
            let state = stateStack.peek();
            let act: Action = this.table.action(state, input);
            if (!act) throw new Error("Parser Error. at (state=" + state + ", " + input + ")");

            switch (act.kind) {
                case ActionKind.Shift:
                    symbolStack.push(input);
                    stateStack.push(act.n);
                    i++;
                    break;
                case ActionKind.Reduce:
                    console.log("reduce : " + this.table.getRule(act.n).getString());
                    let rule = this.table.getRule(act.n);
                    for (let _ of rule.getRhs()) {
                        symbolStack.pop();
                        stateStack.pop();
                    }
                    let lhs: NTSymbol = rule.getLhs();
                    symbolStack.push(lhs);
                    let top: number = stateStack.peek();
                    stateStack.push(this.table.goto(top, lhs));
                    break;
                case ActionKind.Accepted:
                    console.log("reduce : ^ -> " + symbolStack.peek().getSymbolStr());
                    return;
            }
        }

        // local function.
        function dumpStacks() {
            {
                let arr = new Array<number>();
                stateStack.forEach((e) => {
                    arr.push(e);
                });
                let str = "[  ";
                arr.reverse().forEach((e) => {
                    if (e > 10)
                        str = str + e + " ";
                    else
                        str = str + e + "  ";
                });
                str = str + "]";
                // console.log(str);
            }
            {
                let arr = new Array<GSymbol>();
                symbolStack.forEach((e) => {
                    arr.push(e);
                });
                let str = "[  ";
                arr.reverse().forEach((e) => {
                    str = str + e.getSymbolStr() + "  ";
                });
                str = str + "]";
                console.log(str);
            }
        }
    }

    // default grammer.
    private loadGrammer(): Rule[] {

        return [
            new Rule(N("E"), [N("E"), T("+"), N("T")]),
            new Rule(N("E"), [N("E"), T("-"), N("T")]),
            new Rule(N("E"), [N("T")]),

            new Rule(N("EE"), [N("EE"), T(","), N("E")]),
            new Rule(N("EE"), [N("E")]),

            new Rule(N("T"), [N("T"), T("*"), N("G")]),
            new Rule(N("T"), [N("T"), T("/"), N("G")]),
            new Rule(N("T"), [N("G")]),

            new Rule(N("G"), [T("("), N("E"), T(")")]),
            new Rule(N("G"), [T("I")]),
            new Rule(N("G"), [T("X")]),
            new Rule(N("G"), [N("E"), T(">"), N("E")]),
            new Rule(N("G"), [N("E"), T("=="), N("E")]),
            new Rule(N("G"), [T("input")]),
            new Rule(N("G"), [T("X"), T("("), N("EE"), T(")")]),
            new Rule(N("G"), [T("X"), T("("), T(")")]),
            new Rule(N("G"), [T("("), N("E"), T(")"), T("("), N("EE"), T(")")]),
            new Rule(N("G"), [T("("), N("E"), T(")"), T("("), T(")")]),
            new Rule(N("G"), [T("alloc")]),
            new Rule(N("G"), [T("&"), T("X")]),
            new Rule(N("G"), [T("*"), N("E")]),
            new Rule(N("G"), [T("null")]),

            new Rule(N("S"), [T("X"), T("="), N("E"), T(";")]),
            new Rule(N("S"), [T("output"), N("E"), T(";")]),
            new Rule(N("S"), [T("if"), T("("), N("E"), T(")"), T("{"), N("SS"), T("}")]),
            new Rule(N("S"), [T("if"), T("("), N("E"), T(")"), T("{"), N("SS"), T("}"),
            T("else"), T("{"), N("SS"), T("}")]),
            new Rule(N("S"), [T("while"), T("("), N("E"), T(")"), T("{"), N("SS"), T("}")]),
            new Rule(N("S"), [T("*"), T("X"), T("="), N("E"), T(";")]),

            new Rule(N("SS"), [N("SS"), N("S")]),
            new Rule(N("SS"), [N("S")]),

            new Rule(N("F"), [T("X"), T("("), N("XX"), T(")"), T("{"), N("SS"), T("return"), N("E"), T(";"), T("}")]),
            new Rule(N("F"), [T("X"), T("("), T(")"), T("{"), N("SS"), T("return"), N("E"), T(";"), T("}")]),
            new Rule(N("F"), [N("X"), T("("), N("XX"), T(")")
                , T("{"), T("var"), N("XX"), T(";"), N("SS"), T("return"), N("E"), T(";"), T("}")]),
            new Rule(N("F"), [N("X"), T("("), T(")")
                , T("{"), T("var"), N("XX"), T(";"), N("SS"), T("return"), N("E"), T(";"), T("}")]),

            new Rule(N("XX"), [N("XX"), T(","), T("X")]),
            new Rule(N("XX"), [T("X")]),

            new Rule(N("P"), [N("P"), N("F")]),
            new Rule(N("P"), [N("F")]),

            new Rule(new EntryNTSymbol(), [N("P")]),
        ];

        function N(str: string) {
            return new NTSymbol(str);
        }

        function T(str: string) {
            return new TSymbol(str);
        }
    }
}
