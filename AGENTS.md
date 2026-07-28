<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Instructions for Femcart Platform Architecture

Welcome agent! You are assigned to finalize the **Platform Integration Phase** and complete the **Home Page Builder** refactoring for the Femcart e-commerce website. The project requirements, architectural design, and tasks are detailed in the repository documents.

## Central Source of Truth Checklists
You MUST refer to the following combined audit document to understand what is complete, what is required next, and the comprehensive backlog:
- **Master Feature Audit**: [project_features_audit.md](file:///d:/Rasel%20Mahmud%20Shanto/e-commerce-fresh-market/project_features_audit.md)

## CMS & Builder Documentation
- Architecture Guide: [home-builder-architecture.md](file:///d:/Rasel%20Mahmud%20Shanto/e-commerce-fresh-market/frontend/home-builder-architecture.md)
- Sequential Checklist: [home-builder-tasks.md](file:///d:/Rasel%20Mahmud%20Shanto/e-commerce-fresh-market/frontend/home-builder-tasks.md)
- Code & Tool Playbook: [skill.md](file:///d:/Rasel%20Mahmud%20Shanto/e-commerce-fresh-market/frontend/skill.md)

---

## 1. Core Directives

1. **Focus on Launch Blockers (P0)**: Prioritize tasks tagged as P0 in `todo_features.md` (Payment Gateways, Transactional Emails, Security/Rate Limiting). Do not start P2 features until P0 and P1 are complete.
2. **Backwards Compatibility**: The existing `/home` page and checkout flows must continue to function. Deprecate components gracefully instead of deleting them abruptly.
3. **Robust Systems**: When implementing gateways or emails, ensure failures are caught and handled gracefully. Use database transactions (`$transaction`) whenever updating wallets, stock, or order statuses.
4. **Premium UI & Design Guidelines**: Adhere to the modern visual aesthetics described in the web application guidelines. Ensure all components use harmonized palette presets, rounded corners, dynamic layout sizing (cols, gap), and responsive styling.

---

## 2. Technical Map & File List

Refer to these files when modifying the platform architecture:
- **Backend Schema & Database**:
  - Prisma Schema: [schema.prisma](file:///d:/Rasel%20Mahmud%20Shanto/e-commerce-fresh-market/backend/prisma/schema.prisma)
  - Zod Validators: `backend/src/modules/*/validators.ts`
- **Critical Backend Controllers (P0 Focus)**:
  - Payments: `backend/src/modules/payment/controller.ts` (Needs replacement of mocks)
  - Orders: `backend/src/modules/order/controller.ts` (Needs email/webhook hooks)
  - Auth/Security: `backend/src/modules/auth/controller.ts` (Needs rate limiting)
- **Frontend Components**:
  - Component Registry: `frontend/src/page-builder/registry.tsx`
  - Builder Layout: `frontend/src/components/admin/HomeBuilder/`

---

## 3. Operational Workflow

For each phase of the implementation:
1. **Prepare**: Open the relevant backend or frontend files, check for existing code patterns, and double-check requirements in `project_features_audit.md`.
2. **Implement**: Write complete, well-commented code. For integrations (Stripe, Nodemailer), ensure environment variables are clearly documented.
3. **Verify**: Use curl/manual test scripts for API testing. Inspect database updates using Prisma Studio. Run `npm run dev` to verify hot module replacement.
4. **Document Progress**: Tick the checkboxes in `project_features_audit.md` as soon as you have verified the completion of a specific task.

---

## 4. Current State & Immediate Priorities

**Status**: The core E-commerce engine is ~85% complete, and the Home Page Builder is largely complete through Phase 11. 

**Immediate Priority (The Blockers)**:
- **Payments**: The `PaymentController` is mocked with a `setTimeout`. This is the single biggest blocker to going live. Webhook validation is missing.
- **Emails**: The platform sends SMS via a global wallet, but zero transactional emails are configured.
- **Security**: Basic rate limiting (e.g. `express-rate-limit`) and security headers (`helmet`) must be applied to prevent scraping and brute-forcing.

When onboarding, read `project_features_audit.md` to pick up the next available uncompleted task.
