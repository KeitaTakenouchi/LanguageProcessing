import C = require("typescript-collections");
import { Action, ActionKind, EntryNTSymbol, ExitTSymbol, GSymbol, LRTerm, NTSymbol, Rule, TSymbol } from "./grammers";

export class LRTable {
    private rules: Rule[];
    private terms: LRTerm[] = [];

    private follows: C.Dictionary<NTSymbol, C.Set<TSymbol>> = new C.Dictionary();

    private automata: C.Dictionary<[number, GSymbol], number> = new C.Dictionary();
    private states: Array<C.Set<LRTerm>> = new Array<C.Set<LRTerm>>();

    private actions: C.Dictionary<[number, TSymbol], Action> = new C.Dictionary();
    private gotos: C.Dictionary<[number, NTSymbol], number> = new C.Dictionary();

    constructor(rules: Rule[]) {
        this.rules = rules;
        this.calcFollows();
        this.calcAutomata();
        this.buildActions();
        this.buildGotos();
    }

    public follow(key: NTSymbol): C.Set<TSymbol> {
        let val = this.follows.getValue(key);
        if (!val) {
            val = new C.Set<TSymbol>();
            this.follows.setValue(key, val);
        }
        return val;
    }

    public dumpFollow(): void {
        console.log("---- FOLLOWS ----");
        this.follows.forEach(
            (key: NTSymbol, values: C.Set<TSymbol>) => {
                console.log(" FOLLOW[" + key.getSymbolStr() + "] = {"
                    + values.toArray().map((s) => s.getSymbolStr()).join(", ") + "}");
            });
    }

    public dumpRules(): void {
        console.log("---- RULES ----");
        this.rules.forEach(
            (rule, i) => {
                console.log(" (" + i + ") " + rule.getString());
            });
    }

    public dumpAutomata(): void {
        console.log("---- STATES ----");
        this.states.forEach((set, i) => {
            console.log("   " + i + " : " + set.toArray().map((v) => v.getString()).join(" | "));
        });

        console.log("---- AUTOMATA ----");
        {
            let line: string = "    |";
            for (let symbol of this.allRhsSymbols()) {
                line = line + " " + symbol.getSymbolStr() + " ";
            }
            console.log(line);
        }
        for (let state = 0; state < this.states.length; state++) {
            let line: string = (state >= 10)
                ? " " + state + " |"
                : "  " + state + " |";
            for (let symbol of this.allRhsSymbols()) {
                let nextState = this.automata.getValue([state, symbol]);
                if (nextState >= 10)
                    line = line + "" + nextState + " ";
                else if (nextState < 10)
                    line = line + " " + nextState + " ";
                else
                    line = line + "   ";
            }
            console.log(line);
        }
    }

    public dumpGotos() {
        console.log("---- GOTOs ----");
        {
            let line: string = "    |";
            for (let symbol of this.allRhsSymbols()) {
                if (!(symbol instanceof NTSymbol)) continue;
                line = line + " " + symbol.getSymbolStr() + " ";
            }
            console.log(line);
        }
        for (let state = 0; state < this.states.length; state++) {
            let line: string = (state >= 10)
                ? " " + state + " |"
                : "  " + state + " |";
            for (let symbol of this.allRhsSymbols()) {
                if (!(symbol instanceof NTSymbol)) continue;
                let nextState = this.gotos.getValue([state, symbol]);
                if (nextState >= 10)
                    line = line + "" + nextState + " ";
                else if (nextState < 10)
                    line = line + " " + nextState + " ";
                else
                    line = line + "   ";
            }
            console.log(line);
        }
    }

