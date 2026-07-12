# 05 - Design System

**Status:** DRAFT — gaming / 3D portal

## Direction

- **Feel:** Game lobby / mission control — spatial depth, not flat SaaS dashboard.
- **Brand:** “AgentVerse” as hero-level signal in first viewport.
- **Avoid:** Generic purple-gradient AI look; warm cream + terracotta broadsheet clichés.
- **Mobile-first:** Touch orbit, large hit targets for persona avatars; Realme-class widths.

## Palette (proposal — Design Keeper to validate)

| Token | Hex | Use |
|-------|-----|-----|
| `--av-void` | `#0B1218` | Scene clear / deep background |
| `--av-plate` | `#15202B` | HUD panels (sparingly) |
| `--av-accent` | `#E8A838` | CTAs / active persona |
| `--av-mint` | `#3DDC97` | Success / approved gate |
| `--av-coral` | `#FF6B4A` | Alerts / blocked gate |
| `--av-ink` | `#F2F5F7` | Primary text on dark |

## Typography

- Display: distinctive geometric sans (not Inter/Roboto/Arial).
- UI: readable sans for HUD chat.

## Motion

- 2–3 intentional motions: persona idle breathe, camera ease-in on enter, gate approve pulse.
- Respect `prefers-reduced-motion`.

## Validation

Follow `E:\machine-docs\personas\web-playwright-checklist.md` before coding sign-off.
