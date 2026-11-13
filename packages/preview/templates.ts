import { Direction, TaskType } from './types.js';

export function resolveTaskType(taskTypeOrPrompt?: string): TaskType {
  if (!taskTypeOrPrompt) return 'music';
  const str = taskTypeOrPrompt.toLowerCase();
  if (str.includes('music') || str.includes('spotify') || str.includes('audio') || str.includes('song') || str.includes('player')) {
    return 'music';
  }
  if (str.includes('dashboard') || str.includes('analytics') || str.includes('metric') || str.includes('telemetry') || str.includes('stat')) {
    return 'dashboard';
  }
  if (str.includes('landing') || str.includes('oss') || str.includes('library') || str.includes('product') || str.includes('hero')) {
    return 'landing';
  }
  if (str.includes('editorial') || str.includes('journal') || str.includes('reading') || str.includes('photo') || str.includes('blog') || str.includes('article')) {
    return 'editorial';
  }
  return 'music';
}

export function renderSubjectTemplate(taskType: TaskType, direction: Direction): string {
  switch (taskType) {
    case 'music':
      return renderMusicTemplate(direction);
    case 'dashboard':
      return renderDashboardTemplate(direction);
    case 'landing':
      return renderLandingTemplate(direction);
    case 'editorial':
      return renderEditorialTemplate(direction);
  }
}

