import { Term, unify } from "./substitution.js"

export interface Rule {
    lhs: Term;
    rhs: Term;
}

export interface Equation {
    lhs: Term;
    rhs: Term;
}

export type Formula = string | [string, ...Formula[]]

export type Action = DeleteAction

export type DeleteAction = ["delete", Equation]

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
            return this.names.get(term.name)!.toUpperCase() + term.name;
        }

        let name = term.name;
        let args = term.args.map((x) => " " + this.showTerm(x)).join("");
        return `(${name}${args})`;
    }

    private addRule(fst: Term, snd: Term) {

    }

    public perform(action: Action) {
        switch(action[0]) {
            case "delete": {
                this.delete(action[1]);
            }
        }
    }

    private delete(equation: Equation) {
        let index = this.equations.indexOf(equation);

        if(index !== -1) {
            this.equations.splice(index, 1);
        } else {
            throw "delete: unexpected equation!";
        }
    }

    public *listDelete(): Generator<DeleteAction> {
        // Look for equalities such as s = s; notice: the right-hand side should
        // never have variables that don't appear in the left-hand side, so we
        // just check that we can unify both sides (so it's a deep comparison)
        // without changing anything (i.e., they're already the same)
        for(var e of this.equations) {
            let mgu = unify(e.lhs, e.rhs);
            if(mgu && mgu.size == 0) {
                yield ["delete", e]
            }
        }
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
