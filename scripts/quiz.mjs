#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(__dirname, "..", "src", "i18n");

const LANGS = {
  es: "Spanish",
  zh: "Chinese",
  vi: "Vietnamese",
  tl: "Tagalog",
};

const CATEGORIES = {
  housing: "Housing",
  voting: "Voting",
  lgbtq: "LGBTQ+ Rights",
  freeSpeech: "Free Speech",
  workers: "Workers' Rights",
  donate: "Donate",
  site: "Site",
};

function loadTranslations(lang) {
  const raw = readFileSync(join(I18N_DIR, `${lang}.ts`), "utf-8");
  const cleaned = raw
    .replace(/^export default\s*/, "(")
    .replace(/}\s*as\s*Record<string,\s*string>;\s*$/, "})")
    .replaceAll(/\/\/.*$/gm, "");
  return eval(cleaned);
}

function updateFile(lang, key, newValue) {
  const filePath = join(I18N_DIR, `${lang}.ts`);
  let content = readFileSync(filePath, "utf-8");

  const ek = key.replace(/\./g, "\\.");
  const pat = new RegExp(
    `("${ek}":\\s*(?:\\n\\s*)?")((?:[^"\\\\]|\\\\.)*)(")`,
  );

  const escaped = newValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  if (!pat.test(content)) {
    console.log(`  Could not find "${key}" in ${lang}.ts`);
    return false;
  }

  content = content.replace(pat, (_match, pre, _old, post) => pre + escaped + post);
  writeFileSync(filePath, content);
  return true;
}

// Colors
const R = "\x1b[0m";
const B = "\x1b[1m";
const C = "\x1b[36m";
const Y = "\x1b[33m";
const G = "\x1b[32m";
const D = "\x1b[2m";
const M = "\x1b[35m";

const en = loadTranslations("en");
const all = {};
for (const l of Object.keys(LANGS)) all[l] = loadTranslations(l);

// Quiz-worthy keys: skip short titles, phone numbers, nav items
const skip = /\.(title|phone\w*|home)$|^common\.|^site\.title$/;
const keys = Object.keys(en).filter((k) => !skip.test(k) && en[k].length > 20);

const rl = createInterface({ input: process.stdin, output: process.stdout });
let score = 0;
let rounds = 0;
let updated = 0;

async function round() {
  const key = keys[Math.floor(Math.random() * keys.length)];
  const lang =
    Object.keys(LANGS)[Math.floor(Math.random() * Object.keys(LANGS).length)];
  const cat = CATEGORIES[key.split(".")[0]] || key.split(".")[0];

  console.log();
  console.log(`${B}${C}════════════════════════════════════════════════${R}`);
  console.log(`${B}${C}  ROUND ${rounds + 1}${R}`);
  console.log(`${B}${C}════════════════════════════════════════════════${R}`);
  console.log();
  console.log(`  ${D}section${R}    ${B}${cat}${R}`);
  console.log(`  ${D}key${R}        ${D}${key}${R}`);
  console.log(`  ${D}language${R}   ${B}${M}${LANGS[lang]}${R}`);
  console.log();
  console.log(`  ${B}ENGLISH:${R}`);
  console.log(`  ${Y}${en[key]}${R}`);
  console.log();

  const ans = await rl.question(`  ${G}> ${R}`);
  const yours = ans.trim();
  if (!yours) {
    console.log(`  ${D}(skipped)${R}`);
    return true;
  }

  const theirs = all[lang][key] || "(missing)";
  rounds++;

  console.log();
  if (yours === theirs) {
    score++;
    console.log(`  ${B}${G}EXACT MATCH${R}`);
  } else {
    console.log(`  ${B}YOURS:${R}`);
    console.log(`  ${G}${yours}${R}`);
    console.log();
    console.log(`  ${B}WAS:${R}`);
    console.log(`  ${Y}${theirs}${R}`);
    console.log();

    if (updateFile(lang, key, yours)) {
      all[lang][key] = yours;
      updated++;
      console.log(`  ${G}Updated ${lang}.ts${R}`);
    }
  }

  console.log(`  ${D}score: ${score}/${rounds}  |  updates: ${updated}${R}`);
  return true;
}

console.log();
console.log(`${B}${C}╔════════════════════════════════════════════════╗${R}`);
console.log(`${B}${C}║  TRANSLATION QUIZ                              ║${R}`);
console.log(`${B}${C}║  beat the machine. fix the site.               ║${R}`);
console.log(`${B}${C}╚════════════════════════════════════════════════╝${R}`);

let go = true;
while (go) go = await round();

console.log();
if (rounds > 0) {
  const pct = Math.round((score / rounds) * 100);
  console.log(`${B}Final: ${score}/${rounds} (${pct}%)  |  ${updated} translation(s) updated${R}`);
}
console.log(`${D}thanks for making the translations better.${R}`);
console.log();

rl.close();
