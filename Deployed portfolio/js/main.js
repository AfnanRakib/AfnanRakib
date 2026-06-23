document.addEventListener("DOMContentLoaded", () => {
  const menuBtn      = document.querySelector(".menu-btn");
  const nav          = document.querySelector(".site-nav");
  const navLinks     = document.querySelectorAll(".site-nav a");
  const modeToggle   = document.querySelector(".mode-toggle");
  const backTop      = document.querySelector(".back-top");
  const progressBar  = document.querySelector(".scroll-progress");
  const railLinks    = document.querySelectorAll(".section-rail a[data-rail]");
  const focusChip    = document.getElementById("focus-chip");
  const jumpPalette  = document.getElementById("jump-palette");
  const ambientCanvas = document.getElementById("ambient-canvas");
  const matrixCanvas  = document.getElementById("matrix-canvas");
  const glitchHeadings = document.querySelectorAll(".glitch-heading");

  /* ─── MOBILE NAV ─── */
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ─── LIVE CLOCK — Bangladesh = UTC+6 ─── */
  const clockEl = document.getElementById("live-clock");
  if (clockEl) {
    const updateClock = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const bd  = new Date(utc + 6 * 3600000);
      const pad = (n) => String(n).padStart(2, "0");
      clockEl.textContent = `${pad(bd.getHours())}:${pad(bd.getMinutes())}:${pad(bd.getSeconds())}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ─── AMBIENT CANVAS ─── */
  const startAmbientFlow = () => {
    if (!(ambientCanvas instanceof HTMLCanvasElement)) return () => {};
    const canvas = ambientCanvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

    let rafId = 0;
    const orbs = [];

    const spawnOrbs = () => {
      const count = Math.max(8, Math.floor(window.innerWidth / 200));
      orbs.length = 0;
      for (let i = 0; i < count; i++) {
        orbs.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 80 + Math.random() * 180,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: (Math.random() - 0.5) * 0.3,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      spawnOrbs();
    };

    const draw = () => {
      const warm = document.body.classList.contains("warm-mode");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "screen";

      orbs.forEach((orb, idx) => {
        orb.x += orb.speedX;
        orb.y += orb.speedY;
        if (orb.x < -orb.radius)  orb.x = canvas.width  + orb.radius;
        if (orb.x >  canvas.width  + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius)  orb.y = canvas.height + orb.radius;
        if (orb.y >  canvas.height + orb.radius) orb.y = -orb.radius;

        const pulse = 0.8 + Math.sin(performance.now() * 0.00045 + orb.phase) * 0.2;
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * pulse);

        if (warm) {
          g.addColorStop(0,    idx % 2 ? "rgba(218,90,42,0.22)"  : "rgba(15,124,132,0.2)");
          g.addColorStop(0.62, idx % 2 ? "rgba(218,90,42,0.09)"  : "rgba(15,124,132,0.09)");
          g.addColorStop(1, "rgba(0,0,0,0)");
        } else {
          /* indigo + amber orbs — different from Shovon's green */
          g.addColorStop(0,    idx % 2 ? "rgba(129,140,248,0.16)" : "rgba(245,158,11,0.12)");
          g.addColorStop(0.65, idx % 2 ? "rgba(129,140,248,0.07)" : "rgba(245,158,11,0.05)");
          g.addColorStop(1, "rgba(0,0,0,0)");
        }

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  };

  /* ─── MATRIX RAIN ─── */
  let matrixCleanup = null;

  const startMatrixRain = () => {
    if (!(matrixCanvas instanceof HTMLCanvasElement)) return () => {};
    const canvas = matrixCanvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

    let rafId = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
    let drops = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.floor(canvas.width / 14) }, () =>
        Math.floor(Math.random() * 20)
      );
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0,10,0,0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#35d28f";
      ctx.font = "12px monospace";
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      rafId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  };

  startAmbientFlow();

  /* ─── WARM MODE TOGGLE ─── */
  if (modeToggle) {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "warm") {
      document.body.classList.add("warm-mode");
      if (matrixCleanup) { matrixCleanup(); matrixCleanup = null; }
    }

    modeToggle.addEventListener("click", () => {
      const warm = document.body.classList.toggle("warm-mode");
      localStorage.setItem("portfolio-theme", warm ? "warm" : "dark");
      if (warm) {
        if (matrixCleanup) { matrixCleanup(); matrixCleanup = null; }
        if (matrixCanvas) matrixCanvas.style.opacity = "0";
      }
    });
  }

  /* ─── REVEAL ON SCROLL ─── */
  const reveals = document.querySelectorAll(".reveal");
  document.querySelectorAll("section").forEach((section) => {
    section.querySelectorAll(".reveal").forEach((item, idx) => {
      item.style.setProperty("--reveal-delay", `${Math.min(idx * 70, 420)}ms`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  reveals.forEach((item) => revealObserver.observe(item));

  /* ─── SKILL BAR ANIMATION ─── */
  const skillsWrap = document.getElementById("skills-wrap");
  if (skillsWrap) {
    const barObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          skillsWrap.classList.add("bars-animated");
          barObserver.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    barObserver.observe(skillsWrap);
  }

  /* ─── SCROLL LISTENERS: nav highlight, progress, back-top ─── */
  const sections = document.querySelectorAll("section[id]");

  const highlightNav = () => {
    const scrollY = window.scrollY + 115;
    let activeId = "home";
    sections.forEach((s) => { if (scrollY >= s.offsetTop) activeId = s.id; });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
    railLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("data-rail") === activeId);
    });
    if (focusChip) focusChip.textContent = activeId.toUpperCase();

    const header = document.querySelector(".site-header");
    if (header) header.classList.toggle("nav-sc", window.scrollY > 40);
  };

  const updateProgress = () => {
    const top    = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (progressBar) progressBar.style.width = `${height > 0 ? Math.min(100, (top / height) * 100) : 0}%`;
  };

  highlightNav();
  updateProgress();
  window.addEventListener("scroll", () => { highlightNav(); updateProgress(); });

  if (backTop) {
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => backTop.classList.toggle("show", window.scrollY > 460));
  }

  /* ─── TYPED TEXT ─── */
  const typedEl = document.querySelector(".typed-text");
  if (typedEl) {
    const words = (typedEl.getAttribute("data-words") || "").split(",").map(w => w.trim()).filter(Boolean);
    let wIdx = 0, cIdx = 0, deleting = false;

    const tick = () => {
      if (!words.length) return;
      const word = words[wIdx];
      cIdx += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, cIdx);

      if (!deleting && cIdx === word.length) { deleting = true; setTimeout(tick, 1100); return; }
      if (deleting && cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; }
      setTimeout(tick, deleting ? 46 : 86);
    };
    tick();
  }

  /* ─── GLITCH HEADINGS ─── */
  if (glitchHeadings.length) {
    setInterval(() => {
      const pick = glitchHeadings[Math.floor(Math.random() * glitchHeadings.length)];
      pick.classList.add("glitch-now");
      setTimeout(() => pick.classList.remove("glitch-now"), 220);
    }, 2400);
  }

  /* ─── YEAR ─── */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ─── TERMINAL ─── */
  const terminalOutput = document.getElementById("terminal-output");
  const terminalForm   = document.getElementById("terminal-form");
  const terminalInput  = document.getElementById("terminal-input");
  const chips = document.querySelectorAll(".terminal-chip");

  let currentPath = "~";
  const cmdHistory = [];
  let historyIndex = -1;

  const fsTree = {
    "~": {
      type: "dir", children: {
        projects: {
          type: "dir", children: {
            "sohojogi.txt":        { type: "file", content: "Flutter/Supabase household services platform. Learnathon 3.0 champion project." },
            "aust-code-realm.txt": { type: "file", content: "PHP/MySQL online judge with contests, ratings, IDE integration." },
            "homehutbd.txt":       { type: "file", content: "ASP.NET MVC property listing with AI price prediction." },
            "bhromon.txt":         { type: "file", content: "Flutter travel assistant with GPT-4 chatbot and maps." },
          },
        },
        achievements: {
          type: "dir", children: {
            "learnathon.txt": { type: "file", content: "Champion, Learnathon 3.0 (Geeky Solutions) — 2025." },
            "icpc.txt":       { type: "file", content: "ICPC Dhaka Regional 2025 — Rank #122, Team AUST_DEADCODER." },
            "bubt-iucpc.txt": { type: "file", content: "BUBT IUCPC 2025 — Rank #35, Team AUST_DEADCODER." },
          },
        },
        "about.txt":   { type: "file", content: "Final-year CSE undergraduate at AUST, CGPA 3.75. President AUST Programming Club, VP AUST CSE Society, ACM ICPC Coordinator." },
        "contact.txt": { type: "file", content: "Email: rakibhasan4101@gmail.com | LinkedIn: linkedin.com/in/afnanhasanrakib | GitHub: github.com/afnanrakib" },
      },
    },
  };

  const getNode = (path) => {
    const parts = path.replace(/^~\/?/, "").split("/").filter(Boolean);
    let node = fsTree["~"];
    for (const p of parts) { node = node?.children?.[p]; if (!node) return null; }
    return node;
  };

  const resolvePath = (path) => {
    let cursor = path.startsWith("/") ? "~" : currentPath;
    for (const part of path.split("/").filter(Boolean)) {
      if (part === ".") continue;
      if (part === "..") {
        const chunks = cursor.split("/").filter(Boolean);
        chunks.pop();
        cursor = chunks.length ? chunks.join("/") : "~";
        continue;
      }
      const node = getNode(cursor);
      if (!node || node.type !== "dir" || !node.children[part] || node.children[part].type !== "dir") return null;
      cursor = cursor === "~" ? `~/${part}` : `${cursor}/${part}`;
    }
    return cursor;
  };

  const appendLine = (text, type = "") => {
    if (!terminalOutput) return;
    const p = document.createElement("p");
    if (type) p.className = type;
    p.textContent = text;
    terminalOutput.appendChild(p);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  };

  const runCommand = (rawCommand) => {
    const input = rawCommand.trim();
    if (!input) return;
    const [rawCmd, ...args] = input.split(/\s+/);
    const cmd = rawCmd.toLowerCase();

    appendLine(`guest@rakib:${currentPath}$ ${input}`);

    if (cmd === "clear") { if (terminalOutput) terminalOutput.innerHTML = ""; return; }

    if (cmd === "help") {
      [
        "Commands: help, ls, pwd, cd <dir>, cat <file>, tree, whoami, about, stats, achievements, ranks, projects, contact, matrix, clear",
        "Tip: ArrowUp/Down for history. Press '/' to focus terminal.",
      ].forEach(l => appendLine(l, "line-ok"));
      return;
    }

    if (cmd === "pwd") { appendLine(currentPath, "line-ok"); return; }

    if (cmd === "ls") {
      const node = getNode(currentPath);
      if (!node || node.type !== "dir") { appendLine("ls: cannot read directory", "line-warn"); return; }
      const items = Object.keys(node.children).map(n => node.children[n].type === "dir" ? `${n}/` : n);
      appendLine(items.join("   ") || "(empty)", "line-ok");
      return;
    }

    if (cmd === "tree") {
      ["~/", "|-- projects/", "|   |-- sohojogi.txt", "|   |-- aust-code-realm.txt",
       "|   |-- homehutbd.txt", "|   |-- bhromon.txt",
       "|-- achievements/", "|   |-- learnathon.txt", "|   |-- icpc.txt", "|   |-- bubt-iucpc.txt",
       "|-- about.txt", "|-- contact.txt"].forEach(l => appendLine(l, "line-ok"));
      return;
    }

    if (cmd === "cd") {
      const target = args[0] || "~";
      if (target === "~") { currentPath = "~"; appendLine("switched to ~", "line-ok"); return; }
      const resolved = resolvePath(target);
      if (!resolved) { appendLine(`cd: no such directory: ${target}`, "line-warn"); return; }
      currentPath = resolved;
      appendLine(`switched to ${currentPath}`, "line-ok");
      return;
    }

    if (cmd === "cat") {
      const target = args[0];
      if (!target) { appendLine("cat: missing file operand", "line-warn"); return; }
      const node = getNode(currentPath);
      const file = node?.children?.[target];
      if (!file || file.type === "dir") { appendLine(`cat: ${target}: No such file`, "line-warn"); return; }
      appendLine(file.content, "line-ok");
      return;
    }

    if (cmd === "whoami") { appendLine("md-rakib-hasan", "line-ok"); return; }
    if (cmd === "sudo")   { appendLine("permission denied: running in read-only hero mode.", "line-warn"); return; }
    if (cmd === "hack")   { appendLine("nice try. real hackers write tests first.", "line-ok"); return; }
    if (cmd === "rm")     { appendLine("rm: refusing to delete the universe. nice try.", "line-warn"); return; }

    if (cmd === "open") {
      const target = (args[0] || "").toLowerCase();
      const section = document.getElementById(target);
      if (section) { section.scrollIntoView({ behavior: "smooth" }); appendLine(`navigating to: ${target}`, "line-ok"); }
      else appendLine(`open: unknown section '${target}'. Try: home, console, about, projects, ranks, experience, achievements, skills, education, contact`, "line-warn");
      return;
    }

    if (cmd === "matrix") {
      if (document.body.classList.contains("warm-mode")) {
        appendLine("matrix mode requires dark theme. Switch to dark mode first.", "line-warn");
        return;
      }
      if (matrixCanvas) {
        const active = matrixCanvas.style.opacity === "0.7";
        if (active) {
          matrixCanvas.style.opacity = "0";
          if (matrixCleanup) { matrixCleanup(); matrixCleanup = null; }
          appendLine("matrix rain: OFF", "line-ok");
        } else {
          matrixCanvas.style.opacity = "0.7";
          matrixCleanup = startMatrixRain();
          appendLine("matrix rain: ON — initiating green rain protocol...", "line-ok");
        }
      }
      return;
    }

    const staticOutputs = {
      about: [
        "Rakib Hasan: final-year CSE undergraduate at AUST.",
        "Focus: full-stack engineering, mobile apps, competitive programming.",
        "CGPA: 3.75 | Location: Dhaka, Bangladesh",
      ],
      stats: [
        "CGPA: 3.75 | University: AUST",
        "Leadership: President AUST Programming Club, VP AUST CSE Society, ACM ICPC Coordinator.",
        "Competitive: ICPC Dhaka 2025 #122, Learnathon 3.0 Champion.",
      ],
      achievements: [
        "Champion  — Learnathon 3.0 (2025)",
        "#122      — ICPC Dhaka Regional (2025)",
        "#35       — BUBT IUCPC (2025)",
        "#97       — AUST IUPC (2025)",
        "1st R.U.  — Research Odyssey Exhibition (2025)",
        "Champion  — Intra AUST Programming Contest, CSE Carnival 4.0 (2024)",
      ],
      ranks: [
        "Champion  — Learnathon 3.0 · Team Synergy (2025)",
        "Champion  — Intra AUST Programming Contest (2024)",
        "#35       — BUBT IUCPC 2025 · AUST_DEADCODER",
        "#97       — AUST IUPC 2025 · 0xDEADCODER",
        "#122      — ICPC Dhaka Regional 2025 · AUST_DEADCODER",
        "1st R.U.  — Research Odyssey Exhibition 2025",
      ],
      contact: [
        "Email:    rakibhasan4101@gmail.com",
        "GitHub:   github.com/afnanrakib",
        "LinkedIn: linkedin.com/in/afnanhasanrakib",
        "CF:       codeforces.com/profile/afnanrakib",
        "Discord:  discord.com/users/afnan_rakib",
      ],
      projects: ["Navigating to projects section..."],
    };

    const output = staticOutputs[cmd];
    if (!output) {
      appendLine(`command not found: '${cmd}'. Type 'help' for a list.`, "line-warn");
      return;
    }

    if (cmd === "projects") document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    if (cmd === "contact")  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

    output.forEach(l => appendLine(l, "line-ok"));
  };

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = terminalInput.value;
      if (val.trim()) { cmdHistory.push(val); historyIndex = cmdHistory.length; }
      runCommand(val);
      terminalInput.value = "";
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", () => runCommand(chip.getAttribute("data-command") || ""));
    });

    terminalInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        terminalInput.value = cmdHistory[historyIndex] || "";
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        historyIndex = Math.min(cmdHistory.length, historyIndex + 1);
        terminalInput.value = cmdHistory[historyIndex] || "";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        terminalInput.focus();
      }
    });
  }

  /* ─── DRAGGABLE TERMINAL ─── */
  const terminalShell = document.querySelector(".terminal-shell");
  const terminalBar   = document.querySelector(".terminal-topbar");
  if (terminalShell && terminalBar && !window.matchMedia("(pointer: coarse)").matches) {
    let dragging = false, offsetX = 0, offsetY = 0, tx = 0, ty = 0;
    terminalBar.addEventListener("mousedown", (e) => {
      dragging = true; terminalBar.style.cursor = "grabbing";
      offsetX = e.clientX - tx; offsetY = e.clientY - ty;
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      tx = e.clientX - offsetX; ty = e.clientY - offsetY;
      terminalShell.style.transform = `translate(${tx}px, ${ty}px)`;
      terminalShell.style.zIndex = "12";
    });
    window.addEventListener("mouseup", () => { dragging = false; terminalBar.style.cursor = "grab"; });
  }

  /* ─── PROJECT FILTER ─── */
  const filterBtns   = document.querySelectorAll(".pf-btn");
  const projectCards = document.querySelectorAll(".proj-card[data-category]");
  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-cat") || "all";
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        projectCards.forEach((card) => {
          const cats = (card.getAttribute("data-category") || "").split(" ");
          card.classList.toggle("filtered-out", filter !== "all" && !cats.includes(filter));
        });
      });
    });
  }

  /* ─── EXPERIENCE — EXPANDABLE ORGS ─── */
  // (global so onclick="toggleExpOrg(n)" in HTML works)
  window.toggleExpOrg = function(idx) {
    const eorg = document.getElementById("eorg-" + idx);
    if (!eorg) return;
    const isOpen = eorg.classList.toggle("open");
    const roles = eorg.querySelector(".eorg-roles");
    if (roles) roles.classList.toggle("open", isOpen);
    const btnLabel = eorg.querySelector(".exp-toggle-btn span");
    if (btnLabel) btnLabel.textContent = isOpen ? "Hide Details" : "Show Details";
  };

  /* ─── PROJECT VIEW TOGGLE (grid / list) ─── */
  const viewBtns = document.querySelectorAll(".view-btn");
  const projectContainer = document.getElementById("project-container");
  if (viewBtns.length && projectContainer) {
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        viewBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        projectContainer.classList.toggle("list-view", view === "list");
      });
    });
  }

  /* ─── PROJECT CARD 3D TILT ─── */
  projectCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const rotY = ((x / r.width)  - 0.5) * 9;
      const rotX = (0.5 - (y / r.height)) * 9;
      card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });


  /* ─── CUSTOM CURSOR ─── */
  const cursorDot  = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  if (cursorDot && cursorRing && !window.matchMedia("(pointer: coarse)").matches) {
    document.body.classList.add("cursor-active");
    let ringX = 0, ringY = 0;
    window.addEventListener("mousemove", (e) => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      ringX += (e.clientX - ringX) * 0.2;
      ringY += (e.clientY - ringY) * 0.2;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    });
    document.querySelectorAll("a, button, .proj-card, .terminal-chip, .ach-card, .soc-btn").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  /* ─── MAGNETIC BUTTONS ─── */
  document.querySelectorAll(".mag-btn, .mode-toggle, .pf-btn, .terminal-chip").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      if (window.matchMedia("(pointer: coarse)").matches) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      el.style.transform = `translate(${x * 0.09}px, ${y * 0.12}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* ─── COPY EMAIL ─── */
  const copyEmailBtn = document.querySelector(".copy-email-btn");
  const copyToast    = document.getElementById("copy-toast");
  if (copyEmailBtn instanceof HTMLButtonElement) {
    copyEmailBtn.addEventListener("click", async () => {
      const email = copyEmailBtn.getAttribute("data-email") || "";
      try {
        await navigator.clipboard.writeText(email);
        if (copyToast) {
          copyToast.classList.add("show");
          setTimeout(() => copyToast.classList.remove("show"), 1400);
        }
      } catch {
        copyEmailBtn.textContent = "Failed";
        setTimeout(() => { copyEmailBtn.innerHTML = '<i class="far fa-copy"></i> Copy'; }, 1200);
      }
    });
  }

  /* ─── JUMP PALETTE (Ctrl+K) ─── */
  if (jumpPalette) {
    const open  = () => { jumpPalette.hidden = false; jumpPalette.classList.add("show"); };
    const close = () => { jumpPalette.classList.remove("show"); jumpPalette.hidden = true; };

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        jumpPalette.hidden ? open() : close();
      } else if (e.key === "Escape" && !jumpPalette.hidden) {
        close();
      }
    });

    jumpPalette.addEventListener("click", (e) => { if (e.target === jumpPalette) close(); });

    jumpPalette.querySelectorAll("button[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-jump");
        document.getElementById(target || "")?.scrollIntoView({ behavior: "smooth" });
        close();
      });
    });
  }
});
