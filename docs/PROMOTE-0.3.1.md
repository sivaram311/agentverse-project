# Promote 0.3.1 — agentverse-upgrade side fleet

**Rule:** Only `F:\apps\agentverse-upgrade` / `G:\apps\agentverse-upgrade` on **4312 / 5312**.  
Never stop classic `:5310`, v2 `:4311`, portal, CSS, ProdDeck.

| Gate | Host | Upstream |
|------|------|----------|
| Q1 | https://agentverse-upgrade-staging.delena.buzz | :4312 |
| Q2 | https://agentverse-upgrade.delena.buzz | :5312 |

Bake: `NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz` · pack **0.3.1** from `feature/upgradation-functionality` @ `77be672`+
