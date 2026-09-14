import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import typescript from "typescript";
import {
  generateCaseStudyPages,
  loadCaseStudies,
  parseCaseStudy,
  renderCaseStudyPage,
  scanConfidentiality,
  slugifyHeading,
} from "./case-studies.mjs";

const safeSource = `---
title: "Case seguro"
slug: "case-seguro"
summary: "Resumo público e abstrato."
tags: [Kotlin, AWS SQS]
---

# Case seguro

## Visão geral

Conteúdo seguro.
`;

const confidentialityNotice =
  "Este é um estudo técnico autoral desenvolvido em ambiente pessoal a partir de padrões recorrentes da indústria. O cenário e a arquitetura foram sintetizados para fins educacionais e não descrevem sistemas, projetos, dados ou decisões de empregadores atuais ou anteriores.";

const approvedPublicSlugs = [
  "conciliacao-financeira-idempotente-saga",
  "resiliencia-performance-motor-elegibilidade",
  "operacao-segura-dlq-mcp-client-agnostic",
];

async function loadHomeCaseStudies(rootDir) {
  const source = await readFile(join(rootDir, "src", "caseStudies.ts"), "utf8");
  const transpiled = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.ESNext,
      target: typescript.ScriptTarget.ES2022,
    },
    fileName: "caseStudies.ts",
    reportDiagnostics: true,
  });
  const errors = (transpiled.diagnostics ?? []).filter(
    ({ category }) => category === typescript.DiagnosticCategory.Error,
  );
  assert.deepEqual(errors, [], "typed home metadata must transpile without errors");

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(
    transpiled.outputText,
  ).toString("base64")}`;
  const module = await import(moduleUrl);
  return module.engineeringCaseStudies;
}

function extractTechArticleJsonLd(html) {
  const match = html.match(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  assert.ok(match, "missing application/ld+json script");
  const jsonLd = JSON.parse(match[1]);
  assert.equal(jsonLd["@type"], "TechArticle");
  return jsonLd;
}

test("parses required front matter and article body", () => {
  const parsed = parseCaseStudy(safeSource, "safe.md");
  assert.equal(parsed.slug, "case-seguro");
  assert.deepEqual(parsed.tags, ["Kotlin", "AWS SQS"]);
  assert.match(parsed.body, /## Visão geral/);
});

for (const [label, unsafe] of [
  ["AWS ARN", "arn:aws:sqs:sa-east-1:123456789012:private-queue"],
  ["AWS GovCloud ARN", "arn:aws-us-gov:s3:::fictional-review-bucket"],
  ["AWS account", "Conta 123456789012"],
  ["private URL", "https://logs.internal.example/path"],
  ["email outside allowlist", "person@example.com"],
  ["ticket", "FIN-1234"],
  ["professional attribution", "Experiência profissional real"],
  ["secret", "AKIAIOSFODNN7EXAMPLE"],
  ["GitHub classic PAT", `ghp_${"A".repeat(36)}`],
  ["GitHub fine-grained PAT", `github_pat_${"A".repeat(22)}_${"B".repeat(59)}`],
  ["GitLab PAT", `glpat-${"A".repeat(24)}`],
  ["Slack token", `xoxb-${"AB".repeat(6)}-${"C".repeat(24)}`],
  ["Slack app token", "xapp-1-FAKEAPP-FAKEINSTALL-FAKESECRET"],
  ["npm token", `npm_${"A".repeat(36)}`],
  ["OpenAI token", `sk-${"A".repeat(32)}`],
  ["Google API key", `AIza${"A".repeat(35)}`],
  ["private S3 URI", "s3://example-private-bucket/path"],
  ["RFC1918 10/8 address", "10.23.4.5"],
  ["RFC1918 172.16/12 address", "172.20.1.10"],
  ["RFC1918 192.168/16 address", "192.168.1.5"],
  ["loopback address", "127.0.0.1"],
  ["corporate hostname", "service.corp"],
  ["local hostname", "devbox.local"],
  ["localhost hostname", "localhost"],
  ["RSA private key", "-----BEGIN RSA PRIVATE KEY-----"],
  ["EC private key", "-----BEGIN EC PRIVATE KEY-----"],
  ["OpenSSH private key", "-----BEGIN OPENSSH PRIVATE KEY-----"],
  ["encrypted private key", "-----BEGIN ENCRYPTED PRIVATE KEY-----"],
]) {
  test(`rejects ${label}`, () => {
    assert.throws(
      () => scanConfidentiality(`${safeSource}\n${unsafe}`, "unsafe.md"),
      /Confidentiality check failed/,
    );
  });
}

test("allows only the explicitly approved public email", () => {
  assert.doesNotThrow(() =>
    scanConfidentiality(
      `${safeSource}\nContato: caiquecleber@gmail.com`,
      "safe.md",
    ),
  );
});

for (const emptyTags of ["[]", "[ ]", "[,]", '[""]']) {
  test(`rejects empty tags declared as ${emptyTags}`, () => {
    const source = safeSource.replace(
      "tags: [Kotlin, AWS SQS]",
      `tags: ${emptyTags}`,
    );

    assert.throws(() => parseCaseStudy(source, "empty-tags.md"), /missing tags/);
  });
}

test("loads only markdown case studies in stable order", async () => {
  const directory = await mkdtemp(join(tmpdir(), "case-studies-"));
  await writeFile(join(directory, "case-02.md"), safeSource.replaceAll("case-seguro", "case-dois"));
  await writeFile(join(directory, "case-01.md"), safeSource.replaceAll("case-seguro", "case-um"));
  const cases = await loadCaseStudies(directory);
  assert.deepEqual(cases.map(({ slug }) => slug), ["case-um", "case-dois"]);
});

test("slugifies accented headings deterministically", () => {
  assert.equal(slugifyHeading("Visão geral"), "visao-geral");
});

test("keeps heading IDs globally unique across natural suffix collisions", () => {
  const caseStudy = parseCaseStudy(
    `${safeSource}\n\n## Foo\n\nPrimeiro.\n\n## Foo\n\nSegundo.\n\n## Foo 2\n\nTerceiro.`,
    "headings.md",
  );
  const html = renderCaseStudyPage(caseStudy, {});
  const fooIds = [...html.matchAll(/<h2 id="(foo[^"]*)">/g)].map(
    ([, id]) => id,
  );

  assert.deepEqual(fooIds, ["foo", "foo-2", "foo-2-2"]);
  assert.equal(new Set(fooIds).size, fooIds.length);
});

