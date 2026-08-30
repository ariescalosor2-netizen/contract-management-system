# Contract Management System — Final Enhancement Baseline

## Role architecture

- **Super Admin** — platform owner; manages organizations, system users, roles, and system-level monitoring.
- **Administrator** — organization manager; operates contracts and organization data within their assigned organization.
- **Viewer** — client/stakeholder-facing read-only user within an organization.
- **Contract Manager / Finance Officer / Legal Officer** — organization-scoped operational roles already supported by the module.

## Implemented enhancement in this build

1. Super Admin can create an organization together with its initial Administrator in one transaction.
2. Initial Administrator is automatically linked to the newly created organization.
3. Organization-scoped users created by Super Admin require an organization.
4. Super Admin role cannot be assigned through the normal web user CRUD; the controlled system provisioning command remains the path for creating a system-level Super Admin.
5. Organization Admins cannot create or assign the Super Admin role.
6. Super Admin organization UI was upgraded with onboarding-oriented fields and organization statistics.
7. Top navigation displays the active organization context for organization users and System Administration for Super Admin.
8. Viewer contract navigation stays inside the Viewer portal route.
9. Existing multiple-party contract API and UI flow is preserved: a contract can have multiple linked parties, each with its own party role.

## Existing production configuration

- Frontend uses `VITE_API_URL` when supplied and otherwise uses the local API during development and `/api/v1` in production.
- Render configuration is provided in `render.yaml`.
- Vercel SPA/API routing is provided in `vercel.json`.
- Secrets remain environment variables; do not commit real credentials.

## Verification

Python modules changed by this enhancement pass compile successfully with `python -m py_compile`.
The supplied archive does not contain a complete installed Vite binary, so the frontend production build must be re-run in the project environment after `npm install`/`npm ci`.
