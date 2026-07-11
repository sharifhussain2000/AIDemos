# FarmRise FB→WhatsApp Campaign: Implementation Checklist

---

## Pre-Launch (Weeks 1–2)

### Design & Strategy
- [ ] Finalize agri quiz questions (3–4 options per variant)
- [ ] Confirm reward value (₹75, ₹100, ₹150) and redemption mechanic
- [ ] Lock message copy and tone across all 7 messages
- [ ] Create A/B test matrix (reward value, quiz length, CTA text)
- [ ] Design FB ad creative (2–3 variations)
- [ ] Agree on success metrics and dashboards

### Stakeholder Alignment
- [ ] Review campaign flow with product team
- [ ] Get comms/legal sign-off on copy and compliance
- [ ] Align with app team on deep link handling and reward flow
- [ ] Confirm budget allocation (FB spend + team capacity)
- [ ] Assign campaign owner and daily monitoring lead

### Backend Development
- [ ] **API Development:**
  - [ ] Registration check endpoint (`GET /api/v1/user/registration-check`)
  - [ ] Event logging endpoint (`POST /api/v1/whatsapp-campaign/track-event`)
  - [ ] Reward generation & claim flow
  - [ ] Deep link parameter handling
- [ ] **Database:**
  - [ ] Create `whatsapp_campaign_events` table
  - [ ] Create `user_rewards` table (if new)
  - [ ] Ensure phone masking/hashing on all PII
- [ ] **Testing:**
  - [ ] Unit tests for registration check (handles timeouts, errors)
  - [ ] Integration tests for event logging
  - [ ] Load test (expect 10K–50K events/day)

### Mobile App Setup
- [ ] Implement deep link handler for `farmrise://onboarding?campaign=...`
- [ ] Auto-populate phone and campaign fields on onboarding
- [ ] Build reward banner UI (show reward value, expiry countdown)
- [ ] Implement reward redemption flow
- [ ] Add analytics tracking for campaign origin attribution
- [ ] Test on iOS and Android (internal builds)

### WhatsApp / Infobip Setup
- [ ] Register WhatsApp Business Account (if not done)
- [ ] Configure phone number for Message Flows API
- [ ] Register all 7 message templates with Meta (approval needed)
  - [ ] `farmrise_existing_user_welcome`
  - [ ] `farmrise_quiz_welcome`
  - [ ] `farmrise_quiz_q1`, `farmrise_quiz_q2`, `farmrise_quiz_q3`
  - [ ] `farmrise_reward_unlock`
  - [ ] `farmrise_reward_retry`
- [ ] Set up Infobip webhook for delivery/read events
- [ ] Configure click tracking (Infobip will handle URL wrapping)
- [ ] Test message sending with internal test numbers

### Analytics & Monitoring
- [ ] Set up Datadog/Mixpanel dashboard for real-time metrics
- [ ] Configure alerts for:
  - [ ] Engagement rate drops below 20%
  - [ ] Download CTR drops below 10%
  - [ ] High failure rates on registration check API
  - [ ] Spike in WhatsApp blocks/reports
- [ ] Create reporting template (daily performance summary)

---

## Week 2: QA & Testing

### End-to-End Flow Testing
- [ ] **Existing User Path:**
  - [ ] Create test accounts that ARE registered on FarmRise
  - [ ] Click FB test link → Land on WhatsApp → See "Already on FarmRise" → Click "Open App"
  - [ ] Verify deep link opens app correctly
  - [ ] Verify event logged: `existing_user_welcome_shown`
  - [ ] Verify no further messages sent

- [ ] **New User Gamification Path:**
  - [ ] Create test accounts that are NOT registered
  - [ ] Click FB test link → Land on WhatsApp → See quiz welcome
  - [ ] Answer Q1 → See Q2
  - [ ] Answer Q2 → Verify engagement threshold met → See Q3
  - [ ] Answer Q3 → See reward unlock
  - [ ] Click download → Verify deep link and app install tracking
  - [ ] Verify all events logged: `new_user_welcome_shown`, `quiz_question_shown` (×3), `reward_unlock_shown`, `download_cta_clicked`

- [ ] **Retry Path:**
  - [ ] Unlock reward → Wait 6+ hours → Verify retry message sent
  - [ ] Click download from retry → Verify install attribution to retry message

- [ ] **Error Scenarios:**
  - [ ] Registration check API timeout → Should default to gamification path
  - [ ] WhatsApp delivery failure → Verify retry logic
  - [ ] Corrupted phone number → Gracefully handle

