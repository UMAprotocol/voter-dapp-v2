import fs from "fs";
import path from "path";

main();

function main() {
  const pathToDir = process.argv[2];
  const dir = path.join(__dirname, `../${pathToDir}`);
  const funcs = fs
    .readdirSync(dir)
    .filter((file) => file !== "index.ts")
    .map((file) => file.split(".")[0]);
  const imports = funcs.map((func) => `import ${func} from "./${func}";`).join("\n");
  const exports = funcs.join(", ");
  const exportStatement = `export { ${exports} };`;
  const output = `${imports}\n\n${exportStatement}\n`;
  fs.writeFileSync(path.join(__dirname, `../${pathToDir}/index.ts`), output);
}
