import C = require("typescript-collections");
import { Action, EntryNTSymbol, Grammer, NTSymbol, Rule, TSymbol } from "./grammers";
import { LRTable } from "./lrtable";


class ParserGenerator {
    private rules: Rule[];
    private gotos: C.Dictionary<[number, NTSymbol], number>;
    private actions: C.Dictionary<[number, TSymbol], Action>;

    constructor(rules?: Rule[]) {
        this.rules = (rules) ? rules : Grammer.defaultGrammer();
        let table = new LRTable(this.rules);
        this.actions = table.getActions();
        this.gotos = table.getGotos();
    }

    public generateCode() {
        console.log("--------------ACTIONS-------------------");
        {
            let str = "";
            for (let key of this.actions.keys()) {
                let act: Action = this.actions.getValue(key);
                str = str.concat("s("
                    + key[0] + ", "
                    + "\"" + key[1].getSymbolStr() + "\", "
                    + act.kind + ", "
                    + act.n + ");");
            }
            console.log(str);
        }
        console.log("-----------------GOTO-------------------");
        {
            let str = "";
            for (let key of this.gotos.keys()) {
                let goto: number = this.gotos.getValue(key);
                str = str.concat("s("
                    + key[0] + ", "
                    + "\"" + key[1].getSymbolStr() + "\", "
                    + goto + ");");
            }
            console.log(str);
        }
    }
}

let p = new ParserGenerator();
p.generateCode();
