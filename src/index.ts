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

// Can we remove this?
test.addEquation(
    ["inst", "s", ["lam", "a"]],
    ["inst", "s", ["lam", "a"]]
);
