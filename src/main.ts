
import { Scanner } from "./parser/scanner";
import { Token } from "./parser/token";

export class Main {
    public static run(): void {
        const fs = require("fs");
        const filename: string = "../sample_programs/c.tip";
        const body: string = fs.readFileSync(filename, "UTF-8");
        const scanner = new Scanner(body);

        let token: Token = scanner.scan();
        while (!token) {
            console.log(token);
            token = scanner.scan();
        }
    }
}

Main.run();
