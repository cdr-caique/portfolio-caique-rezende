import { useEffect, useState } from "react";
import { loadRepositories, type RepositoryResult } from "../github";

function starLabel(stars: number | null) {
  if (stars === null) return "Estrelas indisponíveis";

  return `${stars} ${stars === 1 ? "estrela" : "estrelas"}`;
}

export function GitHubProjects() {
  const [result, setResult] = useState<RepositoryResult | null>(null);

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    async function updateRepositories(allowRetry: boolean) {
      try {
        const nextResult = await loadRepositories();
        if (!active) return;

        setResult(nextResult);
        if (nextResult.source === "fallback" && allowRetry) {
          retryTimer = setTimeout(() => {
            void updateRepositories(false);
          }, 5_000);
        }
      } catch {
        if (active) setResult({ source: "fallback", repositories: [] });
      }
    }

    void updateRepositories(true);

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  if (!result) {
    return (
      <div className="github-loading" role="status">
        Atualizando projetos…
      </div>
    );
  }

  return (
    <section aria-label="Projetos do GitHub">
      {result.source === "fallback" && (
        <p role="status">
          Exibindo uma seleção salva — atualização automática temporariamente indisponível
        </p>
      )}
      <div className="github-repo-list">
        {result.repositories.slice(0, 3).map((repository) => (
          <article className="github-repo-item" key={repository.id} aria-label={`Projeto ${repository.name}`}>
            <div className="github-repo-copy">
              <h3>{repository.name}</h3>
              {repository.description ? <p>{repository.description}</p> : null}
            </div>
            <div className="github-repo-meta">
              <span>{repository.language ?? "Não informado"}</span>
              {repository.stargazers_count === null || repository.stargazers_count > 0 ? (
                <span>{starLabel(repository.stargazers_count)}</span>
              ) : null}
              <a
                href={repository.html_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir repositório ${repository.name}`}
              >
                Abrir no GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        ))}
      </div>
      <a
        className="github-all-link"
        href="https://github.com/cdr-caique?tab=repositories"
        target="_blank"
        rel="noreferrer"
      >
        Ver todos os repositórios <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
