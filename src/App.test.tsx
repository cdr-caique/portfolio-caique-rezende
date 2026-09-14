import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { featuredProjects, profile } from "./content";

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

function mockAnimationFrames() {
  let callbacks: FrameRequestCallback[] = [];

  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);

  return () => {
    const scheduled = callbacks;
    callbacks = [];
    scheduled.forEach((callback) => callback(0));
  };
}

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");

  if (originalScrollIntoView) {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  } else {
    delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  }

  vi.restoreAllMocks();
});

describe("App", () => {
  it("posiciona a seção indicada pelo fragmento no carregamento inicial", () => {
    const flushAnimationFrame = mockAnimationFrames();
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState(null, "", "/#estudos-de-caso");

    render(<App />);

    expect(scrollIntoView).not.toHaveBeenCalled();
    act(() => {
      flushAnimationFrame();
      flushAnimationFrame();
    });
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  it("confirma o posicionamento após a estabilização do carregamento", () => {
    const flushAnimationFrame = mockAnimationFrames();
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState(null, "", "/#estudos-de-caso");
    render(<App />);

    act(() => {
      flushAnimationFrame();
      flushAnimationFrame();
    });
    scrollIntoView.mockClear();

    fireEvent.load(window);
    act(() => {
      flushAnimationFrame();
      flushAnimationFrame();
    });

    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  it("reposiciona a página quando o fragmento muda", () => {
    const flushAnimationFrame = mockAnimationFrames();
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    render(<App />);
    act(() => {
      flushAnimationFrame();
      flushAnimationFrame();
    });
    scrollIntoView.mockClear();

    window.history.replaceState(null, "", "/#estudos-de-caso");
    fireEvent(window, new HashChangeEvent("hashchange"));
    act(() => {
      flushAnimationFrame();
      flushAnimationFrame();
    });

    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  it("apresenta o primeiro viewport do portfólio com ações de navegação", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Caíque Rezende/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Engenheiro de Software · Backend · Cloud Developer"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver projetos/i })).toHaveAttribute(
      "href",
      "#projetos",
    );
    const hero = screen.getByRole("region", { name: /Caíque Rezende/i });
    expect(within(hero).getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      profile.linkedin,
    );
  });

  it("organiza a narrativa completa em seções acessíveis", () => {
    render(<App />);

    for (const heading of [
      "Sobre mim",
      "Trajetória",
      "Stack",
      "Estudos de Caso de Engenharia",
      "Projetos em destaque",
      "GitHub em tempo real",
      "Vamos construir algo que precisa durar?",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
    }

    for (const region of [
      "Sobre mim",
      "Trajetória",
      "Stack",
      "Estudos de Caso de Engenharia",
      "Projetos em destaque",
      "GitHub em tempo real",
    ]) {
      expect(screen.getByRole("region", { name: region })).toBeInTheDocument();
    }
  });

  it("oferece acesso ao currículo e às certificações no LinkedIn", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "Ver currículo no LinkedIn" })).toHaveAttribute(
      "href",
      profile.linkedin,
    );
    expect(screen.getByRole("link", { name: "Ver certificações no LinkedIn" })).toHaveAttribute(
      "href",
      profile.linkedin,
    );
  });

  it("apresenta a atuação profissional e a localização atualizadas", () => {
    render(<App />);

    expect(
      screen.getByText("Atuação entre São José dos Campos e São Paulo, SP."),
    ).toBeInTheDocument();

    for (const company of ["iFood", "Loggi", "Itaú Unibanco", "BTG Pactual"]) {
      expect(screen.getByText(company)).toBeInTheDocument();
    }

    expect(screen.queryByText(/Caçapava/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Baseado em/i)).not.toBeInTheDocument();
  });

  it("agrupa o retrato com as principais áreas de atuação", () => {
    render(<App />);

    const profilePanel = screen.getByRole("complementary", {
      name: "Perfil profissional",
    });

    expect(
      within(profilePanel).getByRole("img", {
        name: "Foto de perfil de Caíque Rezende",
      }),
    ).toBeInTheDocument();

    for (const specialty of ["Backend", "AWS Cloud", "Mercado financeiro"]) {
      expect(within(profilePanel).getByText(specialty)).toBeInTheDocument();
    }
  });

  it("destaca as credenciais em AWS e Dados", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Credenciais" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("AWS Certified Developer – Associate"),
    ).toBeInTheDocument();
    expect(screen.getByText("Certificações em Dados")).toBeInTheDocument();
  });

  it("apresenta a formação acadêmica no perfil e nas credenciais", () => {
    render(<App />);

    expect(
      screen.getByText(/Sou bacharel em Engenharia de Computação pela Universidade Federal de Itajubá \(UNIFEI\)/),
    ).toBeInTheDocument();

    const credentialsPanel = screen.getByRole("region", {
      name: "Credenciais",
    });
    expect(
      within(credentialsPanel).getByRole("heading", {
        name: "Engenharia de Computação — Bacharelado",
      }),
    ).toBeInTheDocument();
    expect(
      within(credentialsPanel).getByText(
        "Universidade Federal de Itajubá (UNIFEI)",
      ),
    ).toBeInTheDocument();
  });

  it("distingue competências consolidadas das áreas em aprofundamento", () => {
    render(<App />);

    const heading = screen.getByRole("heading", {
      name: "Dados & IA aplicada",
    });
    const card = heading.closest("article");

    expect(card).not.toBeNull();
    expect(within(card!).getByText("Em aprofundamento")).toBeInTheDocument();
    expect(
      within(card!).getByText("Agentes e integrações com LLMs"),
    ).toBeInTheDocument();
  });

  it("apresenta as empresas com identidades visuais acessíveis", () => {
    render(<App />);

    const logos = [
      ["iFood", "/brands/ifood.png"],
      ["Loggi", "/brands/loggi.png"],
      ["Itaú Unibanco", "/brands/itau.png"],
      ["BTG Pactual", "/brands/btg-pactual.png"],
    ] as const;

    for (const [company, source] of logos) {
      expect(
        screen.getByRole("img", { name: `Logo ${company}` }),
      ).toHaveAttribute("src", source);
    }

    expect(screen.getByText("Atualmente")).toBeInTheDocument();
  });

  it("oferece acesso aos projetos editoriais e ao contato principal", () => {
    render(<App />);

    for (const project of featuredProjects) {
      const link = screen.getByRole("link", {
        name: new RegExp(project.name, "i"),
      });
      expect(link).toHaveAttribute("href", project.url);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }

    expect(
      screen.getByRole("link", { name: /enviar e-mail/i }),
    ).toHaveAttribute("href", `mailto:${profile.email}`);
  });
});