### Performance & Load Testing
- [ ] Load test: 100 concurrent users in flow
- [ ] Load test: 1K events/minute logging
- [ ] Latency: Registration check API < 2 seconds (p95)
- [ ] Latency: Event logging < 500ms (p95)
- [ ] Database: Can handle 50K new rows/day without query slowdown

### Compliance & Approval
- [ ] WhatsApp templates approved by Meta (all 7)
- [ ] Privacy review: Phone masking in all logs ✓
- [ ] Legal review: Copy compliant with advertising standards ✓
- [ ] Test with internal users (50+ testers)

---

## Week 3: Soft Launch (5–10% Budget)

### Campaign Setup
- [ ] Create FB campaign with 5–10K daily budget
- [ ] Target: Agri-interested users, non-FarmRise users (use custom audience exclusion)
- [ ] Set up conversion tracking (link click → WhatsApp → 3+ engagement)
- [ ] Create 2–3 ad creative variations
- [ ] Set up UTM parameters: `utm_campaign=fb_whatsapp_gamif&utm_source=facebook`

### Pre-Launch Checklist (24 Hours Before)
- [ ] All APIs operational (test with synthetic traffic)
- [ ] WhatsApp Flows configured and tested
- [ ] Deep links working on iOS and Android
- [ ] Analytics dashboard live and capturing test events
- [ ] Alert thresholds set
- [ ] Escalation contacts identified (team on standby)

### Launch (Soft)
- [ ] **Start Time:** 9 AM IST (peak mobile usage)
- [ ] **Duration:** 48–72 hours at low volume
- [ ] **Monitoring:** Every 2 hours, check:
  - [ ] Messages delivered (no high failure rate)
  - [ ] Engagement rate tracking toward 35% target
  - [ ] Download CTR tracking toward 25% target
  - [ ] No spam complaints or blocks
  - [ ] Deep links working (check Datadog app install events)
- [ ] **Daily Standup:** Review metrics + decide to continue or pause

### Success Criteria to Launch Full Campaign
- ✓ Engagement rate ≥ 30% (within range)
- ✓ Download CTR ≥ 20%
- ✓ No high failure rates (<1% message delivery failure)
- ✓ No WhatsApp blocks/complaints
- ✓ CPI estimate ≤ ₹80

### Pause/Iterate If:
- ✗ Engagement rate < 15% → Simplify quiz (2 questions instead of 3)
- ✗ Download CTR < 10% → Increase reward value (test ₹150)
- ✗ Message delivery > 5% failure → Check Infobip status, phone number issues
- ✗ High block rate → Review messaging for spam signals

---

## Week 4: Scale & Optimize (Full Campaign)

### Scale Strategy
- [ ] If soft launch succeeds, increase FB budget to ₹100K/day
- [ ] Run A/B tests in parallel:
  - [ ] Variant A (Control): ₹100, 3 questions
  - [ ] Variant B: ₹75, 3 questions
  - [ ] Variant C: ₹150, 3 questions
  - [ ] Variant D: ₹100, 2 questions
- [ ] Run 7–14 days per variant (each gets ≥500 users)

### Daily Monitoring
- [ ] **Funnel Metrics:**
  - [ ] FB → WhatsApp entry rate (should be 75–85%)
  - [ ] Engagement rate (3+ clicks) by variant
  - [ ] Download CTR by variant
  - [ ] Install rate (post-download) — track via AppsFlyer
- [ ] **Quality Metrics:**
  - [ ] Reward redemption rate (% of new users claiming reward on app)
  - [ ] Day 1 retention (% of new users returning to app)
  - [ ] Day 7 retention
  - [ ] CPI by variant
- [ ] **Health Metrics:**
  - [ ] WhatsApp message delivery rate
  - [ ] API response times
  - [ ] Error rate on registration check
  - [ ] Spam/block rate

### Weekly Optimization
- [ ] Review A/B test results (after 7 days)
- [ ] Identify winning variant (likely highest CPI-adjusted ROI)
- [ ] Shift budget toward winning variant
- [ ] Pause underperforming variant
- [ ] Test new quiz questions (keep fresh)
- [ ] Communicate learnings to stakeholders (Friday deck)

