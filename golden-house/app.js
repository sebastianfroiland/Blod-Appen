/* =============================================================================
   GOLDEN HOUSE — app logic
   Renders the menu from menu.js, runs the cart, and registers the order.
   ============================================================================ */
(function () {
  const { SHOP, MENU } = window.GOLDEN_HOUSE;

  const ORDERS_KEY  = "goldenhouse_orders";   // shared with monitor.html
  const CART_KEY    = "goldenhouse_cart";
  const COUNTER_KEY = "goldenhouse_counter";
  const USER_KEY    = "goldenhouse_user";
  const NOTE_KEY    = "goldenhouse_note_dismissed";
  const DISCOUNT_RATE = 0.15;                  // 15 % på første bestilling for medlemmer

  // flat lookup: id -> item (+ category name)
  const ITEMS = {};
  MENU.forEach((cat) => cat.items.forEach((it) => (ITEMS[it.id] = { ...it, cat: cat.name })));

  // cart = { itemId: qty }
  let cart = loadCart();
  let user = loadUser();   // medlem (lagres lokalt i nettleseren)

  const $ = (sel, root = document) => root.querySelector(sel);
  const kr = (n) => `${n} kr`;
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---- hand-drawn wavy divider (inline svg) ---------------------------- */
  function ruleSVG() {
    return `<svg class="cat__rule" viewBox="0 0 600 9" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 5 C 60 1, 120 9, 180 5 S 300 1, 360 5 S 480 9, 540 5 598 4 598 4"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" filter="url(#rough)"/></svg>`;
  }

  /* ===================== render menu + sidebar ========================== */
  function renderMenu() {
    const nav = $("#catNav");
    const root = $("#menuRoot");

    nav.innerHTML = MENU.map(
      (c, i) =>
        `<li><a href="#cat-${c.id}" data-cat="${c.id}">
            <span class="num">${String(i + 1).padStart(2, "0")}</span>${esc(c.name)}
         </a></li>`
    ).join("");

    root.innerHTML = MENU.map(
      (c) => `
      <section class="cat" id="cat-${c.id}" data-cat="${c.id}">
        <div class="cat__head">
          <h3>${esc(c.name)}</h3>
          ${c.note ? `<span class="cat__note">${esc(c.note)}</span>` : ""}
        </div>
        ${ruleSVG()}
        ${c.items.map(itemRow).join("")}
      </section>`
    ).join("");

    root.addEventListener("click", onMenuClick);
  }

  function itemRow(it) {
    const badge = it.spicy ? `<span class="spicy" title="Sterk">🌶️</span>` : "";
    const num = it.no != null ? `<span class="item__no">${it.no}</span>` : "";
    return `
      <div class="item" data-id="${it.id}">
        <div class="item__main">
          <div class="item__name">${num}<span>${esc(it.name)}</span> ${badge}</div>
          ${it.desc ? `<div class="item__desc">${esc(it.desc)}</div>` : ""}
          ${it.alg ? `<div class="item__alg" title="Allergener">${esc(it.alg)}</div>` : ""}
        </div>
        <div class="item__price">${it.price}<span class="kr"> kr</span></div>
        <div class="item__action" data-action-for="${it.id}">${actionControl(it.id)}</div>
      </div>`;
  }

  function actionControl(id) {
    const q = cart[id] || 0;
    if (!q) return `<button class="add" data-add="${id}">Legg til</button>`;
    return stepper(id, q);
  }

  function stepper(id, q) {
    return `<div class="stepper" role="group" aria-label="Antall">
        <button data-dec="${id}" aria-label="Færre">–</button>
        <span class="qty">${q}</span>
        <button data-inc="${id}" aria-label="Flere">+</button>
      </div>`;
  }

  function onMenuClick(e) {
    const add = e.target.closest("[data-add]");
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (add) return changeQty(add.dataset.add, +1, true);
    if (inc) return changeQty(inc.dataset.inc, +1);
    if (dec) return changeQty(dec.dataset.dec, -1);
  }

  /* ===================== cart operations =============================== */
  function changeQty(id, delta, bumpFab) {
    const next = (cart[id] || 0) + delta;
    if (next <= 0) delete cart[id];
    else cart[id] = next;
    saveCart();
    // update just this row's control
    const cell = document.querySelector(`[data-action-for="${id}"]`);
    if (cell) cell.innerHTML = actionControl(id);
    updateFab(bumpFab);
    if ($("#drawer").classList.contains("open")) renderCart();
  }

  function cartEntries() {
    return Object.keys(cart).map((id) => ({ ...ITEMS[id], qty: cart[id] })).filter((x) => x.id);
  }
  function cartCount() { return Object.values(cart).reduce((a, b) => a + b, 0); }
  function cartTotal() { return cartEntries().reduce((s, x) => s + x.price * x.qty, 0); }

  // medlemsrabatt: 15 % på første bestilling
  function memberDiscountAvailable() { return !!(user && !user.discountUsed); }
  function discountAmount() { return memberDiscountAvailable() ? Math.round(cartTotal() * DISCOUNT_RATE) : 0; }
  function payableTotal() { return cartTotal() - discountAmount(); }

  function updateFab(bump) {
    const fab = $("#cartFab");
    const n = cartCount();
    fab.hidden = n === 0;
    $("#cartCount").textContent = n;
    $("#cartFabTotal").textContent = kr(payableTotal());
    if (bump && n > 0) { fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump"); }
  }

  /* ===================== drawer (cart + checkout) ====================== */
  function openDrawer() {
    renderCart();
    $("#overlay").classList.add("open");
    $("#drawer").classList.add("open");
    $("#drawer").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    $("#overlay").classList.remove("open");
    $("#drawer").classList.remove("open");
    $("#drawer").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderCart() {
    const body = $("#cartBody");
    const foot = $("#cartFoot");
    const entries = cartEntries();

    if (!entries.length) {
      body.innerHTML = `<div class="cart-empty"><span>🥡</span>Handlekurven er tom.<br>Legg til noe godt fra menyen!</div>`;
      foot.innerHTML = "";
      return;
    }

    body.innerHTML =
      entries.map((x) => `
        <div class="cart-line" data-id="${x.id}">
          <div>
            <div class="cart-line__name">${x.no != null ? x.no + ". " : ""}${esc(x.name)}</div>
            <div class="cart-line__ctrls">
              ${stepper(x.id, x.qty)}
              <button class="cart-line__remove" data-rm="${x.id}">fjern</button>
            </div>
          </div>
          <div class="cart-line__price">${kr(x.price * x.qty)}</div>
        </div>`).join("") +
      checkoutForm();

    const disc = discountAmount();
    foot.innerHTML = `
      ${disc ? `
        <div class="subtotal-row"><span>Sum</span><span>${kr(cartTotal())}</span></div>
        <div class="discount-row"><span>Medlemsrabatt (15 %)</span><span>− ${kr(disc)}</span></div>` : ""}
      <div class="total-row"><span>Totalt</span><span>${kr(payableTotal())}</span></div>
      <button class="btn-send" id="sendOrder">Send bestilling</button>`;

    body.querySelectorAll("[data-rm]").forEach((b) =>
      b.addEventListener("click", () => changeQty(b.dataset.rm, -1e9)));
    body.querySelectorAll("[data-inc]").forEach((b) =>
      b.addEventListener("click", () => changeQty(b.dataset.inc, +1)));
    body.querySelectorAll("[data-dec]").forEach((b) =>
      b.addEventListener("click", () => changeQty(b.dataset.dec, -1)));
    $("#sendOrder").addEventListener("click", submitOrder);
  }

  function checkoutForm() {
    return `
      <div class="checkout">
        <h3 class="u-red">Hvem henter?</h3>
        <div class="field" id="f-name">
          <label for="ch-name">Navn</label>
          <input id="ch-name" type="text" autocomplete="name" placeholder="Ditt navn" value="${esc(draft.name)}" />
        </div>
        <div class="field" id="f-phone">
          <label for="ch-phone">Telefon</label>
          <input id="ch-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="F.eks. 400 00 000" value="${esc(draft.phone)}" />
        </div>
        <div class="field">
          <label for="ch-time">Når vil du hente?</label>
          <select id="ch-time">
            ${["Så snart som mulig", "Om 30 min", "Om 45 min", "Om 1 time"]
              .map((t) => `<option ${draft.pickup === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="ch-note">Kommentar (valgfritt)</label>
          <textarea id="ch-note" placeholder="Allergier, ekstra sterkt, o.l.">${esc(draft.note)}</textarea>
        </div>
      </div>`;
  }

  // keep typed values if the cart re-renders
  const draft = { name: "", phone: "", pickup: "Så snart som mulig", note: "" };
  function syncDraft() {
    const g = (id) => (document.getElementById(id) ? document.getElementById(id).value : "");
    draft.name = g("ch-name"); draft.phone = g("ch-phone");
    draft.pickup = g("ch-time") || draft.pickup; draft.note = g("ch-note");
  }
  document.addEventListener("input", (e) => { if (e.target.closest(".checkout")) syncDraft(); });

  /* ===================== submit / register order ====================== */
  function submitOrder() {
    syncDraft();
    let ok = true;
    const mark = (fid, good) => {
      const el = document.getElementById(fid);
      if (el) el.classList.toggle("field--invalid", !good);
    };
    mark("f-name", !!draft.name.trim());
    mark("f-phone", draft.phone.replace(/\D/g, "").length >= 6);
    if (!draft.name.trim() || draft.phone.replace(/\D/g, "").length < 6) {
      ok = false;
      (document.getElementById(!draft.name.trim() ? "ch-name" : "ch-phone") || {}).focus?.();
    }
    if (!ok) return;

    const subtotal = cartTotal();
    const discount = discountAmount();
    const ticket = nextCounter();
    const order = {
      id: "o" + Date.now(),
      ticket,
      ts: Date.now(),
      status: "ny",
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      pickup: draft.pickup,
      note: draft.note.trim(),
      items: cartEntries().map((x) => ({ no: x.no ?? null, name: x.name, qty: x.qty, price: x.price })),
      subtotal,
      discount,
      member: discount > 0 ? (user.name || user.email || "medlem") : null,
      total: subtotal - discount,
    };

    // Register the order. For now it lands in the in-house monitor (monitor.html).
    // 👉 PHASE 2: this is where the order gets sent to the kitchen for real
    //    (backend + live screen, or WhatsApp/SMS). See README.md.
    const all = loadOrders();
    all.push(order);
    saveOrders(all);

    // velkomstrabatten kan bare brukes én gang
    if (discount > 0 && user) { user.discountUsed = true; saveUser(); renderLoginTab(); }

    // reset cart
    cart = {};
    saveCart();
    updateFab(false);
    refreshAllControls();

    showConfirmation(order);
    draft.name = ""; draft.phone = ""; draft.note = ""; draft.pickup = "Så snart som mulig";
  }

  function showConfirmation(order) {
    $("#cartBody").innerHTML = `
      <div class="confirm">
        <svg class="confirm__check" viewBox="0 0 100 100" fill="none" stroke="currentColor"
             stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 52 L42 74 L82 28" filter="url(#rough)"/>
          <path d="M50 92 a42 42 0 1 1 0.1 0" stroke-width="4" filter="url(#rough)"/>
        </svg>
        <h2>Takk, ${esc(order.name.split(" ")[0])}!</h2>
        <p>Bestillingen er registrert.</p>
        <p class="ticketno">Bestilling ${order.ticket}</p>
        <p>Henting: <b>${esc(order.pickup)}</b> · Totalt <b>${kr(order.total)}</b></p>
        ${order.discount ? `<p style="color:var(--red);font-family:var(--font-note);font-size:1.3rem">Du sparte ${kr(order.discount)} med medlemsrabatten! 🎉</p>` : ""}
        <p style="margin-top:16px">Vi gjør maten klar. Vi ses snart! 🥡</p>
      </div>`;
    $("#cartFoot").innerHTML = `<button class="btn-send" id="closeConfirm" style="background:var(--ink)">Lukk</button>`;
    $("#closeConfirm").addEventListener("click", closeDrawer);
  }

  function refreshAllControls() {
    document.querySelectorAll("[data-action-for]").forEach((cell) => {
      cell.innerHTML = actionControl(cell.dataset.actionFor);
    });
  }

  /* ===================== sidebar scroll-spy =========================== */
  function setupScrollSpy() {
    const links = Array.from(document.querySelectorAll("#catNav a"));
    const byId = {};
    links.forEach((a) => (byId[a.dataset.cat] = a));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            links.forEach((a) => a.classList.remove("active"));
            const a = byId[en.target.dataset.cat];
            if (a) {
              a.classList.add("active");
              a.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    document.querySelectorAll(".cat").forEach((s) => obs.observe(s));
  }

  /* ===================== footer (from SHOP) =========================== */
  function renderFooter() {
    $("#footHours").innerHTML =
      SHOP.hours
        .map((h) => `<div class="hours-row"><span>${esc(h.day)}</span><span>${esc(h.time)}</span></div>`)
        .join("") +
      (SHOP.hoursNote ? `<p class="muted" style="margin-top:8px">${esc(SHOP.hoursNote)}</p>` : "");

    $("#footAddress").textContent = SHOP.address ? SHOP.address : "Stangeland";

    const ph = $("#footPhone");
    const nums = [];
    if (SHOP.phone) nums.push(`<a href="tel:${SHOP.phone.replace(/\s/g, "")}">📞 ${esc(SHOP.phone)}</a>`);
    if (SHOP.mobil) nums.push(`<a href="tel:${SHOP.mobil.replace(/\s/g, "")}">📱 ${esc(SHOP.mobil)}</a>`);
    ph.innerHTML = nums.join("<br>");

    if (SHOP.allergens) {
      $("#footAlg").innerHTML =
        "<b>Allergener:</b> " +
        Object.entries(SHOP.allergens).map(([k, v]) => `${k} = ${esc(v)}`).join(" · ");
    }
  }

  /* ===================== login / medlemskap ========================== */
  function renderLoginTab() {
    const tab = $("#loginTab");
    $("#loginTabLabel").textContent = user ? (user.name ? user.name.split(" ")[0] : "Medlem") : "Logg inn";
    tab.classList.toggle("is-member", !!user);
    const note = $("#loginNote");
    if (note) note.hidden = !!user || localStorage.getItem(NOTE_KEY) === "1";
  }

  function openLogin() {
    renderLoginContent();
    $("#loginOverlay").classList.add("open");
    $("#loginModal").classList.add("open");
    $("#loginModal").setAttribute("aria-hidden", "false");
  }
  function closeLogin() {
    $("#loginOverlay").classList.remove("open");
    $("#loginModal").classList.remove("open");
    $("#loginModal").setAttribute("aria-hidden", "true");
  }

  function renderLoginContent() {
    const box = $("#loginContent");
    if (user) {
      box.innerHTML = `
        <h2>Hei, ${esc((user.name || "medlem").split(" ")[0])}! 👋</h2>
        <p>Du er medlem hos Golden House.</p>
        ${memberDiscountAvailable()
          ? `<p class="perk">Du har 15&nbsp;% på din neste bestilling. 🎉</p>`
          : `<p class="muted">Du har brukt velkomstrabatten — takk for handelen!</p>`}
        <button class="btn-ghost" id="logoutBtn">Logg ut</button>`;
      $("#logoutBtn").addEventListener("click", () => { logout(); renderLoginContent(); });
      return;
    }
    box.innerHTML = `
      <h2>Bli medlem</h2>
      <p class="perk">Få 15&nbsp;% på din første bestilling! 🎉</p>
      <p class="muted">Helt valgfritt — du kan bestille uten å logge inn.</p>
      <form id="loginForm" novalidate>
        <div class="field" id="lf-name">
          <label for="lg-name">Navn</label>
          <input id="lg-name" type="text" autocomplete="name" placeholder="Ditt navn" />
        </div>
        <div class="field" id="lf-email">
          <label for="lg-email">E-post</label>
          <input id="lg-email" type="email" autocomplete="email" inputmode="email" placeholder="deg@epost.no" />
        </div>
        <button class="btn-send" type="submit">Bli medlem &amp; få 15&nbsp;%</button>
      </form>
      <p class="muted" style="margin-top:12px">Demo: lagres kun i din egen nettleser.</p>`;
    $("#loginForm").addEventListener("submit", handleLoginSubmit);
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    const name = ($("#lg-name").value || "").trim();
    const email = ($("#lg-email").value || "").trim();
    const okName = name.length >= 2;
    const okEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    $("#lf-name").classList.toggle("field--invalid", !okName);
    $("#lf-email").classList.toggle("field--invalid", !okEmail);
    if (!okName || !okEmail) { (okName ? $("#lg-email") : $("#lg-name")).focus(); return; }
    user = { name, email, joined: Date.now(), discountUsed: false };
    saveUser();
    if (!draft.name) draft.name = name;
    renderLoginTab();
    renderLoginContent();
    updateFab(false);
    if ($("#drawer").classList.contains("open")) renderCart();
  }

  function logout() {
    user = null;
    try { localStorage.removeItem(USER_KEY); } catch {}
    renderLoginTab();
    updateFab(false);
    if ($("#drawer").classList.contains("open")) renderCart();
  }

  /* ===================== persistence ================================= */
  function loadUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; } }
  function saveUser() { try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {} }
  function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} }
  function loadOrders() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch { return []; } }
  function saveOrders(a) { try { localStorage.setItem(ORDERS_KEY, JSON.stringify(a)); } catch {} }
  function nextCounter() {
    let n = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10) + 1;
    if (n > 999) n = 1;
    try { localStorage.setItem(COUNTER_KEY, String(n)); } catch {}
    return "#" + String(n).padStart(3, "0");
  }

  /* ===================== wire up ===================================== */
  function init() {
    if (user && !draft.name) draft.name = user.name || "";
    renderMenu();
    renderFooter();
    setupScrollSpy();
    renderLoginTab();
    updateFab(false);

    $("#cartFab").addEventListener("click", openDrawer);
    $("#cartClose").addEventListener("click", closeDrawer);
    $("#overlay").addEventListener("click", closeDrawer);
    $("#loginTab").addEventListener("click", openLogin);
    $("#loginClose").addEventListener("click", closeLogin);
    $("#loginOverlay").addEventListener("click", closeLogin);
    $("#loginNoteX").addEventListener("click", () => {
      $("#loginNote").hidden = true;
      try { localStorage.setItem(NOTE_KEY, "1"); } catch {}
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeDrawer(); closeLogin(); } });
    $("#scrollDown").addEventListener("click", () =>
      document.getElementById("bestilling").scrollIntoView({ behavior: "smooth" }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
