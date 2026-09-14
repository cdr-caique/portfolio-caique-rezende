// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadRepositories } from "../github";
import { GitHubProjects } from "./GitHubProjects";

vi.mock("../github", () => ({
  loadRepositories: vi.fn(),
}));

const mockedLoadRepositories = vi.mocked(loadRepositories);

const repositories = [
  {
    id: 1,
    name: "api-pública",
    description: "Uma API confiável.",
    html_url: "https://github.com/cdr-caique/api-publica",
    language: "Python",
    stargazers_count: 12,
    fork: false,
    archived: false,
    pushed_at: "2026-08-01T00:00:00Z",
  },
  {
    id: 2,
    name: "serviço-web",
    description: null,
    html_url: "https://github.com/cdr-caique/servico-web",
    language: null,
    stargazers_count: 0,
    fork: false,
    archived: false,
    pushed_at: "2026-08-02T00:00:00Z",
  },
];

describe("GitHubProjects", () => {
  beforeEach(() => {
    mockedLoadRepositories.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("exibe os cartões de projetos recebidos do GitHub", async () => {
    mockedLoadRepositories.mockResolvedValue({ source: "github", repositories });

    render(<GitHubProjects />);

    expect(screen.getByText("Atualizando projetos…")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "api-pública" })).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("12 estrelas")).toBeInTheDocument();
    expect(screen.queryByText("0 estrelas")).not.toBeInTheDocument();
    expect(screen.getByText("Não informado")).toBeInTheDocument();
    expect(screen.queryByText("Sem descrição pública.")).not.toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Abrir repositório api-pública" });
    expect(link).toHaveAttribute("href", "https://github.com/cdr-caique/api-publica");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(
      screen.queryByText(
        "Exibindo uma seleção salva — atualização automática temporariamente indisponível",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver todos os repositórios" })).toHaveAttribute(
      "href",
      "https://github.com/cdr-caique?tab=repositories",
    );
  });

  it("informa quando está exibindo os projetos de fallback", async () => {
    mockedLoadRepositories.mockResolvedValue({
      source: "fallback",
      repositories: repositories.map((repository) => ({
        ...repository,
        stargazers_count: null,
      })),
    });

    render(<GitHubProjects />);

    expect(
      await screen.findByText(
        "Exibindo uma seleção salva — atualização automática temporariamente indisponível",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "serviço-web" })).toBeInTheDocument();
    expect(screen.getAllByText("Estrelas indisponíveis")).toHaveLength(2);
    expect(screen.queryByText("0 estrelas")).not.toBeInTheDocument();
  });

  it("tenta atualizar novamente uma vez após exibir a seleção salva", async () => {
    vi.useFakeTimers();
    mockedLoadRepositories
      .mockResolvedValueOnce({ source: "fallback", repositories })
      .mockResolvedValueOnce({ source: "github", repositories });

    render(<GitHubProjects />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockedLoadRepositories).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(mockedLoadRepositories).toHaveBeenCalledTimes(2);
    expect(
      screen.queryByText(
        "Exibindo uma seleção salva — atualização automática temporariamente indisponível",
      ),
    ).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(mockedLoadRepositories).toHaveBeenCalledTimes(2);
  });
});
