// Shared interactions for the portfolio.
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }));
}

// Rotating role text.
const typewriter = document.getElementById("typewriter");
if (typewriter) {
  const roles = ["a Data Analyst", "a Power BI Developer", "a BI Analyst", "an Excel Specialist"];
  let role = 0, position = roles[0].length, deleting = true;
  function typeRole() {
    const word = roles[role];
    position += deleting ? -1 : 1;
    typewriter.textContent = word.slice(0, position);
    let delay = deleting ? 42 : 78;
    if (!deleting && position === word.length) { deleting = true; delay = 1500; }
    else if (deleting && position === 0) { deleting = false; role = (role + 1) % roles.length; delay = 350; }
    window.setTimeout(typeRole, delay);
  }
  window.setTimeout(typeRole, 1700);
}

// Project category filters supporting multi-word tags
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter.trim().toLowerCase();

    filterButtons.forEach(btn => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    projectCards.forEach(card => {
      const rawTags = card.dataset.tags || "";
      const matches = rawTags.toLowerCase().includes(selectedFilter.replace("-", " "));

      card.hidden = selectedFilter !== "all" && !matches;
    });
  });
});

// Accessible image preview modal.
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeButton = document.querySelector(".close-btn");

function closeModal() {
  if (!modal || !modalImage) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalImage.src = "";
  document.body.classList.remove("modal-open");
}

document.querySelectorAll(".preview-btn").forEach(button => button.addEventListener("click", () => {
  if (!modal || !modalImage) return;
  modalImage.src = button.dataset.image || "";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closeButton?.focus();
}));

closeButton?.addEventListener("click", closeModal);
modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

// Contact form handler
const form = document.getElementById("contactForm");
if (form) form.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
  const status = document.getElementById("message-status");
  if (status) status.style.display = "block";
  window.location.href = `mailto:frankpatojnr@gmail.com?subject=${subject}&body=${body}`;
});

// Skill track animations
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.2 });
  document.querySelectorAll(".skill-track").forEach(track => observer.observe(track));
} else {
  document.querySelectorAll(".skill-track").forEach(track => track.classList.add("in-view"));
}

/* ==========================================================================
   LIVE FINANCIAL MARKET DASHBOARD & CANDLESTICK / LINE ENGINE
   ========================================================================== */
