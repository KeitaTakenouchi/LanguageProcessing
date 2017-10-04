import fs = require("fs");
import C = require("typescript-collections");
import { LRParser } from "../src/parser/lrparser";
import { Scanner } from "../src/parser/scanner";

let parser: LRParser = new LRParser();

let filename: string = "../../sample_programs/b.tip";
let body: string = fs.readFileSync(filename, "UTF-8");
let scanner = new Scanner(body);

let tokens = [];
let token;
while (token = scanner.scan())
    tokens.push(token);

parser.parse(tokens);

