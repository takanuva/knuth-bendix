export type Term = Variable | Function

export interface Variable {
    readonly type: "var";
    readonly name: number;
}

export interface Function {
    readonly type: "fun";
    readonly name: string;
    readonly args: Term[];
}

export interface Atom {
    readonly type: "fun";
    readonly name: string;
    readonly args: [];
}

export type Substitution = Map<number, Term>

function identical(lhs: Term, rhs: Term): boolean {
    if(lhs.type === "var") {
        if(rhs.type === "var") {
            return lhs.name === rhs.name;
        }

        return false;
    }

    if(rhs.type === "fun") {
        if(lhs.name === rhs.name && lhs.args.length === rhs.args.length) {
            return lhs.args.every((x, i) => identical(x, lhs.args[i]!));
        }
    }

    return false;
}

export function unify(lhs: Term, rhs: Term): Substitution | false {
    if(lhs.type === "var") {
        if(rhs.type === "var" && lhs.name === rhs.name) {
            return new Map();
        }

        return new Map([[lhs.name, rhs]]);
    }

    if(rhs.type === "var") {
        return new Map([[rhs.name, lhs]]);
    }

    if(rhs.name === lhs.name) {
        return unifyArgs(lhs.args, rhs.args);
    }

    return false;
}

function unifyArgs(lhs: Term[], rhs: Term[]): Substitution | false {
    if(lhs.length !== rhs.length) {
        return false;
    }

    let subst: Substitution = new Map();
    for(let i = 0; i < lhs.length; i++) {
        let fst = instantiate(lhs[i]!, subst);
        let snd = instantiate(rhs[i]!, subst);
        let this_step = unify(fst, snd);

        if(this_step) {
            subst = compose(subst, this_step)
        } else {
            return false;
        }
    }

    return subst;
}

function instantiate(term: Term, subst: Substitution): Term {
    if(term.type === "var") {
        if(subst.has(term.name)) {
            return subst.get(term.name)!;
        }

        return term;
    }

    return {
        type: "fun",
        name: term.name,
        args: term.args.map((x) => instantiate(x, subst))
    }
}

function compose(t2: Substitution, t1: Substitution): Substitution {
    let result: Substitution = new Map();

    for(let [key, val] of t2.entries()) {
        result.set(key, val);
    }

    for(let [key, val] of t1.entries()) {
        if(t2.has(key)) {
            throw new Error("constraint violated: substitutions share key");
        }

        result.set(key, instantiate(val, t2));
    }

    return result;
}
