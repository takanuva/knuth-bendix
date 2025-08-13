import { Term } from "./substitution.js"

export interface Rule {
    lhs: Term;
    rhs: Term;
}

export interface Equation {
    lhs: Term;
    rhs: Term;
}

export class KnuthBendix {
    private equations: Equation[];
    private rules: Rule[];

    public constructor() {
        this.equations = [];
        this.rules = [];
    }
}
