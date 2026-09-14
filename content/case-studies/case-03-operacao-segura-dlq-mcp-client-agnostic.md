---
title: "Operação segura de DLQs com MCP, Skills e arquitetura client-agnostic"
slug: "operacao-segura-dlq-mcp-client-agnostic"
summary: "Projeto pessoal de Engenharia de IA para investigação segura de DLQs, combinando MCP, Skills portáveis, observabilidade, mínimo privilégio e decisão humana."
tags: [AWS SQS, DLQ, MCP, Skills, AI Engineering, Prompt Engineering, Context Engineering, Tool Orchestration, Client-Agnostic Architecture, Cursor, ChatGPT Codex, Claude Desktop, Datadog, OpenSearch, AWS CLI, SSO, IAM, Human-in-the-loop, Production Engineering]
---

# Operação segura de DLQs com MCP, Skills e arquitetura client-agnostic

## Visão geral

Neste projeto pessoal, desenvolvi uma arquitetura conceitual para investigação segura de DLQs usando **MCP, Skills e integrações com ferramentas de observabilidade e infraestrutura**.

O núcleo é desenhado como uma **client-agnostic MCP architecture**: o servidor MCP e as Skills permanecem desacoplados do host de IA e podem ser reutilizados por clientes como **Cursor, ChatGPT Codex e Claude Desktop**.

O objetivo não é permitir que a IA opere sistemas sozinha, mas aumentar a capacidade do engenheiro de reunir contexto e investigar incidentes simulados, preservando controle humano sobre ações de maior risco.

## Arquitetura conceitual

```diagram
Legenda: Arquitetura client-agnostic para investigação segura de DLQs
                     Agent Host
          +-------------+-------------+
          |             |             |
       Cursor      ChatGPT Codex   Claude Desktop
          |             |             |
          +-------------+-------------+
                        |
                    MCP Protocol
                        |
                   Ops MCP Server
                        |
              +---------+---------+
              |         |         |
              v         v         v
          Datadog   OpenSearch  AWS CLI
         dashboards  logs/APM     SQS
              |         |         |
              +---------+---------+
                        |
                        v
                Contexto consolidado
                        |
                        v
               Sugestão de diagnóstico
                        |
                        v
                  Decisão humana
```

## Client-agnostic MCP architecture

A solução separa quatro camadas:

```diagram
Legenda: Separação entre ferramentas, procedimentos, configuração do host e comportamento
MCP Server / Tools     → portátil
Skills / Procedimentos → reutilizáveis
Configuração do host   → específica do cliente
Comportamento do agente→ pode variar entre modelos/hosts
```

Isso evita acoplamento a comandos, APIs ou UI proprietários de um único produto.

## MCP

O MCP expõe tools estruturadas como:
- listar DLQs permitidas;
- consultar atributos;
- inspecionar mensagens;
- gerar backup;
- identificar ownership;
- buscar contexto de observabilidade;
- consultar logs.

Ações destrutivas não são disponibilizadas automaticamente:
- purge;
- delete;
- redrive destrutivo.

## Skills portáveis

As Skills descrevem capacidades e procedimentos, e não instruções específicas de Cursor, Codex ou Claude.

Exemplo:

```text
Skill: investigar-dlq

1. Identificar a fila
2. Consultar volume e atributos
3. Preservar uma amostra
4. Identificar owner
5. Consultar dashboard
6. Buscar logs/APM
7. Classificar hipótese
8. Sugerir próximo passo
9. Solicitar decisão humana para ação destrutiva
```

## Datadog

No cenário proposto, dashboards ajudam a correlacionar:
- crescimento da DLQ;
- taxa de erros;
- latência;
- comportamento do consumer.

## OpenSearch via SSO

OpenSearch fornece logs sintéticos e contexto de APM, enquanto o SSO representa um mecanismo de autenticação controlada.

## AWS CLI via SSO

AWS CLI permite consultar atributos e estado de filas de laboratório usando autenticação por SSO e permissões controladas.

## Engenharia de IA

O trabalho envolve mais do que prompts:

**contexto + ferramentas + procedimentos + restrições + decisão humana**

### Context Engineering
Selecionar o contexto certo para cada etapa.

### Tool orchestration
Decidir quando consultar Datadog, OpenSearch ou AWS.

### Guardrails
Restringir capacidades de alto risco no próprio desenho das tools e permissões.

### Structured outputs

```text
Fila:
Owner:
Volume:
Erro predominante:
Hipótese:
Evidência:
Risco:
Ação sugerida:
```

### Human-in-the-loop
A IA apoia investigação e decisão, mas ações irreversíveis permanecem sob controle humano.

## Princípios de segurança

- SSO;
- IAM de mínimo privilégio;
- allowlist;
- backup de evidências;
- owners versionados;
- zero tool de purge/redrive/delete;
- secrets fora do prompt;
- ações destrutivas sob decisão humana.

## Próximas evoluções

- adapters de configuração por host;
- testes de compatibilidade entre clientes;
- avaliação de qualidade das recomendações;
- approval workflows;
- auditoria de ações;
- classificação determinística antes da camada de IA;
- dashboards de recorrência por causa.

O princípio permanece:

> qualquer ação destrutiva precisa ser proporcional ao nível de confiança da automação e ao seu blast radius.

## Competências demonstradas

- AI Engineering;
- MCP;
- Skills;
- client-agnostic architecture;
- Cursor;
- ChatGPT Codex;
- Claude Desktop;
- Datadog;
- OpenSearch;
- AWS CLI;
- SSO;
- IAM / least privilege;
- guardrails;
- human-in-the-loop;
- AWS SQS / DLQ;
- Production Engineering;
- Observability;
- Incident Investigation.
