import { Substitution, Term, unify } from "./substitution.js"

type Unification = [Map<string, number>, Substitution | false]

export interface Rule {
    lhs: Formula;
    rhs: Formula;
}

export interface Equation {
    lhs: Formula;
    rhs: Formula;
}

export type Formula = string | [string, ...Formula[]]

export type Action = DeleteAction
                   | OrientAction

export type DeleteAction = ["delete", Equation]
export type OrientAction = ["orient", Equation]

export function showFormula(formula: Formula): string {
    if(typeof formula === "string") {
        return formula.toUpperCase();
    }

    let [head, ...tail] = formula;
    let body = [head, ...tail.map(showFormula)].join(" ");
    return `(${body})`;
}

export class KnuthBendix {
    private equations: Equation[];
    private rules: Rule[];
    private names: Map<number, string>;
    private measures: ((term: Formula) => number)[];

    public constructor() {
        this.equations = [];
        this.rules = [];
        this.names = new Map();
        this.measures = [];
    }

    public show() {
        if(this.equations.length > 0) {
            console.log("Equations:");
            for(var i = 0; i < this.equations.length; i++) {
                let lhs = showFormula(this.equations[i]!.lhs);
                let rhs = showFormula(this.equations[i]!.rhs);
                console.log(`  #${i} ${lhs} = ${rhs}`);
            }
        } else {
            console.log("There are currently no equations.");
        }
        if(this.rules.length > 0) {
            console.log("Rules:");
            for(var i = 0; i < this.rules.length; i++) {
                let lhs = showFormula(this.rules[i]!.lhs);
                let rhs = showFormula(this.rules[i]!.rhs);
                console.log(`  #${i} ${lhs} = ${rhs}`);
            }
        } else {
            console.log("There are currently no rules.");
        }
    }

    public addMeasure(measure: (term: Formula) => number) {
        this.measures.push(measure);
    }

    private compare(lhs: Formula, rhs: Formula): number {
        // Check our formulas, in lexicographical order!
        for(let f of this.measures) {
            let x = f(lhs) - f(rhs);
            if(x == 0) {
                continue;
            };
            return x;
        }

        // Couldn't decide: same weight!
        return 0;
    }

    private serialize(term: Term): Formula {
        switch(term.type) {
            case "var": {
                return this.names.get(term.name)!;
            }
            case "fun": {
                return [term.name, ...term.args.map((x) => this.serialize(x))]
            }
        }
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

    private unify(lhs: Formula, rhs: Formula): Unification {
        let variables = new Map();
        let fst = this.parse(lhs, variables);
        let snd = this.parse(rhs, variables);

        return [variables, unify(fst, snd)]
    }

    public addEquation(lhs: Formula, rhs: Formula) {
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

    private addRule(lhs: Formula, rhs: Formula) {
        this.rules.push({ lhs, rhs });
    }

    public perform(action: Action) {
        switch(action[0]) {
            case "delete": {
                this.delete(action[1]);
                break;
            }
            case "orient": {
                this.orient(action[1]);
                break;
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

    private orient(equation: Equation) {
        // First, we need to remove this equation
        this.delete(equation);

        // Then proceed to add this as a rule
        let x = this.compare(equation.lhs, equation.rhs);
        if(x === 0) {
            throw "orient: unexpected equation!";
        }
        if(x > 0) {
            this.addRule(equation.lhs, equation.rhs);
        } else {
            this.addRule(equation.rhs, equation.lhs);
        }
    }

    public *listActions(): Generator<Action> {
        yield *this.listDelete();
        yield *this.listOrient();
    }

    public *listDelete(): Generator<DeleteAction> {
        // Look for equalities such as s = s; notice: the right-hand side should
        // never have variables that don't appear in the left-hand side, so we
        // just check that we can unify both sides (so it's a deep comparison)
        // without changing anything (i.e., they're already the same)
        for(var e of this.equations) {
            let [_, mgu] = this.unify(e.lhs, e.rhs);
            if(mgu && mgu.size == 0) {
                yield ["delete", e]
            }
        }
    }

    public *listCompose() {

    }

    public *listSimplify() {

    }

    public *listOrient(): Generator<OrientAction> {
        // Check our equations for orientable versions
        for(var e of this.equations) {
            let comparison = this.compare(e.lhs, e.rhs);
            if(comparison !== 0) {
                yield ["orient", e]
            }

            // This will be a problem later: cannot orient!
            continue;
        }
    }

    public *listCollapse() {

    }

    public *listDeduce() {

    }
}
