function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setHljsCss(isDark) {
  var cssName = isDark ? "darcula.css" : "github.css";
  var cssUrl = "/public/lib/highlight/styles/" + cssName;
  var styleEl = document.getElementById("js_hljsCss");
  styleEl.setAttribute("href", cssUrl);
  setCookie("theme", isDark ? "dark" : "light", 10);

  if (document.body) {
    if (isDark) {
      document.body.className = "bloghub theme-dark";
    } else {
      document.body.className = "bloghub theme-light";
    }
  }
}

function initAndDeleteOsTheme() {
  if (window.matchMedia) {
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    setHljsCss(media.matches);

    media.addEventListener("change", function () {
      var isDark = media.matches;
      setHljsCss(isDark);
    });
  }
}

initAndDeleteOsTheme();
