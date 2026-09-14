import { featuredProjects } from "../content";

export function FeaturedProjects() {
  return (
    <div className="featured-grid">
      {featuredProjects.map((project, index) => (
        <article className="featured-card" key={project.name}>
          <p className="card-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3>{project.displayName}</h3>
          <p className="project-repository">{project.name}</p>
          <p className="project-summary">{project.summary}</p>

          <div className="project-details">
            <div>
              <h4>Decisões em foco</h4>
              <ul className="highlight-list">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Stack</h4>
              <ul className="technology-list">
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
          </div>

          <a
            className="project-link"
            href={project.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Ver no GitHub — ${project.name}`}
          >
            Ver no GitHub <span aria-hidden="true">↗</span>
          </a>
        </article>
      ))}
    </div>
  );
}
