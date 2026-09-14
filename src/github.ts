import { featuredProjects } from "./content";

export type GitHubRepository = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number | null;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

type LiveGitHubRepository = GitHubRepository & { stargazers_count: number };

export type RepositoryResult =
  | { source: "github"; repositories: LiveGitHubRepository[] }
  | { source: "fallback"; repositories: GitHubRepository[] };

const API_URL = "https://api.github.com/users/cdr-caique/repos?per_page=100&sort=updated";

const featuredRepositoryNames = new Set(
  featuredProjects.map(({ name }) => name.toLowerCase()),
);

const fallbackRepositories: GitHubRepository[] = [
  {
    id: -1,
    name: "watt-io-backend-challenge",
    description: "API para cadastro e consulta de filmes com contratos claros e documentação interativa.",
    html_url: "https://github.com/cdr-caique/watt-io-backend-challenge",
    language: "Python",
    stargazers_count: null,
    fork: false,
    archived: false,
    pushed_at: "2026-01-01T00:00:00Z",
  },
  {
    id: -2,
    name: "compilers-project",
    description: null,
    html_url: "https://github.com/cdr-caique/compilers-project",
    language: null,
    stargazers_count: null,
    fork: false,
    archived: false,
    pushed_at: "2026-01-01T00:00:00Z",
  },
];

function isGitHubRepository(value: unknown): value is LiveGitHubRepository {
  if (!value || typeof value !== "object") return false;

  const repository = value as Record<string, unknown>;
  return (
    typeof repository.id === "number" &&
    Number.isFinite(repository.id) &&
    typeof repository.name === "string" &&
    repository.name.trim().length > 0 &&
    (typeof repository.description === "string" || repository.description === null) &&
    typeof repository.html_url === "string" &&
    isHttpUrl(repository.html_url) &&
    (typeof repository.language === "string" || repository.language === null) &&
    typeof repository.stargazers_count === "number" &&
    Number.isFinite(repository.stargazers_count) &&
    typeof repository.fork === "boolean" &&
    typeof repository.archived === "boolean" &&
    typeof repository.pushed_at === "string" &&
    Number.isFinite(Date.parse(repository.pushed_at))
  );
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function selectRepositories<T extends GitHubRepository>(repositories: T[], limit = 3) {
  return repositories
    .filter(
      (repository) =>
        !repository.fork &&
        !repository.archived &&
        repository.name.toLowerCase() !== "cdr-caique" &&
        !featuredRepositoryNames.has(repository.name.toLowerCase()),
    )
    .sort((a, b) => {
      if (a.stargazers_count === null) return b.stargazers_count === null ? 0 : 1;
      if (b.stargazers_count === null) return -1;

      return (
        b.stargazers_count - a.stargazers_count ||
        Date.parse(b.pushed_at) - Date.parse(a.pushed_at)
      );
    })
    .slice(0, limit);
}

export async function loadRepositories(fetcher: typeof fetch = fetch): Promise<RepositoryResult> {
  try {
    const response = await fetcher(API_URL, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) throw new Error(`GitHub respondeu ${response.status}`);

    const value: unknown = await response.json();
    if (!Array.isArray(value)) throw new Error("Resposta inválida do GitHub");

    const repositories = selectRepositories(value.filter(isGitHubRepository));
    if (repositories.length === 0) throw new Error("Nenhum repositório utilizável encontrado");

    return { source: "github", repositories };
  } catch {
    return { source: "fallback", repositories: fallbackRepositories };
  }
}
