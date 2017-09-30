import C = require("typescript-collections");
import { EntryNTSymbol, ExitGSymbol, GSymbol, LRTerm, NTSymbol, Rule, TSymbol } from "./grammers";

export class LRTable {
    private rules: Rule[];
    private terms: LRTerm[] = [];

    private follows: C.Dictionary<NTSymbol, C.Set<TSymbol>> = new C.Dictionary();

    constructor(rules: Rule[]) {
        this.rules = rules;
        this.calcFollows();
    }

    public follow(key: NTSymbol): C.Set<TSymbol> {
        let val = this.follows.getValue(key);
        if (!val) {
            val = new C.Set<TSymbol>();
            this.follows.setValue(key, val);
        }
        return val;
    }

    public closure(terms: LRTerm[]): LRTerm[] {
        let all: LRTerm[] = terms;
        let added: LRTerm[][] = [];
        added.push(terms);
        for (let i = 0; ; i++) {
            let nextTerms: LRTerm[] = [];
            for (let t of added[i]) {
                let nextSym: GSymbol = t.getNextSymbol();
                if (!(nextSym instanceof NTSymbol)) continue;

                let ts = this.findLRTermsStartWith(nextSym as NTSymbol);
                for (let term of ts) {
                    if (contains(all, term)) continue;
                    all.push(term);
                    nextTerms.push(term);
                }
            }
            if (nextTerms.length === 0) break;
            added.push(nextTerms);
        }
        return all;

        // local functions.
        function contains(ts: LRTerm[], term: LRTerm): boolean {
            for (let t of ts) {
                if (t.equals(term)) return true;
            }
            return false;
        }
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
            (rule) => {
                console.log(" " + rule.getString());
            });
    }

    private calcFollows() {
        let prev: number = -1;
        let exitSym = new ExitGSymbol();
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

    private findLRTermsStartWith(nt: NTSymbol): LRTerm[] {
        let ts = [];
        for (let t of this.terms) {
            if (t.getRule().getLhs().getSymbolStr() === nt.getSymbolStr())
                ts.push(t);
        }
        return ts;
    }

}
