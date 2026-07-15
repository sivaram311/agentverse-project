# 02 — Architecture: Stage truth 0.3.5 (W4 + `stageVisible`)

**Initiative:** AgentVerse upgrade · cast swap + context adoption  
**Version cut:** **0.3.5**  
**Branch / fleet:** `feature/upgradation-functionality` · **3312 / 4312 / 5312 only**  
**Date:** 2026-07-15  
**Role:** Technical Architect  
**Upstream vision:** [01-vision-walkthrough.md](./01-vision-walkthrough.md) (read-only for this lane)  
**Hire:** [2026-07-15-w4-architecture-0.3.5.md](../../hires/2026-07-15-w4-architecture-0.3.5.md)  
**SoT:** ACTION-PLAN W4 · PACK-TEMPLATE · `pack-loader.Pack.stageVisible` · store `setActivePack` (camera+epoch today)

**This turn:** docs/contracts only — **no** `src/` product code · **no** push · **no** promote · **no** edits to Vision / ACTION-PLAN.

---

## Current gap (as-read)

| Surface | Today | Target 0.3.5 |
|---------|-------|----------------|
| `Pack.stageVisible` | Typed + packed in JSON | Applied as **stage cast** / talkable set |
| `setActivePack` | Camera preset + optional `composeSeed` + hard `packEpoch` bump | **Also** coerce `selectedPersona` into cast; expose cast helpers |
| `HubScene` / `FlatRoster` / `TeamMemberBar` | `personas.map` full catalog | Filter to active pack `stageVisible` ∩ known `PersonaId` |
| `PlayerAvatar` nearest greet | Seats from **full** `personas` | Seats from **on-stage** cast only |
| Adopt / Switch / Hire | ACTION-PLAN §8 playbook | Store API sketch + ACTIVITY event shapes; Hire = **SOP**, not Cursor/CLI product API |

---

## Burst-2 exclusive ownership (zero path overlap)

Impl coding **after** Human GO + this contract. Lanes are disjoint; shared **read** of `pack-loader` / helper OK.

| Lane | Seat | Owns (exclusive write) | Does **not** touch |
|------|------|------------------------|--------------------|
| **ST** | Karthik (+ Aravind assist) | `src/lib/store.ts` · **NEW** `src/lib/stage-cast.ts` (pure helpers: intersect cast, default talk target, ACTIVITY event builders) | Scene meshes · HUD components · pack JSON · personas.json |
| **SCENE** | Aravind | `src/components/scene/HubScene.tsx` · `src/components/scene/PlayerAvatar.tsx` | `store.ts` · HUD · pack-loader schema |
| **W4-UI** | Muthu (+ Meenakshi copy-lite) | `src/components/hud/FlatRoster.tsx` · `src/components/hud/TeamMemberBar.tsx` · `src/components/hud/ChatPanel.tsx` · **NEW** `src/components/hud/ContextDecisionOffer.tsx` (single affordance — B3) | `HubScene` / `PlayerAvatar` · `store.ts` internals (call public actions only) |

**Integrate (Lead only, after Burst-2 merge):** bump `package.json` → **0.3.5**, HANDOFF/OPS #12, wire E2E hire — not in Burst-2 write set.

**Out of Burst-2 (approval / CAST hygiene):** `personas.json` · `src/lib/types.ts` `PersonaId` · pack JSON cast lists — see blockers. Do not let ST/SCENE/W4-UI “fix” missing ids by editing cast files mid-lane.

```text
Read-only shared:
  pack-loader.getPack / Pack.stageVisible
  orchestrator.personas / getPersona (overlay)
  stage-cast helpers (ST creates; SCENE + W4-UI import)
```

---

## Store API sketch

Keep Zustand persist key `agentverse-office-v2`. **Do not** persist Layer B hire notes. Persist continues to include `activePackId` + `selectedPersona` (must remain valid on hydrate — see risks).

### Helpers (`stage-cast.ts` — ST)

