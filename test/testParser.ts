import Assert = require("assert");
import "mocha";
import C = require("typescript-collections");
import { EntryNTSymbol, LRTerm, NTSymbol, Rule, TSymbol } from "../src/parser/parsergen/grammers";
import { LRTable } from "../src/parser/parsergen/lrtable";

describe("LR talbe", () => {
    let rules: Rule[] = [];
    let terms: LRTerm[] = [];

    describe("Sample Grammer", () => {
        before(() => {
            rules[0] = new Rule(new EntryNTSymbol(), [new NTSymbol("E")]);
            rules[1] = new Rule(new NTSymbol("E"), [new NTSymbol("E"), new TSymbol("+"), new NTSymbol("T")]);
            rules[2] = new Rule(new NTSymbol("E"), [new NTSymbol("T")]);
            rules[3] = new Rule(new NTSymbol("T"), [new NTSymbol("T"), new TSymbol("*"), new NTSymbol("F")]);
            rules[4] = new Rule(new NTSymbol("T"), [new NTSymbol("F")]);
            rules[5] = new Rule(new NTSymbol("F"), [new TSymbol("("), new NTSymbol("E"), new TSymbol(")")]);
            rules[6] = new Rule(new NTSymbol("F"), [new TSymbol("i")]);
        });

        it(" calculate follows from rules.", () => {
            let table = new LRTable(rules);
            table.dumpRules();
            table.dumpFollow();
        });

        it(" calculate closure of S.", () => {
            let table = new LRTable(rules);
            let term = new LRTerm(rules[1]);

            let closure: C.Set<LRTerm> = new C.Set<LRTerm>();
            closure.add(term);
            closure = table.closure(closure);
            console.log("closure of " + term.getString());
            closure.forEach((t) => { console.log("   " + t.getString()); });
            Assert.equal(closure.size(), 6);
        });

        it(" Create LR(0) automata.", () => {
            let table = new LRTable(rules);
            table.dumpAutomata();
        });
    });
});
