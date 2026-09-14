import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { engineeringCaseStudies } from "../caseStudies";
import { EngineeringCaseStudies } from "./EngineeringCaseStudies";

const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

afterEach(cleanup);

describe("EngineeringCaseStudies", () => {
  it("renders the approved cases in editorial order", () => {
    render(<EngineeringCaseStudies />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
    expect(within(articles[0]).getByText("Case principal")).toBeInTheDocument();
    expect(
      within(articles[0]).getByRole("heading", {
        name: engineeringCaseStudies[0].title,
      }),
    ).toBeInTheDocument();
  });

  it("links every CTA to its canonical static page", () => {
    render(<EngineeringCaseStudies />);
    for (const item of engineeringCaseStudies) {
      const card = screen
        .getByRole("heading", { name: item.title })
        .closest("article");
      expect(
        within(card!).getByRole("link", { name: "Ver estudo de caso" }),
      ).toHaveAttribute("href", item.href);
    }
  });

  it("marks the lead case without relying on color alone", () => {
    render(<EngineeringCaseStudies />);
    const featured = screen.getByText("Case principal").closest("article");
    expect(featured).toHaveClass("case-study-card--featured");
    expect(featured).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/case principal/i),
    );
  });

  it("mantém os três cases na mesma linha assimétrica em telas largas", () => {
    const desktopRules = styles.slice(
      styles.indexOf("@media (min-width: 72rem)"),
      styles.indexOf("@media (prefers-reduced-motion: reduce)"),
    );

    expect(desktopRules).toMatch(
      /\.case-studies-grid\s*\{\s*grid-template-columns:\s*minmax\(0, 1\.35fr\) repeat\(2, minmax\(0, 1fr\)\);\s*\}/,
    );
    expect(desktopRules).not.toMatch(
      /\.case-study-card--featured\s*\{[^}]*grid-row/,
    );
  });
});
