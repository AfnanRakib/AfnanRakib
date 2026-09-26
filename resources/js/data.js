/* ─── Brand mark (RAKIB wordmark, recolored dynamically per theme) ─── */
const LOGO_VIEWBOX = '33 33 727 727';
const LOGO_PATH_D = 'M 137 500 L 100 524 L 66 501 L 66 686 L 137 686 Z M 324 499 L 325 686 L 395 686 L 395 500 L 363 523 L 359 524 Z M 286 466 L 244 495 L 238 494 L 209 481 L 175 468 L 176 686 L 286 686 Z M 213 244 L 208 245 L 143 289 L 142 291 L 186 308 L 196 313 L 211 318 L 215 321 L 215 414 L 218 413 L 285 368 L 285 272 L 253 260 L 218 245 Z M 350 235 L 338 238 L 288 272 L 296 275 L 308 282 L 317 292 L 322 304 L 324 315 L 321 375 L 306 369 L 303 369 L 300 372 L 216 427 L 215 471 L 243 482 L 286 453 L 288 413 L 322 427 L 324 429 L 325 487 L 344 499 L 357 509 L 362 510 L 395 486 L 395 281 L 391 265 L 382 250 L 372 241 L 364 237 Z M 578 108 L 575 109 L 470 180 L 470 291 L 466 295 L 407 334 L 406 347 L 470 406 L 470 686 L 543 686 L 544 275 L 577 288 L 581 291 L 581 685 L 688 615 L 727 588 L 727 345 L 723 331 L 716 323 L 707 318 L 684 310 L 682 308 L 688 303 L 724 280 L 724 217 L 650 187 L 580 235 L 654 265 L 687 245 L 689 253 L 690 291 L 685 304 L 679 310 L 623 347 L 667 365 L 683 370 L 686 373 L 690 382 L 692 396 L 693 428 L 691 441 L 688 448 L 681 455 L 651 474 L 633 487 L 616 496 L 616 267 L 603 274 L 583 288 L 579 288 L 580 287 L 578 249 Z M 543 504 L 508 527 L 505 527 L 494 523 L 489 520 L 472 514 L 470 512 L 473 509 L 508 488 L 530 498 L 538 500 L 542 502 Z M 504 284 L 508 284 L 507 361 L 463 321 L 459 314 L 465 311 Z M 578 235 L 574 239 L 508 283 L 506 280 L 508 205 Z M 432 107 L 361 155 L 361 226 L 371 228 L 384 235 L 394 245 L 401 257 L 405 272 L 406 317 L 432 300 Z M 210 108 L 205 109 L 141 152 L 137 152 L 137 107 L 66 155 L 66 487 L 99 510 L 102 510 L 137 486 L 138 153 L 212 185 L 212 241 L 214 241 L 217 238 L 283 196 L 283 137 L 268 132 Z';

function brandMarkSvg(fill) {
  return `<svg class="brand-mark" viewBox="${LOGO_VIEWBOX}" role="img" aria-label="Rakib"><path d="${LOGO_PATH_D}" fill="${fill}" fill-rule="evenodd"/></svg>`;
}

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
  { file: 'home',         text: 'Md. Rakib Hasan junior software engineer DSI competitive programmer technical leader AUST Bangladesh' },
  { file: 'about',        text: 'about background CSE CGPA 3.772 Ahsanullah University Dynamic Solutions Innovators DSI SOHOJOGI AUST CODE REALM HOMEHUTBD' },
  { file: 'projects',     text: 'SOHOJOGI Flutter Supabase AUST CODE REALM PHP MySQL HOMEHUTBD ASP.NET BHROMON Google Maps IRREVOCABLE-ETERNITY OpenGL Java JavaFX CODE REALM' },
  { file: 'experience',   text: 'Dynamic Solutions Innovators DSI junior software engineer president vice president AUST programming club CSE society CP community Geeky Solutions learnathon leader' },
  { file: 'achievements', text: 'champion learnathon ICPC top 7% BUBT IUCPC #35 AUST inter-university #97 rank merit scholarship academic award runner-up research odyssey' },
  { file: 'skills',       text: 'C++ C Python Java Dart JavaScript C# Flutter HTML CSS ASP.NET Spring Boot JavaFX Perl Shell Linux MySQL Supabase Docker Firebase GitHub Actions computer vision machine learning' },
  { file: 'contact',      text: 'email github linkedin codeforces leetcode atcoder discord contact rakibhasan4101@gmail.com' },
  { file: 'settings',     text: 'settings theme editor font JetBrains Mono configuration vscode' },
  { file: 'photo',        text: 'photo portrait image png Md. Rakib Hasan' },
  { file: 'cv',           text: 'CV resume PDF download Md. Rakib Hasan curriculum vitae' },
];
