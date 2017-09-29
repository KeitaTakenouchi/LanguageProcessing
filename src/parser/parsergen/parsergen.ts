import { LRTable } from "./lrtable";
import { Rule, LRTerm, EntryNTSymbol, NTSymbol, TSymbol } from "./grammers";

class LRParserGen {
    public static main() {
        let rules: Rule[] = [];
        let terms: LRTerm[] = [];

        rules[0] = new Rule(new EntryNTSymbol(), [new NTSymbol("E")]);
        rules[1] = new Rule(new NTSymbol("E"), [new NTSymbol("E"), new TSymbol("+"), new NTSymbol("T")]);
        rules[2] = new Rule(new NTSymbol("E"), [new NTSymbol("T")]);
        rules[3] = new Rule(new NTSymbol("T"), [new NTSymbol("T"), new TSymbol("*"), new NTSymbol("F")]);
        rules[4] = new Rule(new NTSymbol("T"), [new NTSymbol("F")]);
        rules[5] = new Rule(new NTSymbol("F"), [new TSymbol("("), new NTSymbol("E"), new TSymbol(")")]);
        rules[6] = new Rule(new NTSymbol("F"), [new TSymbol("i")]);

        let table = new LRTable(rules);
        table.dumpRules();
        table.dumpFollow();
    }
}

LRParserGen.main();