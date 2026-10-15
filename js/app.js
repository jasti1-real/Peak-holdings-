// Main Peak Holdings UI and authentication flow.
(() => {
  const fmt = window.PeakProducts.format;
  const auth = document.getElementById("auth");
  const app = document.getElementById("app");
  let user = null;
  window.PeakProducts.render(window.PeakProducts.fallbackItems);

  function showTab(id) {
    document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === id));
    document.querySelectorAll(".nav").forEach(button => button.classList.toggle("active", button.dataset.tab === id));
  }
  function enter(account) {
    user = account;
    auth.classList.add("hidden");
    app.classList.remove("hidden");
    document.getElementById("userGreeting").textContent = (account.name || "Member") + " 👋";
    document.getElementById("userPhone").textContent = account.phone || "";
    document.getElementById("accountName").textContent = account.name || "Member";
    document.getElementById("accountPhone").textContent = account.phone || "";
    const code = account.referralCode || "—";
    document.getElementById("refCode").textContent = code;
    const link = location.origin + location.pathname + "?ref=" + encodeURIComponent(code);
    document.getElementById("homeLink").value = document.getElementById("refLink").value = link;
    showTab("home");
  }
  async function loadAccount() {
    const token = localStorage.getItem("peak_token");
    if (!token) return;
    const result = await window.PeakAPI.get("/me", token);
    enter(result.user);
    document.getElementById("balance").textContent = fmt(result.balanceUgx || 0);
    renderLedger(result.ledger || []);
  }
  function renderLedger(items) {
    const rows = items.map(item => '<tr><td>' + String(item.description || item.type || "").replace(/[<>]/g, "") +
      '</td><td>' + String(item.direction || "").replace(/[<>]/g, "") + '</td><td>UGX ' + fmt(item.amount_ugx) +
      '</td><td>' + String(item.status || "").replace(/[<>]/g, "") + '</td></tr>').join("");
    window.peakLedgerHtml = '<div class="tablewrap"><table><thead><tr><th>Transaction</th><th>Direction</th><th>Amount</th><th>Status</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="4">No transactions yet.</td></tr>') + '</tbody></table></div>';
  }
  document.querySelectorAll(".nav").forEach(button => button.addEventListener("click", () => showTab(button.dataset.tab)));
  document.getElementById("showLogin").addEventListener("click", () => {
    document.getElementById("register").classList.add("hidden");
    document.getElementById("login").classList.remove("hidden");
  });
  document.getElementById("showRegister").addEventListener("click", () => {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("register").classList.remove("hidden");
  });
  document.getElementById("registerForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirm")) return alert("Passwords do not match.");
    const button = event.submitter;
    button.disabled = true; button.textContent = "Creating account…";
    try {
      const data = await window.PeakAPI.post("/register", {
        name: form.get("name"), phone: form.get("phone"),
        password: form.get("password"), referral: form.get("referral")
      });
      localStorage.setItem("peak_token", data.token);
      localStorage.setItem("peak_user", JSON.stringify(data.user));
      enter(data.user);
      document.getElementById("balance").textContent = fmt(data.bonusUgx || 0);
      renderLedger([{description:"Registration welcome bonus",type:"welcome_bonus",direction:"credit",amount_ugx:data.bonusUgx||5000,status:"successful"}]);
      alert("Account created successfully.");
    } catch (error) { alert(error.message); }
    finally { button.disabled = false; button.textContent = "Create account"; }
  });
  document.getElementById("loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget), button = event.submitter;
    button.disabled = true; button.textContent = "Logging in…";
    try {
      const data = await window.PeakAPI.post("/login", {phone:form.get("phone"),password:form.get("password")});
      localStorage.setItem("peak_token", data.token);
      localStorage.setItem("peak_user", JSON.stringify(data.user));
      enter(data.user);
      const result = await window.PeakAPI.get("/me", data.token);
      document.getElementById("balance").textContent = fmt(result.balanceUgx || 0);
      renderLedger(result.ledger || []);
    } catch (error) { alert(error.message); }
    finally { button.disabled = false; button.textContent = "Log in"; }
  });
  document.querySelectorAll("[data-copy]").forEach(button => button.addEventListener("click", async () => {
    const input = document.getElementById(button.dataset.copy);
    try { await navigator.clipboard.writeText(input.value); button.textContent = "Copied!"; setTimeout(() => button.textContent = "Copy", 1300); }
    catch { input.select(); document.execCommand("copy"); }
  }));
  document.getElementById("productList").addEventListener("click", event => {
    const button = event.target.closest('[data-action="buy"]');
    if (button) alert("Machine " + button.dataset.product + ": purchases will be enabled after verified deposits and server-side purchase accounting are implemented.");
  });
  document.querySelectorAll("[data-action]").forEach(button => {
    if (button.dataset.action === "buy") return;
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "deposit") alert("Deposits are not enabled yet. Marzpay integration must be completed first.");
      else if (action === "withdraw") alert("Withdrawals are not enabled yet. Verified payment processing and balance checks are required.");
      else if (action === "password") alert("Secure password change is not implemented yet.");
      else if (action === "ledger") {
        const win = window.open("", "_blank");
        if (win) { win.document.write("<title>Peak Holdings Ledger</title><h2>Transaction ledger</h2>" + (window.peakLedgerHtml || "<p>No ledger loaded.</p>")); win.document.close(); }
        else alert("Allow pop-ups to view the ledger.");
      } else alert("Official support links have not been configured yet.");
    });
  });
  document.getElementById("logout").addEventListener("click", async () => {
    const token = localStorage.getItem("peak_token");
    try { await window.PeakAPI.post("/logout", {}, token); } catch {}
    localStorage.removeItem("peak_token"); localStorage.removeItem("peak_user");
    user = null; app.classList.add("hidden"); auth.classList.remove("hidden");
    document.getElementById("register").classList.remove("hidden"); document.getElementById("login").classList.add("hidden");
  });
  (async () => {
    try {
      const products = await window.PeakAPI.get("/products");
      if (Array.isArray(products.products) && products.products.length) window.PeakProducts.render(products.products);
    } catch (error) { console.warn("Using local product catalogue until API is reachable.", error); }
    try { await loadAccount(); } catch { localStorage.removeItem("peak_token"); localStorage.removeItem("peak_user"); }
  })();
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); deferredPrompt = event; });
  document.getElementById("installBtn").addEventListener("click", async () => {
    if (deferredPrompt) { await deferredPrompt.prompt(); deferredPrompt = null; }
    else alert("Install becomes available after the PWA manifest and service worker are configured.");
  });
})();
