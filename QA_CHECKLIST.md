# Wealth Clicks – Release QA Checklist

Use this document every time you prepare a release candidate. Check off each item after it passes.

## 1. Environment
- [ ] `.env` files contain correct production API keys / DB URIs (never localhost)
- [ ] MongoDB connection successful (`Connected to MongoDB` message on server start)
- [ ] Client builds without warnings (`npm run build` in `client`)

## 2. Agent-side Functional Flows
| Flow | Steps | Pass? |
|------|-------|-------|
| **Registration & Login** | Register → email verification (if enabled) → login | ☐ |
| **Click Earning** | Click banner 50× → daily earnings capped at ₱10 | ☐ |
| **Buy Package** | Choose package → pay → appears in Active Packages | ☐ |
| **Claim Matured Package** | Fast-forward/end-date package → claim → shared earnings increases | ☐ |
| **Withdraw — Click Earnings** | Have ≥₱100 click earnings → withdraw → status pending | ☐ |
| **Withdraw — Direct/Indirect** | Have referral earnings → withdraw | ☐ |
| **Withdraw — Shared Capital** | Have shared earnings → withdraw | ☐ |
| **Real-time Updates** | Observe WebSocket events: withdrawal status & earnings_update | ☐ |
| **Profile Update & Password Change** | Change display name & password → relogin succeeds | ☐ |

## 3. Admin-side Functional Flows
| Flow | Steps | Pass? |
|------|-------|-------|
| **Dashboard Statistics** | Numbers match DB values | ☐ |
| **User Management** | Search user → suspend/activate → user login affected | ☐ |
| **Package Approval** | Approve/reject pending package | ☐ |
| **Withdrawals – Referral** | Approve/reject; balances adjust | ☐ |
| **Withdrawals – Click** | Approve/reject; balances adjust | ☐ |
| **Withdrawals – Shared** | Approve/reject; balances adjust | ☐ |
| **Settings (Rates/Caps)** | Edit click rate or daily cap → agent side reflects after refresh | ☐ |

## 4. Cross-cutting
- [ ] All pages responsive (desktop ≥1024px, mobile 375px)
- [ ] No 404/500 errors in browser console
- [ ] JWT expires → redirected to login
- [ ] Logout clears localStorage & sockets

## 5. Automated Tests
- [ ] `npm run cypress:run` completes with 0 failures

## 6. Deployment
- [ ] Render (backend) build passes & healthcheck OK
- [ ] Netlify (frontend) build passes & site loads
- [ ] ENV vars configured in both dashboards

## 7. Monitoring / Backups
- [ ] Logs streaming in Render / Logtail / Papertrail
- [ ] MongoDB daily backup enabled & recent snapshot verified

---
**Date:** ____________  **Release:** v___  **QA Engineer:** ____________
