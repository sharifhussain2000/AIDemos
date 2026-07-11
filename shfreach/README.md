# 🌾 FarmRise WhatsApp Quiz Campaign

## Overview

An interactive, gamified Facebook → WhatsApp → Quiz flow that demonstrates how FarmRise engages both new and existing users with personalized experiences. This is a **frontend prototype** showcasing the user journey and conversion mechanics.

### 🎯 Campaign Strategy

**Single Facebook Banner** → Both new and existing users click the same ad  
**WhatsApp Registration Check** → Backend identifies if user is registered or not  
**Two Personalized Flows** → Branching experiences based on user status

---

## 📋 Features

### ✨ Gamification Elements
- 🎮 **3-Question Quiz** with fun farming trivia
- ⚡ **Progress Indicators** showing quiz advancement
- 🎯 **Instant Feedback** with emoji reactions
- 🏆 **Score Board** displaying final performance
- 🔥 **Streak Tracking** for consecutive correct answers
- 🎉 **Confetti Animation** on quiz completion

### 👥 User Flows

#### New User Path
1. User clicks Facebook banner
2. Opens WhatsApp with pre-filled message "Hi"
3. Bot greets them & explains quiz rules
4. Answer 3 agri questions with options
5. Get instant reactions & progress feedback
6. Unlock ₹100 reward
7. Download app CTA to claim reward

#### Existing User Path
1. User clicks same Facebook banner
2. Opens WhatsApp with pre-filled message "Hi"
3. Bot recognizes them (no quiz needed!)
4. Instant VIP welcome message
5. Unlock ₹100 bonus (no effort)
6. Download/Open app CTA to claim reward

### 📊 Engagement Metrics
- **Engagement Threshold:** 3+ clicks (one per quiz question)
- **Download CTA Clicks:** After quiz/reward unlock
- **App Install Tracking:** Post-download attribution

---

## 🚀 Quick Start

### Option 1: Open HTML File
```bash
# Simply open index.html in any web browser
open index.html
```

### Option 2: Run with Python (Local Server)
```bash
# Python 3
python -m http.server 8000

# Then visit: http://localhost:8000
```

### Option 3: Run with Node.js (http-server)
```bash
npm install -g http-server
http-server

# Then visit: http://localhost:8080
```

---

## 📁 Project Structure

```
FarmRise-WhatsApp-Quiz-Campaign/
├── index.html              # Main UI (HTML + CSS)
├── js/
│   └── app.js             # Application logic & interactions
├── README.md              # This file
└── CAMPAIGN-STRATEGY.md   # Detailed campaign strategy doc
```

### File Details

**index.html**
- Complete HTML markup with embedded CSS
- Two-column demo grid (New User Left, Existing User Right)
- Facebook banner at top (same for both)
- All styling included

**js/app.js**
- Quiz data and questions
- Message flow logic
- Reaction & feedback system
- Confetti animation
- Stage navigation

---

## 🎮 How to Use

### Starting the Demo

1. **Click "Join Challenge on WhatsApp"** on the Facebook banner
2. Two flows start automatically on left and right columns
3. **New User Flow (LEFT - Green):**
   - Click/type "Hi" to send greeting
   - Bot responds with welcome message
   - Answer 3 quiz questions by clicking option buttons
   - See instant reactions after each answer
   - Receive final score & confetti animation
   - See download app CTA

4. **Existing User Flow (RIGHT - Dark):**
   - Click/type "Hi" to send greeting
   - Bot recognizes you instantly
   - No quiz needed
   - Receive VIP welcome message
   - See open app CTA

### Navigation Controls

At the bottom of each flow section:
- **Welcome** → First message stage
- **Quiz** → Quiz questions (new users only)
- **Reward** / **Recognition** → Final screen
- **Reset** → Restart the flow

---

## ✏️ Customization Guide

### Change Quiz Questions

Edit `js/app.js`, update the `QUIZ` array:

```javascript
const QUIZ = [
    {
        q: "Your Question Here?",
        options: [
            { text: "Option A", emoji: "🌾" },
            { text: "Option B", emoji: "🌽" },
            { text: "Option C", emoji: "🌸" }
        ],
        reactions: ["Reaction 1", "Reaction 2"],
        hint: "Optional hint text"
    }
];
```

### Change Reward Amount

In `js/app.js`, look for `₹100` and replace with desired amount:

