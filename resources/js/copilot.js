/* ════ AI COPILOT ════ */
const vscBody    = document.querySelector('.vsc-body');
const copPanel   = document.getElementById('copilot-panel');
const copMsgs    = document.getElementById('cop-messages');
const copForm    = document.getElementById('cop-form');
const copInput   = document.getElementById('cop-input');

const COPILOT_RESPONSES = [
  {
    keys: ['about', 'who', 'rakib', 'tell'],
    text: `**Rakib** is a final-year CSE student at AUST (CGPA 3.75) who blends algorithmic precision with full-stack product development.\n\nHe's the **President** of the AUST Programming Club, a **Learnathon 3.0 Champion**, and has ranked **#122 at ICPC Dhaka Regional**. He builds everything from cross-platform mobile apps to competitive programming judges.`,
  },
  {
    keys: ['project', 'built', 'work', 'apps'],
    text: `Rakib's key projects:\n\n• **SOHOJOGI** — Flutter/Supabase household services platform (Learnathon champion project)\n• **AUST CODE REALM** — Online judge with IDE integration, PHP/MySQL\n• **HOMEHUTBD** — ASP.NET property platform with ML-powered pricing\n• **BHROMON** — AI travel assistant with GPT-4 + Google Maps\n• **IRREVOCABLE-ETERNITY** — 2D dungeon fighter in C++/OpenGL`,
  },
  {
    keys: ['stack', 'skill', 'tech', 'language', 'tool'],
    text: `**Languages:** C++ (95%), C, Python, Java, Dart, JS, C#\n\n**Mobile/Web:** Flutter, HTML/CSS, ASP.NET MVC, Bootstrap, PHP\n\n**Databases:** MySQL, Supabase, SQL Server, Firebase\n\n**Tools:** Docker, GitHub Actions, Judge0, OpenCV, Git`,
  },
  {
    keys: ['hire', 'job', 'opportunity', 'recruit', 'work with'],
    text: `Rakib is **open to new opportunities** — full-time roles, internships, and freelance collaborations.\n\nBest way to reach him:\n📧 **rakibhasan4101@gmail.com**\n💼 <a href="https://linkedin.com/in/afnanhasanrakib" target="_blank">LinkedIn</a>\n\nHe's based in Dhaka, Bangladesh and available immediately.`,
  },
  {
    keys: ['contact', 'email', 'reach', 'find'],
    text: `📧 **Email:** rakibhasan4101@gmail.com\n🐙 **GitHub:** <a href="https://github.com/afnanrakib" target="_blank">github.com/afnanrakib</a>\n💼 **LinkedIn:** <a href="https://linkedin.com/in/afnanhasanrakib" target="_blank">afnanhasanrakib</a>\n⚔️ **Codeforces:** afnanrakib\n📍 **Location:** Dhaka, Bangladesh`,
  },
  {
    keys: ['achieve', 'award', 'rank', 'contest', 'icpc', 'champion'],
    text: `🏆 **Learnathon 3.0 Champion** — Geeky Solutions, 2025\n🏆 **Intra AUST Programming Champion** — CSE Carnival 4.0, 2024\n**#35** BUBT IUCPC National (Team AUST_DEADCODER)\n**#97** AUST Inter-University PC\n**#122** ICPC Dhaka Regional (Onsite)\n🥈 Research Odyssey Runner-Up\n🎓 Academic Merit Scholarship — Top 5% of dept`,
  },
  {
    keys: ['experience', 'leader', 'club', 'president', 'role'],
    text: `Rakib holds multiple leadership positions:\n\n• **President** — AUST Programming and Informatics Club\n• **Vice President** — AUST CSE Society\n• **ACM Coordinator** — AUST CP Community\n• **Team Leader** — Learnathon 3.0 (Geeky Solutions)`,
  },
];

function copilotReply(question) {
  const q = question.toLowerCase();
  for (const entry of COPILOT_RESPONSES) {
    if (entry.keys.some(k => q.includes(k))) return entry.text;
  }
  return `I'm not sure about that specific question! Try asking about:\n\n• **Projects** Rakib has built\n• His **Tech Stack**\n• **Achievements & Rankings**\n• **Experience** & leadership\n• How to **hire** or **contact** him`;
}

function addCopMsg(text, role = 'ai') {
  const msg = document.createElement('div');
  msg.className = `cop-msg cop-msg-${role}`;
  const avatar = document.createElement('div');
  avatar.className = 'cop-avatar';
  avatar.innerHTML = role === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
  const bubble = document.createElement('div');
  bubble.className = 'cop-bubble';
  bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  copMsgs.appendChild(msg);
  copMsgs.scrollTop = copMsgs.scrollHeight;
}

function sendCopilotMsg(question) {
  if (!question.trim()) return;
  addCopMsg(question, 'user');
  copInput.value = '';

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'cop-msg cop-msg-ai';
  typing.innerHTML = '<div class="cop-avatar"><i class="fas fa-robot"></i></div><div class="cop-bubble cop-typing"><span></span><span></span><span></span></div>';
  copMsgs.appendChild(typing);
  copMsgs.scrollTop = copMsgs.scrollHeight;

  setTimeout(() => {
    typing.remove();
    addCopMsg(copilotReply(question), 'ai');
  }, 700 + Math.random() * 400);
}

copForm?.addEventListener('submit', e => {
  e.preventDefault();
  sendCopilotMsg(copInput.value.trim());
});

document.querySelectorAll('.cop-chip').forEach(chip => {
  chip.addEventListener('click', () => sendCopilotMsg(chip.dataset.q));
});

document.getElementById('cop-close')?.addEventListener('click', () => {
  vscBody.classList.remove('copilot-open');
  copPanel.classList.add('hidden');
});
document.getElementById('ab-copilot')?.addEventListener('click', toggleCopilot);

function toggleCopilot() {
  const open = vscBody.classList.toggle('copilot-open');
  copPanel.classList.toggle('hidden', !open);
  if (open) {
    document.getElementById('ab-copilot').classList.add('active');
    copInput.focus();
  } else {
    document.getElementById('ab-copilot').classList.remove('active');
  }
}
