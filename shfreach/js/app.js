// ===== QUIZ DATA WITH PERSONALITY =====
const QUIZ = [
    {
        q: "🌽 Which crop needs the most water during summer?",
        options: [
            { text: "Wheat", emoji: "🌾" },
            { text: "Corn", emoji: "🌽" },
            { text: "Cotton", emoji: "🌸" }
        ],
        reactions: ["🌽 Corn power!", "💧 Great choice!"],
        hint: "Think tropical! 🌴"
    },
    {
        q: "🐛 What's the best way to prevent armyworm?",
        options: [
            { text: "Neem spray", emoji: "🌿" },
            { text: "Chemical pesticide", emoji: "🧪" },
            { text: "Both (based on severity)", emoji: "⚖️" }
        ],
        reactions: ["🧠 Smart thinking!", "🌿 Natural choice!"],
        hint: "Mix & match approach works best 🎯"
    },
    {
        q: "💰 Where do farmers get the BEST prices?",
        options: [
            { text: "Local mandis", emoji: "🏪" },
            { text: "Direct buyers", emoji: "🤝" },
            { text: "FarmRise (obviously! 😉)", emoji: "⭐" }
        ],
        reactions: ["😎 You know us!", "🏆 Smart farmer!", "💡 Wise choice!"],
        hint: "Hint: You're using it right now! 😉"
    }
];

const REACTIONS = {
    correct: ["✅ Nailed it!", "🎯 Bullseye!", "🔥 You're on fire!", "💪 Strong answer!", "🌟 Perfect!"],
    quick: ["⚡ Lightning fast!", "🚀 Super quick!"],
    final: ["🏆 Champion!", "👑 Legend!", "🎖️ Hall of fame!"]
};

const PHONE_NUMBERS = ["+91 98765 43210", "+91 97654 32109", "+91 96543 21098"];

let newUserQuizProgress = 0;
let newUserAnswers = [];
let newUserScore = 0;
let newUserStreak = 0;

// ===== HELPER FUNCTIONS =====
function showBothFlows() {
    initNewUserFlow();
    initExistingUserFlow();
    setTimeout(() => {
        document.querySelector('.demo-grid').scrollIntoView({ behavior: 'smooth' });
    }, 300);
}

function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
}

function addMessage(containerId, type, text, isReaction = false) {
    const msgs = document.getElementById(containerId);
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    
    const time = getCurrentTime();
    const content = isReaction ? 
        `<div class="emoji-reaction">${text}</div>` :
        `<div class="message-bubble">${text}</div>`;
    
    msg.innerHTML = `
        <div style="display: flex; flex-direction: ${type === 'sent' ? 'row-reverse' : 'row'}; align-items: flex-end; gap: 8px; width: 100%;">
            ${content}
            <div class="message-time" style="${type === 'sent' ? 'margin-right: auto;' : 'margin-left: auto;'}">${time}</div>
        </div>
    `;
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;
}

function createConfetti() {
    for (let i = 0; i < 15; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.textContent = ['🎉', '🎊', '🏆', '⭐', '💰', '🌾'][Math.floor(Math.random() * 6)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        confetti.style.fontSize = '20px';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 1000);
    }
}

// ===== NEW USER FLOW =====
function initNewUserFlow() {
    const msgs = document.getElementById('newUserMessages');
    msgs.innerHTML = '';
    newUserQuizProgress = 0;
    newUserAnswers = [];
    newUserScore = 0;
    newUserStreak = 0;
    
    addMessage('newUserMessages', 'sent', 'Hi');
    
    setTimeout(() => {
        addMessage('newUserMessages', 'received', `🎮 Hey Farmer! Welcome to FarmRise Quiz Challenge! 🌾\n\nI'm Quiz Bot 🤖 and I've got 3 FUN questions for you!\n\n✨ Each right answer = 1 point\n⚡ Answer quick = bonus streak\n🏆 Get 3/3 = ₹100 reward!\n\nReady to prove you're a farming expert? Let's go! 🚀`);
        
        setTimeout(() => {
            document.getElementById('newUserInput').disabled = true;
            document.getElementById('newUserSendBtn').disabled = true;
            
            setTimeout(() => {
                showNewUserStage(1);
                displayNewUserQuizQuestion();
            }, 600);
        }, 1200);
    }, 600);
}

