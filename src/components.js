function dom(html) {
    const div = document.createElement(`div`);
    div.innerHTML = html;
    const children = [];
    for (let i = 0; i < div.children.length; i++) {
        children.push(div.children[i]);
    }
    return children;
}

class ThemeToggle extends HTMLElement {
    darkIcon = `<%= render("./_icons/moon-line.svg")%>`;
    lightIcon = `<%= render("./_icons/sun-line.svg")%>`;

    connectedCallback() {
        this.render();
        this.style.cursor = "pointer";
    }

    render() {
        this.innerHTML = "";
        const elements = dom(/*html*/ `
        <i class="icon" style="width: 20px;">${
            localStorage.getItem("theme") === "dark" ? this.darkIcon : this.lightIcon
        }</i>
      `);
        this.append(...elements);

        elements[0].addEventListener("click", () => {
            localStorage.setItem("theme", localStorage.getItem("theme") === "dark" ? "light" : "dark");
            document.documentElement.setAttribute("data-theme", localStorage.getItem("theme"));
            this.render();
        });
    }
}
customElements.define("theme-toggle", ThemeToggle);
if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "light");
}
document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") ?? "light");

class ColorBand extends HTMLElement {
    _resizeCanvas() {
        const canvas = this.querySelector("canvas");
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
    }

    connectedCallback() {
        this.style.display = "block";
        this.innerHTML = /*html*/ `<canvas class="w-full h-full"></canvas>`;

        this._resizeCanvas();

        this._resizeObserver = new ResizeObserver(() => this._resizeCanvas());
        this._resizeObserver.observe(this);

        const canvas = this.querySelector("canvas");

        const NUM_POINTS = 120;
        const PLOT_COUNT = 3;

        // Forest green palette
        const palette = [
            "#7ab98a", "#63a373", "#3f7d4e", "#2f5e3b",
            "#5dbd8a", "#8ecf9e", "#4a9e6e", "#a3d4a8",
            "#6bbf8a", "#78c9a0", "#55b07a", "#9cd1a0",
        ];

        // Generate stable random seeds per point per plot
        const plots = [];
        for (let p = 0; p < PLOT_COUNT; p++) {
            const points = [];
            for (let i = 0; i < NUM_POINTS; i++) {
                // Noise state: random scatter
                const noiseX = Math.random() * 2 - 1;
                const noiseY = Math.random() * 2 - 1;

                // Line state: y = x with tiny jitter
                const t = (i / (NUM_POINTS - 1)) * 2 - 1;
                const lineX = t + (Math.random() - 0.5) * 0.05;
                const lineY = t + (Math.random() - 0.5) * 0.05;

                // Tight ellipse: tilted 45 degrees
                const angle = (i / NUM_POINTS) * Math.PI * 2;
                const ex = Math.cos(angle) * 0.8;
                const ey = Math.sin(angle) * 0.3;
                const cos45 = Math.cos(Math.PI / 4);
                const sin45 = Math.sin(Math.PI / 4);
                const ellipseX = ex * cos45 - ey * sin45 + (Math.random() - 0.5) * 0.08;
                const ellipseY = ex * sin45 + ey * cos45 + (Math.random() - 0.5) * 0.08;

                // Wide ellipse: looser correlation
                const wex = Math.cos(angle) * 0.7;
                const wey = Math.sin(angle) * 0.55;
                const wideEllipseX = wex * cos45 - wey * sin45 + (Math.random() - 0.5) * 0.12;
                const wideEllipseY = wex * sin45 + wey * cos45 + (Math.random() - 0.5) * 0.12;

                // Triple cluster / trefoil: 3 overlapping ellipses
                const cluster = i % 3;
                const clusterAngle = (i / NUM_POINTS) * Math.PI * 2;
                const clusterOffsets = [
                    { cx: -0.35, cy:  0.35, rot: Math.PI / 5,  rx: 0.35, ry: 0.12 },
                    { cx:  0.0,  cy:  0.0,  rot: Math.PI / 4,  rx: 0.3,  ry: 0.1 },
                    { cx:  0.35, cy: -0.35, rot: Math.PI / 3.5, rx: 0.35, ry: 0.12 },
                ];
                const cl = clusterOffsets[cluster];
                const clx = Math.cos(clusterAngle) * cl.rx;
                const cly = Math.sin(clusterAngle) * cl.ry;
                const cosR = Math.cos(cl.rot);
                const sinR = Math.sin(cl.rot);
                const trefoilX = cl.cx + clx * cosR - cly * sinR + (Math.random() - 0.5) * 0.08;
                const trefoilY = cl.cy + clx * sinR + cly * cosR + (Math.random() - 0.5) * 0.08;

                const color = palette[Math.floor(Math.random() * palette.length)];
                const radius = 1.2 + Math.random() * 1.2;

                points.push({
                    noiseX, noiseY,
                    lineX, lineY,
                    ellipseX, ellipseY,
                    wideEllipseX, wideEllipseY,
                    trefoilX, trefoilY,
                    color, radius,
                });
            }
            plots.push(points);
        }


        // Left plot: single ellipse cycle
        const keyframesLeft = ["noise", "wideEllipse", "ellipse", "wideEllipse"];
        // Right plot: trefoil / triple-cluster cycle
        const keyframesRight = ["noise", "wideEllipse", "trefoil", "wideEllipse"];

        function getPos(point, fromState, toState, blend) {
            const states = {
                noise: [point.noiseX, point.noiseY],
                line: [point.lineX, point.lineY],
                ellipse: [point.ellipseX, point.ellipseY],
                wideEllipse: [point.wideEllipseX, point.wideEllipseY],
                trefoil: [point.trefoilX, point.trefoilY],
            };
            const from = states[fromState];
            const to = states[toState];
            return [
                from[0] + (to[0] - from[0]) * blend,
                from[1] + (to[1] - from[1]) * blend,
            ];
        }

        // Smooth sinusoidal easing — no hard stops at boundaries
        function smoothStep(t) {
            return (1 - Math.cos(t * Math.PI)) / 2;
        }

        const PHASE_DURATION = 3000;
        const TOTAL_PHASES = keyframesLeft.length; // both have same length
        const CYCLE = PHASE_DURATION * TOTAL_PHASES;

        const startTime = performance.now();

        const drawAxes = (ctx, cx, cy, size) => {
            const axisColor = getComputedStyle(document.documentElement)
                .getPropertyValue("--border-color").trim() || "#454545";
            ctx.strokeStyle = axisColor;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx, cy + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - size, cy);
            ctx.lineTo(cx + size, cy);
            ctx.stroke();
            ctx.globalAlpha = 1;
        };

