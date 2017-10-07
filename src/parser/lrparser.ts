import C = require("typescript-collections");
import { Action, ActionKind, EntryNTSymbol, ExitTSymbol, Grammer, GSymbol, NTSymbol, Rule, TSymbol } from "./parsergen/grammers";
import { LRTable } from "./parsergen/lrtable";
import { SyntaxKind } from "./scanner";
import { Token } from "./token";

export class LRParser {
    private rules: Rule[];
    private actions: C.Dictionary<[number, TSymbol], Action>;
    private gotos: C.Dictionary<[number, TSymbol], number>;

    constructor(rules?: Rule[]) {
        if (!rules) {
            this.rules = Grammer.defaultGrammer();
            this.actions = Grammer.loadDefaultActions();
            this.gotos = Grammer.loadDefaultGotos();
        } else {
            this.rules = rules;
            let table = new LRTable(this.rules);
            this.actions = table.getActions();
            this.gotos = table.getGotos();
        }
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
            let act: Action = this.actions.getValue([state, input]);
            if (!act) throw new Error("Parser Error. at (state=" + state + ", " + input + ")");

            switch (act.kind) {
                case ActionKind.Shift:
                    symbolStack.push(input);
                    stateStack.push(act.n);
                    i++;
                    break;
                case ActionKind.Reduce:
                    console.log("reduce : " + act.n);
                    let rule = this.rules[act.n];
                    for (let _ of rule.getRhs()) {
                        symbolStack.pop();
                        stateStack.pop();
                    }
                    let lhs: NTSymbol = rule.getLhs();
                    symbolStack.push(lhs);
                    let top: number = stateStack.peek();
                    stateStack.push(this.gotos.getValue([top, lhs]));
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
}