function displayNewUserQuizQuestion() {
    const quizMsgs = document.getElementById('newUserQuizMessages');
    
    if (newUserQuizProgress === 0) {
        quizMsgs.innerHTML = '';
    }

    const quiz = QUIZ[newUserQuizProgress];
    const progress = newUserQuizProgress + 1;
    const totalQuestions = QUIZ.length;

    // Progress bar
    const progressDiv = document.createElement('div');
    progressDiv.style.marginTop = '12px';
    progressDiv.innerHTML = `<div class="progress-bar">
        ${Array.from({length: totalQuestions}, (_, i) => 
            `<div class="progress-dot ${i < progress ? 'active' : ''}"></div>`
        ).join('')}
    </div>`;

    // Question
    addMessage('newUserQuizMessages', 'received', `<strong>Question ${progress}/${totalQuestions}</strong>\n\n${quiz.q}`);
    
    setTimeout(() => {
        const optionsDiv = document.createElement('div');
        optionsDiv.style.marginTop = '12px';
        quiz.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = `${opt.emoji} ${String.fromCharCode(65 + idx)}) ${opt.text}`;
            btn.onclick = () => handleNewUserAnswer(idx, opt.text);
            optionsDiv.appendChild(btn);
        });
        
        const msgs = document.getElementById('newUserQuizMessages');
        msgs.appendChild(progressDiv);
        msgs.appendChild(optionsDiv);
        msgs.scrollTop = msgs.scrollHeight;
    }, 400);
}

function handleNewUserAnswer(idx, answer) {
    newUserAnswers.push(answer);
    newUserScore += 10;
    newUserStreak += 1;
    
    // Show selected answer as message
    addMessage('newUserQuizMessages', 'sent', `${QUIZ[newUserQuizProgress].options[idx].emoji} ${answer}`);
    
    // Reaction
    const reactions = REACTIONS.quick;
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    setTimeout(() => {
        addMessage('newUserQuizMessages', 'received', reaction, true);
    }, 300);
    
    setTimeout(() => {
        if (newUserQuizProgress < QUIZ.length - 1) {
            const nextReaction = QUIZ[newUserQuizProgress].reactions[Math.floor(Math.random() * QUIZ[newUserQuizProgress].reactions.length)];
            addMessage('newUserQuizMessages', 'received', nextReaction);
            newUserQuizProgress++;
            
            setTimeout(() => {
                // Clear options
                const quizMsgs = document.getElementById('newUserQuizMessages');
                const optionsDiv = quizMsgs.querySelector('div[style*="marginTop"]');
                if (optionsDiv) optionsDiv.remove();
                const progressDiv = quizMsgs.querySelector('.progress-bar');
                if (progressDiv) progressDiv.parentElement.remove();
                
                displayNewUserQuizQuestion();
            }, 600);
        } else {
            addMessage('newUserQuizMessages', 'received', '🎉 Quiz Complete! All answered!');
            
            setTimeout(() => {
                showNewUserStage(2);
                showNewUserReward();
            }, 800);
        }
    }, 700);
}

