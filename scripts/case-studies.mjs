import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Marked } from "marked";

const siteUrl = "https://caique-rezende.dev";
const allowedEmailAddresses = new Set(["caiquecleber@gmail.com"]);
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const riskPatterns = [
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ["AWS ARN", /\barn:aws(?:-[a-z0-9]+)*:[a-z0-9-]+:[^\s]+/gi],
  ["AWS account number", /\b\d{12}\b/g],
  ["GitHub token", /\b(?:gh[pousr]_[A-Z0-9]{20,255}|github_pat_[A-Z0-9_]{20,255})\b/gi],
  ["GitLab token", /\bglpat-[A-Z0-9_-]{20,255}\b/gi],
  ["Slack token", /\b(?:xox[baprs]-[A-Z0-9-]{20,255}|xapp-[A-Z0-9-]{20,255})\b/gi],
  ["npm token", /\bnpm_[A-Z0-9]{20,255}\b/gi],
  ["OpenAI token", /\bsk-(?:proj-)?[A-Z0-9_-]{20,255}\b/gi],
  ["Google API key", /\bAIza[A-Z0-9_-]{30,}\b/gi],
  ["private S3 URI", /\bs3:\/\/[^\s<>"')\]]+/gi],
  ["private or loopback IPv4 address", /\b(?:10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2}|127(?:\.\d{1,3}){3})\b/g],
  ["private or local hostname", /\b(?:localhost|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:internal|corp|local|lan|localdomain)(?:\.[a-z0-9-]+)*)\b/gi],
  ["ticket identifier", /\b(?:FIN|INC|OPS|PROD|SRE)-\d{3,}\b/g],
  ["blocked internal alias", /\bOpsPilot\b/gi],
  ["professional attribution", /\b(?:experiência profissional real|atuando em billing|sustentação de sistemas financeiros)\b/gi],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g],
];

