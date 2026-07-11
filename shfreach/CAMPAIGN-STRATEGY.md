# FarmRise Non-Registered User Acquisition Campaign
## FB → WhatsApp → Gamified Onboarding Flow

---

## Campaign Overview

**Objective:** Acquire non-FarmRise users through a gamified experience, measuring engagement as 3+ clicks.

**Channel Stack:**
- Facebook/Instagram ads → WhatsApp link → WhatsApp flow → App download

**Target Audience:** Non-FarmRise app users (agri-interested, but not yet on platform)

**Primary KPI:** 3+ clicks (engagement threshold) → App installs (conversion)

---

## Campaign Flow Architecture

```
FB Ad Click
    ↓
WhatsApp Redirect (Infobip/Twilio)
    ↓
User Entry Point (Welcome Message)
    ↓
    ├─ [Check] Is User FarmRise Registered?
    │
    ├─→ YES: Show "Already on FarmRise" Flow
    │   └─ Display Open App CTA
    │   └─ Log as Existing User (1 click)
    │
    ├─→ NO: Show Gamification Flow
    │   ├─ Question 1 (agri-related) → Click 1
    │   ├─ Question 2 (agri-related) → Click 2
    │   ├─ Question 3 (agri-related) → Click 3 ✓ ENGAGEMENT THRESHOLD
    │   └─ Reward Unlock → Download App CTA
    │       └─ Log as New User → App Install (Conversion)
    │
    └─ Fallback: Exit to FAQ / Support
```

---

## Detailed Flows

### Flow A: Existing FarmRise User Path

**Trigger:** User clicks FB ad → Redirected to WhatsApp

**Messages:**

```
1. Welcome [CLICK 1]
   "Hey Farmer! 👋 Welcome to FarmRise rewards.
   
   We detected you're already using FarmRise.
   Tap below to open the app and claim your exclusive reward!"
   
   CTA: [Open FarmRise App]
   
2. Thank You
   "Great! You'll earn ₹X reward credits.
   Check your FarmRise app now."
```

**Engagement Metric:** 1 click (opens app)  
**Secondary Outcome:** DAU lift, in-app reward redemption

---

### Flow B: Non-Registered User Gamification Path

**Trigger:** User clicks FB ad → Redirected to WhatsApp → User is NOT on FarmRise

**Stage 1: Welcome + Opt-in**

```
Message 1 [CLICK 1]
"🌾 Welcome to FarmRise Quiz Challenge! 
Answer 3 quick agri questions and claim your reward.

Tap 'Start' to begin!"

CTA: [Start Quiz] or [Skip]
```

**Stage 2: Quiz Questions (3 questions)**

Each question should:
- Be agri-relevant (crop care, pest management, fertiliser, yields, market prices)
- Have 2–3 button options (quick-reply buttons in WhatsApp)
- Feel achievable (not gatekeeping based on right answers — gamification, not filtering)
- Drive 1 click per question

```
Message 2 [CLICK 2]
"Question 1/3: 🌽 Which crop needs the most water during summer?

A. Wheat
B. Corn
C. Cotton"

CTA: [A] [B] [C]
```

```
Message 3 [CLICK 3]
"Question 2/3: 🐛 What's the best way to prevent armyworm in your field?

A. Neem spray
B. Chemical pesticide
C. Both (based on severity)"

CTA: [A] [B] [C]
```

```
Message 4 [CLICK 3]
"Question 3/3: 💰 Where do farmers typically get best prices?

A. Local mandis
B. Direct buyer networks
C. FarmRise (obviously! 😉)"

CTA: [A] [B] [C]
```

---

## Stage 3: Reward Unlock + Download CTA

```
Message 5 [ENGAGEMENT THRESHOLD MET]
"🎉 Quiz Complete! You've unlocked ₹100 reward credit!

Download FarmRise now to claim it and start earning more."

CTA: [Download FarmRise App]

Subtext: "Available on iOS & Android. Your reward expires in 7 days."
```

**Optional:** Follow-up if user doesn't click download within 2 hours:

