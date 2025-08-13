import * as kb from "./knuth-bendix.js"

function v(name: number): kb.Term {
    return { type: "var", name }
}

function f(name: string, ...args: kb.Term[]): kb.Term {
    return { type: "fun", name, args };
}

function s(subst: kb.Substitution | false): string {
    function show_term(term: kb.Term): string {
        if(term.type === "var") {
            return term.name.toString();
        }

        return `${term.name}(${term.args.map(show_term).join(", ")})`;
    }

    function show_entry([key, value]: [number, kb.Term]): string {
        return `${key} => ${show_term(value)}`;
    }

    if(subst) {
        const entries = subst.entries();
        return entries.map(show_entry).toArray().join(", ");
    }

    return "false";
}

console.log(s(kb.unify(f("foo"), v(0))));
console.log(s(kb.unify(f("foo"), f("bar"))));
console.log(s(kb.unify(f("likes", f("bob"), v(1)), f("likes", v(4), f("apple")))));

console.log(s(kb.unify(
    f("append", f("nil"), v(0), v(0)),
    f("append", f("nil"), f("cons", f("zero"), f("nil")), v(1))
)));
