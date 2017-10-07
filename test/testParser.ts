import Assert = require("assert");
import "mocha";
import C = require("typescript-collections");
import { LRParser } from "../src/parser/lrparser";
import { EntryNTSymbol, ExitTSymbol, LRTerm, NTSymbol, Rule, TSymbol } from "../src/parser/parsergen/grammers";
import { LRTable } from "../src/parser/parsergen/lrtable";
import { Scanner, SyntaxKind } from "../src/parser/scanner";
import { Token } from "../src/parser/token";

describe("LR talbe", () => {

    describe("Sample Grammer", () => {
        let rules: Rule[] = [];
        let terms: LRTerm[] = [];

        before(() => {
            rules[0] = new Rule(new EntryNTSymbol(), [new NTSymbol("E")]);
            rules[1] = new Rule(new NTSymbol("E"), [new NTSymbol("E"), new TSymbol("+"), new NTSymbol("T")]);
            rules[2] = new Rule(new NTSymbol("E"), [new NTSymbol("T")]);
            rules[3] = new Rule(new NTSymbol("T"), [new NTSymbol("T"), new TSymbol("*"), new NTSymbol("F")]);
            rules[4] = new Rule(new NTSymbol("T"), [new NTSymbol("F")]);
            rules[5] = new Rule(new NTSymbol("F"), [new TSymbol("("), new NTSymbol("E"), new TSymbol(")")]);
            rules[6] = new Rule(new NTSymbol("F"), [new TSymbol("X")]);
        });

        it(" calculate follows and firsts from rules.", () => {
            let table = new LRTable(rules);
            table.dumpRules();
            table.dumpFirst();
            table.dumpFollow();
        });

        it(" Create LR(0) automata.", () => {
            let table = new LRTable(rules);
            table.dumpAutomata();
        });

        it(" Create goto table.", () => {
            let table = new LRTable(rules);
            table.dumpGotos();
            table.dumpActions();
        });

        it(" Parse input symbols.", () => {
            let parser = new LRParser(rules);
            // ( i + i ) * i
            let inputs: Token[] = [
                new Token(SyntaxKind.OpenParenToken, "(", 1),
                new Token(SyntaxKind.Identifier, "X", 1),
                new Token(SyntaxKind.PlusToken, "+", 1),
                new Token(SyntaxKind.Identifier, "X", 1),
                new Token(SyntaxKind.CloseParenToken, ")", 1),
                new Token(SyntaxKind.AsteriskToken, "*", 1),
                new Token(SyntaxKind.Identifier, "X", 1),
            ];
            parser.parse(inputs);
        });
    });

    describe("Sample Grammer 2", () => {
        let rules: Rule[] = [];
        let terms: LRTerm[] = [];

        before(() => {
            rules[0] = new Rule(new EntryNTSymbol(), [new NTSymbol("S")]);
            rules[1] = new Rule(new NTSymbol("S"), [new NTSymbol("E"), new TSymbol("="), new NTSymbol("E")]);
            rules[2] = new Rule(new NTSymbol("S"), [new TSymbol("X")]);
            rules[3] = new Rule(new NTSymbol("E"), [new NTSymbol("E"), new TSymbol("+"), new NTSymbol("T")]);
            rules[4] = new Rule(new NTSymbol("E"), [new NTSymbol("T")]);
            rules[5] = new Rule(new NTSymbol("T"), [new TSymbol("X")]);
        });

        it(" Parse input symbols.", () => {
            let parser = new LRParser(rules);

            //  i + i = i
            let inputs: Token[] = [
                new Token(SyntaxKind.Identifier, "X", 1),
                new Token(SyntaxKind.PlusToken, "+", 1),
                new Token(SyntaxKind.Identifier, "X", 1),
                new Token(SyntaxKind.EqualsToken, "=", 1),
                new Token(SyntaxKind.Identifier, "X", 1),
            ];
            parser.parse(inputs);
        });
    });

    describe("Defalut grammer ", () => {
        let parser = new LRParser();

        it(" Parse input symbols a.tip with default grammer.", () => {
            const fs = require("fs");
            let filename: string = "sample_programs/a.tip";
            let body: string = fs.readFileSync(filename, "UTF-8");
            let scanner = new Scanner(body);

            let tokens = [];
            let token;
            while (token = scanner.scan())
                tokens.push(token);

            parser.parse(tokens);
        });

        it(" Parse input symbols of b.tip with default grammer.", () => {
            const fs = require("fs");
            let filename: string = "sample_programs/b.tip";
            let body: string = fs.readFileSync(filename, "UTF-8");
            let scanner = new Scanner(body);

            let tokens = [];
            let token;
            while (token = scanner.scan())
                tokens.push(token);

            parser.parse(tokens);
        });

        it(" Parse input symbols of c.tip with default grammer.", () => {
            const fs = require("fs");
            let filename: string = "sample_programs/c.tip";
            let body: string = fs.readFileSync(filename, "UTF-8");
            let scanner = new Scanner(body);

            let tokens = [];
            let token;
            while (token = scanner.scan())
                tokens.push(token);

            parser.parse(tokens);
        });
    });
});

