---
name: bidcargas-portal
description: Portal whitelabel da account — cargas, propostas, chat, usuários, favoritos. Use ao implementar bidcargas-portal com slug, branding e API /portal.
disable-model-invocation: true
---

# bidcargas-portal

## Personificação whitelabel (MVP)

- Cada account: `slug` + `AccountSetting` (logo, primary color)
- Middleware valida slug vs host reservado
- Dev local: `?account=slug` ou host `slug.localhost`

## Fluxo embarcador

1. Publicar load (draft → published)
2. Receber bids (notificação + lista)
3. Aceitar bid → load closed
4. Chat com motorista na negociação

## Permissões

| Role | Pode |
|---|---|
| `account_admin` | users, settings, billing read, loads, bids |
| `account_user` | loads, bids, chat |

## Integração API

- `GET /portal/loads?page=&limit=`
- `POST /portal/loads`, `PATCH`, publish action
- `GET /portal/loads/:id/bids`
- `POST /portal/bids/:id/accept` | `reject`

## Referência xfdnflow

Portal cliente por slug — padrão `{slug}.xfdnflow.com`; adaptar domínio BidCargas.

Plano: `docs/PLAN.md` no workspace raiz.
