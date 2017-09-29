import { Rule, LRTerm, NTSymbol, TSymbol, ExitGSymbol, EntryNTSymbol, GSymbol } from "./grammers";

export class LRTable {
    private rules: Rule[];
    private terms: LRTerm[] = [];

    private follows: Map<NTSymbol, TSymbol[]> = new Map();

    constructor(rules: Rule[]) {
        this.rules = rules;
        this.calcFollows();
    }

    public follow(key: NTSymbol): TSymbol[] {
        let value;
        for (let nt of this.follows.keys()) {
            if (nt.getSymStr() == key.getSymStr()) {
                value = this.follows.get(nt);
                break;
            }
        }

        if (!value) {
            value = [];
            this.follows.set(key, value);
        }
        return value;
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

                let terms = this.findLRTermsStartWith(nextSym as NTSymbol);
                for (let term of terms) {
                    if (contains(all, term)) continue;
                    all.push(term);
                    nextTerms.push(term);
                }
            }
            if (nextTerms.length == 0) break;
            added.push(nextTerms);
        }
        return all;

        // local functions.
        function contains(terms: LRTerm[], term: LRTerm): boolean {
            for (let t of terms) {
                if (t.equals(term)) return true;
            }
            return false;
        }
    }

    private calcFollows() {
        let prev: number = -1;
        let exitSym = new ExitGSymbol()
        while (prev != size(this.follows)) {
            prev = size(this.follows);
            for (let rule of this.rules) {
                let lhs: NTSymbol = rule.getLhs();

                // S -> *
                if (lhs instanceof EntryNTSymbol) {
                    let fs: TSymbol[] = this.follow(lhs);
                    // follow[S] = follow[S] ∪ {$}
                    if (!LRTable.contains(fs, exitSym))
                        fs.push(exitSym);
                }

                let rhs: GSymbol[] = rule.getRhs();
                for (let i = 0; i < rhs.length; i++) {
                    let current: GSymbol = rhs[i];
                    let next: GSymbol = rhs[i + 1];

                    // when A -> aBb
                    if (current instanceof NTSymbol && next instanceof TSymbol) {
                        let fb: TSymbol[] = this.follow(current);
                        // follow[B] = follow[B] ∪ {b}
                        if (!LRTable.contains(fb, next))
                            fb.push(next);
                    }

                    // when A -> aB
                    if (current instanceof NTSymbol && !next) {
                        // follow[B] = follow[B] ∪ follow[A]
                        let fb = this.follow(current);
                        let fa = this.follow(lhs);
                        for (let s of fa) {
                            if (!LRTable.contains(fb, s))
                                fb.push(s);
                        }
                    }
                }
            }
        }

        // local function.
        function size(map: Map<NTSymbol, TSymbol[]>): number {
            let sum = 0;
            for (let arr of map.values())
                sum = sum + arr.length;
            return sum;
        }
    }

    private findLRTermsStartWith(nt: NTSymbol): LRTerm[] {
        let ts = [];
        for (let t of this.terms) {
            if (t.getRule().getLhs().getSymStr() == nt.getSymStr())
                ts.push(t);
        }
        return ts;
    }

    private static contains(ss: GSymbol[], target: GSymbol): boolean {
        for (let s of ss) {
            if (s.getSymStr() == target.getSymStr())
                return true;
        }
        return false;
    }

    public dumpFollow(): void {
        this.follows.forEach(function (values: TSymbol[], key: NTSymbol) {
            console.log("FOLLOW[" + key.getSymStr() + "] = {"
                + values.map((s) => s.getSymStr()).join(", ") + "}");
        })
    }

    public dumpRules(): void {
        this.rules.forEach(function (rule) {
            console.log(rule.toString());
        })
    }
}