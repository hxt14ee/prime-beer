# Prime Beer

Telegram mini-app catalog built with React + Vite.

## Development

1. `npm ci`
2. `npm run dev`
3. Open `http://127.0.0.1:5173/`

## Quality Gate For Modern Smartphones

Automated mobile adaptation and optimization pipeline is configured for:

1. Functional regression on Tier-A mobile device classes
2. Design guard checks (safe area, right-corner FAB, viewport containment)
3. Accessibility critical checks (axe)
4. Lighthouse performance gate with Core Web Vitals thresholds
5. Final accept/reject verdict by release judge

See full process in [docs/mobile-quality-gate.md](docs/mobile-quality-gate.md).

## CI Agent Orchestration

PR workflow: `.github/workflows/mobile-quality-gate.yml`

1. Orchestrator (Lead)
2. Device Matrix Agent
3. Functional QA Agent
4. Real Device Agent
5. Design Review Agent
6. Performance Agent
7. Accessibility Agent
8. Fix Agent
9. Release Judge Agent
