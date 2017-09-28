class LRTerm {
    private rule: Rule;
    private index: number = 0;

    constructor(rule: Rule) {
        this.rule = rule;
    }

    public getRule(): Rule {
        return this.rule;
    }

    public proceed(): LRTerm {
        let t = new LRTerm(this.rule);
        let max = this.rule.getRhs().length;
        t.index = (this.index < max) ? this.index + 1 : this.index;
        return t;
    }

    /** return 'undefined' if dot is on the end. */
    public getNextSymbol(): GSymbol {
        return this.rule.getRhs()[this.index];
    }

    public toString(): string {
        let str: string = this.rule.getLhs().getSymStr().toString() + " -> ";
        let rhs: GSymbol[] = this.rule.getRhs();
        for (let i = 0; i < rhs.length; i++) {
            let sym: string = rhs[i].getSymStr().toString();
            str = (i == this.index)
                ? str.concat(".").concat(sym)
                : str.concat(" ").concat(sym);
        }
        return str;
    }

    public equals(o: any): boolean {
        if (!(o instanceof LRTerm)) return false;
        let t = o as LRTerm;
        // since rule instances are unique.
        if (this.rule != t.rule) return false;
        if (this.index != t.index) return false;
        return true;
    }
}

class Rule {
    private lhs: NTSymbol;
    private rhs: GSymbol[];

    constructor(lhs: NTSymbol, rhs: GSymbol[]) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    public toString(): string {
        let arr: string[] = this.rhs.map((sym: GSymbol) => sym.getSymStr().toString());
        return this.lhs.getSymStr() + " -> " + arr.join(" ");
    }

    public getLhs(): NTSymbol {
        return this.lhs;
    }

    public getRhs(): GSymbol[] {
        return this.rhs;
    }
}

abstract class GSymbol {
    private sym: string;

    constructor(sym: string) {
        this.sym = sym;
    }

    public getSymStr(): string {
        return this.sym;
    }

}

class NTSymbol extends GSymbol {
    constructor(sym: string) {
        super(sym);
    }
}

class TSymbol extends GSymbol {
    constructor(sym: string) {
        super(sym);
    }
}

class Table {
    private rules: Rule[] = [];
    private terms: LRTerm[] = [];

    private closure(terms: LRTerm[]): LRTerm[] {
        let all: LRTerm[] = terms;
        let added: LRTerm[][] = [];
        added.push(terms);
        let i = 0;
        while (true) {
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
            i++;
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

    private findLRTermsStartWith(nt: NTSymbol): LRTerm[] {
        let ts = [];
        for (let t of this.terms) {
            if (t.getRule().getLhs().getSymStr() == nt.getSymStr())
                ts.push(t);
        }
        return ts;
    }

    public static main() {
        new Table().createTable();
    }

    public createTable() {
        this.rules[0] = new Rule(new NTSymbol("S"), [new NTSymbol("E")]);
        this.terms[0] = new LRTerm(this.rules[0]);

        this.rules[1] = new Rule(new NTSymbol("E"), [new NTSymbol("E"), new TSymbol("+"), new NTSymbol("T")]);
        this.terms[1] = new LRTerm(this.rules[1]);

        this.rules[2] = new Rule(new NTSymbol("E"), [new NTSymbol("T")]);
        this.terms[2] = new LRTerm(this.rules[2]);

        this.rules[3] = new Rule(new NTSymbol("T"), [new NTSymbol("T"), new TSymbol("*"), new NTSymbol("F")]);
        this.terms[3] = new LRTerm(this.rules[3]);

        this.rules[4] = new Rule(new NTSymbol("T"), [new NTSymbol("F")]);
        this.terms[4] = new LRTerm(this.rules[4]);

        this.rules[5] = new Rule(new NTSymbol("F"), [new TSymbol("("), new NTSymbol("E"), new TSymbol(")")]);
        this.terms[5] = new LRTerm(this.rules[5]);

        this.rules[6] = new Rule(new NTSymbol("F"), [new TSymbol("i")]);
        this.terms[6] = new LRTerm(this.rules[6]);


        {
            let term = this.terms[1];
            console.log(term.toString() + " ==> ")
            let closure: LRTerm[] = this.closure([term]);
            for (let t of closure)
                console.log("\t" + t.toString());

            term = term.proceed();
            console.log(term.toString() + " ==> ")
            closure = this.closure([term]);
            for (let t of closure)
                console.log("\t" + t.toString());

            term = term.proceed();
            console.log(term.toString() + " ==> ")
            closure = this.closure([term]);
            for (let t of closure)
                console.log("\t" + t.toString());

            term = term.proceed();
            console.log(term.toString() + " ==> ")
            closure = this.closure([term]);
            for (let t of closure)
                console.log("\t" + t.toString());
        }

    }
}

Table.main();
