import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

test("publishes canonical Portuguese metadata for search and social previews", () => {
  const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
  const document = new DOMParser().parseFromString(html, "text/html");

  expect(document.documentElement.getAttribute("lang")).toBe("pt-BR");
  expect(document.title).toBe("Caíque Rezende — Backend & Cloud Developer");
  expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
    "Engenheiro de Software especializado em backend, AWS e sistemas distribuídos, com atuação em dados e IA aplicada.",
  );
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
    "https://caique-rezende.dev",
  );
  expect(document.querySelector('link[rel="icon"]')?.getAttribute("href")).toBe("/favicon.svg");
  expect(document.querySelector('meta[property="og:type"]')?.getAttribute("content")).toBe("website");
  expect(document.querySelector('meta[property="og:locale"]')?.getAttribute("content")).toBe("pt_BR");
  expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
    "https://caique-rezende.dev",
  );
  expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(
    "Caíque Rezende — Backend & Cloud Developer",
  );
  expect(document.querySelector('meta[property="og:description"]')?.getAttribute("content")).toBe(
    "Engenheiro de Software especializado em backend, AWS e sistemas distribuídos, com atuação em dados e IA aplicada.",
  );
  expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(
    "https://caique-rezende.dev/og.png",
  );
  expect(document.querySelector('meta[property="og:image:width"]')?.getAttribute("content")).toBe("1731");
  expect(document.querySelector('meta[property="og:image:height"]')?.getAttribute("content")).toBe("909");
  expect(document.querySelector('meta[property="og:image:alt"]')?.getAttribute("content")).toBe(
    "Caíque Rezende — Backend, Cloud e IA aplicada",
  );
  expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBe(
    "summary_large_image",
  );
  expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe(
    "Caíque Rezende — Backend & Cloud Developer",
  );
  expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute("content")).toBe(
    "Engenheiro de Software especializado em backend, AWS e sistemas distribuídos, com atuação em dados e IA aplicada.",
  );
  expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute("content")).toBe(
    "https://caique-rezende.dev/og.png",
  );
});
