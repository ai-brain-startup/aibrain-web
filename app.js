/* ==========================================================================
   AI Brain Startup — High-DPI 4K 3D Canvas & Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNeuralCanvas();
  initMobileDrawer();
  initAgentTabs();
  initMemoryCalculator();
  initLiveDemoSimulator();
  initWaitlistForm();
  initLegalModals();
});

/* --------------------------------------------------------------------------
   1. 3D Neural Sphere Canvas Animation (Retina/4K High-DPI Scaled)
   -------------------------------------------------------------------------- */
function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height, dpr;
  let points = [];
  const pointCount = 45;
  const radius = 140;
  let angleX = 0.0015;
  let angleY = 0.0025;
  let isCanvasVisible = true;

  // IntersectionObserver to pause rendering when canvas is offscreen
  const observer = new IntersectionObserver((entries) => {
    isCanvasVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    // Scale internal canvas dimensions for 4K / Retina HD crispness
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Create 3D points on a sphere surface (Fibonacci sphere algorithm)
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < pointCount; i++) {
    const y = 1 - (i / (pointCount - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    points.push({
      x: x * radius,
      y: y * radius,
      z: z * radius
    });
  }

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left - width / 2) * 0.00003;
    mouseY = (e.clientY - rect.top - height / 2) * 0.00003;
  }, { passive: true });

  function animate() {
    if (isCanvasVisible) {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const rotX = angleX + mouseY;
      const rotY = angleY + mouseX;

      const projectedPoints = [];

      // Rotate and project 3D points
      for (let p of points) {
        let x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        let z1 = p.z * Math.cos(rotY) + p.x * Math.sin(rotY);

        let y2 = p.y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = z1 * Math.cos(rotX) + p.y * Math.sin(rotX);

        p.x = x1;
        p.y = y2;
        p.z = z2;

        const scale = 280 / (280 + z2);
        const projX = p.x * scale + cx;
        const projY = p.y * scale + cy;

        projectedPoints.push({ x: projX, y: projY, z: z2, scale });
      }

      // Draw connecting lines between close nodes
      ctx.lineWidth = 1;
      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p1 = projectedPoints[i];
          const p2 = projectedPoints[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 5625) { // 75px squared distance
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / 75) * 0.4;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw glowing nodes
      for (let p of projectedPoints) {
        const nodeRadius = Math.max(1.5, 3 * p.scale);
        const alpha = Math.min(1, Math.max(0.2, (p.z + radius) / (2 * radius)));

        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);

        if (p.z > 20) {
          ctx.fillStyle = '#00f0ff';
        } else if (p.z < -20) {
          ctx.fillStyle = 'rgba(112, 0, 255, 0.6)';
        } else {
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        }

        ctx.fill();
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------------------------------
   2. Mobile Drawer Navigation Controller
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggle = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  if (!toggle || !drawer) return;

  toggle.addEventListener('click', () => {
    const isHidden = drawer.classList.contains('hidden');
    if (isHidden) {
      drawer.classList.remove('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    } else {
      drawer.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close drawer on link click
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   3. Autonomous Agent Tabs Switcher
   -------------------------------------------------------------------------- */
function initAgentTabs() {
  const tabs = document.querySelectorAll('.agent-tab');
  const contents = document.querySelectorAll('.agent-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      contents.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('hidden', '');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.removeAttribute('hidden');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Live AI Demo Simulator
   -------------------------------------------------------------------------- */
function initLiveDemoSimulator() {
  const demoForm = document.getElementById('demoForm');
  const demoInput = document.getElementById('demoInput');
  const demoChat = document.getElementById('demoChat');
  const suggestBtns = document.querySelectorAll('.suggest-btn');

  if (!demoForm || !demoChat) return;

  const simulatedResponses = {
    'Explain Persistent Memory': `AI Brain uses a dual-layer cognitive architecture combining continuous vector embeddings with a Graph Neural Network (GNN). Every conversation, code revision, and project decision is indexed into non-volatile graph nodes, enabling instant contextual retrieval even across months of inactivity.`,
    '2026 Agent Roadmap': `In 2026, AI Brain evolves through Phase 2 into multi-agent orchestration. Key milestones include autonomous goal decomposition, recursive self-debugging for coding agents, and real-time distributed knowledge syncing.`,
    'Google Cloud Integration': `AI Brain is engineered for native deployment on Google Cloud Infrastructure. It leverages Firebase Firestore for distributed graph state synchronization, BigQuery for massive analytical vector querying, and Gemini API for multimodal reasoning.`
  };

  function appendBubble(text, sender = 'user') {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}-bubble`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar-mini';
    avatar.textContent = sender === 'user' ? '👤' : '🧠';

    const textDiv = document.createElement('div');
    textDiv.className = 'bubble-text';
    textDiv.textContent = text;

    bubble.appendChild(avatar);
    bubble.appendChild(textDiv);

    demoChat.appendChild(bubble);
    demoChat.scrollTop = demoChat.scrollHeight;
  }

  function handleQuery(queryText) {
    if (!queryText.trim()) return;

    appendBubble(queryText, 'user');

    // Simulate AI thinking delay
    setTimeout(() => {
      let response = "AI Brain is analyzing your prompt against persistent memory graphs...";
      if (queryText.includes("Persistent Memory") || queryText.includes("memory")) {
        response = simulatedResponses['Explain Persistent Memory'];
      } else if (queryText.includes("Roadmap") || queryText.includes("2026")) {
        response = simulatedResponses['2026 Agent Roadmap'];
      } else if (queryText.includes("Google Cloud") || queryText.includes("Cloud")) {
        response = simulatedResponses['Google Cloud Integration'];
      } else {
        response = `Recorded "${queryText}" into persistent memory. AI Brain has indexed this context for future autonomous agent workflows.`;
      }

      appendBubble(response, 'ai');
    }, 600);
  }

  demoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = demoInput.value;
    handleQuery(query);
    demoInput.value = '';
  });

  suggestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      handleQuery(query);
    });
  });
}

/* --------------------------------------------------------------------------
   5. Waitlist Form Submission (Functional Storage & Logging)
   -------------------------------------------------------------------------- */
function initWaitlistForm() {
  const form = document.getElementById('waitlistForm');
  const toast = document.getElementById('formToast');

  if (!form || !toast) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('waitlistEmail').value;
    const role = document.getElementById('waitlistRole').value;

    if (email && role) {
      const submission = {
        email: email,
        role: role,
        timestamp: new Date().toISOString(),
        domain: 'aibrainstartup.com'
      };

      // 1. Store in localStorage
      let subscribers = [];
      try {
        subscribers = JSON.parse(localStorage.getItem('aibrain_waitlist_subscribers') || '[]');
      } catch (err) {
        subscribers = [];
      }
      subscribers.push(submission);
      localStorage.setItem('aibrain_waitlist_subscribers', JSON.stringify(subscribers));

      // 2. Log formatted JSON to console
      console.log('🚀 [AI Brain Waitlist] New Functional Submission:', submission);

      // 3. Show real success toast message
      toast.classList.remove('hidden');
      form.reset();

      setTimeout(() => {
        toast.classList.add('hidden');
      }, 6000);
    }
  });
}

/* --------------------------------------------------------------------------
   6. Legal Modals Controller
   -------------------------------------------------------------------------- */
function initLegalModals() {
  const modalPrivacy = document.getElementById('modalPrivacy');
  const modalTerms = document.getElementById('modalTerms');

  const btnOpenPrivacy = document.getElementById('btnOpenPrivacy');
  const btnClosePrivacy = document.getElementById('btnClosePrivacy');

  const btnOpenTerms = document.getElementById('btnOpenTerms');
  const btnCloseTerms = document.getElementById('btnCloseTerms');

  if (btnOpenPrivacy && modalPrivacy) {
    btnOpenPrivacy.addEventListener('click', () => modalPrivacy.classList.remove('hidden'));
    btnClosePrivacy.addEventListener('click', () => modalPrivacy.classList.add('hidden'));
  }

  if (btnOpenTerms && modalTerms) {
    btnOpenTerms.addEventListener('click', () => modalTerms.classList.remove('hidden'));
    btnCloseTerms.addEventListener('click', () => modalTerms.classList.add('hidden'));
  }

  // Close modal on background click
  window.addEventListener('click', (e) => {
    if (e.target === modalPrivacy) modalPrivacy.classList.add('hidden');
    if (e.target === modalTerms) modalTerms.classList.add('hidden');
  });
}

/* --------------------------------------------------------------------------
   4. Interactive Memory Calculator Widget Logic
   -------------------------------------------------------------------------- */
function initMemoryCalculator() {
  const codeSizeInput = document.getElementById('calcCodeSize');
  const promptsInput = document.getElementById('calcPrompts');

  const valCodeSize = document.getElementById('valCodeSize');
  const valPrompts = document.getElementById('valPrompts');

  const resTokens = document.getElementById('resTokens');
  const resEfficiency = document.getElementById('resEfficiency');
  const resCost = document.getElementById('resCost');

  if (!codeSizeInput || !promptsInput) return;

  function calculate() {
    const files = parseInt(codeSizeInput.value, 10);
    const prompts = parseInt(promptsInput.value, 10);

    valCodeSize.textContent = `${files} Files`;
    valPrompts.textContent = `${prompts} Queries/day`;

    // Monthly Wasted Tokens in Stateless LLM = (files * 800 tokens * prompts * 30 days) / 1,000,000
    const monthlyWastedTokens = ((files * 850 * prompts * 30) / 1000000).toFixed(1);
    const efficiency = Math.min(98.5, 85 + (files * 0.015)).toFixed(1);
    const costSaved = Math.round((files * 850 * prompts * 30 * 0.000003));

    resTokens.textContent = `${monthlyWastedTokens} Million Tokens`;
    resEfficiency.textContent = `${efficiency}% Saved`;
    resCost.textContent = `$${costSaved} / Mo Saved`;
  }

  codeSizeInput.addEventListener('input', calculate);
  promptsInput.addEventListener('input', calculate);
  calculate();
}