```ts
/** Intersect pack.stageVisible with known PersonaId; drop unknown ids (e.g. pre-cast vikram). */
function stageCast(pack: Pack | null): PersonaId[]

/** Prefer helpdesk if in cast; else first cast id; else orchestratorId if in cast; else cast[0] throw-safe. */
function defaultTalkTarget(pack: Pack | null, preferred?: PersonaId | null): PersonaId

function isOnStage(id: PersonaId, pack: Pack | null): boolean
```

### `setActivePack(appId, reason?)` — extend (ST)

Preserve W3 behavior (camera, `composeSeed`, hard/soft epoch, toast). **Add:**

1. Resolve `pack = getPack(appId)`; unknown → no-op (today).  
2. On **changing** pack (or re-assert with reason): after epoch/camera/`composeSeed` updates, set  
   `selectedPersona = defaultTalkTarget(pack, get().selectedPersona)`  
   — if current selection **∉** `stageCast(pack)`, replace with default (Vision: Help Desk when listed).  
3. Do **not** clear message history / Portal session on pack flip (session binding remains W3).  
4. Emit ACTIVITY-shaped record for Switch only when `changing` (see events) — runtime may buffer for Lead to append ACTIVITY-LOG; do not invent network ACTIVITY API.

### `adoptPersona(id: PersonaId)` — new (ST)

| | |
|--|--|
| Guard | `isOnStage(id, activePack)` else no-op + optional `setError` / toast |
| Epoch | **Unchanged** |
| Effect | `selectedPersona = id`; `summonPersona(id)` / open chat as today `selectPersona` does |
| ACTIVITY | `adopt` event |

Alias: existing `selectPersona` should either call the same cast guard or be thin-wrapped so HUD cannot select off-cast.

### `switchPack(appId, reason?: string)` — new (ST)

Thin operator-facing alias: `setActivePack(appId, reason ?? "switch")` with documented semantics = **Switch** (hard default via pack `switchPolicy`). UI decision affordance calls this — not raw multi-set storm.

### `hireReplacement(args)` — new (ST) · **SOP only**

```ts
type HireReplacementArgs = {
  personaId: PersonaId;       // usually a workerRoles id; may equal a stage id
  hireNotePath: string;       // e.g. agents/hires/YYYY-MM-DD-….md
  reason: string;             // "poisoned" | free text
  ownershipPaths?: string[];  // disjoint paths for ACTIVITY
  bumpEpoch?: boolean;        // default false — see epoch policy
};
```

| | |
|--|--|
| Product API | **Forbidden** — does not call Cursor Task / CLI / Portal hire endpoint |
| Epoch | Default **same** `packEpoch`. `bumpEpoch: true` only when Lead chooses hard invalidate of in-flight Layer B under this pack (rare; couples Hire+Switch semantics — still **one** operator decision) |
| Stage | Does **not** add WebGL bodies; may leave stage avatar if `personaId ∈ stageVisible` |
| Effect | Append to in-memory `activityEvents[]` (optional ring buffer, **not** persist) + return event for Lead ACTIVITY-LOG append |
| UI | W4-UI may show “Hire logged” confirm; file creation remains human/Lead SOP |

### Decision gate (cross-cutting)

Max **one** of Adopt / Switch / Hire per operator turn. Store sketches a `lastContextDecisionAt` / `contextDecisionNonce` or simple `pendingDecision: null | "adopt" | "switch" | "hire"` cleared on confirm — **W4-UI** owns the single confirm chrome; ST owns the latch so ChatPanel cannot auto-chain.

---

## ACTIVITY event shape (runtime buffer → Lead ACTIVITY-LOG)

Machine ACTIVITY-LOG remains append-only markdown (provider `cursor`). Store emits structured payloads so Lead/ops can paste one row.

