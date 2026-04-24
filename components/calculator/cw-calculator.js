import { createCalculatorEngine } from "./calculator-engine.js";

const SHEET = /* css */ `
  :host {
    display: block;
    outline: none;
    --calc-bg: #fffaf4;
    --calc-key: #f0e6d8;
    --calc-key-active: #e5d5c0;
    --calc-key-op: #d4c4a8;
    --calc-text: #3a332c;
    --calc-border: #e5d9c8;
  }

  .shell {
    font-family: system-ui, "Segoe UI", Roboto, sans-serif;
    color: var(--calc-text);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .display {
    background: #faf3ea;
    border: 1px solid var(--calc-border);
    border-radius: 12px;
    padding: 0.65rem 0.9rem;
    min-height: 2.6rem;
    text-align: right;
    font-size: clamp(1.35rem, 5vw, 1.6rem);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    word-break: break-all;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.4rem;
    margin-top: 0.6rem;
  }

  button {
    font: inherit;
    font-size: 1.05rem;
    font-weight: 600;
    min-height: 48px;
    border: 1px solid var(--calc-border);
    border-radius: 10px;
    background: var(--calc-key);
    color: var(--calc-text);
    cursor: pointer;
  }

  button:active {
    background: var(--calc-key-active);
  }

  button.op {
    background: var(--calc-key-op);
  }

  button.wide {
    grid-column: span 2;
  }

  button:focus-visible {
    outline: 2px solid #b89a72;
    outline-offset: 2px;
  }

  @media (max-width: 380px) {
    .grid { gap: 0.3rem; }
    button { min-height: 44px; font-size: 0.98rem; }
  }
`;

/**
 * @param {object} eng
 * @param {import("./calculator-engine.js").Op} op
 * @param {() => void} update
 */
function bindOp(eng, op, update) {
  return function () {
    eng.setOp(op);
    update();
  };
}

export class CwCalculator extends HTMLElement {
  constructor() {
    super();
    this.tabIndex = 0;
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    var eng = createCalculatorEngine();
    var el = this.shadowRoot;
    if (!el) return;

    el.innerHTML = ""
      + "<style>" + SHEET + "</style>"
      + "<div class=\"shell\" part=\"shell\">"
      + "  <div class=\"display\" part=\"display\" role=\"status\" aria-live=\"polite\" aria-atomic=\"true\">0</div>"
      + "  <div class=\"grid\" part=\"grid\"></div>"
      + "</div>";

    var display = el.querySelector(".display");
    var grid = el.querySelector(".grid");
    if (!display || !grid) return;

    function update() {
      display.textContent = eng.getDisplay();
    }

    /**
     * @param {string} text
     * @param {() => void} onClick
     * @param {{ op?: boolean, wide?: boolean }} opts
     */
    function addBtn(text, onClick, opts) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      if (opts && opts.op) b.className = "op";
      if (opts && opts.wide) b.className = (b.className + " wide").trim();
      b.addEventListener("click", onClick);
      grid.appendChild(b);
    }

    addBtn("C", function () { eng.clear(); update(); });
    addBtn("⌫", function () { eng.backspace(); update(); });
    addBtn("%", function () { eng.percent(); update(); });
    addBtn("÷", bindOp(eng, "/", update), { op: true });

    addBtn("7", function () { eng.digit("7"); update(); });
    addBtn("8", function () { eng.digit("8"); update(); });
    addBtn("9", function () { eng.digit("9"); update(); });
    addBtn("×", bindOp(eng, "*", update), { op: true });

    addBtn("4", function () { eng.digit("4"); update(); });
    addBtn("5", function () { eng.digit("5"); update(); });
    addBtn("6", function () { eng.digit("6"); update(); });
    addBtn("−", bindOp(eng, "-", update), { op: true });

    addBtn("1", function () { eng.digit("1"); update(); });
    addBtn("2", function () { eng.digit("2"); update(); });
    addBtn("3", function () { eng.digit("3"); update(); });
    addBtn("+", bindOp(eng, "+", update), { op: true });

    (function () {
      var w = document.createElement("button");
      w.className = "wide";
      w.type = "button";
      w.textContent = "0";
      w.addEventListener("click", function () { eng.digit("0"); update(); });
      grid.appendChild(w);
    })();
    addBtn(".", function () { eng.dot(); update(); });
    addBtn("=", function () { eng.equals(); update(); }, { op: true });

    this._onKey = function (e) {
      if (e.defaultPrevented) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (k === "0" || k === "1" || k === "2" || k === "3" || k === "4" || k === "5" || k === "6" || k === "7" || k === "8" || k === "9") {
        e.preventDefault();
        eng.digit(k);
        update();
        return;
      }
      if (k === "." || k === ",") {
        e.preventDefault();
        eng.dot();
        update();
        return;
      }
      if (k === "Enter" || k === "=") {
        e.preventDefault();
        eng.equals();
        update();
        return;
      }
      if (k === "Escape") {
        e.preventDefault();
        eng.clear();
        update();
        return;
      }
      if (k === "Backspace") {
        e.preventDefault();
        eng.backspace();
        update();
        return;
      }
      if (k === "Delete") {
        e.preventDefault();
        eng.clear();
        update();
        return;
      }
      if (k === "+") { e.preventDefault(); eng.setOp("+"); update(); return; }
      if (k === "-") { e.preventDefault(); eng.setOp("-"); update(); return; }
      if (k === "*") { e.preventDefault(); eng.setOp("*"); update(); return; }
      if (k === "/") { e.preventDefault(); eng.setOp("/"); update(); return; }
    };
    this.addEventListener("keydown", this._onKey);

    update();
  }

  disconnectedCallback() {
    if (this._onKey) {
      this.removeEventListener("keydown", this._onKey);
    }
  }
}

if (!customElements.get("cw-calculator")) {
  customElements.define("cw-calculator", CwCalculator);
}
