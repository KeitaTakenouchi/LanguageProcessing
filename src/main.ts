
import { Scanner } from './parser/scanner';
import { Token } from './parser/token';

export class Main {
    public static run(): void {
        let fs = require('fs');
        let filename: string = "../sample_programs/c.tip"
        let body: string = fs.readFileSync(filename, "UTF-8");
        let scanner = new Scanner(body);

        let token: Token;
        while (token = scanner.scan()) {
            console.log(token);
        }
    }
}

Main.run();