# Promote — agentverse-upgrade 0.3.0 (side fleet)

## Rule

Deploy only to `F:\apps\agentverse-upgrade` / `G:\apps\agentverse-upgrade` on **4312 / 5312**.  
Never stop or overwrite `F:\apps\agentverse`, `G:\apps\agentverse`, `*-v2`, ProdDeck, portal, CSS.

## Hosts

| Env | Host | Upstream |
|-----|------|----------|
| PREPROD | https://agentverse-upgrade-staging.delena.buzz | :4312 |
| PROD | https://agentverse-upgrade.delena.buzz | :5312 |

## Crew

promote-em + qa + security + review + ops + **field-ops**

## Bake

`NEXT_PUBLIC_CSS_ISSUER=https://css.delena.buzz` · `NEXT_PUBLIC_AV_ENV=PREPROD|PROD`

## Evidence

`H:\releases\agentverse-upgrade-0.3.0\evidence\q1|q2\`
