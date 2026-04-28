import { createRequire } from "module";

const require = createRequire(import.meta.url);

const mod = require("pdf-parse");

console.log(mod);
console.log(typeof mod);
console.log(Object.keys(mod));