```
Message 6 (Retry)
"Don't miss out! Your ₹100 reward is waiting.

Tap below to download FarmRise and claim it instantly."

CTA: [Download Now]
```

---

## Technical Implementation

### 1. **User Registration Check**

**Method:** Query FarmRise backend using phone number extracted from WhatsApp

**Pseudocode:**
```
phone = extract_from_whatsapp_profile()
is_registered = query_farmrise_api(phone)

if is_registered:
  route_to_flow(existing_user_flow)
else:
  route_to_flow(gamification_flow)
```

**Touchpoint:** Immediately after WhatsApp entry (within first message)

---

### 2. **Click Tracking & Attribution**

**Track:**
- Click 1: First interaction (quiz start or existing user button)
- Click 2: Second question answered
- Click 3: Third question answered (ENGAGEMENT threshold)
- Click 4: App download CTA tapped
- Final: App install (via deep link or attribution partner like AppsFlyer)

**Tool:** Infobip Conversations API or Twilio Flex with custom click tracking

**Data Warehouse:** Send events to FarmRise analytics (Datadog/Mixpanel) with schema:

```json
{
  "event": "whatsapp_interaction",
  "phone": "masked_phone",
  "flow_type": "gamification|existing_user",
  "click_sequence": ["start_quiz", "q1_answered", "q2_answered", "q3_answered", "download_cta"],
  "engagement_threshold_met": true,
  "timestamp": "2026-07-10T12:34:56Z",
  "source": "facebook_campaign_xyz"
}
```

---

### 3. **App Download Deep Linking**

**Structure:**
```
farmrise://onboarding?campaign=fb_whatsapp_gamif&phone=<phone>&reward_code=<code>
```

**Fallback:** Play Store / App Store link with UTM parameters

**App Logic:**
- Detect user came from campaign
- Auto-populate phone (skip entry screen)
- Show reward banner on onboarding
- Claim reward flow → incentivize app exploration

---

## Messaging & Tone Guidelines

| Element | Approach |
|---------|----------|
| **Agri Questions** | Farmer-friendly, practical (not overly technical); reflect real field challenges |
| **Gamification Language** | Use 🌾🎉🎯 emojis; "Quiz Challenge," "Reward Unlock," "Claim Now" |
| **Reward Value** | ₹100 is anchor (test ₹75, ₹100, ₹150); redeemable on first app transaction |
| **CTA Clarity** | Single, obvious next step per message; avoid choice paralysis |
| **Response Time** | Aim for <10 seconds between questions (auto-advance or user-triggered) |

---

## Campaign Variants & Testing

### A/B Test Matrix

| Variable | Variant A | Variant B | Variant C |
|----------|-----------|-----------|-----------|
| **Reward Value** | ₹75 | ₹100 | ₹150 |
| **Quiz Length** | 2 questions | 3 questions | 4 questions |
| **Question Difficulty** | Easy (higher avg. engagement) | Medium | Hard (filter-heavy) |
| **CTA Text** | "Download App" | "Claim Reward" | "Join FarmRise" |
| **Emoji Density** | Low | Medium | High |

**Recommendation:** Start with ₹100 / 3 questions / Medium difficulty / "Claim Reward" as control.

---

## Success Metrics & Dashboards

### Primary Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| **Engagement Rate** (3+ clicks) | 35–45% | % of WhatsApp entries hitting threshold |
| **Download Rate** | 25–35% | % of engaged users who click download |
| **Install Rate** | 60–75% (of downloads clicked) | Post-click app installs (via AppsFlyer) |
| **Conversion Rate** (FB → Install) | 5–10% | Blended (existing + new users) |

### Secondary Metrics

| Metric | Notes |
|--------|-------|
| **Reward Redemption Rate** | % of new users redeeming ₹ on FarmRise (shows quality) |
| **Day 7 Retention** | % still active on app 7 days post-install |
| **Cost Per Install** | FB ad spend / total installs |
| **Cost Per Engaged User** | FB ad spend / users hitting 3+ clicks |

### Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ FB → WhatsApp → App Install Funnel                  │
├─────────────────────────────────────────────────────┤
│                                                       │
│ FB Clicks → 10,000                                  │
│     ↓ 80% → WhatsApp Entry: 8,000                   │
│     ↓ 45% → 3+ Clicks (Engagement): 3,600 ✓         │
│     ↓ 30% → Download CTA Click: 1,080               │
│     ↓ 70% → App Install (post-click): 756           │
│                                                       │
│ Overall Conversion: 7.56% | CPI: ₹45 (example)     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## Risk Mitigation & Edge Cases

### Issue: User Registration Check Fails

**Mitigation:**
- Default to gamification flow (safer assumption)
- Log error + fallback phone to manual review queue
- Retry check after question 1 (async)

### Issue: Low Click-Through on Download CTA

**Mitigation:**
- Add countdown timer ("Reward expires in 2 hours")
- Retry message after 2–6 hours with urgency framing
- A/B test reward value (higher = higher CTA click)
- Test CTA placement (inline vs. separate message)

### Issue: High Abandonment Between Questions

**Mitigation:**
- Shorten quiz (test 2 questions instead of 3)
- Use multiple-choice buttons (faster than typing)
- Add progress bar ("2/3 complete")
- Motivational message after Q2 ("Almost there!")

### Issue: User Switches to Different WhatsApp Number

**Mitigation:**
- No single-phone attribution lock; allow re-entry
- Track by both phone + WhatsApp ID (backend)
- Deduplicate installs via AppsFlyer fingerprinting

---

## Implementation Timeline

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **Design & Testing** | Week 1 | Flow diagrams, message copy, A/B matrix |
| **Backend Setup** | Week 2–3 | User check API, click tracking, deep links |
| **WhatsApp Config** | Week 2–3 | Infobip/Twilio templates, auto-responses |
| **FB Campaign Setup** | Week 3 | Ad creative, landing page, audience targeting |
| **QA & Dry Run** | Week 4 | End-to-end testing, internal user validation |
| **Launch** | Week 5 | Soft launch (low budget) → Scaling based on metrics |

---

## Success Criteria & Go/No-Go Gates

**Go Decision Criteria:**

- ✓ Engagement rate ≥ 30% (3+ clicks)
- ✓ Download rate ≥ 20% (of engaged)
- ✓ CPI ≤ ₹60 (for non-registered users)
- ✓ Day 7 retention ≥ 15% (new installs)

**No-Go / Pause Criteria:**

- ✗ Engagement rate < 15% → Simplify quiz (2 questions)
- ✗ Download rate < 10% → Increase reward value or add urgency
- ✗ CPI > ₹100 → Pause campaign, audit audience targeting
- ✗ High block/report rate on WhatsApp → Reduce message frequency

---

## Appendix: Sample Message Copy

### Variant: High Urgency + Emoji-Dense

```
Message 1
"🌾 QUICK CHALLENGE: Answer 3 agri Qs, WIN ₹100! ⏰

Tap START → Answer → CLAIM 🎉

Only today! 👇"

CTA: [Start Quiz]
```

### Variant: Minimal / Professional

```
Message 1
"Hi! We have a quick 2-minute quiz about farming. 
Answer 3 questions and earn ₹100 in FarmRise credits.

Ready to start?"

CTA: [Yes, Start] [Maybe Later]
```

### Variant: Testimonial + Social Proof

```
Message 1
"⭐ 50K+ farmers already joined FarmRise.

Take our quick quiz (2 min), earn ₹100, and see why!

START →"

CTA: [Take Quiz]
```

---

## Next Steps

1. **Finalize message copy** with your comms team
2. **Design WhatsApp flow** in Infobip / Twilio (template review)
3. **Develop user-check API** with backend (phone → registration status)
4. **Set up click tracking** & analytics forwarding
5. **Create FB ad creative** (1–3 asset variants)
6. **Run soft launch** (₹5–10K budget, 3–5 days) → Analyze engagement
7. **Iterate & scale** based on performance data