test("renders Markdown without executing raw HTML", () => {
  const caseStudy = parseCaseStudy(
    `${safeSource}\n\n## Decisão técnica\n\n<script>alert("unsafe")</script>\n\n\`\`\`js\nconst answer = 42;\n\`\`\`\n\n| Item | Valor |\n| --- | --- |\n| Seguro | Sim |`,
    "safe.md",
  );
  const html = renderCaseStudyPage(caseStudy, {});
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;alert/);
  assert.match(html, /<h2 id="visao-geral">Visão geral<\/h2>/);
  assert.match(html, /class="article-code"/);
  assert.match(html, /<div class="table-scroll" tabindex="0"><table>/);
});

test("renders only explicit diagram fences as accessible figures", () => {
  const caseStudy = parseCaseStudy(
    `${safeSource}\n\n## Arquitetura\n\n\`\`\`diagram\nLegenda: Fluxo público entre origem e destino\nOrigem -> Destino\n\`\`\`\n\n\`\`\`text\nBloco de código comum\n\`\`\``,
    "diagram.md",
  );
  const html = renderCaseStudyPage(caseStudy, {});

  assert.equal(html.match(/<figure class="article-diagram">/g)?.length ?? 0, 1);
  assert.match(
    html,
    /<figcaption id="diagram-caption-1">Fluxo público entre origem e destino<\/figcaption>/,
  );
  assert.match(
    html,
    /<div class="diagram-scroll" tabindex="0" role="region" aria-labelledby="diagram-caption-1">/,
  );
  assert.match(html, /<code class="article-diagram-code">Origem -&gt; Destino/);
  assert.match(html, /<code class="article-code">Bloco de código comum/);
});

test("rejects a diagram fence without a specific caption", () => {
  const caseStudy = parseCaseStudy(
    `${safeSource}\n\n\`\`\`diagram\nOrigem -> Destino\n\`\`\``,
    "unlabelled-diagram.md",
  );

  assert.throws(
    () => renderCaseStudyPage(caseStudy, {}),
    /diagram.*Legenda/i,
  );
});

test("keeps a single h1 when article Markdown contains another level-one heading", () => {
  const caseStudy = parseCaseStudy(
    `${safeSource}\n\n# Seção inesperada\n\nConteúdo adicional.`,
    "safe.md",
  );
  const html = renderCaseStudyPage(caseStudy, {});
  assert.equal(html.match(/<h1\b[^>]*>/gi)?.length ?? 0, 1);
});

