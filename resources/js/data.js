/* ─── Files ─── */
const FILES = [
  { id: 'home',         label: 'home.html',              dot: 'html', ft: 'HTML'            },
  { id: 'about',        label: 'about.md',               dot: 'md',   ft: 'Markdown'        },
  { id: 'projects',     label: 'projects.js',            dot: 'js',   ft: 'JavaScript'      },
  { id: 'experience',   label: 'experience.html',        dot: 'html', ft: 'HTML'            },
  { id: 'achievements', label: 'achievements.md',        dot: 'md',   ft: 'Markdown'        },
  { id: 'skills',       label: 'skills.css',             dot: 'css',  ft: 'CSS'             },
  { id: 'contact',      label: 'contact.html',           dot: 'html', ft: 'HTML'            },
  { id: 'settings',     label: '.vscode/settings.json',  dot: 'json', ft: 'JSON'            },
  { id: 'photo',        label: 'Md. Rakib Hasan.png',    dot: 'png',  ft: 'PNG Image'       },
  { id: 'cv',           label: 'Md. Rakib Hasan.pdf',    dot: 'pdf',  ft: 'PDF'             },
];

/* ─── Themes ─── */
const THEMES = {
  'dark-default': { label: 'Dark Default (Indigo)', color: '#818cf8' },
  'tokyo-night':  { label: 'Tokyo Night',           color: '#7aa2f7' },
  'catppuccin':   { label: 'Catppuccin Mocha',      color: '#cba6f7' },
  'nord':         { label: 'Nord',                  color: '#88c0d0' },
  'vscode-light': { label: 'VS Code Light',          color: '#0078d4' },
  'dracula':      { label: 'Dracula',               color: '#bd93f9' },
  'solarized-light': { label: 'Solarized Light',      color: '#cb4b16' },
};

/* ─── Searchable index ─── */
const SEARCH_DATA = [
  { file: 'home',         text: 'Md. Rakib Hasan software developer competitive programmer technical leader AUST Bangladesh' },
  { file: 'about',        text: 'about background CSE CGPA 3.75 Ahsanullah University SOHOJOGI AUST CODE REALM HOMEHUTBD' },
  { file: 'projects',     text: 'SOHOJOGI Flutter Supabase AUST CODE REALM PHP MySQL HOMEHUTBD ASP.NET BHROMON Google Maps IRREVOCABLE-ETERNITY OpenGL Java JavaFX CODE REALM' },
  { file: 'experience',   text: 'president vice president AUST programming club CSE society CP community Geeky Solutions learnathon leader' },
  { file: 'achievements', text: 'champion learnathon ICPC #122 BUBT IUCPC #35 AUST inter-university #97 rank merit scholarship academic award runner-up research odyssey' },
  { file: 'skills',       text: 'C++ C Python Java Dart JavaScript C# Flutter HTML CSS ASP.NET MySQL Supabase Docker Firebase GitHub Actions computer vision machine learning' },
  { file: 'contact',      text: 'email github linkedin codeforces leetcode atcoder discord contact rakibhasan4101@gmail.com' },
  { file: 'settings',     text: 'settings theme editor font JetBrains Mono configuration vscode' },
  { file: 'photo',        text: 'photo portrait image png Md. Rakib Hasan' },
  { file: 'cv',           text: 'CV resume PDF download Md. Rakib Hasan curriculum vitae' },
];
