import { useEffect } from "react";
import { FeaturedProjects } from "./components/FeaturedProjects";
import { EngineeringCaseStudies } from "./components/EngineeringCaseStudies";
import { GitHubProjects } from "./components/GitHubProjects";
import { ProfilePortrait } from "./components/ProfilePortrait";
import { SectionHeading } from "./components/SectionHeading";
import { SiteNavigation } from "./components/SiteNavigation";
import {
  credentials,
  experienceHighlights,
  profile,
  stackGroups,
} from "./content";

const specialties = [
  "Backend & APIs",
  "Sistemas distribuídos",
  "AWS Cloud",
  "Dados & IA aplicada",
];

export function App() {
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    const scrollToHashTarget = () => {
      const targetId = window.location.hash.slice(1);
      if (!targetId) return;

      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    };

    const scheduleHashScroll = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(scrollToHashTarget);
      });
    };

    scheduleHashScroll();
    window.addEventListener("hashchange", scheduleHashScroll);
    window.addEventListener("load", scheduleHashScroll);
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.removeEventListener("hashchange", scheduleHashScroll);
      window.removeEventListener("load", scheduleHashScroll);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>

      <SiteNavigation />

      <main id="conteudo">
        <section id="inicio" className="hero" aria-labelledby="portfolio-title">
          <div className="hero-copy">
            <p className="hero-role">{profile.role}</p>
            <h1 id="portfolio-title">{profile.name}</h1>
            <h2>Backend que sustenta o próximo passo.</h2>
            <p className="hero-description">
              Transformo regras de negócio complexas em serviços claros,
              resilientes e preparados para evoluir.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projetos">
                Ver projetos <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button button-secondary"
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button button-tertiary"
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                Ver currículo no LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <aside className="hero-aside" aria-label="Especialidades">
            <p className="hero-aside-label">Em foco</p>
            <ul className="specialty-list">
              {specialties.map((specialty, index) => (
                <li key={specialty}>
                  <span>0{index + 1}</span>
                  {specialty}
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section id="sobre" className="content-section about-section" aria-labelledby="sobre-title">
          <SectionHeading
            id="sobre-title"
            eyebrow="Sobre"
            title="Sobre mim"
            description="Curiosidade, clareza e visão sistêmica orientam a forma como eu construo software."
          />
          <div className="about-layout">
            <aside className="about-profile" aria-label="Perfil profissional">
              <ProfilePortrait />
              <ul className="profile-specialties" aria-label="Áreas de atuação">
                <li>Backend</li>
                <li>AWS Cloud</li>
                <li>Mercado financeiro</li>
              </ul>
            </aside>
            <div className="about-copy">
              <p>
                Minha relação com tecnologia começou pela curiosidade de entender
                como as coisas funcionam. Pesquisar, testar ideias e aprender com
                problemas difíceis transformou essa curiosidade em ofício.
              </p>
              <p>
                Sou bacharel em Engenharia de Computação pela Universidade
                Federal de Itajubá (UNIFEI) e construí minha trajetória em
                empresas de tecnologia e instituições financeiras de grande
                porte. Nesses contextos, transformo regras de negócio complexas
                em APIs claras, dados consistentes e decisões técnicas que façam
                sentido dentro do sistema inteiro.
              </p>
              <p>
                Essa experiência trouxe uma base sólida em sistemas cloud na
                AWS, serviços distribuídos, mensageria e plataformas críticas —
                especialmente no setor financeiro.
              </p>
              <p>
                Em paralelo, aprofundo minha atuação em Engenharia de Dados e
                IA aplicada, com Prompt Engineering e integração de agentes
                modernos a produtos e fluxos de desenvolvimento.
              </p>
              <p className="about-location">Atuação entre {profile.location}.</p>
            </div>
          </div>
        </section>

        <section id="trajetoria" className="content-section journey-section" aria-labelledby="trajetoria-title">
          <SectionHeading
            id="trajetoria-title"
            eyebrow="Evolução"
            title="Trajetória"
            description="Uma trajetória entre tecnologia, logística e mercado financeiro, sempre com backend, cloud e sistemas críticos no centro."
          />
          <div className="journey-content">
            <div className="experience-grid" aria-label="Experiência profissional">
              {experienceHighlights.map((highlight) => (
                <article
                  className={`experience-card experience-card--${highlight.slug}`}
                  key={highlight.name}
                >
                  <div className="company-logo-frame">
                    {/* As logos locais já estão dimensionadas para o card; manter o arquivo direto evita transformar as marcas. */}
                    <img
                      src={highlight.logo}
                      alt={`Logo ${highlight.name}`}
                    />
                  </div>
                  <div className="experience-card-body">
                    <div className="company-meta">
                      <p>{highlight.context}</p>
                      {highlight.current ? <span>Atualmente</span> : null}
                    </div>
                    <h3>{highlight.name}</h3>
                    <p className="experience-focus">{highlight.focus}</p>
                    <p className="experience-summary">{highlight.summary}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="trajectory-note">
              <p className="card-index">Visão de engenharia</p>
              <p>
                Cada contexto ampliou uma mesma base: traduzir regras de negócio
                em serviços confiáveis, observar o sistema inteiro e tomar
                decisões que continuem fazendo sentido em produção.
              </p>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                Ver trajetória completa no LinkedIn <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        <section id="stack" className="content-section stack-section" aria-labelledby="stack-title">
          <SectionHeading
            id="stack-title"
            eyebrow="Capacidades"
            title="Stack"
            description="Ferramentas agrupadas pelo papel que cumprem — sem percentuais arbitrários, com contexto de uso."
          />
          <div className="stack-content">
            <div className="stack-grid">
              {stackGroups.map((group) => (
                <article
                  className={`stack-card${
                    group.status ? " stack-card--developing" : ""
                  }`}
                  key={group.title}
                >
                  <div className="stack-card-heading">
                    <h3>{group.title}</h3>
                    {group.status ? (
                      <p className="stack-status">{group.status}</p>
                    ) : null}
                  </div>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <section className="credentials-panel" aria-labelledby="credentials-title">
              <div>
                <p className="card-index">Formação & certificações</p>
                <h3 id="credentials-title">Credenciais</h3>
              </div>
              <div className="credential-list">
                {credentials.map((credential) => (
                  <article key={credential.title}>
                    <h4>{credential.title}</h4>
                    <p>{credential.description}</p>
                  </article>
                ))}
                <a
                  className="credentials-link"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver certificações no LinkedIn <span aria-hidden="true">↗</span>
                </a>
              </div>
            </section>
          </div>
        </section>

        <section
          id="estudos-de-caso"
          className="content-section case-studies-section"
          aria-labelledby="estudos-de-caso-title"
        >
          <SectionHeading
            id="estudos-de-caso-title"
            eyebrow="Experiência aplicada"
            title="Estudos de Caso de Engenharia"
            description="Estudos técnicos autorais sobre sistemas distribuídos, confiabilidade, performance, observabilidade e Engenharia de IA, desenvolvidos em ambiente pessoal para demonstrar decisões e práticas de engenharia."
          />
          <EngineeringCaseStudies />
        </section>

        <section id="projetos" className="content-section projects-section" aria-labelledby="projetos-title">
          <SectionHeading
            id="projetos-title"
            eyebrow="Seleção editorial"
            title="Projetos em destaque"
            description="Projetos públicos que mostram decisões sobre consistência, integrações, estruturas de dados e desenho de APIs."
          />
          <FeaturedProjects />
        </section>

        <section id="github" className="content-section github-section" aria-labelledby="github-title">
          <SectionHeading
            id="github-title"
            eyebrow="Código público"
            title="GitHub em tempo real"
            description="Repositórios públicos atualizados diretamente do GitHub, com uma seleção local quando a consulta não estiver disponível."
          />
          <GitHubProjects />
        </section>
      </main>

      <footer id="contato" className="site-footer">
        <section className="contact-section">
          <div>
            <p className="section-eyebrow">Contato</p>
            <h2>Vamos construir algo que precisa durar?</h2>
            <p>
              Se o desafio envolve backend, integrações ou sistemas preparados
              para evoluir, vamos conversar.
            </p>
          </div>
          <div className="contact-links">
            <a className="button button-primary" href={`mailto:${profile.email}`}>
              Enviar e-mail <span aria-hidden="true">↗</span>
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <div className="footer-note">
          <p>{profile.fullName}</p>
          <a href="#inicio">Voltar ao início ↑</a>
        </div>
      </footer>
    </>
  );
}
