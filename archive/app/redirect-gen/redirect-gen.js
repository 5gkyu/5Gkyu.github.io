(function () {
    const urlInput = document.getElementById("targetUrl");
    const pasteBtn = document.getElementById("pasteBtn");
    const genBtn = document.getElementById("genBtn");
    const secInput = document.getElementById("waitSec");

    if (!urlInput || !pasteBtn || !genBtn || !secInput) {
        return;
    }

    const T_TITLE = "Redirecting...";
    const T_STYLE = "body{background:#fdfaf3;color:#6a564a;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:1.5rem;} .btn{display:inline-block;padding:12px 30px;background:#9ab08f;color:#fff;text-decoration:none;border-radius:999px;font-weight:bold;margin-top:20px;box-shadow:0 4px 10px rgba(0,0,0,0.1);transition:0.2s;} .btn:hover{transform:translateY(-2px);opacity:0.9;} .card{background:#fff;padding:36px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,0.05);max-width:420px;width:92%;}";
    const SCRIPT_OPEN = "\x3Cscript>";
    const SCRIPT_CLOSE = "\x3C/script>";
    const EMPTY_MESSAGE = "上のURLを入力して「HTMLを生成」を押してください";

    function escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalizeUrl(raw) {
        try {
            return new URL(raw).toString();
        } catch (error) {
            return raw;
        }
    }

    function build1(url) {
        const safe = escapeHtml(url);
        const jsUrl = JSON.stringify(url);
        return [
            "<!DOCTYPE html>",
            "<html lang=\"ja\">",
            "<head>",
            "<meta charset=\"UTF-8\">",
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
            "<title>" + T_TITLE + "</title>",
            "<meta http-equiv=\"refresh\" content=\"0;url=" + safe + "\">",
            "<style>" + T_STYLE + "</style>",
            "</head>",
            "<body>",
            "<p>自動で転送します...</p>",
            "<a href=\"" + safe + "\" class=\"btn\">移動する</a>",
            SCRIPT_OPEN + "setTimeout(function(){location.href=" + jsUrl + "},500)" + SCRIPT_CLOSE,
            "</body>",
            "</html>"
        ].join("\n");
    }

    function build2(url) {
        const safe = escapeHtml(url);
        return [
            "<!DOCTYPE html>",
            "<html lang=\"ja\">",
            "<head>",
            "<meta charset=\"UTF-8\">",
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
            "<title>" + T_TITLE + "</title>",
            "<style>" + T_STYLE + "</style>",
            "</head>",
            "<body>",
            "<div class=\"card\">",
            "<h2 style=\"margin-top:0;\">" + T_TITLE + "</h2>",
            "<p>ボタンを押すと指定したページへ移動します。</p>",
            "<a href=\"" + safe + "\" class=\"btn\">ページを開く</a>",
            "</div>",
            "</body>",
            "</html>"
        ].join("\n");
    }

    function build3(url, sec) {
        const safe = escapeHtml(url);
        const jsUrl = JSON.stringify(url);
        const seconds = Math.max(1, Math.min(60, sec));
        return [
            "<!DOCTYPE html>",
            "<html lang=\"ja\">",
            "<head>",
            "<meta charset=\"UTF-8\">",
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
            "<title>" + T_TITLE + "</title>",
            "<style>" + T_STYLE + " .num{font-size:3rem;font-weight:bold;color:#eeafa1;margin:20px 0;}</style>",
            "</head>",
            "<body>",
            "<div class=\"num\" id=\"c\">" + seconds + "</div>",
            "<p>カウントダウン終了後に自動で転送します。</p>",
            "<a href=\"" + safe + "\" class=\"btn\">先に移動する</a>",
            SCRIPT_OPEN + "var n=" + seconds + ";var i=setInterval(function(){n--;document.getElementById('c').textContent=n;if(n<=0){clearInterval(i);location.href=" + jsUrl + "}},1000)" + SCRIPT_CLOSE,
            "</body>",
            "</html>"
        ].join("\n");
    }

    function updateAll() {
        const raw = urlInput.value.trim();
        if (!raw) {
            return;
        }

        const url = normalizeUrl(raw);
        const sec = parseInt(secInput.value, 10) || 5;

        ["code-1", "code-2", "code-3"].forEach(function (id, index) {
            const el = document.getElementById(id);
            el.classList.remove("is-empty");

            if (index === 0) {
                el.textContent = build1(url);
            }
            if (index === 1) {
                el.textContent = build2(url);
            }
            if (index === 2) {
                el.textContent = build3(url, sec);
            }
        });
    }

    pasteBtn.addEventListener("click", async function () {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            if (window.HlToast) {
                window.HlToast.show("クリップボードから貼り付けました");
            }
        } catch (error) {
            if (window.HlToast) {
                window.HlToast.show("貼り付けに失敗しました", "warning");
            }
        }
    });

    genBtn.addEventListener("click", function () {
        const raw = urlInput.value.trim();

        if (!raw) {
            if (window.HlToast) {
                window.HlToast.show("転送先URLを入力してください", "warning");
            }
            urlInput.focus();
            return;
        }

        updateAll();
        if (window.HlToast) {
            window.HlToast.show("HTMLを生成しました");
        }
    });

    secInput.addEventListener("input", function () {
        const code3 = document.getElementById("code-3");
        if (!code3.classList.contains("is-empty")) {
            updateAll();
        }
    });

    document.body.addEventListener("click", function (event) {
        const btn = event.target.closest("hl-button");
        if (!btn) {
            return;
        }

        const targetId = btn.getAttribute("data-target");
        if (!targetId) {
            return;
        }

        const codeEl = document.getElementById(targetId);
        if (!codeEl || codeEl.classList.contains("is-empty") || codeEl.textContent === EMPTY_MESSAGE) {
            if (window.HlToast) {
                window.HlToast.show("先にHTMLを生成してください", "warning");
            }
            return;
        }

        const code = codeEl.textContent;

        if (btn.classList.contains("copy-btn")) {
            navigator.clipboard.writeText(code).then(function () {
                if (window.HlToast) {
                    window.HlToast.show("コードをコピーしました");
                }
            });
        }

        if (btn.classList.contains("dl-btn")) {
            const blob = new Blob([code], { type: "text/html;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "redirect.html";
            link.click();
            URL.revokeObjectURL(link.href);
        }

        if (btn.classList.contains("pv-btn")) {
            const blob = new Blob([code], { type: "text/html;charset=utf-8" });
            window.open(URL.createObjectURL(blob), "_blank", "noopener");
        }
    });
})();
