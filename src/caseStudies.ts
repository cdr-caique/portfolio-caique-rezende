export type EngineeringCaseStudy = {
  index: string;
  category: string;
  title: string;
  summary: string;
  tags: readonly string[];
  href: string;
  featured?: boolean;
};

export const engineeringCaseStudies = [
  {
    index: "01",
    category: "Sistemas financeiros distribuídos",
    title: "Conciliação financeira idempotente em uma saga distribuída",
    summary:
      "Arquitetura de referência para uma saga financeira distribuída com Kotlin, Spring Boot, Kafka, SNS/SQS e Redis, explorando ordenação de eventos e reprocessamento seguro.",
    tags: ["Kotlin", "Spring Boot", "Kafka", "AWS", "Redis", "Idempotência"],
    href: "/estudos-de-caso/conciliacao-financeira-idempotente-saga/",
    featured: true,
  },
  {
    index: "02",
    category: "Confiabilidade & performance",
    title: "Resiliência e performance em um motor de elegibilidade",
    summary:
      "Experimento técnico com um motor de elegibilidade hipotético, separando falhas de dependência de regras de negócio e explorando projection, pares exatos e cache.",
    tags: ["Java", "Kotlin", "Spring Boot", "JPA", "PostgreSQL", "Observabilidade"],
    href: "/estudos-de-caso/resiliencia-performance-motor-elegibilidade/",
  },
  {
    index: "03",
    category: "Engenharia de IA & produção",
    title:
      "Operação segura de DLQs com MCP, Skills e arquitetura client-agnostic",
    summary:
      "Projeto pessoal de Engenharia de IA para investigação segura de DLQs, combinando MCP, Skills portáveis, observabilidade, mínimo privilégio e decisão humana.",
    tags: [
      "MCP",
      "AI Engineering",
      "Context Engineering",
      "Observability",
      "AWS SSO",
      "Human-in-the-loop",
    ],
    href: "/estudos-de-caso/operacao-segura-dlq-mcp-client-agnostic/",
  },
] as const satisfies readonly EngineeringCaseStudy[];