const requiredFields = ["title", "slug", "summary", "tags"];

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const items = trimmed.slice(1, -1).trim();
    if (!items) return [];
    return items.split(",").map((item) => item.trim().replace(/^['"]|['"]$/g, ""));
  }
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function scanConfidentiality(source, fileName) {
  const findings = riskPatterns.flatMap(([label, pattern]) => {
    pattern.lastIndex = 0;
    return pattern.test(source) ? [`${fileName}: ${label}`] : [];
  });
  const hasUnexpectedEmail = (source.match(emailPattern) ?? []).some(
    (email) => !allowedEmailAddresses.has(email.toLowerCase()),
  );
  if (hasUnexpectedEmail) {
    findings.push(`${fileName}: email address outside allowlist`);
  }
  if (findings.length > 0) {
    throw new Error(`Confidentiality check failed:\n${findings.join("\n")}`);
  }
}

export function parseCaseStudy(source, fileName) {
  scanConfidentiality(source, fileName);
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) throw new Error(`${fileName}: invalid front matter`);
  const attributes = Object.fromEntries(
    match[1].split(/\r?\n/).filter(Boolean).map((line) => {
      const separator = line.indexOf(":");
      return [line.slice(0, separator).trim(), parseScalar(line.slice(separator + 1))];
    }),
  );
  for (const field of requiredFields) {
    const value = attributes[field];
    if (
      !value ||
      (Array.isArray(value) &&
        (value.length === 0 || value.some((item) => !String(item).trim())))
    ) {
      throw new Error(`${fileName}: missing ${field}`);
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(attributes.slug)) {
    throw new Error(`${fileName}: invalid slug`);
  }
  return { ...attributes, body: match[2].trim(), fileName };
}

export async function loadCaseStudies(contentDir) {
  const names = (await readdir(contentDir)).filter((name) => name.endsWith(".md")).sort();
  return Promise.all(names.map(async (name) => parseCaseStudy(await readFile(join(contentDir, name), "utf8"), name)));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value) {
  const url = String(value).trim();
  if (/^(?:https?:|mailto:|\/|#)/i.test(url)) return escapeHtml(url);
  return null;
}

export function slugifyHeading(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "secao";
}

function renderMarkdown(source) {
  const headings = [];
  const usedHeadingIds = new Set();
  let diagramCount = 0;
  const renderer = {
    heading({ tokens, depth }) {
      const html = this.parser.parseInline(tokens);
      const text = this.parser.parseInline(tokens, this.parser.textRenderer);
      const renderedDepth = depth === 1 ? 2 : depth;
      const baseId = slugifyHeading(text);
      let id = baseId;
      let suffix = 2;
      while (usedHeadingIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }
      usedHeadingIds.add(id);
      if (renderedDepth === 2) headings.push({ id, text });
      return `<h${renderedDepth} id="${id}">${html}</h${renderedDepth}>\n`;
    },
    html({ text }) {
      return escapeHtml(text);
    },
    code({ text, lang }) {
      if (lang?.trim().toLowerCase() === "diagram") {
        const [captionLine, ...diagramLines] = text.replaceAll("\r", "").split("\n");
        const caption = captionLine.match(/^Legenda:\s*(\S.*)$/i)?.[1];
        const diagram = diagramLines.join("\n").trimEnd();
        if (!caption || !diagram) {
          throw new Error(
            'diagram fence requires a "Legenda: ..." first line and content',
          );
        }

        diagramCount += 1;
        const captionId = `diagram-caption-${diagramCount}`;
        return `<figure class="article-diagram">\n<figcaption id="${captionId}">${escapeHtml(caption)}</figcaption>\n<div class="diagram-scroll" tabindex="0" role="region" aria-labelledby="${captionId}"><pre><code class="article-diagram-code">${escapeHtml(diagram)}\n</code></pre></div>\n</figure>\n`;
      }
      return `<pre><code class="article-code">${escapeHtml(text)}\n</code></pre>\n`;
    },
    table(token) {
      let header = "";
      for (const cell of token.header) header += this.tablecell(cell);
      let body = "";
      for (const row of token.rows) {
        let cells = "";
        for (const cell of row) cells += this.tablecell(cell);
        body += this.tablerow({ text: cells });
      }
      const tbody = body ? `<tbody>${body}</tbody>\n` : "";
      return `<div class="table-scroll" tabindex="0"><table>\n<thead>${this.tablerow({ text: header })}</thead>\n${tbody}</table></div>\n`;
    },
    blockquote({ tokens }) {
      return `<blockquote>\n${this.parser.parse(tokens)}</blockquote>\n`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const safeHref = safeUrl(href);
      if (!safeHref) return text;
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${safeHref}"${titleAttribute}>${text}</a>`;
    },
    image({ href, title, text }) {
      const safeHref = safeUrl(href);
      if (!safeHref) return escapeHtml(text);
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${safeHref}" alt="${escapeHtml(text)}"${titleAttribute}>`;
    },
  };
  const marked = new Marked({ gfm: true, renderer });
  return { html: marked.parse(source), headings };
}

function articleBody(body) {
  return body
    .replace(/^#\s+[^\r\n]+\r?\n+/, "")
    .replace(/^>\s*\*\*Nota de confidencialidade:\*\*[^\r\n]*(?:\r?\n>[^\r\n]*)*\r?\n*/i, "")
    .trim();
}

function renderNavigation(navigation) {
  const links = [];
  if (navigation.previous) {
    links.push(`<a rel="prev" href="/estudos-de-caso/${escapeHtml(navigation.previous.slug)}/">← ${escapeHtml(navigation.previous.title)}</a>`);
  }
  links.push('<a href="/#estudos-de-caso">Voltar aos estudos de caso</a>');
  if (navigation.next) {
    links.push(`<a rel="next" href="/estudos-de-caso/${escapeHtml(navigation.next.slug)}/">${escapeHtml(navigation.next.title)} →</a>`);
  }
  return links.join("\n");
}

export function renderCaseStudyPage(caseStudy, navigation = {}) {
  const canonical = escapeHtml(`${siteUrl}/estudos-de-caso/${caseStudy.slug}/`);
  const title = escapeHtml(caseStudy.title);
  const summary = escapeHtml(caseStudy.summary);
  const tags = Array.isArray(caseStudy.tags) ? caseStudy.tags : [caseStudy.tags];
  const tagsHtml = tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
  const rendered = renderMarkdown(articleBody(caseStudy.body));
  const articleHtml = rendered.html;
  const tocHtml = rendered.headings.length < 2
    ? ""
    : `<nav class="article-toc" aria-label="Nesta página"><p>Nesta página</p><ol>${rendered.headings.map(({ id, text }) => `<li><a href="#${escapeHtml(id)}">${escapeHtml(text)}</a></li>`).join("")}</ol></nav>`;
  const navigationHtml = renderNavigation(navigation);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: caseStudy.title,
    description: caseStudy.summary,
    author: { "@type": "Person", name: "Caíque Rezende", url: siteUrl },
    mainEntityOfPage: `${siteUrl}/estudos-de-caso/${caseStudy.slug}/`,
    keywords: tags,
  }).replace(/[<>&]/g, (character) => ({ "<": "\\u003c", ">": "\\u003e", "&": "\\u0026" })[character]);

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Caíque Rezende</title>
    <meta name="description" content="${summary}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/case-studies.css">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:url" content="${canonical}">
    <meta property="og:title" content="${title} — Caíque Rezende">
    <meta property="og:description" content="${summary}">
    <meta property="og:image" content="https://caique-rezende.dev/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="article-header"><a href="/">CR · Caíque Rezende</a></header>
    <main id="conteudo">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Início</a> / <a href="/#estudos-de-caso">Estudos de caso</a></nav>
      <header class="case-study-hero">
        <p class="article-eyebrow">Estudo de caso de engenharia</p>
        <h1>${title}</h1>
        <p class="article-summary">${summary}</p>
        <ul class="article-tags">${tagsHtml}</ul>
      </header>
      <aside class="confidentiality-note" aria-label="Nota de escopo">
        Este é um estudo técnico autoral desenvolvido em ambiente pessoal a partir de padrões recorrentes da indústria. O cenário e a arquitetura foram sintetizados para fins educacionais e não descrevem sistemas, projetos, dados ou decisões de empregadores atuais ou anteriores.
      </aside>
      ${tocHtml}
      <article class="case-study-article">${articleHtml}</article>
      <nav class="case-navigation" aria-label="Outros estudos de caso">${navigationHtml}</nav>
    </main>
    <footer class="article-footer">
      <p>Caíque Rezende · Engenharia de Software, Backend &amp; Cloud</p>
      <a href="/">Voltar ao portfólio</a>
    </footer>
  </body>
</html>
`;
}

export function renderSitemap(caseStudies) {
  const urls = [siteUrl, ...caseStudies.map(({ slug }) => `${siteUrl}/estudos-de-caso/${slug}/`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
}

export async function generateCaseStudyPages({ rootDir, outDir }) {
  const caseStudies = await loadCaseStudies(join(rootDir, "content", "case-studies"));
  await Promise.all(caseStudies.map(async (caseStudy, index) => {
    const destination = join(outDir, "estudos-de-caso", caseStudy.slug);
    await mkdir(destination, { recursive: true });
    await writeFile(join(destination, "index.html"), renderCaseStudyPage(caseStudy, {
      previous: caseStudies[index - 1],
      next: caseStudies[index + 1],
    }));
  }));
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "sitemap.xml"), renderSitemap(caseStudies));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateCaseStudyPages({ rootDir: process.cwd(), outDir: join(process.cwd(), "dist") });
}
