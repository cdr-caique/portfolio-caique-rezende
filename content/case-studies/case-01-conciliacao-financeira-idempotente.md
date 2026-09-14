---
title: "Conciliação financeira idempotente em uma saga distribuída"
slug: "conciliacao-financeira-idempotente-saga"
summary: "Arquitetura de referência para uma saga financeira distribuída com Kotlin, Spring Boot, Kafka, SNS/SQS e Redis, explorando ordenação de eventos e reprocessamento seguro."
tags: [Kotlin, Spring Boot, Kafka, AWS SNS, AWS SQS, Redis, Distributed Systems, Idempotency, Event-Driven Architecture]
---

# Conciliação financeira idempotente em uma saga distribuída

## Visão geral

Como projeto pessoal, modelei um cenário de referência no qual um fluxo financeiro distribuído precisa integrar um novo produto a uma cadeia hipotética de movimentação, provisão e conciliação.

A solução proposta combina **Kotlin, Spring Boot, Kafka, AWS SNS/SQS, Redis e CloudFormation**, com processamento **at-least-once** e idempotência nas duas pontas da integração.

## O problema

No cenário modelado, publicar no callback da movimentação geraria um evento cedo demais. O processamento também precisa suportar reexecuções sem produzir múltiplas conciliações.

## Decisão arquitetural

```diagram
Legenda: Fluxo da movimentação financeira até o consumidor idempotente
Movimentação financeira
        |
        v
Callback de confirmação
        |
        v
Etapa de provisão
        |
        v
AWS SNS
        |
        v
AWS SQS (outra conta)
        |
        v
Consumidor idempotente
```

Na arquitetura de referência, a publicação acontece em uma etapa explícita de provisão, posterior ao callback.

## Idempotência

A arquitetura considera **at-least-once + idempotência** com chave de negócio no Redis. A chave é persistida após o publish bem-sucedido, e o consumidor também deduplica.

## Trade-off

Existe uma janela entre publicação e persistência da chave. Uma evolução possível seria **Transactional Outbox**.

## Integração cross-account

A infraestrutura inclui SNS, SQS, policies cross-account e CloudFormation multiambiente.

## Competências demonstradas

- sistemas distribuídos;
- event-driven architecture;
- idempotência;
- at-least-once;
- AWS cross-account;
- evolução incremental de legado;
- infraestrutura como código.