function renderMusicTemplate(d: Direction): string {
  return `
  <div class="template-music">
    <!-- Player Bar -->
    <div class="music-player-bar">
      <div class="player-left">
        <div class="player-thumb">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <div class="player-meta">
          <div class="player-title">${escapeHtml(d.headline || 'Kinetic Resonance')}</div>
          <div class="player-artist">${escapeHtml(d.sub || 'Auteur Ensemble • Hi-Fi Master')}</div>
        </div>
      </div>
      <div class="player-center">
        <div class="player-controls">
          <button class="player-btn-icon" aria-label="Shuffle" title="Shuffle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
          </button>
          <button class="player-btn-icon" aria-label="Previous" title="Previous">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"></line></svg>
          </button>
          <button class="player-play-btn" aria-label="Play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <button class="player-btn-icon" aria-label="Next" title="Next">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"></line></svg>
          </button>
          <button class="player-btn-icon" aria-label="Repeat" title="Repeat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
          </button>
        </div>
        <div class="player-scrubber">
          <span class="player-time">02:41</span>
          <div class="player-progress-track">
            <div class="player-progress-fill" style="width: 64%;"></div>
          </div>
          <span class="player-time">04:15</span>
        </div>
      </div>
      <div class="player-right">
        <button class="btn-action primary">${escapeHtml(d.cta || 'Play Track')}</button>
      </div>
    </div>

    <!-- Track List -->
    <div class="music-section">
      <div class="section-header">
        <h3 class="section-title">Queue & Recent Tracks</h3>
        <span class="section-badge">4 Selected</span>
      </div>
      <div class="track-list">
        <div class="track-row">
          <span class="track-num">01</span>
          <div class="track-info">
            <div class="track-name">Midnight Velocity</div>
            <div class="track-sub">Auteur Lab • Electric Cut</div>
          </div>
          <span class="track-album">Monograph Vol. 1</span>
          <span class="track-duration">03:24</span>
        </div>
        <div class="track-row active">
          <span class="track-num">02</span>
          <div class="track-info">
            <div class="track-name">Phosphor Synthesis</div>
            <div class="track-sub">Monad Sync • CRT Tone</div>
          </div>
          <span class="track-album">Monograph Vol. 1</span>
          <span class="track-duration">04:12</span>
        </div>
        <div class="track-row">
          <span class="track-num">03</span>
          <div class="track-info">
            <div class="track-name">Brutalist Rhythm</div>
            <div class="track-sub">Studio Grid • 120 BPM</div>
          </div>
          <span class="track-album">Form Follows Rhythm</span>
          <span class="track-duration">02:58</span>
        </div>
        <div class="track-row">
          <span class="track-num">04</span>
          <div class="track-info">
            <div class="track-name">Subtle Typographies</div>
            <div class="track-sub">Editorial Sound • Slow Press</div>
          </div>
          <span class="track-album">Liner Notes</span>
          <span class="track-duration">05:03</span>
        </div>
      </div>
    </div>

    <!-- Album Grid -->
    <div class="music-section">
      <div class="section-header">
        <h3 class="section-title">Featured Releases</h3>
      </div>
      <div class="album-grid">
        <div class="album-card">
          <div class="album-cover cover-1">
            <div class="cover-pattern"></div>
            <span class="cover-tag">LP</span>
          </div>
          <div class="album-title">Analog Architecture</div>
          <div class="album-meta">8 Tracks • 2026</div>
        </div>
        <div class="album-card">
          <div class="album-cover cover-2">
            <div class="cover-pattern"></div>
            <span class="cover-tag">EP</span>
          </div>
          <div class="album-title">Harmonic Precision</div>
          <div class="album-meta">12 Tracks • 2026</div>
        </div>
        <div class="album-card">
          <div class="album-cover cover-3">
            <div class="cover-pattern"></div>
            <span class="cover-tag">LIVE</span>
          </div>
          <div class="album-title">Monochrome Suite</div>
          <div class="album-meta">10 Tracks • 2026</div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderDashboardTemplate(d: Direction): string {
  return `
  <div class="template-dashboard">
    <!-- Stat Cards -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">API Requests</div>
        <div class="stat-value">2.48M</div>
        <div class="stat-delta positive">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
          +14.2% vs lw
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">p99 Latency</div>
        <div class="stat-value">41.6ms</div>
        <div class="stat-delta positive">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          -8.4% nominal
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Error Rate</div>
        <div class="stat-value">0.012%</div>
        <div class="stat-delta neutral">Within SLA</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Runners</div>
        <div class="stat-value">24</div>
        <div class="stat-delta positive">All Healthy</div>
      </div>
    </div>

    <!-- Telemetry Chart -->
    <div class="chart-box">
      <div class="chart-header">
        <div>
          <h4 class="chart-title">${escapeHtml(d.headline || 'System Telemetry')}</h4>
          <div class="chart-sub">${escapeHtml(d.sub || 'Real-time throughput and request latency distribution')}</div>
        </div>
        <button class="btn-action primary">${escapeHtml(d.cta || 'Run Query')}</button>
      </div>
      <div class="chart-svg-wrap">
        <svg class="chart-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0.0"></stop>
            </linearGradient>
          </defs>
          <line x1="0" y1="30" x2="500" y2="30" stroke="var(--color-border)" stroke-dasharray="3 3"></line>
          <line x1="0" y1="70" x2="500" y2="70" stroke="var(--color-border)" stroke-dasharray="3 3"></line>
          <path d="M0 100 Q 50 60, 100 80 T 200 45 T 300 65 T 400 20 T 500 35 L 500 120 L 0 120 Z" fill="url(#chartGrad)"></path>
          <path d="M0 100 Q 50 60, 100 80 T 200 45 T 300 65 T 400 20 T 500 35" fill="none" stroke="var(--color-accent)" stroke-width="2.5"></path>
          <circle cx="400" cy="20" r="4" fill="var(--color-accent)"></circle>
        </svg>
      </div>
      <div class="chart-axis">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:59</span>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-box">
      <div class="table-header-row">
        <span>Endpoint</span>
        <span>Method</span>
        <span>Status</span>
        <span>Latency</span>
        <span>Traffic</span>
      </div>
      <div class="table-row">
        <span class="mono-cell font-mono">/v1/preview/render</span>
        <span><span class="method-tag post">POST</span></span>
        <span><span class="status-pill ok">200 OK</span></span>
        <span class="font-mono">18ms</span>
        <span class="font-mono">1,420 req/m</span>
      </div>
      <div class="table-row">
        <span class="mono-cell font-mono">/v1/looks/manifest</span>
        <span><span class="method-tag get">GET</span></span>
        <span><span class="status-pill ok">200 OK</span></span>
        <span class="font-mono">4ms</span>
        <span class="font-mono">8,950 req/m</span>
      </div>
      <div class="table-row">
        <span class="mono-cell font-mono">/v1/evals/telemetry</span>
        <span><span class="method-tag get">GET</span></span>
        <span><span class="status-pill ok">200 OK</span></span>
        <span class="font-mono">22ms</span>
        <span class="font-mono">610 req/m</span>
      </div>
    </div>
  </div>`;
}

function renderLandingTemplate(d: Direction): string {
  return `
  <div class="template-landing">
    <!-- Hero Block -->
    <div class="landing-hero">
      <div class="hero-kicker">v0.1.0 • Taste Compiled at Build Time</div>
      <h2 class="hero-title">${escapeHtml(d.headline || 'Design Systems Built for Autonomous Agents')}</h2>
      <p class="hero-sub">${escapeHtml(d.sub || 'Compile taste at build time, not runtime. Deterministic previews, bounded context, and zero generic UI.')}</p>
      <div class="hero-actions">
        <button class="btn-action primary">${escapeHtml(d.cta || 'Get Started')}</button>
        <button class="btn-action secondary">Explore Looks →</button>
      </div>
    </div>

    <!-- Feature Grid -->
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        </div>
        <h4 class="feature-title">Zero Runtime LLM</h4>
        <p class="feature-text">Deterministic rendering with CSS custom properties injected from curated look contracts.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
        <h4 class="feature-title">Bounded Context</h4>
        <p class="feature-text">Strict ≤ 300 token contracts and ≤ 400 token direction budgets keep agent turns cheap and fast.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        </div>
        <h4 class="feature-title">Human in the Loop</h4>
        <p class="feature-text">Instant numbered review with keyboard 1–N selection and clipboard synchronization.</p>
      </div>
    </div>

    <!-- Terminal / Code Snippet -->
    <div class="terminal-block">
      <div class="terminal-bar">
        <div class="terminal-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="terminal-title">quickstart.sh</span>
      </div>
      <pre class="terminal-code"><code>npx auteur-ui preview --directions .auteur-ui/directions.json --open</code></pre>
    </div>
  </div>`;
}

function renderEditorialTemplate(d: Direction): string {
  return `
  <div class="template-editorial">
    <!-- Editorial Header -->
    <div class="editorial-header">
      <div class="editorial-kicker">Issue 14 • Architecture & Systems</div>
      <h2 class="editorial-title">${escapeHtml(d.headline || 'The Tyranny of the Default Aesthetic')}</h2>
      <p class="editorial-sub">${escapeHtml(d.sub || 'Why compiling taste at build time restores dignity and intentionality to modern software interfaces.')}</p>
      <div class="editorial-meta">
        <span>By The Editors</span>
        <span>•</span>
        <span>8 min read</span>
        <span>•</span>
        <span>November 2026</span>
      </div>
    </div>

    <!-- Pull Quote -->
    <div class="pull-quote">
      <div class="quote-mark">“</div>
      <p class="quote-text">Design is not how it looks; it is how the constraints resolve into pure signal.</p>
    </div>

    <!-- Two-column Body -->
    <div class="editorial-body">
      <div class="editorial-col">
        <p><span class="dropcap">W</span>hen digital interfaces homogenize under the gravity of generic component kits, software loses its sense of place. Intentional typography, measured spatial rhythms, and deliberate constraints restore dignity to human-tool interaction.</p>
      </div>
      <div class="editorial-col">
        <p>Every design contract in <code>auteur-ui</code> is a compilation of decisions rather than descriptive prose. The machine parses tokens and numbers; the human experiences typographic cadence and deliberate hierarchy.</p>
      </div>
    </div>

    <!-- Plate / Visual Frame -->
    <div class="editorial-plate">
      <div class="plate-inner">
        <div class="plate-grid-lines"></div>
        <span class="plate-badge">PLATE IV</span>
      </div>
      <div class="plate-caption">
        <span>Fig. 1 — Typographic scale and baseline density under viewport constraints.</span>
        <button class="btn-action primary">${escapeHtml(d.cta || 'Read Full Folio')}</button>
      </div>
    </div>
  </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

