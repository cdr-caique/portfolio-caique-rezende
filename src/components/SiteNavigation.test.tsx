// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SiteNavigation } from "./SiteNavigation";

const originalInnerHeight = window.innerHeight;

afterEach(() => {
  cleanup();
  document
    .querySelectorAll("#sobre, #trajetoria, #estudos-de-caso, #github, #contato")
    .forEach((node) => {
      node.remove();
    });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: originalInnerHeight,
  });
});

beforeEach(() => {
  window.location.hash = "";
});

describe("SiteNavigation", () => {
  it("abre o menu móvel com todos os destinos e fecha após a escolha", () => {
    render(<SiteNavigation />);

    const trigger = screen.getByRole("button", { name: "Abrir menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    for (const label of [
      "Sobre",
      "Trajetória",
      "Stack",
      "Cases",
      "Projetos",
      "GitHub",
      "Contato",
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Cases" })).toHaveAttribute(
      "href",
      "#estudos-de-caso",
    );
    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute(
      "href",
      "#contato",
    );

    fireEvent.click(screen.getByRole("link", { name: "Trajetória" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("mantém o menu móvel aberto e acessível em uma janela baixa", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 240 });
    render(<SiteNavigation />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));

    expect(screen.getByRole("link", { name: "Contato" })).toBeVisible();
    const menu = document.getElementById("site-menu");
    expect(menu).toHaveAttribute("data-open", "true");
  });

  it("fecha o menu com Escape e devolve o foco ao acionador", () => {
    render(<SiteNavigation />);

    const trigger = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(trigger);
    const casesLink = screen.getByRole("link", { name: "Cases" });
    casesLink.focus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("indica a seção ativa quando o endereço muda", () => {
    render(<SiteNavigation />);

    window.location.hash = "#stack";
    fireEvent(window, new HashChangeEvent("hashchange"));

    expect(screen.getByRole("link", { name: "Stack" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("atualiza a seção ativa quando a página é rolada", () => {
    render(<SiteNavigation />);

    const sobre = document.createElement("section");
    sobre.id = "sobre";
    sobre.getBoundingClientRect = () =>
      ({ top: -500, bottom: -100 } as DOMRect);

    const trajetoria = document.createElement("section");
    trajetoria.id = "trajetoria";
    trajetoria.getBoundingClientRect = () =>
      ({ top: 72, bottom: 672 } as DOMRect);

    document.body.append(sobre, trajetoria);
    fireEvent.scroll(window);

    expect(screen.getByRole("link", { name: "Trajetória" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: "Stack" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marca contato quando o rodapé ocupa a maior parte da tela", () => {
    render(<SiteNavigation />);

    const github = document.createElement("section");
    github.id = "github";
    github.getBoundingClientRect = () =>
      ({ top: -400, bottom: 210 } as DOMRect);

    const contato = document.createElement("footer");
    contato.id = "contato";
    contato.getBoundingClientRect = () =>
      ({ top: 210, bottom: 810 } as DOMRect);

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 600,
    });
    document.body.append(github, contato);
    fireEvent.scroll(window);

    expect(screen.getByRole("link", { name: "Contato" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
