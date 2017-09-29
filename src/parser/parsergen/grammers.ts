export class LRTerm {
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

export class Rule {
    private lhs: NTSymbol;
    private rhs: GSymbol[];

    constructor(lhs: NTSymbol, rhs: GSymbol[]) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    public toString(): string {
        return this.lhs.getSymStr()
            + " -> "
            + this.rhs.map((sym: GSymbol) => sym.getSymStr().toString()).join(" ");
    }

    public getLhs(): NTSymbol {
        return this.lhs;
    }

    public getRhs(): GSymbol[] {
        return this.rhs;
    }
}

export abstract class GSymbol {
    private sym: string;

    constructor(sym: string) {
        this.sym = sym;
    }

    public getSymStr(): string {
        return this.sym;
    }

}

export class NTSymbol extends GSymbol {
    constructor(sym: string) {
        super(sym);
    }
}

export class TSymbol extends GSymbol {
    constructor(sym: string) {
        super(sym);
    }
}

export class EntryNTSymbol extends NTSymbol {
    constructor() {
        super("S");
    }
}

export class ExitGSymbol extends GSymbol {
    constructor() {
        super("$");
    }
}