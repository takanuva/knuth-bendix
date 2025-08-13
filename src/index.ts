import { Term, Substitution, unify } from "./substitution.js"
import * as kb from "./knuth-bendix.js"

function v(name: number): Term {
    return { type: "var", name }
}

function f(name: string, ...args: Term[]): Term {
    return { type: "fun", name, args };
}

function show(subst: Substitution | false): string {
    function show_term(term: Term): string {
        if(term.type === "var") {
            return term.name.toString();
        }

        return `${term.name}(${term.args.map(show_term).join(", ")})`;
    }

    function show_entry([key, value]: [number, Term]): string {
        return `${key} => ${show_term(value)}`;
    }

    if(subst) {
        const entries = subst.entries();
        return entries.map(show_entry).toArray().join(", ");
    }

    return "false";
}

console.log(show(unify(f("foo"), v(0))));
console.log(show(unify(f("foo"), f("bar"))));
console.log(show(unify(f("likes", f("bob"), v(1)), f("likes", v(4), f("apple")))));

console.log(show(unify(
    f("append", f("nil"), v(0), v(0)),
    f("append", f("nil"), f("cons", f("zero"), f("nil")), v(1))
)));

const test = new kb.KnuthBendix();
