# Web Application Industrial Standards (Agent Crew)

## Pre-Coding Validation (in pre-work/)
- Design alignment checks using Playwright visual regression or Chrome DevTools (screenshot comparisons, CSS audit).
- Form control validations: Client + server-side, accessibility (axe), error handling.
- API contract testing (contract-first or Pact).

## Runtime / Ops Standards
- **Logging**: Structured JSON logs (winston/pino). Log rotation (daily, size-based, compression). Central log location per env.
- **Port Registration**: Always reserve in workflow/ports/REGISTRY.md before starting server. Use assigned port only.
- **Versioning**: Semantic Versioning (SemVer). Include version in API responses, UI footer, package.json. Git tags for releases.
- **Monitoring**: Health checks (/health), metrics endpoint.
- **Security**: Helmet, rate limiting, CORS, CSP. Always integrate with CSS auth.
- **Build/Deploy**: CI-ready scripts, env-specific configs.

## Testing
- Unit + Integration + E2E (Playwright).
- Visual regression tests for design system compliance.

## Agent Responsibilities
- Design System Keeper: Runs Playwright design validation.
- QA-Tester: Form validations, log checks.
- Promote-EM: Includes log rotation config in evidence pack.
