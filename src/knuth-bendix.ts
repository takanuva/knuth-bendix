import { Term } from "./substitution.js"

export interface Rule {
    lhs: Term;
    rhs: Term;
}

export interface Equation {
    lhs: Term;
    rhs: Term;
}

export type Formula = string | [string, ...Formula[]]

export class KnuthBendix {
    private equations: Equation[];
    private rules: Rule[];
    private names: Map<number, string>;

    public constructor() {
        this.equations = [];
        this.rules = [];
        this.names = new Map();
    }

    private getVar(name: string, variables: Map<string, number>): number {
        if(variables.has(name)) {
            return variables.get(name)!;
        }

        let index = this.names.size;
        variables.set(name, index);
        this.names.set(index, name);
        return index;
    }

    private parse(f: Formula, variables: Map<string, number>): Term {
        if(typeof f === "string") {
            let name = this.getVar(f, variables);
            return { type: "var", name };
        }

        let [name, ...data] = f;
        let args = data.map((x) => this.parse(x, variables));
        return { type: "fun", name, args }
    }

    public addEquation(fst: Formula, snd: Formula) {
        let variables = new Map();

        let lhs = this.parse(fst, variables);
        let rhs = this.parse(snd, variables);

        let size = this.equations.length;
        let lhs_str = this.showTerm(lhs);
        let rhs_str = this.showTerm(rhs);
        console.log(`Adding equation #${size}: ${lhs_str} = ${rhs_str}.`);

        this.equations.push({ lhs, rhs });
    }

    private showTerm(term: Term): string {
        if(term.type === "var") {
            return this.names.get(term.name)!.toUpperCase();
        }

        let name = term.name;
        let args = term.args.map((x) => " " + this.showTerm(x)).join("");
        return `(${name}${args})`;
    }

    private addRule(fst: Term, snd: Term) {

    }

    public *listDelete() {

    }

    public *listCompose() {

    }

    public *listSimplify() {

    }

    public *listOrient() {

    }

    public *listCollapse() {

    }

    public *listDeduce() {

    }
}
