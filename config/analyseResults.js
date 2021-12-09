import { stripColor } from "https://deno.land/std/fmt/colors.ts";
import { Buffer } from "https://deno.land/std/io/buffer.ts";
import { readLines } from "https://deno.land/std@0.97.0/io/bufio.ts";

function summarize(l, out) {
  const tkns = l.matchAll(
    /test\sresult:\s(.*)\s(\d+)\spassed;\s(\d+)\sfailed;\s(\d+)\signored;\s(\d+)\smeasured;\s(\d+)\sfiltered\sout\s\((\d+)ms\)/gm
  );
  const tknsArr = Array.from(tkns)[0];
  if (!tknsArr) return;
  out.passed = Number(tknsArr[2]);
  out.failed = Number(tknsArr[3]);
  out.ignored = Number(tknsArr[4]);
  out.measured = Number(tknsArr[5]);
  out.filteredOut = Number(tknsArr[6]);
  out.totalTimeTaken = Number(tknsArr[7]);
}

function singleTest(l, out) {
  const tkns = l.matchAll(/test\s(.*)\s\.\.\.\s(.*)\s.*/gm);
  const tknsArr = Array.from(tkns)[0];
  if (!tknsArr) return;
  const obj = JSON.parse(tknsArr[1]);
  totalWeight += obj.weight;

  if (tknsArr[2] === "ok") {
    out.passedCases.push(obj.name);

    for (let i = 0; i < 10; i++) {
      if (obj[i.toString()]) {
        out.passedLOs.push(obj[i.toString()]);
      }
    }

    out.passedLOs.push();
    score += obj.weight;
  } else {
    out.failedCases.push(obj.name);
  }
}

const p = Deno.run({
  cmd: [
    "deno",
    "test",
    "--unstable",
    "--allow-all",
    "--allow-run",
    "--allow-write",
    "--allow-env",
    "--allow-net",
    "sigma.test.js",
  ],
  stdout: "piped",
  stderr: "piped",
  stdin: "null",
});

const out = { passedCases: [], failedCases: [], passedLOs: [] };
const s = await p.status();
out.status = s.success;
const rawOutput = await p.output();
const buf = new Buffer(rawOutput);
let totalWeight = 0;
let score = 0;

for await (const l of readLines(buf)) {
  summarize(stripColor(l), out);
  singleTest(stripColor(l), out);
}
out.score = Math.round((score / totalWeight) * 100) + "%";
console.log(JSON.stringify(out, null, 4));
