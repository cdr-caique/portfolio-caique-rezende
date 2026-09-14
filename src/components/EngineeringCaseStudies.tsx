import {
  engineeringCaseStudies,
  type EngineeringCaseStudy,
} from "../caseStudies";

export function EngineeringCaseStudies() {
  return (
    <div className="case-studies-grid">
      {engineeringCaseStudies.map((caseStudy: EngineeringCaseStudy) => (
        <article
          aria-label={
            caseStudy.featured
              ? `Case principal: ${caseStudy.title}`
              : undefined
          }
          className={`case-study-card${
            caseStudy.featured ? " case-study-card--featured" : ""
          }`}
          key={caseStudy.href}
        >
          <div className="case-study-card-meta">
            <p className="card-index">{caseStudy.index}</p>
            <p>{caseStudy.category}</p>
            {caseStudy.featured ? <p>Case principal</p> : null}
          </div>
          <h3>{caseStudy.title}</h3>
          <p>{caseStudy.summary}</p>
          <ul
            aria-label={`Tecnologias de ${caseStudy.title}`}
            className="case-study-tags"
          >
            {caseStudy.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <a className="case-study-link" href={caseStudy.href}>
            Ver estudo de caso
          </a>
        </article>
      ))}
    </div>
  );
}
