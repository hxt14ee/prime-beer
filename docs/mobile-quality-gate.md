# Mobile Adaptation And Optimization Pipeline (April 2026)

This repository uses an automated quality gate for modern smartphones with explicit acceptance and rejection criteria.

## Agent Roles

| Role | Agent Type | Responsibility | Can block release |
| --- | --- | --- | --- |
| Orchestrator (Lead) | default | Запускает pipeline и сводит вердикт | Yes |
| Device Matrix Agent | explorer | Обновляет/валидирует матрицу девайсов и браузеров | No |
| Functional QA Agent | worker | E2E/регресс на матрице (Playwright) | Yes |
| Real Device Agent | worker | Прогон на реальных iOS/Android | Yes |
| Design Review Agent | explorer+worker | Визуальные дифы, safe-area, кликабельность | Yes |
| Performance Agent | worker | Lighthouse CI и бюджеты CWV | Yes |
| Accessibility Agent | worker | WCAG 2.2 AA проверки | Yes |
| Fix Agent | worker | Готовит план исправлений по упавшим гейтам | No |
| Release Judge Agent | explorer | Финальный авто-вердикт ACCEPT/REJECT | Yes |

Roles are defined in `config/agent-roles.json`.

## Coverage Tiers

Device matrix source: `config/mobile-device-matrix.json`.

1. Tier A (required on every PR)
   - iOS Safari regular and large classes
   - Android Chrome flagship and Samsung classes
2. Tier B (nightly)
   - iOS compact class
   - Android mid-range class

## Hard Release Gates (Reject If Violated)

1. Any Tier-A functional test fails.
2. Any Tier-A design guard test fails.
3. Any critical accessibility violation is detected.
4. Any Core Web Vitals threshold is breached:
   - LCP > 2.5s
   - INP > 200ms
   - CLS > 0.1

## CI Workflows

1. `.github/workflows/mobile-quality-gate.yml`
   - Trigger: pull requests and manual runs.
   - Jobs: orchestrator, device-matrix, functional, real-device, design, performance, accessibility, fix, release-judge.
2. `.github/workflows/mobile-nightly-full-matrix.yml`
   - Trigger: nightly schedule and manual runs.
   - Scope: Tier A + Tier B + performance audit.

## Local Commands

1. `npm run test:mobile:functional`
2. `npm run test:mobile:design`
3. `npm run test:mobile:a11y`
4. `npm run test:mobile:perf`
5. `npm run test:mobile:full`
6. `npm run ci:orchestrator`
7. `npm run ci:device-matrix`
8. `npm run ci:real-device`
9. `npm run ci:fix-agent`
10. `npm run ci:release-judge`

## Real Device Gate Mode

`REQUIRE_REAL_DEVICE_GATE=true` makes real-device checks blocking.

Optional CI variables:

1. `REAL_DEVICE_PROVIDER` (`none` or `browserstack`)
2. `REAL_DEVICE_COMMAND` (command that executes real-device run)
3. `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` secrets

## Acceptance Authority

Final automated decision is produced by `scripts/ci/release-judge.mjs`.
If any required gate fails, verdict is `REJECT`; otherwise verdict is `ACCEPT`.
