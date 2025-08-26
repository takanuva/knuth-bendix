import * as reader from "readline-sync"
import { Term } from "./substitution.js"
import * as kb from "./knuth-bendix.js"

const test = new kb.KnuthBendix();
test.addEquation(// app
    ["inst", "s", ["app", "a", "b"]],
    ["app", ["inst", "s", "a"], ["inst", "s", "b"]]
)
test.addEquation(// varid
    ["inst", ["id"], ["z"]],
    ["z"]
)
test.addEquation(// varcons
    ["inst", ["cons", "a", "s"], ["z"]],
    "a"
)
test.addEquation(// clos
    ["inst", "t", ["inst", "s", "a"]],
    ["inst", ["comp", "s", "t"], "a"]
)
test.addEquation(// abs
    ["inst", "s", ["lam", "a"]],
    ["lam", ["inst", ["cons", ["z"], ["comp", "s", ["shift"]]], "a"]]
)
test.addEquation(//idl
    ["comp", ["id"], "s"],
    "s"
)

test.addEquation(//idl
    ["comp", ["id"], "s"],
    ["comp", ["id"], "s"]
)

function measure1(x: kb.Formula): number {
    // Variable!
    if(typeof x === "string") {
        return 1;
    }

    switch(x[0]) {
        case "app":
            return measure1(x[1]!) + measure1(x[2]!);
        case "lam":
            return 2 + measure1(x[1]!);
        case "inst":
            return measure1(x[2]!) * measure1(x[1]!);
        case "cons":
            return measure1(x[1]!) + measure1(x[2]!);
        case "comp":
            return measure1(x[1]!) * measure1(x[2]!);
        case "shift":
            return 2;
        case "id":
            return 2;
        case "z":
            return 1;
    }

    throw ["invalid formula", x];
}

function measure2(x: kb.Formula): number {
    // Variable!
    if(typeof x === "string") {
        return 1;
    }

    switch(x[0]) {
        case "app":
            return 1 + measure2(x[1]!) + measure2(x[2]!);
        case "lam":
            return 2 * measure2(x[1]!);
        case "inst":
            return measure2(x[2]!) * (1 + measure2(x[1]!));
        case "cons":
            return 1 + measure2(x[1]!) + measure2(x[2]!);
        case "comp":
            return measure2(x[1]!) * (1 + measure2(x[2]!));
        case "shift":
            return 1;
        case "id":
            return 1;
        case "z":
            return 1;
    }

    throw ["invalid formula", x];
}

function show(formula: kb.Formula): string {
    if(typeof formula === "string") {
        return formula.toUpperCase();
    }

    let [head, ...tail] = formula;
    let body = [head, ...tail.map(show)].join(" ");
    return `(${body})`;
}

test.addMeasure(measure1);
test.addMeasure(measure2);

function showState() {

}

function printActions(actions: kb.Action[]) {
    console.log(`There are currently ${actions.length} actions available:`);

    for(var i = 0; i < actions.length; i++) {
        let action = actions[i]!;
        switch(action[0]) {
            case "delete": {
                let lhs = show(action[1].lhs);
                let rhs = show(action[1].rhs);
                console.log(`  #${i}: delete ${lhs} = ${rhs}`);
                break;
            }
            case "orient": {
                let lhs = show(action[1].lhs);
                let rhs = show(action[1].rhs);
                console.log(`  #${i}: orient ${lhs} = ${rhs}`);
                break;
            }
        }
    }
}

function offerActions(): kb.Action[] {
    let actions = test.listActions().toArray();
    printActions(actions);
    return actions;
}

function performAction() {
    showState();
    let actions = offerActions();

    try {
        let answer = reader.question("How to proceed? Call: ");
        let number = parseInt(answer);
        if(isNaN(number) || number < 0 || number >= actions.length) {
            throw "oops";
        }

        console.log("Doing action!");

    } catch {
        console.log("Invalid answer, bro.");
        return performAction();
    }
}

performAction();
