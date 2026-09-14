import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const mainTerraform = await readFile(
  new URL("../infra/app/main.tf", import.meta.url),
  "utf8",
);

function extractCustomRuleBodies(source) {
  const bodies = [];
  const declaration = /\bcustom_rule\b/g;

  while (declaration.exec(source)) {
    const openingBrace = source.indexOf("{", declaration.lastIndex);
    if (
      openingBrace === -1 ||
      source.slice(declaration.lastIndex, openingBrace).trim()
    ) {
      continue;
    }

    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let index = openingBrace; index < source.length; index += 1) {
      const character = source[index];
      const nextCharacter = source[index + 1];

      if (lineComment) {
        if (character === "\n") lineComment = false;
        continue;
      }
      if (blockComment) {
        if (character === "*" && nextCharacter === "/") {
          blockComment = false;
          index += 1;
        }
        continue;
      }
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === quote) {
          quote = null;
        }
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
      } else if (character === "#") {
        lineComment = true;
      } else if (character === "/" && nextCharacter === "/") {
        lineComment = true;
        index += 1;
      } else if (character === "/" && nextCharacter === "*") {
        blockComment = true;
        index += 1;
      } else if (character === "{") {
        depth += 1;
      } else if (character === "}") {
        depth -= 1;
        if (depth === 0) {
          bodies.push(source.slice(openingBrace + 1, index));
          declaration.lastIndex = index + 1;
          break;
        }
      }
    }
  }

  return bodies;
}

function extractCustomRules(source) {
  return extractCustomRuleBodies(source).map((body) => {
    const fields = {};
    for (const line of body.split(/\r?\n/)) {
      const assignment = line.match(
        /^\s*(source|target|status)\s*=\s*"((?:\\.|[^"\\])*)"/,
      );
      if (assignment) fields[assignment[1]] = assignment[2];
    }
    return fields;
  });
}

function hasSpaFallback(source) {
  return extractCustomRules(source).some(
    (rule) => rule.target === "/index.html" && rule.status === "200",
  );
}

function hasCanonicalRedirect(source) {
  return extractCustomRules(source).some(
    (rule) =>
      rule.source === "https://www.${var.domain_name}" &&
      rule.target === "https://${var.domain_name}" &&
      rule.status === "301",
  );
}

test("does not rewrite extensionless routes to the SPA entry point", () => {
  assert.equal(
    hasSpaFallback(mainTerraform),
    false,
    "a SPA 200 rewrite would intercept the static case-study routes",
  );
});

test("preserves the canonical www to apex redirect", () => {
  assert.equal(
    hasCanonicalRedirect(mainTerraform),
    true,
    "missing the www to apex 301 redirect",
  );
});

test("detects the SPA fallback when status appears before target", () => {
  const source = `
resource "aws_amplify_app" "example" {
  custom_rule {
    status = "200"
    source = "</^[^.]+$/>>"
    target = "/index.html"
  }
}`;

  assert.equal(hasSpaFallback(source), true);
});

test("detects the SPA fallback in its original field order", () => {
  const source = `
resource "aws_amplify_app" "example" {
  custom_rule {
    source = "</^[^.]+$/>>"
    target = "/index.html"
    status = "200"
  }
}`;

  assert.equal(hasSpaFallback(source), true);
});

test("does not assemble the canonical redirect from separate rules", () => {
  const source = `
resource "aws_amplify_app" "example" {
  custom_rule {
    source = "https://www.\${var.domain_name}"
    target = "https://\${var.domain_name}"
    status = "302"
  }

  custom_rule {
    source = "/legacy"
    target = "/replacement"
    status = "301"
  }
}`;

  assert.equal(hasCanonicalRedirect(source), false);
});

test("recognizes a valid canonical redirect regardless of field order", () => {
  const source = `
resource "aws_amplify_app" "example" {
  custom_rule {
    status = "301"
    target = "https://\${var.domain_name}"
    source = "https://www.\${var.domain_name}"
  }
}`;

  assert.equal(hasCanonicalRedirect(source), true);
});