    public dumpActions() {
        console.log("---- ACTIONs ----");
        {
            let line: string = "    |";
            let columns = this.allRhsSymbols();
            columns.push(new ExitTSymbol());
            for (let symbol of columns) {
                if (!(symbol instanceof TSymbol) && !(symbol instanceof ExitTSymbol))
                    continue;
                line = line + "  " + symbol.getSymbolStr() + " ";
            }
            console.log(line);
        }
        for (let state = 0; state < this.states.length; state++) {
            let line: string = (state >= 10)
                ? " " + state + " |"
                : "  " + state + " |";
            let columns = this.allRhsSymbols();
            columns.push(new ExitTSymbol());
            for (let symbol of columns) {
                if (!(symbol instanceof TSymbol) && !(symbol instanceof ExitTSymbol))
                    continue;
                let act = this.actions.getValue([state, symbol]);

                if (!act) {
                    line = line + "    ";
                    continue;
                }

                let n = act.n;
                switch (act.kind) {
                    case ActionKind.Shift:
                        if (n >= 10)
                            line = line + "s" + n + " ";
                        else
                            line = line + " s" + n + " ";
                        break;
                    case ActionKind.Reduce:
                        if (n >= 10)
                            line = line + "r" + n + " ";
                        else
                            line = line + " r" + n + " ";
                        break;
                    case ActionKind.Accepted:
                        line = line + " AC ";
                        break;
                    default:
                        break;
                }
            }
            console.log(line);
        }
    }

    /**
     * State -> Non-Terminal Symbol -> (ActionKind, State)
     */
    public action(state: number, symbol: NTSymbol): Action {
        return this.actions.getValue([state, symbol]);
    }

    /**
     * State -> Terminal Symbol -> State
     */
    public goto(state: number, symbol: NTSymbol): number {
        return this.gotos.getValue([state, symbol]);
    }

    public getRule(index: number): Rule {
        return this.rules[index];
    }

    public closure(terms: C.Set<LRTerm>): C.Set<LRTerm> {
        let all: C.Set<LRTerm> = new C.Set<LRTerm>();
        terms.forEach((v) => { all.add(v); });

        let added: Array<C.Set<LRTerm>> = [];
        added.push(terms);
        for (let i = 0; ; i++) {
            let nextTerms: C.Set<LRTerm> = new C.Set<LRTerm>();
            for (let term of added[i].toArray()) {
                let nextSym: GSymbol = term.getNextSymbol();
                if (!(nextSym instanceof NTSymbol)) continue;

                let rules = this.findRulesStartingWith(nextSym as NTSymbol);
                for (let r of rules) {
                    let t = new LRTerm(r);
                    if (all.contains(t)) continue;
                    all.add(t);
                    nextTerms.add(t);
                }
            }
            if (nextTerms.size() === 0) break;
            added.push(nextTerms);
        }
        return all;
    }

    private calcFollows() {
        let prev: number = -1;
        let exitSym = new ExitTSymbol();
        while (prev !== size(this.follows)) {
            prev = size(this.follows);
            for (let rule of this.rules) {
                let lhs: NTSymbol = rule.getLhs();

                // when S -> *
                if (lhs instanceof EntryNTSymbol) {
                    // follow[S] = follow[S] ∪ {$}
                    let fs = this.follow(lhs);
                    fs.add(exitSym);
                }

                let rhs: GSymbol[] = rule.getRhs();
                for (let i = 0; i < rhs.length; i++) {
                    let current: GSymbol = rhs[i];
                    let next: GSymbol = rhs[i + 1];

                    // when A -> aBb
                    if (current instanceof NTSymbol && next instanceof TSymbol) {
                        // follow[B] = follow[B] ∪ {b}
                        let fb = this.follow(current);
                        fb.add(next);
                    }

                    // when A -> aB
                    if (current instanceof NTSymbol && !next) {
                        // follow[B] = follow[B] ∪ follow[A]
                        let fb = this.follow(current);
                        let fa = this.follow(lhs);
                        fb.union(fa);
                    }
                }
            }
        }

        // local function.
        function size(map: C.Dictionary<NTSymbol, C.Set<TSymbol>>): number {
            let sum = 0;
            for (let vs of map.values())
                sum = sum + vs.size();
            return sum;
        }
    }

