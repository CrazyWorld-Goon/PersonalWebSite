import "./cw-calculator.js";

var el = document.getElementById("calculator-dialog");
var openBtn = document.getElementById("open-calculator");
var closeBtn = document.getElementById("calculator-dialog-close");

if (!(el instanceof HTMLDialogElement)) {
  // Dialog missing — skip
} else {
  if (openBtn) {
    openBtn.addEventListener("click", function () {
      el.showModal();
      queueMicrotask(function () {
        var calc = document.querySelector("cw-calculator");
        if (calc) calc.focus();
      });
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      el.close();
    });
  }

  el.addEventListener("click", function (e) {
    if (e.target === el) {
      el.close();
    }
  });
}