### Contingency Plans
| Issue | Plan |
|-------|------|
| Engagement rate drops | Reduce quiz length; increase reward value; improve question copy |
| Download CTR drops | Add urgency messaging (countdown timer); test higher reward |
| API timeouts | Implement caching; upgrade infrastructure; use async fallback |
| High WhatsApp blocks | Reduce message frequency; remove aggressive emoji; review copy |
| Low retention post-install | Work with onboarding team; ensure reward redemption flow is frictionless |

---

## Ongoing (Weeks 5+)

### Maintenance
- [ ] Monitor dashboards daily (15 min standup)
- [ ] Respond to performance alerts within 1 hour
- [ ] Weekly optimization review (Fridays)
- [ ] Monthly full performance review + stakeholder deck

### Scaling
- [ ] Expand to new states/languages if performing well
- [ ] Test new reward types (exclusive products, loyalty points, etc.)
- [ ] Test new quiz formats (video, image-based, higher engagement)
- [ ] Explore integration with loyalty programs (G2N, referrals)

### Profitability Analysis
- [ ] CPI vs. LTV comparison (after 30 days of new user data)
- [ ] Unit economics: Ad spend → Install → DAU → Revenue
- [ ] Determine sustainable CAC & scale targets
- [ ] Plan 2026 budget based on learnings

---

## Risk Log & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WhatsApp templates not approved in time | Medium | High | Submit templates 1 week early; have fallback message copy ready |
| Low engagement rate (<20%) | Medium | High | Pre-test quiz questions; simplify to 2 questions if needed |
| High WhatsApp block rate | Low | Critical | Test messaging with internal users first; monitor closely first 48h |
| Deep link failures on iOS | Low | Medium | Prioritize iOS testing; have App Store link fallback |
| Registration check API timeout | Low | Medium | Implement 2s timeout + fallback to gamification |
| Low app install rate post-download | Medium | High | Work with app team on reward redemption flow; test deep link UX |

---

## Sign-Off Checklist (Launch Approval)

### Product
- [ ] Campaign flow and messaging finalized
- [ ] Success metrics agreed
- [ ] A/B test variants locked

### Engineering
- [ ] All APIs tested and load-tested
- [ ] Deep links working on iOS/Android
- [ ] Analytics tracking validated
- [ ] Infrastructure scaled for expected traffic

### Marketing
- [ ] FB ads created and approved
- [ ] Targeting audience locked in
- [ ] Budget approved
- [ ] Creative + landing experience reviewed

### Compliance / Legal
- [ ] Copy review completed
- [ ] Privacy compliance verified (phone masking, GDPR, India data laws)
- [ ] WhatsApp templates approved by Meta

### Finance
- [ ] Budget allocated (Infobip + Twilio costs, FB ad spend)
- [ ] CPI target set (₹50–₹70 per new user)
- [ ] ROI expectations documented

---

## Contact & Escalation

| Role | Name | Slack | Email |
|------|------|-------|-------|
| Campaign Owner | [Name] | @[name] | [email] |
| Product Lead | [Name] | @[name] | [email] |
| Backend Lead | [Name] | @[name] | [email] |
| WhatsApp / Infobip Vendor | [Company] | N/A | [contact] |
| Marketing Lead | [Name] | @[name] | [email] |
| Escalation (Critical Issues) | [Name] | @[name] | [email] |

---

## Deliverables Summary

### Documents
- ✓ Campaign Strategy Deck (campaign overview, flows, success metrics)
- ✓ WhatsApp Technical Spec (message templates, API integration, testing)
- ✓ Implementation Checklist (this document)
- ✓ A/B Test Plan (variants, sample size, duration)
- ✓ Analytics Dashboard (real-time metrics + alerts)

### Infrastructure
- ✓ Registration check API
- ✓ Event logging system
- ✓ Deep link handler
- ✓ Reward generation & claim flow
- ✓ WhatsApp webhook receiver

### Creative
- ✓ FB ad copy (2–3 variations)
- ✓ WhatsApp message templates (7 messages)
- ✓ Quiz questions (4–5 options per variant)
- ✓ Landing page / link preview (if needed)

### Go-Live Readiness
- ✓ All systems tested & approved
- ✓ Team trained on monitoring & escalation
- ✓ Dashboards live
- ✓ Alerts configured
- ✓ Budget allocated & approved

---

**Campaign Owner Signature:** _________________ **Date:** _______

**Marketing Lead Signature:** _________________ **Date:** _______

**Product Lead Signature:** _________________ **Date:** _______

**Engineering Lead Signature:** _________________ **Date:** _______

