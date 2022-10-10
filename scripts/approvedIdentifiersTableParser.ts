import fs from "fs";
import https from "https";
import path from "path";
import { IdentifierDetailsT, UmipLinkT } from "types";

void main();

async function main() {
  // first download the table of approved identifiers from our docs
  const url =
    "https://raw.githubusercontent.com/UMAprotocol/docs/master/docs/uma-tokenholders/approved-price-identifiers.md";
  const markdownPath = path.join(__dirname, "../data/approvedIdentifiersTable.md");
  const jsonPath = path.join(__dirname, "../data/approvedIdentifiersTable.json");

  await downloadFile(url, markdownPath);

  // read and parse the markdown file from GitHub
  const contents = fs.readFileSync(markdownPath, "utf-8");
  const lines = contents
    .split("\n")
    // ignore the first 8 lines (headmatter and table headers)
    .slice(8);
  const parsedLines = lines.map(parseLine);

  const table: Record<string, IdentifierDetailsT> = {};

  // add each line to the table
  for (const line of parsedLines) {
    table[line.identifier] = line;
  }

  const parsedTable = JSON.stringify(table, null, 2);

  // write the parsed table to a json file
  fs.writeFile(jsonPath, parsedTable, (err) => console.error(err));

  // remove the markdown file
  fs.unlinkSync(markdownPath);
}

function parseLine(line: string): IdentifierDetailsT {
  const dividerIndices: number[] = [];

  for (let i = 0; i < line.length; i++) {
    if (line[i] === "|") {
      dividerIndices.push(i);
    }
  }

  const identifier = line.substring(dividerIndices[0] + 1, dividerIndices[1]);
  const summary = line.substring(dividerIndices[1] + 2, dividerIndices[2]);
  const markdownUmipLink = line.substring(dividerIndices[2] + 2, line.length);
  const umipLink = parseMarkdownUmipLink(markdownUmipLink);

  return {
    identifier,
    summary,
    umipLink,
  };
}

function parseMarkdownUmipLink(umipLink: string): UmipLinkT {
  const number = umipLink.substring(umipLink.indexOf("[") + 1, umipLink.indexOf("]"));
  const url = umipLink.substring(umipLink.indexOf("(") + 1, umipLink.indexOf(")"));

  return { number, url };
}

async function downloadFile(url: string, targetFile: fs.PathLike) {
  return await new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const code = response.statusCode ?? 0;

        if (code >= 400) {
          return reject(new Error(response.statusMessage));
        }

        // handle redirects
        if (code > 300 && code < 400 && !!response.headers.location) {
          void downloadFile(response.headers.location, targetFile);
          return;
        }

        // save the file to disk
        const fileWriter = fs.createWriteStream(targetFile).on("finish", () => {
          resolve({});
        });

        response.pipe(fileWriter);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
