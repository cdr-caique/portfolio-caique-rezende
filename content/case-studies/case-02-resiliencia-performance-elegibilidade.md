---
title: "Resiliência e performance em um motor de elegibilidade"
slug: "resiliencia-performance-motor-elegibilidade"
summary: "Experimento técnico com um motor de elegibilidade hipotético, separando falhas de dependência de regras de negócio e explorando projection, pares exatos e cache."
tags: [Kotlin, Java, Spring Boot, Hibernate, JPA, Redis, Valkey, PostgreSQL, Observability, Resilience]
---

# Resiliência e performance em um motor de elegibilidade

## Visão geral

Este experimento pessoal modela um motor de elegibilidade hipotético para explorar dois problemas recorrentes: distinguir indisponibilidade técnica de resultado de negócio e reduzir trabalho desnecessário em consultas relacionais.

## Parte 1 — Quando indisponibilidade parece “sem campanha”

O experimento considera uma dependência lenta ou indisponível convertida em um resultado equivalente a “nenhuma campanha encontrada”.

A solução proposta introduz:
- exceção de domínio específica;
- timeout configurável;
- degradação controlada;
- cache Redis com TTL curto;
- correlation ID no MDC.

O principal ganho esperado é semântico: **falha de infraestrutura deixa de parecer regra de negócio**.

## Parte 2 — Query cartesiana

No cenário modelado, a consulta combina listas de produto e variante usando `IN`, gerando mais combinações do que o caller realmente precisa.

A alternativa explorada utiliza:
- pares exatos;
- projection;
- dedupe;
- cache Valkey;
- DTO público compatível;
- teste contra regressão.

## Principal aprendizado

> Antes de otimizar o banco, descubra exatamente qual trabalho você está pedindo para ele fazer.

E:

> Um resultado vazio e uma dependência indisponível são estados diferentes do sistema.

## Competências demonstradas

- exceção de domínio específica;
- timeout configurável;
- degradação controlada;
- cache Redis com TTL curto;
- correlation ID no MDC;
- pares exatos;
- projection;
- dedupe;
- cache Valkey;
- DTO público compatível;
- teste contra regressão.
