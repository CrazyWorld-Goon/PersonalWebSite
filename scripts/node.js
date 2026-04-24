#!/usr/bin/env node
(function () {
  var STORAGE_KEY = "crazyworld-lang";
  var body = document.body;
  var btnEn = document.getElementById("lang-en");
  var btnRu = document.getElementById("lang-ru");

  function setLang(lang) {
    if (lang !== "en" && lang !== "ru") lang = "en";
    body.classList.remove("lang-en", "lang-ru");
    body.classList.add("lang-" + lang);
    document.documentElement.lang = lang;
    if (btnEn) btnEn.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    if (btnRu) btnRu.setAttribute("aria-pressed", lang === "ru" ? "true" : "false");
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
  }

  function initLang() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}
    if (saved === "en" || saved === "ru") {
      setLang(saved);
      return;
    }
    var nav = navigator.language || "";
    if (nav.toLowerCase().startsWith("ru")) setLang("ru");
    else setLang("en");
  }

  if (btnEn) btnEn.addEventListener("click", function () { setLang("en"); });
  if (btnRu) btnRu.addEventListener("click", function () { setLang("ru"); });

  initLang();
})();
