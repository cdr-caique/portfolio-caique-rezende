export type JourneyItem = {
  eyebrow: string;
  title: string;
  description: string;
};

export type StackGroup = {
  title: string;
  items: string[];
  status?: string;
};

export type ExperienceHighlight = {
  name: string;
  context: string;
  logo: string;
  slug: string;
  current?: boolean;
  focus: string;
  summary: string;
};

export type FeaturedProject = {
  displayName: string;
  name: string;
  summary: string;
  highlights: string[];
  technologies: string[];
  url: string;
};

export const profile = {
  name: "Caíque Rezende",
  fullName: "Caíque Cléber Dias de Rezende",
  role: "Engenheiro de Software · Backend · Cloud Developer",
  github: "https://github.com/cdr-caique",
  linkedin: "https://www.linkedin.com/in/cdr-caique/",
  email: "caiquecleber@gmail.com",
  location: "São José dos Campos e São Paulo, SP",
} as const;

export const experienceHighlights: ExperienceHighlight[] = [
  { name: "iFood", context: "Tecnologia & escala", focus: "Produtos digitais de grande alcance", summary: "Experiência em ambientes de tecnologia orientados a produto, colaboração e evolução contínua de serviços.", logo: "/brands/ifood.png", slug: "ifood" },
  { name: "Loggi", context: "Tecnologia & logística", focus: "Sistemas distribuídos e operação", summary: "Atuação em um contexto de logística com integrações, escala e confiabilidade como parte central do produto.", logo: "/brands/loggi.png", slug: "loggi" },
  { name: "Itaú Unibanco", context: "Mercado financeiro", focus: "Plataformas críticas e regras complexas", summary: "Bagagem no setor bancário, lidando com qualidade, segurança e decisões de engenharia em sistemas críticos.", logo: "/brands/itau.png", slug: "itau" },
  { name: "BTG Pactual", context: "Mercado financeiro", focus: "Backend e cloud no setor financeiro", summary: "Atuação atual em engenharia de software, combinando sistemas backend, AWS e domínio financeiro.", logo: "/brands/btg-pactual.png", slug: "btg", current: true },
];
export const journey: JourneyItem[] = [
  { eyebrow: "01 · Fundamentos", title: "Curiosidade que virou ofício", description: "Desde cedo, tecnologia sempre foi território de descoberta. A curiosidade por entender como sistemas funcionam evoluiu para uma base sólida em computação e resolução de problemas." },
  { eyebrow: "02 · Backend", title: "Regras de negócio em serviços claros", description: "O foco se consolidou no backend: APIs bem definidas, dados consistentes, testes úteis e código preparado para mudanças." },
  { eyebrow: "03 · Escala", title: "Sistemas que conversam e resistem", description: "A experiência em produtos de grande escala consolidou uma visão de engenharia que inclui microsserviços, mensageria, cloud, observabilidade e operação." },
  { eyebrow: "04 · Financeiro", title: "Engenharia em ambientes críticos", description: "A atuação em grandes instituições financeiras ampliou a bagagem em sistemas críticos, confiabilidade, segurança e regras de negócio complexas." },
];

export const credentials = [
  {
    title: "Engenharia de Computação — Bacharelado",
    description: "Universidade Federal de Itajubá (UNIFEI)",
  },
  {
    title: "AWS Certified Developer – Associate",
    description: "Conhecimento validado para desenvolver, implantar e operar aplicações na AWS.",
  },
  {
    title: "Certificações em Dados",
    description: "Formação complementar aplicada a dados, monitoramento e decisões orientadas por informação.",
  },
] as const;

export const stackGroups: StackGroup[] = [
  { title: "Backend", items: ["Python", "Java", "Kotlin", "Spring Boot"] },
  { title: "Integração", items: ["APIs REST", "Microsserviços", "Kafka", "SQS"] },
  { title: "Cloud & Entrega", items: ["AWS", "Docker", "Terraform"] },
  { title: "Engenharia", items: ["Clean Code", "SOLID", "Arquitetura Hexagonal"] },
  {
    title: "Dados & IA aplicada",
    status: "Em aprofundamento",
    items: [
      "Engenharia de Dados",
      "Engenharia de IA",
      "Prompt Engineering",
      "Agentes e integrações com LLMs",
    ],
  },
];

export const featuredProjects: FeaturedProject[] = [
  {
    displayName: "Cancelamentos resilientes",
    name: "contract-cancellation-api",
    summary: "API REST para cancelamentos consistentes mesmo sob repetição, concorrência e falhas de processamento.",
    highlights: ["Idempotência persistente", "Lock transacional", "Correlation ID"],
    technologies: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    url: "https://github.com/cdr-caique/contract-cancellation-api",
  },
  {
    displayName: "Árvores e estruturas de dados",
    name: "asset-tree-python",
    summary: "Estrutura hierárquica construída a partir de listas planas, com busca, caminho, filtros e operações eficientes sobre a árvore.",
    highlights: ["Modelagem de árvores", "Eficiência algorítmica", "Decisões de arquitetura"],
    technologies: ["Python", "Pytest", "Estruturas de dados"],
    url: "https://github.com/cdr-caique/asset-tree-python",
  },
  {
    displayName: "Integrações contextuais",
    name: "iFood-Backend-Advanced-Test-Challenge",
    summary: "Microsserviço que combina clima e preferências musicais para sugerir playlists contextuais com foco em resiliência.",
    highlights: ["Integrações externas", "Tolerância a falhas", "Documentação Swagger"],
    technologies: ["Java", "Spring Boot", "Spotify API", "OpenWeather"],
    url: "https://github.com/cdr-caique/iFood-Backend-Advanced-Test-Challenge",
  },
];
