import C = require("typescript-collections");

export class LRTerm {
    private rule: Rule;
    private index: number = 0;

    constructor(rule: Rule) {
        this.rule = rule;
    }

    /**
     * For typpescript-collections.
     */
    public toString() {
        return C.util.makeString(this);
    }

    public getRule(): Rule {
        return this.rule;
    }

    public proceed(): LRTerm {
        const t = new LRTerm(this.rule);
        const max = this.rule.getRhs().length;
        t.index = (this.index < max) ? this.index + 1 : this.index;
        return t;
    }

    /** return 'undefined' if dot is on the end. */
    public getNextSymbol(): GSymbol {
        return this.rule.getRhs()[this.index];
    }

    public getString() {
        let str: string = this.rule.getLhs().getSymbolStr().toString() + " -> ";
        const rhs: GSymbol[] = this.rule.getRhs();
        for (let i = 0; i < rhs.length; i++) {
            const sym: string = rhs[i].getSymbolStr().toString();
            str = (i === this.index)
                ? str.concat(".").concat(sym)
                : str.concat(" ").concat(sym);
        }
        if (this.index === rhs.length)
            str = str.concat(".");
        return str;
    }

    public equals(o: any): boolean {
        if (!(o instanceof LRTerm)) return false;
        const t = o as LRTerm;
        // since rule instances are unique.
        if (this.rule !== t.rule) return false;
        if (this.index !== t.index) return false;
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

    public getString(): string {
        return this.lhs.getSymbolStr()
            + " -> "
            + this.rhs.map((sym: GSymbol) => sym.getSymbolStr().toString()).join(" ");
    }

    public getLhs(): NTSymbol {
        return this.lhs;
    }

    public getRhs(): GSymbol[] {
        return this.rhs;
    }

    public toString() {
        return C.util.makeString(this);
    }
}

export abstract class GSymbol {
    private sym: string;

    constructor(sym: string) {
        this.sym = sym;
    }

    public getSymbolStr(): string {
        return this.sym;
    }

    public toString() {
        return C.util.makeString(this);
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
        super("^");
    }
}

export class ExitTSymbol extends GSymbol {
    constructor() {
        super("$");
    }
}

export enum ActionKind {
    Shift,
    Reduce,
    Accepted,
}

export class Action {
    public readonly kind: ActionKind;
    public readonly n: number;
    /**
     * @param kind is a kind of the action.
     * @param n is a target state when Shift,
     *          is a rule index when Reduce,
     *          is 0 when Accepted.
     */
    constructor(kind: ActionKind, n: number) {
        this.kind = kind;
        this.n = n;
    }
}