        const animate = () => {
            if (!this.isConnected) return;

            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const plotWidth = w / PLOT_COUNT;
            const pad = Math.min(plotWidth, h) * 0.12;

            ctx.clearRect(0, 0, w, h);

            const elapsed = performance.now() - startTime;

            for (let p = 0; p < PLOT_COUNT; p++) {
                const cx = plotWidth * p + plotWidth / 2;
                const cy = h / 2;
                const size = (Math.min(plotWidth, h) / 2) - pad;

                drawAxes(ctx, cx, cy, size);

                let phaseFrom, phaseTo, blend;

                if (p === 1) {
                    // Middle: always the tight diagonal line
                    phaseFrom = "line";
                    phaseTo = "line";
                    blend = 0;
                } else {
                    // Each side plot has its own speed and offset for independence
                    const speed = p === 0 ? 1.0 : 0.7;
                    const offset = p === 0 ? 0 : CYCLE * 0.35;
                    const kf = p === 0 ? keyframesLeft : keyframesRight;
                    const t = ((elapsed * speed + offset) % CYCLE) / PHASE_DURATION;
                    const phaseIndex = Math.floor(t) % TOTAL_PHASES;
                    blend = smoothStep(t - Math.floor(t));
                    phaseFrom = kf[phaseIndex];
                    phaseTo = kf[(phaseIndex + 1) % TOTAL_PHASES];
                }

                const points = plots[p];
                for (const pt of points) {
                    const [nx, ny] = getPos(pt, phaseFrom, phaseTo, blend);
                    const sx = cx + nx * size;
                    const sy = cy - ny * size;

                    ctx.beginPath();
                    ctx.arc(sx, sy, pt.radius, 0, Math.PI * 2);
                    ctx.fillStyle = pt.color;
                    ctx.globalAlpha = 0.8;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            this._raf = requestAnimationFrame(animate);
        };

        this._raf = requestAnimationFrame(animate);
    }
    disconnectedCallback() {
        if (this._raf) {
            cancelAnimationFrame(this._raf);
            this._raf = null;
        }
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
    }
}
customElements.define("color-band", ColorBand);

class QuoteLink extends HTMLElement {
    quotesIcon = `<%= render("./_icons/double-quotes-r.svg")%>`;

    constructor() {
        super();
        this.href = "";
    }

    static get observedAttributes() {
        return ["href"];
    }

    attributeChangedCallback(name, _oldValue, newValue) {
        if (name === "href") {
            this.href = newValue;
            this.render();
        }
    }

    connectedCallback() {
        this.style.display = "inline-flex";
        this.render();
    }

    render() {
        this.innerHTML = `
        <a href="${this.href}" class="inline-flex items-baseline" style="color: var(--link-color); font-size: 12px; transform: translateY(-6px);">
          <span>[</span>
          <i class="icon" style="width: 12px;">${this.quotesIcon}</i>
          <span>]</span>
        </a>
      `;
    }
}

customElements.define("q-l", QuoteLink);
