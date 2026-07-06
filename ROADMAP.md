# RepoMatch Development Roadmap

A living roadmap of features, completed work, and upcoming priorities for the RepoMatch codebase.

---

## Done
- [x] **Token additions to `globals.css`** — added transition, spacing, radius, color, and focus tokens (July 6, 2026)
- [x] **Namespace class styles in `widgets.css`** — prefix safe CSS variables (July 6, 2026)
- [x] **19 Widget Library Components** — full suite of modular components (July 6, 2026)
- [x] **Layout integration** — imported styles in `layout.tsx` (July 6, 2026)
- [x] **Barrel exports config** — index file inside `/components/ui/` (July 6, 2026)
- [x] **Refactored core page workflows**:
  - `OnboardingWizard` refactor
  - `MatchList` refactor
  - `SwipeDeck` refactor
  - `DashboardPage` refactor
- [x] **Interactive playground** — `/ui` route showing states, triggers, and error validations (July 6, 2026)
- [x] **Accessibility layout targets** — added `#rm-main-content` target pages for skip-to-content links (July 6, 2026)
- [x] **Widget library guide** — created `WIDGET_LIBRARY_GUIDE.md` with playground screenshot (July 6, 2026)

---

## In Progress
- [ ] **Phase 4: Verification and Automated CI Testing Setup** (Next Phase)

---

## Next Up (Priorities)

### 1. Component Unit & Integration Testing
- Write Jest / React Testing Library tests for complex widget logic:
  - **Toast system eviction**: Confirm that success/info notifications get evicted before danger/error messages when the queue is saturated.
  - **Table pagination & sorting**: Verify page slicing works correctly and sorting strings/numbers behaves as expected.
  - **Modal z-index layer count**: Test nested z-index increment and decrement limits on close.

### 2. Automated Accessibility (a11y) Testing
- Set up Playwright or axe-core testing scripts to scan `/ui` automatically.
- Verify focus traps inside `Modal` and `Dropdown` cycle and wrap focus properly.

### 3. CI Workflow Setup
- Create a `.github/workflows/ci.yml` pipeline that triggers on push/PR.
- Run `pnpm install`, lint checks, TypeScript checks, and play test suites to ensure zero build errors.

### 4. Remaining Pages Audit & Refactoring
Refactor the remaining raw-HTML pages to use our components:
- `/claim` (needs `Card`, `Button`, `Input`, `Select`)
- `/login` (needs `Button`, `Card`)
- `/network` (needs `Card`, `Badge`, `Button`)
- `/people` (needs `Card`, `Badge`, `Button`)
- `/u/[username]` (needs `Badge`, `Card`, `Button`)

---

## Known Gaps & Future Improvements
- **Theme support**: Component tokens currently bind directly to dark-theme variables. Add a theme switcher using `.rm-theme-light` CSS variables.
- **Roving index key binds**: Support Home/End key binds inside `Tabs` roving layouts.