function showNewUserReward() {
    const rewardMsgs = document.getElementById('newUserRewardMessages');
    rewardMsgs.innerHTML = '';
    
    createConfetti();
    
    addMessage('newUserRewardMessages', 'received', `🎉🎉🎉 BOOM! YOU WON! 🎉🎉🎉\n\nCongrats, Farming Champion! 🏆\n\nYou nailed all 3 questions!`);
    
    setTimeout(() => {
        addMessage('newUserRewardMessages', 'received', `\n<div class="score-board">
            Final Score: <div class="score-value">30/30 🌟</div>
            Streak: 3 correct in a row <span class="streak">🔥 ON FIRE!</span>
        </div>`);
    }, 600);
    
    setTimeout(() => {
        addMessage('newUserRewardMessages', 'received', `💰 ₹100 Reward Unlocked!\n\n✨ Your instant reward is ready to claim!\n\n📱 Download FarmRise App NOW to claim it in seconds!`);
    }, 1200);
    
    setTimeout(() => {
        addMessage('newUserRewardMessages', 'received', `🚀 Get Started:\n1️⃣ Download the app\n2️⃣ Sign up with this chat\n3️⃣ Claim ₹100 instantly!\n\n⏱️ Valid for 7 days only!`);
    }, 1800);
}

function sendNewUserMessage() {
    const input = document.getElementById('newUserInput');
    if (input.value.trim()) {
        addMessage('newUserMessages', 'sent', input.value);
        input.value = '';
    }
}

function showNewUserStage(num) {
    ['newUserStage1', 'newUserStage2', 'newUserStage3'].forEach((id, i) => {
        document.getElementById(id).classList.toggle('active', i === num);
    });
}

function resetNewUser() {
    showNewUserStage(0);
    initNewUserFlow();
}

// ===== EXISTING USER FLOW =====
function initExistingUserFlow() {
    const msgs = document.getElementById('existingUserMessages');
    msgs.innerHTML = '';
    
    addMessage('existingUserMessages', 'sent', 'Hi');
    
    setTimeout(() => {
        addMessage('existingUserMessages', 'received', `👑 Hey Champion! Welcome back! 🌾\n\nI detected you're part of the FarmRise family! 🎉\n\nWe've got something SPECIAL just for loyal farmers like you...`);
        
        setTimeout(() => {
            addMessage('existingUserMessages', 'received', `💰 ₹100 Bonus Unlocked!\n\n✨ No quiz needed for members!\n✨ Instant reward for your loyalty!\n\nTap the button below to open the app and claim it NOW! 🚀`);
        }, 800);
    }, 600);
}

function sendExistingUserMessage() {
    const input = document.getElementById('existingUserInput');
    if (input.value.trim()) {
        addMessage('existingUserMessages', 'sent', input.value);
        input.value = '';
        document.getElementById('existingUserSendBtn').disabled = true;
        
        setTimeout(() => {
            showExistingUserStage(1);
            showExistingUserSuccess();
        }, 600);
    }
}

function showExistingUserSuccess() {
    const successMsgs = document.getElementById('existingUserSuccessMessages');
    successMsgs.innerHTML = '';
    
    createConfetti();
    
    addMessage('existingUserSuccessMessages', 'received', `👑 Welcome Back, Farming Legend! 👑\n\n🎖️ Member Status: ACTIVE ✅\n⭐ Loyalty Points: MAXED\n💰 Reward Ready: ₹100`);
    
    setTimeout(() => {
        addMessage('existingUserSuccessMessages', 'received', `\n<div class="score-board">
            Exclusive Member Offer
            <div class="score-value">₹100 Bonus</div>
            Instant claim • No quiz • No wait!
        </div>`);
    }, 600);
    
    setTimeout(() => {
        addMessage('existingUserSuccessMessages', 'received', `🔗 [Open FarmRise App]\n\nClaim Your Bonus in 10 Seconds!\n\n✨ Thank you for being part of our family! 🌾`);
    }, 1200);
}

function showExistingUserStage(num) {
    ['existingUserStage1', 'existingUserStage2'].forEach((id, i) => {
        document.getElementById(id).classList.toggle('active', i === num);
    });
}

function resetExistingUser() {
    showExistingUserStage(0);
    document.getElementById('existingUserInput').value = 'Hi';
    document.getElementById('existingUserSendBtn').disabled = false;
    initExistingUserFlow();
}