test("generates a complete indexable article and sitemap", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "portfolio-root-"));
  const contentDir = join(rootDir, "content", "case-studies");
  const outDir = join(rootDir, "dist");
  await mkdir(contentDir, { recursive: true });
  await writeFile(join(contentDir, "case-01.md"), safeSource);

  await generateCaseStudyPages({ rootDir, outDir });

  const html = await readFile(join(outDir, "estudos-de-caso", "case-seguro", "index.html"), "utf8");
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<main id="conteudo">/);
  assert.match(html, /Nota de escopo/);
  assert.equal(html.split(confidentialityNotice).length - 1, 1);
  assert.match(html, /<link rel="canonical" href="https:\/\/caique-rezende\.dev\/estudos-de-caso\/case-seguro\/">/);
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /"@type":"TechArticle"/);

  const sitemap = await readFile(join(outDir, "sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/caique-rezende\.dev<\/loc>/);
  assert.match(sitemap, /https:\/\/caique-rezende\.dev\/estudos-de-caso\/case-seguro\/<\/loc>/);
});

test("keeps typed home metadata in sync with approved front matter", async () => {
  const rootDir = process.cwd();
  const caseStudies = await loadCaseStudies(join(rootDir, "content", "case-studies"));
  const homeCaseStudies = await loadHomeCaseStudies(rootDir);
  const slugs = caseStudies.map(({ slug }) => slug);

  assert.equal(caseStudies.length, 3);
  assert.deepEqual(slugs, approvedPublicSlugs);
  assert.equal(new Set(slugs).size, caseStudies.length);
  assert.doesNotMatch(JSON.stringify(caseStudies), /\bOpsPilot\b/i);
  assert.deepEqual(
    homeCaseStudies.map(({ title, summary, href }) => ({
      title,
      summary,
      slug: href.match(/^\/estudos-de-caso\/([^/]+)\/$/)?.[1],
      href,
    })),
    caseStudies.map(({ title, summary, slug }) => ({
      title,
      summary,
      slug,
      href: `/estudos-de-caso/${slug}/`,
    })),
  );

});

test("generates every approved public article with its publishing metadata", async () => {
  const rootDir = process.cwd();
  const outDir = await mkdtemp(join(tmpdir(), "published-case-studies-"));
  const caseStudies = await loadCaseStudies(
    join(rootDir, "content", "case-studies"),
  );

  await generateCaseStudyPages({ rootDir, outDir });

  for (const caseStudy of caseStudies) {
    const html = await readFile(
      join(outDir, "estudos-de-caso", caseStudy.slug, "index.html"),
      "utf8",
    );

    assert.ok(html.includes(caseStudy.title));
    assert.ok(html.includes(caseStudy.summary));
    assert.equal(html.match(/<h1\b[^>]*>/gi)?.length ?? 0, 1);
    assert.ok(
      html.includes(
        `<link rel="canonical" href="https://caique-rezende.dev/estudos-de-caso/${caseStudy.slug}/">`,
      ),
    );
    assert.match(html, /<meta property="og:type" content="article">/);
    assert.equal(html.split(confidentialityNotice).length - 1, 1);
    const jsonLd = extractTechArticleJsonLd(html);
    assert.equal(jsonLd.headline, caseStudy.title);
    assert.equal(jsonLd.description, caseStudy.summary);
    assert.match(html, /<link rel="stylesheet" href="\/case-studies\.css">/);
    assert.match(html, />Voltar aos estudos de caso<\/a>/);
  }
});

test("marks every published architecture diagram with a specific caption", async () => {
  const caseStudies = await loadCaseStudies(
    join(process.cwd(), "content", "case-studies"),
  );
  const captions = caseStudies.flatMap(({ body }) =>
    [...body.matchAll(/```diagram\r?\nLegenda:\s*([^\r\n]+)\r?\n/g)].map(
      ([, caption]) => caption,
    ),
  );

  assert.equal(captions.length, 3);
  assert.equal(new Set(captions).size, captions.length);
});

test("styles diagram regions for horizontal scrolling and visible focus", async () => {
  const css = await readFile(
    new URL("../public/case-studies.css", import.meta.url),
    "utf8",
  );

  assert.match(
    css,
    /\.diagram-scroll\s*{[^}]*overflow-x:\s*auto;[^}]*overscroll-behavior-inline:\s*contain;/,
  );
  assert.match(
    css,
    /:where\(a, \[tabindex="0"\]\):focus-visible\s*{[^}]*outline:\s*3px solid var\(--lime\);/,
  );
});

test("print styles override every low-contrast article foreground", async () => {
  const css = await readFile(new URL("../public/case-studies.css", import.meta.url), "utf8");
  assert.match(
    css,
    /@media print[\s\S]*\.article-summary,\s*\.article-eyebrow,\s*\.article-tags li\s*{\s*color: #000;/,
  );
  assert.match(
    css,
    /@media print[\s\S]*\.case-study-article :not\(pre\) > code\s*{[^}]*background: #fff;[^}]*color: #000;/,
  );
});