class LiveMarketTerminal {
  constructor() {
    this.canvas = document.getElementById("marketChartCanvas");
    if (!this.canvas) return; // Exit gracefully on non-home pages

    this.ctx = this.canvas.getContext("2d");
    this.pairSelect = document.getElementById("currencyPairSelect");
    this.pairTitle = document.getElementById("pairDisplayTitle");
    this.statusBadge = document.getElementById("marketApiStatus");
    this.statusText = document.getElementById("statusText");

    // Metric Displays
    this.spotPriceEl = document.getElementById("liveSpotPrice");
    this.priceChangeEl = document.getElementById("livePriceChange");
    this.highLowEl = document.getElementById("liveHighLow");
    this.openVolEl = document.getElementById("liveOpenVol");
    this.lastTickEl = document.getElementById("lastTickTime");

    // Controls
    this.btnCandle = document.getElementById("btnChartCandle");
    this.btnLine = document.getElementById("btnChartLine");
    this.tfButtons = document.querySelectorAll(".tf-btn");
    this.tooltip = document.getElementById("chartTooltip");

    // Chart State Configuration
    this.currentPair = "EURUSD";
    this.currentTimeframe = "5M";
    this.chartMode = "candle"; // 'candle' or 'line'
    this.isLive = false;
    this.candles = [];
    this.maxCandles = 40;
    this.lastPrice = 1.08420;
    this.basePrice = 1.08375;
    this.highPrice = 1.08850;
    this.lowPrice = 1.08110;
    this.openPrice = 1.08375;

    this.pairConfigs = {
      "EURUSD": { base: 1.08420, decimals: 5, spread: "0.8 pips", symbol: "$" },
      "GBPUSD": { base: 1.29160, decimals: 5, spread: "1.2 pips", symbol: "$" },
      "USDJPY": { base: 154.250, decimals: 3, spread: "0.02 yen", symbol: "¥" },
      "BTCUSD": { base: 67450.0, decimals: 2, spread: "12.50 USD", symbol: "$" }
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.resizeCanvas();
    this.resetSeriesForPair(this.currentPair);
    this.fetchRealMarketData();

    // Start Real-Time Tick Loop (1.2 seconds update)
    setInterval(() => this.processMarketTick(), 1200);

    // Live API Poll Refresh (every 30 seconds)
    setInterval(() => this.fetchRealMarketData(), 30000);

    // Smooth Animation Frame Loop
    const renderLoop = () => {
      this.drawChart();
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    this.pairSelect?.addEventListener("change", (e) => {
      this.currentPair = e.target.value;
      if (this.pairTitle) this.pairTitle.textContent = `${e.target.options[e.target.selectedIndex].text} Market Feed`;
      this.resetSeriesForPair(this.currentPair);
      this.fetchRealMarketData();
    });

    this.tfButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.tfButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.currentTimeframe = btn.dataset.tf;
        this.resetSeriesForPair(this.currentPair);
      });
    });

    this.btnCandle?.addEventListener("click", () => {
      this.chartMode = "candle";
      this.btnCandle.classList.add("active");
      this.btnLine.classList.remove("active");
    });

    this.btnLine?.addEventListener("click", () => {
      this.chartMode = "line";
      this.btnLine.classList.add("active");
      this.btnCandle.classList.remove("active");
    });

    // Tooltip Crosshair Listener
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseleave", () => {
      if (this.tooltip) this.tooltip.hidden = true;
    });
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  resetSeriesForPair(pairKey) {
    const config = this.pairConfigs[pairKey] || this.pairConfigs["EURUSD"];
    this.lastPrice = config.base;
    this.openPrice = config.base * (1 - (Math.random() - 0.5) * 0.002);
    this.highPrice = Math.max(this.lastPrice, this.openPrice);
    this.lowPrice = Math.min(this.lastPrice, this.openPrice);

    this.candles = [];
    let current = this.openPrice;

    for (let i = 0; i < this.maxCandles; i++) {
      const volatility = config.base * 0.0008;
      const change = (Math.random() - 0.49) * volatility;
      const open = current;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;

      this.candles.push({ open, high, low, close, timestamp: new Date(Date.now() - (this.maxCandles - i) * 60000) });
      current = close;
      if (high > this.highPrice) this.highPrice = high;
      if (low < this.lowPrice) this.lowPrice = low;
    }
    this.lastPrice = current;
  }

  async fetchRealMarketData() {
    try {
      // Primary API: ExchangeRate-API for Live Forex
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error("API rate limited");
      const data = await res.json();

      if (data && data.rates) {
        this.isLive = true;
        this.updateStatusBadge(true, "LIVE MARKET");

        let rate = 1.0;
        if (this.currentPair === "EURUSD") rate = 1 / data.rates.EUR;
        else if (this.currentPair === "GBPUSD") rate = 1 / data.rates.GBP;
        else if (this.currentPair === "USDJPY") rate = data.rates.JPY;
        else if (this.currentPair === "BTCUSD") rate = data.rates.BTC ? (1 / data.rates.BTC) : 67450.0;

        if (rate && !isNaN(rate)) {
          this.applyRealPriceTick(rate);
        }
      }
    } catch (err) {
      // Fallback: Labeled Simulation Engine
      this.isLive = false;
      this.updateStatusBadge(false, "SIMULATED MARKET");
    }
  }

  updateStatusBadge(live, label) {
    if (!this.statusBadge || !this.statusText) return;
    this.statusText.textContent = label;
    if (live) {
      this.statusBadge.className = "window-status is-live";
    } else {
      this.statusBadge.className = "window-status is-simulated";
    }
  }

  applyRealPriceTick(newPrice) {
    const config = this.pairConfigs[this.currentPair];
    this.lastPrice = newPrice;
    if (newPrice > this.highPrice) this.highPrice = newPrice;
    if (newPrice < this.lowPrice) this.lowPrice = newPrice;

    // Update active candle close
    if (this.candles.length > 0) {
      const activeCandle = this.candles[this.candles.length - 1];
      activeCandle.close = newPrice;
      activeCandle.high = Math.max(activeCandle.high, newPrice);
      activeCandle.low = Math.min(activeCandle.low, newPrice);
    }
    this.updateMetricsUI();
  }

  processMarketTick() {
    const config = this.pairConfigs[this.currentPair];
    const volatility = config.base * (this.currentTimeframe === "1M" ? 0.0004 : 0.0008);
    const delta = (Math.random() - 0.495) * volatility;
    const nextPrice = Math.max(config.base * 0.5, this.lastPrice + delta);

    this.lastPrice = nextPrice;
    if (nextPrice > this.highPrice) this.highPrice = nextPrice;
    if (nextPrice < this.lowPrice) this.lowPrice = nextPrice;

    const activeCandle = this.candles[this.candles.length - 1];
    if (activeCandle) {
      activeCandle.close = nextPrice;
      activeCandle.high = Math.max(activeCandle.high, nextPrice);
      activeCandle.low = Math.min(activeCandle.low, nextPrice);
    }

    // Push new candle periodically
    if (Math.random() > 0.75) {
      this.candles.shift();
      this.candles.push({
        open: nextPrice,
        high: nextPrice,
        low: nextPrice,
        close: nextPrice,
        timestamp: new Date()
      });
    }

    this.updateMetricsUI();
  }

  updateMetricsUI() {
    const config = this.pairConfigs[this.currentPair];
    const dec = config.decimals;

    if (this.spotPriceEl) this.spotPriceEl.textContent = `${config.symbol}${this.lastPrice.toFixed(dec)}`;

    const diff = this.lastPrice - this.openPrice;
    const pct = (diff / this.openPrice) * 100;
    const sign = diff >= 0 ? "+" : "";

    if (this.priceChangeEl) {
      this.priceChangeEl.textContent = `${sign}${diff.toFixed(dec)} (${sign}${pct.toFixed(2)}%)`;
      this.priceChangeEl.className = diff >= 0 ? "badge-up" : "badge-down";
    }

    if (this.highLowEl) {
      this.highLowEl.textContent = `${this.highPrice.toFixed(dec)} / ${this.lowPrice.toFixed(dec)}`;
    }

    if (this.openVolEl) {
      this.openVolEl.textContent = `${this.openPrice.toFixed(dec)}`;
    }

    if (this.lastTickEl) {
      const now = new Date();
      this.lastTickEl.textContent = `Tick: ${now.toTimeString().split(' ')[0]}`;
    }
  }

  drawChart() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    if (this.candles.length < 2) return;

    // Grid Dimensions
    const padding = { top: 15, bottom: 25, left: 10, right: 55 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Compute Min / Max Prices for Range Scaling
    let minP = Infinity, maxP = -Infinity;
    this.candles.forEach(c => {
      if (c.low < minP) minP = c.low;
      if (c.high > maxP) maxP = c.high;
    });

    const pricePadding = (maxP - minP) * 0.1 || 0.001;
    minP -= pricePadding;
    maxP += pricePadding;

    const getY = (price) => padding.top + chartH - ((price - minP) / (maxP - minP)) * chartH;

    // Draw Subtle Grid Lines & Y-Axis Labels
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    this.ctx.fillStyle = "#727b8e";
    this.ctx.font = "10px 'JetBrains Mono', monospace";

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padding.top + (chartH / steps) * i;
      const priceVal = maxP - ((maxP - minP) / steps) * i;

      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(w - padding.right, y);
      this.ctx.stroke();

      const config = this.pairConfigs[this.currentPair];
      this.ctx.fillText(priceVal.toFixed(config.decimals), w - padding.right + 6, y + 3);
    }

    // Render Candles or Line Path
    const candleW = (chartW / this.candles.length) * 0.65;
    const stepX = chartW / (this.candles.length - 1 || 1);

    if (this.chartMode === "candle") {
      this.candles.forEach((c, idx) => {
        const x = padding.left + idx * stepX;
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        const isUp = c.close >= c.open;
        const color = isUp ? "#45d69b" : "#ff5252";

        // Wick
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, highY);
        this.ctx.lineTo(x, lowY);
        this.ctx.stroke();

        // Body
        this.ctx.fillStyle = color;
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(Math.abs(closeY - openY), 2);
        this.ctx.fillRect(x - candleW / 2, bodyY, candleW, bodyH);
      });
    } else {
      // Line Chart Path with Glowing Gradient Area
      this.ctx.beginPath();
      this.candles.forEach((c, idx) => {
        const x = padding.left + idx * stepX;
        const y = getY(c.close);
        if (idx === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });

      this.ctx.strokeStyle = "#9a75ff";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Area Fill
      const lastX = padding.left + (this.candles.length - 1) * stepX;
      this.ctx.lineTo(lastX, padding.top + chartH);
      this.ctx.lineTo(padding.left, padding.top + chartH);
      this.ctx.closePath();

      const grad = this.ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, "rgba(154, 117, 255, 0.25)");
      grad.addColorStop(1, "rgba(154, 117, 255, 0.0)");
      this.ctx.fillStyle = grad;
      this.ctx.fill();
    }

    // Draw Dynamic Price Pulse Head Indicator
    const lastCandle = this.candles[this.candles.length - 1];
    const headX = padding.left + (this.candles.length - 1) * stepX;
    const headY = getY(lastCandle.close);

    this.ctx.fillStyle = lastCandle.close >= lastCandle.open ? "#45d69b" : "#ff5252";
    this.ctx.beginPath();
    this.ctx.arc(headX, headY, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  handleMouseMove(e) {
    if (!this.tooltip) return;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padding = { left: 10, right: 55 };
    const chartW = this.canvas.width - padding.left - padding.right;

    const stepX = chartW / (this.candles.length - 1 || 1);
    const idx = Math.round((mouseX - padding.left) / stepX);

    if (idx >= 0 && idx < this.candles.length) {
      const c = this.candles[idx];
      const config = this.pairConfigs[this.currentPair];

      this.tooltip.hidden = false;
      this.tooltip.style.left = `${mouseX}px`;
      this.tooltip.style.top = `30px`;
      this.tooltip.innerHTML = `
        <div><strong>O:</strong> ${c.open.toFixed(config.decimals)}</div>
        <div><strong>H:</strong> ${c.high.toFixed(config.decimals)}</div>
        <div><strong>L:</strong> ${c.low.toFixed(config.decimals)}</div>
        <div><strong>C:</strong> ${c.close.toFixed(config.decimals)}</div>
      `;
    } else {
      this.tooltip.hidden = true;
    }
  }
}

// Initialize Terminal on DOM load
document.addEventListener("DOMContentLoaded", () => {
  new LiveMarketTerminal();
});
