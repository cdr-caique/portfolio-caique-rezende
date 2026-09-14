import { describe, expect, it, vi } from "vitest";
import { loadRepositories, selectRepositories, type GitHubRepository } from "./github";

const repo = (overrides: Partial<GitHubRepository> = {}): GitHubRepository => ({
  id: 1,
  name: "api",
  description: "Uma API",
  html_url: "https://github.com/cdr-caique/api",
  language: "Python",
  stargazers_count: 0,
  fork: false,
  archived: false,
  pushed_at: "2026-08-01T00:00:00Z",
  ...overrides,
});

const jsonFetcher = (body: unknown) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  ) as unknown as typeof fetch;

describe("selectRepositories", () => {
  it("não repete os projetos que já aparecem na seleção editorial", () => {
    const result = selectRepositories([
      repo({ id: 1, name: "contract-cancellation-api", stargazers_count: 10 }),
      repo({ id: 2, name: "asset-tree-python", stargazers_count: 9 }),
      repo({ id: 3, name: "iFood-Backend-Advanced-Test-Challenge", stargazers_count: 8 }),
      repo({ id: 4, name: "watt-io-backend-challenge", stargazers_count: 2 }),
      repo({ id: 5, name: "compilers-project", stargazers_count: 1 }),
    ]);

    expect(result.map(({ name }) => name)).toEqual([
      "watt-io-backend-challenge",
      "compilers-project",
    ]);
  });

  it("remove o repositório de perfil e retorna três projetos por padrão", () => {
    const result = selectRepositories([
      repo({ id: 1, name: "cdr-caique", stargazers_count: 20 }),
      repo({ id: 2, name: "um", stargazers_count: 4 }),
      repo({ id: 3, name: "dois", stargazers_count: 3 }),
      repo({ id: 4, name: "tres", stargazers_count: 2 }),
      repo({ id: 5, name: "quatro", stargazers_count: 1 }),
    ]);

    expect(result.map(({ name }) => name)).toEqual(["um", "dois", "tres"]);
  });

  it("remove forks e arquivados, prioriza estrelas e limita o resultado", () => {
    const result = selectRepositories([
      repo({ id: 1, name: "recente", pushed_at: "2026-08-20T00:00:00Z" }),
      repo({ id: 2, name: "popular", stargazers_count: 4 }),
      repo({ id: 3, name: "fork", fork: true, stargazers_count: 20 }),
      repo({ id: 4, name: "arquivado", archived: true, stargazers_count: 20 }),
    ], 2);

    expect(result.map(({ name }) => name)).toEqual(["popular", "recente"]);
  });

  it("mantém métricas desconhecidas depois de repositórios com zero estrelas", () => {
    const result = selectRepositories([
      repo({
        id: 1,
        name: "desconhecido",
        stargazers_count: null,
        pushed_at: "2026-08-20T00:00:00Z",
      }),
      repo({ id: 2, name: "zero", stargazers_count: 0 }),
    ]);

    expect(result.map(({ name }) => name)).toEqual(["zero", "desconhecido"]);
  });
});

describe("loadRepositories", () => {
  it("retorna fallback e marca a origem quando a API falha", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;

    const result = await loadRepositories(fetcher);

    expect(result.source).toBe("fallback");
    expect(result.repositories.length).toBeGreaterThan(0);
    expect(result.repositories.every((repository) => repository.stargazers_count === null)).toBe(true);
  });

  it("descarta itens malformados e mantém apenas repositórios utilizáveis", async () => {
    const result = await loadRepositories(jsonFetcher([
      repo({ id: 7, name: "válido" }),
      { ...repo({ id: 8, name: "sem endereço" }), html_url: 123 },
      { ...repo({ id: 9, name: "sem data" }), pushed_at: "inválida" },
    ]));

    expect(result).toMatchObject({ source: "github" });
    expect(result.repositories.map(({ name }) => name)).toEqual(["válido"]);
  });

  it("retorna fallback quando a resposta não tem repositórios utilizáveis", async () => {
    const result = await loadRepositories(jsonFetcher([
      { id: "1", name: "inválido" },
      null,
      { name: "incompleto" },
    ]));

    expect(result.source).toBe("fallback");
    expect(result.repositories.length).toBeGreaterThan(0);
  });

  it("retorna fallback quando a resposta só contém forks ou arquivos", async () => {
    const result = await loadRepositories(jsonFetcher([
      repo({ id: 10, name: "fork", fork: true }),
      repo({ id: 11, name: "arquivado", archived: true }),
    ]));

    expect(result.source).toBe("fallback");
    expect(result.repositories.length).toBeGreaterThan(0);
  });

  it("retorna fallback quando a resposta não é uma lista", async () => {
    const result = await loadRepositories(jsonFetcher({ message: "indisponível" }));

    expect(result.source).toBe("fallback");
    expect(result.repositories.length).toBeGreaterThan(0);
  });
});
