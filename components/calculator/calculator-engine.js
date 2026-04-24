/**
 * @typedef {'+' | '-' | '*' | '/'} Op
 */

function parseDisplay(s) {
  var n = parseFloat(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

/**
 * @param {number} a
 * @param {number} b
 * @param {Op} op
 */
function applyOp(a, b, op) {
  if (op === "+") return a + b;
  if (op === "-") return a - b;
  if (op === "*") return a * b;
  if (op === "/") {
    if (b === 0) return NaN;
    return a / b;
  }
  return b;
}

/**
 * @param {number} n
 */
function formatResult(n) {
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, text: "Error" };
  }
  var s = String(n);
  if (s.length > 14) {
    s = n.toPrecision(10);
    s = s.replace(/\.?0+$/, "");
  } else {
    s = s.replace(/(\.\d*?)0+$/, "$1");
    s = s.replace(/\.$/, "");
  }
  if (s === "-0") s = "0";
  return { ok: true, text: s };
}

/**
 * @returns {{ getDisplay: () => string, digit: (d: string) => void, dot: () => void, setOp: (op: Op) => void, equals: () => void, clear: () => void, backspace: () => void, percent: () => void }}
 */
export function createCalculatorEngine() {
  var display = "0";
  var acc = null;
  /** @type {Op | null} */
  var pending = null;
  var fresh = true;

  function clearAll() {
    display = "0";
    acc = null;
    pending = null;
    fresh = true;
  }

  function getDisplay() {
    return display;
  }

  function digit(d) {
    if (!/^\d$/.test(d)) return;
    if (fresh) {
      display = d;
      fresh = false;
    } else {
      if (display.length >= 12) return;
      if (display === "0" && d !== "0") display = d;
      else if (display === "0" && d === "0") return;
      else display += d;
    }
  }

  function dot() {
    if (fresh) {
      display = "0.";
      fresh = false;
      return;
    }
    if (display.indexOf(".") === -1) {
      display += ".";
    }
  }

  /**
   * @param {Op} op
   */
  function setOp(op) {
    var cur = parseDisplay(display);
    if (Number.isNaN(cur)) {
      clearAll();
      return;
    }
    if (acc !== null && pending && !fresh) {
      var out = applyOp(acc, cur, pending);
      var f = formatResult(out);
      display = f.text;
      if (!f.ok) {
        acc = null;
        pending = null;
        fresh = true;
        return;
      }
      acc = out;
    } else {
      acc = cur;
    }
    pending = op;
    fresh = true;
  }

  function equals() {
    if (pending === null) return;
    var cur = parseDisplay(display);
    if (Number.isNaN(cur)) {
      clearAll();
      return;
    }
    if (acc === null) {
      acc = cur;
    }
    var out = applyOp(acc, cur, pending);
    var f = formatResult(out);
    display = f.text;
    acc = f.ok ? out : null;
    pending = null;
    fresh = true;
  }

  function backspace() {
    if (fresh) return;
    if (display.length <= 1) {
      display = "0";
      fresh = true;
    } else {
      display = display.slice(0, -1);
    }
  }

  function percent() {
    var n = parseDisplay(display);
    if (Number.isNaN(n)) {
      clearAll();
      return;
    }
    var out = n / 100;
    var f = formatResult(out);
    display = f.text;
    acc = null;
    pending = null;
    fresh = true;
  }

  return {
    getDisplay: getDisplay,
    digit: digit,
    dot: dot,
    setOp: setOp,
    equals: equals,
    clear: clearAll,
    backspace: backspace,
    percent: percent,
  };
}