    private calcAutomata() {
        // calc init state from the entry rule.
        let entryRule: Rule = this.findEntryRule();
        let entryTerm: LRTerm = new LRTerm(entryRule);
        let initTerm: C.Set<LRTerm> = new C.Set<LRTerm>();
        initTerm.add(entryTerm);
        let initClosure: C.Set<LRTerm> = this.closure(initTerm);

        let allLhs: GSymbol[] = this.allRhsSymbols();
        this.states.push(initClosure);

        let i = 0; let max = 0;
        while (i <= max) {
            let terms: C.Set<LRTerm> = this.states[i];
            for (let symbol of allLhs) {
                let nextTerms: C.Set<LRTerm> = this.proccedTerms(terms, symbol);
                let nextClosure = this.closure(nextTerms);
                if (nextClosure.isEmpty()) continue;
                let distState = this.findStateByTerms(nextClosure);
                max = (distState > max) ? distState : max;
                this.automata.setValue([i, symbol], distState);
            }
            i++;
        }
    }

    private buildGotos() {
        for (let symbol of this.allRhsSymbols()) {
            if (!(symbol instanceof NTSymbol)) continue;

            // copy transitions from automata to gotos
            for (let i = 0; i < this.states.length; i++) {
                let dist = this.automata.getValue([i, symbol]);
                if (dist) {
                    this.gotos.setValue([i, symbol], dist);
                }
            }
        }
    }

    private buildActions() {
        let actions: C.Dictionary<[number, TSymbol], Action> = this.actions;

        // build shift transidions.
        for (let symbol of this.allRhsSymbols()) {
            if (!(symbol instanceof TSymbol)) continue;

            for (let i = 0; i < this.states.length; i++) {
                let dist = this.automata.getValue([i, symbol]);
                if (dist) {
                    let act = new Action(ActionKind.Shift, dist);
                    this.actions.setValue([i, symbol], act);
                }
            }
        }

        // build reduce
        for (let i = 0; i < this.states.length; i++) {
            let terms = this.states[i];
            for (let term of terms.toArray()) {
                // if consumed all rhs symbols, create reduce transition.
                if (!term.getNextSymbol()) {
                    let rule: Rule = term.getRule();
                    let lhs = term.getRule().getLhs();
                    for (let s of this.follows.getValue(lhs).toArray()) {
                        let act: Action;
                        if (rule.getLhs() instanceof EntryNTSymbol) {
                            act = new Action(ActionKind.Accepted, 0);
                        } else {
                            let ruleIndex = this.rules.indexOf(rule);
                            act = new Action(ActionKind.Reduce, ruleIndex);
                        }
                        this.actions.setValue([i, s], act);
                    }
                }
            }
        }
    }

    private findRulesStartingWith(nt: NTSymbol): Rule[] {
        let ts: Rule[] = [];
        this.rules
            .filter((v) => v.getLhs().toString() === nt.toString())
            .forEach((v) => { ts.push(v); });
        return ts;
    }

    private findEntryRule(): Rule {
        for (let rule of this.rules) {
            if (rule.getLhs() instanceof EntryNTSymbol) {
                return rule;
            }
        }
        return undefined;
    }

    private allRhsSymbols(): GSymbol[] {
        let set = new C.Set<GSymbol>();
        this.rules.forEach((v: Rule) => {
            v.getRhs().forEach((s: GSymbol) => {
                set.add(s);
            });
        });
        return set.toArray();
    }

    private proccedTerms(terms: C.Set<LRTerm>, symbol: GSymbol): C.Set<LRTerm> {
        let nextTerms: C.Set<LRTerm> = new C.Set<LRTerm>();
        terms.forEach((t) => {
            let next = t.getNextSymbol();
            if (next && next.toString() === symbol.toString()) {
                nextTerms.add(t.proceed());
            }
        });
        return nextTerms;
    }

    private findStateByTerms(terms: C.Set<LRTerm>): number {
        let max = this.states.length;
        for (let i = 0; i < max; i++) {
            if (this.states[i].toString() === terms.toString())
                return i;
        }
        this.states.push(terms);
        return max;
    }
}
