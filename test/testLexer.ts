import Assert = require("assert");
import "mocha";
import { Scanner } from "../src/parser/scanner";
import { Token } from "../src/parser/token";

describe("Lexer (Scanner)", () => {
    it("works collectly for a.tip.", () => {
        const fs = require("fs");
        let filename: string = "sample_programs/a.tip";
        let body: string = fs.readFileSync(filename, "UTF-8");
        let scanner = new Scanner(body);

        let token: Token = scanner.scan();
        let count = 0;
        while (token) {
            token = scanner.scan();
            count++;
        }
        Assert.equal(count, 36);
    });
});
