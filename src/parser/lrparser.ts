import C = require("typescript-collections");
import { Action, ActionKind, ExitTSymbol, GSymbol, NTSymbol, Rule, TSymbol } from "./parsergen/grammers";
import { LRTable } from "./parsergen/lrtable";

export class LRParser {
    private table: LRTable;

    // this argument will be inlined in future.
    constructor(rules: Rule[]) {
        this.table = new LRTable(rules);
    }

    public parse(inputs: TSymbol[]) {
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
            switch (act.kind) {
                case ActionKind.Shift:
                    symbolStack.push(input);
                    stateStack.push(act.n);
                    i++;
                    break;
                case ActionKind.Reduce:
                    console.log("r" + act.n);
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
                    console.log("r" + act.n);
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
