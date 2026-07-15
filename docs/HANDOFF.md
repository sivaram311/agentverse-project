# HANDOFF — Upgradation side fleet

**When:** 2026-07-15  
**Branch:** `feature/upgradation-functionality` · **Version:** **`v0.3.7` LIVE** (F+G)
**Side ports:** **3312 / 4312 / 5312**  
**Hosts:** https://agentverse-upgrade-staging.delena.buzz · https://agentverse-upgrade.delena.buzz

## Live (after this cut)

| Env | Version | Evidence |
|-----|---------|----------|
| F PREPROD `:4312` | **0.3.7** | `H:\releases\agentverse-upgrade-0.3.7\` |
| G PROD `:5312` | **0.3.7** | same |

## Shipped

- **0.3.5** — `stageVisible` cast swap + W4 ContextDecisionOffer  
- **0.3.6** — Pack specialist remap (shared Priya+Rajesh; diverge specialists; no ghost stage ids)
- **0.3.7** — Pack overlay display names on avatar tags + roster; **tap-only chat** (proximity / approach greet no longer auto-opens chat panel)

## Cast switch cheat-sheet (display names)

| Pack | Anchors | Specialists |
|------|---------|-------------|
| proddeck | Priya, Rajesh | Ravi, Lena, Keerthi |
| upgrade | Priya, Rajesh | Arjun, Maya, Manu |
| css | Priya, Rajesh | Amrit, Kiran |
| css-next | Priya, Rajesh | Amrit, Mahesh |
| agent-portal | Priya, Rajesh | Arjun, Manoj, Kavi |
| stack-pilot | Priya, Rajesh | Murali, Karthik |
| h-drive | Priya, Rajesh | Naveen, Kiran |

Hard-refresh after promote. Session Desk → flip app = cast change. Tap an agent to talk; walking near or approach greet alone does not open chat.