```javascript
// Example: Change to ₹250
addMessage('newUserRewardMessages', 'received', `💰 ₹250 Reward Unlocked!`);
```

### Customize Colors

In `index.html`, update CSS variables:

```css
/* For Bayer brand colors */
background: linear-gradient(135deg, #1a472a 0%, #2d6e48 100%);
/* #1a472a = Bayer Green Dark
   #2d6e48 = Bayer Green Light */
```

### Add More Questions

Simply add more objects to the `QUIZ` array in `js/app.js`. The progress bar will auto-adjust.

### Modify Messages

Search for `addMessage()` calls in `js/app.js` and update the text parameter:

```javascript
addMessage('newUserMessages', 'received', 'Your new message here');
```

---

## 🔌 Backend Integration Points

This is a **frontend prototype**. To make it production-ready, integrate these backend APIs:

### 1. User Registration Check
```javascript
// When user sends "Hi" on WhatsApp
GET /api/v1/user/registration-check?phone={phone}
Response: { registered: true/false }
```

### 2. Click Event Tracking
```javascript
// After each quiz answer
POST /api/v1/whatsapp-campaign/track-event
Body: {
    phone: "{masked}",
    event_type: "quiz_question_answered",
    click_sequence: ["start", "q1", "q2", "q3"],
    engagement_threshold_met: true
}
```

### 3. Reward Redemption
```javascript
// When user claims reward
POST /api/v1/rewards/claim
Body: { phone, reward_code, campaign_id }
```

---

## 📊 Analytics Dashboard

This demo includes fake metrics. To connect real data:

1. Set up **Datadog** or **Mixpanel** tracking
2. Log events with campaign ID: `fb_whatsapp_gamif`
3. Track funnel:
   - FB Click → WhatsApp Entry
   - WhatsApp Entry → 3+ Engagement
   - Engagement → Download CTA Click
   - Download → App Install (via AppsFlyer)

---

## 🚢 Deployment

### Deploy to GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/FarmRise-WhatsApp-Quiz-Campaign.git
git push -u origin main

# Enable GitHub Pages in repository settings
# Your demo will be live at: https://YOUR_USERNAME.github.io/FarmRise-WhatsApp-Quiz-Campaign
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow the prompts
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

---

## 🎯 Success Metrics

### New Users
- Engagement Rate: 35-45% (3+ clicks)
- Download CTR: 25-35%
- App Install Rate: 60-75% (of download clicks)
- Cost Per Install: ₹50-70

### Existing Users
- Recognition Rate: 85%+
- Open App Rate: 85%+
- Redemption Rate: 70%+

---

## 🔒 Privacy & Compliance

- ✅ Phone numbers are masked in logs
- ✅ No personal data stored in frontend
- ✅ GDPR compliant (WhatsApp opt-in)
- ✅ India data privacy compliant

---

## 🐛 Known Limitations

This is a **frontend demo only**. Missing in this prototype:

- No backend API integration
- No real phone number validation
- No actual WhatsApp Message API
- No real app install tracking
- No persistent data storage
- No user authentication

---

## 📚 Documentation Files

Included in this repository:
- **README.md** (this file) - Quick start guide
- **CAMPAIGN-STRATEGY.md** - Detailed campaign strategy, flows, and technical specs
- **IMPLEMENTATION-CHECKLIST.md** - Week-by-week implementation roadmap

---

## 🤝 Contributing

Feel free to fork, modify, and customize for your own campaigns!

### Suggestions for Enhancement
- [ ] Add A/B test variants (different reward values)
- [ ] Add language localization (Hindi, Marathi, etc.)
- [ ] Add more quiz categories
- [ ] Create admin dashboard to manage quiz questions
- [ ] Add real WhatsApp webhook integration

---

## 📞 Support & Questions

For questions or customization requests, refer to:
1. **CAMPAIGN-STRATEGY.md** - Overall strategy & flow architecture
2. **IMPLEMENTATION-CHECKLIST.md** - Technical implementation details
3. Code comments in `js/app.js`

---

## 📄 License

This project is created for FarmRise by Bayer CropScience India.

---

## 🌾 About FarmRise

FarmRise is Bayer's Direct-to-Farmer (D2F) digital platform connecting farmers with:
- Agricultural products & market insights
- Digital services & financing
- Community & support

Learn more: https://www.farmrise.in

---

**Version:** 1.0  
**Last Updated:** July 2026  
**Created for:** Bayer CropScience India D2F Digital Team