```ts
type PackContextActivityEvent = {
  at: string;                 // ISO or "YYYY-MM-DD HH:mm" IST
  session: "agentverse-feature-branch-2026-07-15" | string;
  provider: "cursor" | "antigravity" | "other";
  role: string;               // lane seat or "operator"
  kind: "adopt" | "switch" | "hire";
  appId: string;
  packEpoch: number;
  personaId?: string;         // adopt / hire
  fromPersonaId?: string;     // adopt
  hireNotePath?: string;      // hire
  ownershipPaths?: string[];  // hire / switch retire list
  reason?: string;
  fleet: "3312/4312/5312";
};
```

ACTIVITY-LOG row mapping (one line):

`| {at} | {session} | {provider} | architect|lane|{role} | W4 {kind} appId={appId} epoch={packEpoch} … | paths | ok | … |`

---

## Components: filter vs hide WebGL

| Component | Strategy | Why |
|-----------|----------|-----|
| **HubScene** `personas.map` → `PersonaAvatar` | **Filter — do not mount** off-cast | Unmounted = no draw/anim cost; empty hex seats OK |
| **FlatRoster** list | **Filter — omit buttons** | 2D fallback must match stage truth (M1) |
| **TeamMemberBar** pills | **Filter — omit pills** | Radar = talkable cast only |
| **PlayerAvatar** `seats` / nearest | **Filter — seats ⊆ cast** | Prevents summon of off-stage ids at empty desks |
| **PersonaAvatar** (mesh) | No per-mesh `visible={false}` policy | Prefer parent filter; hide-still-mounted thrash + proximity bugs |
| **AmbientWalkers** / environment | Unchanged | Not cast bodies; not scaled by `workerRoles` |
| **ChatPanel** | No body; **guard talk target** via store cast + default | See risks |

**Rule:** `workerRoles` never inflate WebGL count. Hire Replacement never mounts a body.

---

## Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | **Store thrash** — Session Desk + project + deep-link re-entering `setActivePack` | Idempotent when `activePackId` unchanged (today); cast coerce only when selection ∉ cast or pack **changing**; one decision latch; no mid-task overlay rewrite |
| R2 | **PlayerAvatar nearest off-stage** | SCENE filters seat list to `stageCast`; reset `lastGreet` on `packEpoch` / `activePackId` change |
| R3 | **ChatPanel defaults** | Persist may restore `selectedPersona` off new cast → ST coerce on `setActivePack` + hydrate rehydrate hook (`onRehydrateStorage` or boot `setActivePack(activePackId)`); ChatPanel uses `getPersona(selected, pack)` only after coerce; compose assignee must be on-stage (Vision M3) |
| R4 | **Unknown `stageVisible` ids** (e.g. css `vikram` ∉ `PersonaId`) | `stageCast` intersects; log/devwarn dropped ids; CAST lane before claiming M1 for css |
| R5 | Soft switch exception | Keep W3: soft = no epoch bump; cast still applies; Layer B retire is Lead SOP on hard only |

---

## Approval blockers (Architect → product)

| ID | Blocker | Unblocks |
|----|---------|----------|
| A1 | **Human GO** on Vision (B1) + this architecture | Burst-2 coding hires |
| A2 | **CAST hygiene:** css (and any pack) `stageVisible` ids must ⊆ `PersonaId` **or** CAST lane adds persona+avatar before SCENE filter ships css M1 | Honest css cast |
| A3 | **B3 UX pick:** confirm single affordance = `ContextDecisionOffer` (chip/modal) vs compose-only — Design-lite sign-off | W4-UI lane |
| A4 | Decision latch API frozen (one-turn) as in this doc | ST + W4-UI |
| A5 | Post-code: E2E hire (#14) · Playwright slot (#15) · DEV E2E before tag (#16) · Reviewer (#17) · DEV host login (#18) | Ship 0.3.5 |

**Architect verdict:** **GO-WITH-CHANGES** (docs) — product coding **NO-GO** until **A1** (+ **A2** before css-complete E2E).

---

## Docs #12 checklist (this turn)

- [x] This architecture contract  
- [x] Hire note `agents/hires/2026-07-15-w4-architecture-0.3.5.md`  
- [x] MyAgent ACTIVITY-LOG append (provider `cursor`)  
- [ ] Product `src/` — **forbidden this turn**
