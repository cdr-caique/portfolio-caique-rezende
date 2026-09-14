# Portfólio de Caíque Rezende

Portfólio profissional de Caíque Rezende, engenheiro de software focado em
backend, cloud e sistemas distribuídos. A versão publicada está em
[caique-rezende.dev](https://caique-rezende.dev).

## Arquitetura

Esta é uma aplicação estática em React, TypeScript e Vite. O Vite gera os
arquivos públicos em `dist/`, que são entregues pelo AWS Amplify Hosting.

A seção de projetos consulta a API pública do GitHub diretamente no navegador.
Quando a consulta não está disponível, a interface mostra uma seleção local de
projetos e faz uma única nova tentativa automática após cinco segundos.

## Pré-requisitos

- Node.js `>=22.13.0`
- pnpm `10.28.0`
- Terraform `>=1.10.0`
- AWS CLI autenticada com um perfil apropriado
- GitHub CLI autenticada na conta que administra o repositório

## Desenvolvimento local

```bash
pnpm install --frozen-lockfile
pnpm run dev
pnpm test
pnpm run test:content
pnpm run lint
pnpm run build
```

O comando de build executa a checagem de tipos e gera o site estático em
`dist/`.

## Estudos de caso

Os artigos públicos ficam em `content/case-studies/`. Cada arquivo precisa de
`title`, `slug`, `summary` e `tags` no front matter.

`pnpm run build` valida confidencialidade, gera páginas HTML em
`dist/estudos-de-caso/<slug>/` e atualiza `dist/sitemap.xml`. O build rejeita
chaves e ARNs AWS, números de conta, chaves privadas, tokens conhecidos de
GitHub, GitLab, Slack, npm, OpenAI e Google, URIs `s3://`, endereços RFC1918 ou
de loopback, hostnames corporativos/locais, tickets e aliases bloqueados.
Também rejeita qualquer e-mail fora da allowlist explícita, que contém somente
`caiquecleber@gmail.com`.

O parser exige todos os campos do front matter e não aceita uma lista `tags`
vazia ou com entradas vazias. IDs de headings são deduplicados globalmente em
cada artigo para manter os links do sumário inequívocos.

Diagramas ASCII devem usar um fence `diagram` cuja primeira linha seja uma
legenda específica. O gerador transforma apenas esse formato em uma figura com
legenda e região rolável acessível; fences de código comuns continuam sendo
renderizados como código:

````markdown
```diagram
Legenda: Fluxo público entre origem e destino
Origem -> Destino
```
````

As páginas públicas são:

- [Conciliação financeira idempotente em uma saga distribuída](https://caique-rezende.dev/estudos-de-caso/conciliacao-financeira-idempotente-saga/)
- [Resiliência e performance em um motor de elegibilidade](https://caique-rezende.dev/estudos-de-caso/resiliencia-performance-motor-elegibilidade/)
- [Operação segura de DLQs com MCP, Skills e arquitetura client-agnostic](https://caique-rezende.dev/estudos-de-caso/operacao-segura-dlq-mcp-client-agnostic/)

## Infraestrutura e implantação

A infraestrutura é dividida em duas responsabilidades:

- `infra/bootstrap` cria e protege o bucket S3 usado pelo estado remoto do Terraform.
- `infra/app` administra a aplicação Amplify, a branch de produção, o redirecionamento canônico de `www` para o domínio apex e a associação do domínio existente.

A home navega apenas por fragments (`/#...`) e os estudos de caso são páginas
HTML estáticas em diretórios próprios. Não reintroduza um fallback SPA com
status `200` para `/index.html`: essa regra interceptaria as rotas dos artigos
antes que o Amplify entregasse seus arquivos estáticos. O redirect `301` de
`www` para o domínio apex deve ser preservado.

O bootstrap da conexão GitHub–Amplify é feito no console da AWS: autorize o
GitHub App oficial apenas para este repositório, crie a aplicação com a branch
`main` e confirme que ela lê `amplify.yml`. Em seguida, inicialize o backend
remoto e importe a aplicação e a branch existentes para o Terraform. Não use
tokens pessoais no código ou nas variáveis do Terraform.

Cada push para `main` inicia uma nova implantação no AWS Amplify. O ambiente
executa o build definido em `amplify.yml` e publica o conteúdo de `dist/`.

## Segurança do repositório

Nunca faça commit de credenciais AWS, tokens do GitHub, arquivos `.env`, estado
do Terraform, arquivos de plano ou artefatos de build. Use credenciais locais
já configuradas, de preferência por IAM Identity Center ou um perfil AWS
dedicado.

## Fora de escopo atual

- Versão em inglês.
- Backend para o formulário de contato.
- API intermediária com cache para os dados do GitHub.
- Autenticação, banco de dados e painel administrativo.
- Transferência do registro do domínio para outro provedor.
