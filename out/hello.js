"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const person_1 = require("./person");
class Hello {
    static main() {
        let person = new person_1.Person();
    }
    f() {
        return false;
    }
}
exports.Hello = Hello;
// This is a anonymous class implementing some interface.
let foo = {
    getName: () => "foo",
    getFoo: () => "foo"
};
let map = new Map();
map.set("js", "JavaScript");
map.set("hs", "Haskell");
map.set(null, "foo");
console.log("js  -> " + map.get("js"));
console.log("hs  -> " + map.get("hs"));
console.log("ts  -> " + map.get("ts"));
console.log("null-> " + map.get(null));
map.forEach((value, key) => {
    console.log(key + " - " + value);
});
let xs = map.entries();
for (let x of xs) {
    console.log(x[3]);
}
