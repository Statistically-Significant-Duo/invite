(() => {
  "use strict";
  const config = window.WEDDING_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const socialLinks = {
    whatsapp: config.whatsappCommunity,
    instagram: config.instagram,
    youtube: config.youtube
  };
  $$("[data-social-link]").forEach(link => {
    const url = socialLinks[link.dataset.socialLink];
    if (!url) return;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.classList.remove("social-coming-soon");
    link.removeAttribute("aria-disabled");
    const status = $(".social-status", link);
    if (status) status.textContent = "VISIT";
  });
  $$(".social-coming-soon").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      toast("This link will be added soon.");
    });
  });
  let toastTimer;
  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.hidden = true; }, 5000);
  }

  // Keep the invitation readable if animation support is unavailable.
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js-ready");
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    $$(".reveal").forEach(element => revealObserver.observe(element));
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$(".desktop-nav a").forEach(link => {
            const current = link.hash === `#${entry.target.id}`;
            link.classList.toggle("active", current);
            if (current) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    $$("main section[id]").forEach(section => sectionObserver.observe(section));
  }

  const menuToggle = $(".menu-toggle");
  const mobileNav = $("#mobile-nav");
  function closeMenu() {
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
  menuToggle.addEventListener("click", () => {
    const opening = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(opening));
    menuToggle.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
    mobileNav.hidden = !opening;
  });
  $$("a", mobileNav).forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => {
    if (!$("#site-header").contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !mobileNav.hidden) { closeMenu(); menuToggle.focus(); }
  });
  window.matchMedia("(min-width: 701px)").addEventListener("change", event => {
    if (event.matches) closeMenu();
  });

  function updateCountdown() {
    const difference = Math.max(0, new Date(config.weddingDate).getTime() - Date.now());
    const units = {
      days: Math.floor(difference / 86400000),
      hours: Math.floor(difference / 3600000) % 24,
      minutes: Math.floor(difference / 60000) % 60,
      seconds: Math.floor(difference / 1000) % 60
    };
    Object.entries(units).forEach(([unit, value]) => { $(`#count-${unit}`).textContent = String(value).padStart(2, "0"); });
    if (difference === 0) {
      $(".countdown-caption .small-label").textContent = "OUR FOREVER HAS BEGUN";
      $(".countdown-caption p").textContent = "The beginning of all our tomorrows.";
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  function downloadFile(content, filename, mime) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const icsEscape = value => String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  $$("[data-calendar]").forEach(button => button.addEventListener("click", () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const calendar = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pabitra and Asmita//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
      "UID:pabitra-asmita-wedding-20270124@wedding.local", `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${config.calendarStart}`, `DTEND;VALUE=DATE:${config.calendarEndExclusive}`,
      `SUMMARY:${icsEscape(`${config.couple} — Wedding celebrations`)}`,
      `LOCATION:${icsEscape(config.location)}`,
      "DESCRIPTION:24 January - Blessings\\n25 January - Haldi\\n26 January - The Wedding at 7:30 PM IST\\nExact venue and directions to follow.",
      "STATUS:CONFIRMED", "TRANSP:TRANSPARENT", "END:VEVENT", "END:VCALENDAR", ""
    ].join("\r\n");
    downloadFile(calendar, "Pabitra-and-Asmita-Save-the-Date.ics", "text/calendar;charset=utf-8");
    toast("A little reminder of our forever, saved to your downloads.");
  }));

  $$("[data-filter]").forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    $$("[data-filter]").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    $(".event-grid").classList.toggle("is-filtered", filter !== "all");
    $$("[data-day]").forEach(card => {
      card.hidden = filter !== "all" && card.dataset.day !== filter;
      if (!card.hidden) card.classList.add("is-visible");
    });
  }));

  const lightbox = $("#lightbox");
  let lightboxTrigger;
  $$("[data-lightbox]").forEach(button => button.addEventListener("click", () => {
    lightboxTrigger = button;
    $("#lightbox-image").src = button.dataset.lightbox;
    $("#lightbox-image").alt = $("img", button).alt;
    $("#lightbox-caption").textContent = button.dataset.caption;
    lightbox.showModal();
    document.body.classList.add("modal-open");
  }));
  $(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", event => {
    if (event.target !== lightbox) return;
    const box = lightbox.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) lightbox.close();
  });
  lightbox.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (lightboxTrigger) lightboxTrigger.focus();
  });

  const form = $("#rsvp-form");
  const feedback = $("#form-feedback");
  function attendanceChanged() {
    const accepted = form.elements.attendance.value === "yes";
    $("#guest-fields").hidden = !accepted;
    $$("input, select", $("#guest-fields")).forEach(input => { input.disabled = !accepted; });
  }
  function readReply() {
    const values = new FormData(form);
    return {
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      attendance: String(values.get("attendance") || "yes"),
      guests: String(values.get("guests") || "0"),
      diet: String(values.get("diet") || ""),
      ceremonies: values.getAll("ceremonies").map(String),
      note: String(values.get("note") || "").trim()
    };
  }
  function saveDraft() {
    try { localStorage.setItem(config.draftStorageKey, JSON.stringify(readReply())); } catch { /* Email replies work when storage is unavailable. */ }
  }
  try {
    const draft = JSON.parse(localStorage.getItem(config.draftStorageKey) || "null");
    if (draft && typeof draft === "object") {
      ["name", "email", "note"].forEach(key => {
        if (typeof draft[key] === "string") form.elements[key].value = draft[key];
      });
      if (["yes", "no"].includes(draft.attendance)) form.elements.attendance.value = draft.attendance;
      if (["1", "2", "3", "4", "5", "6"].includes(draft.guests)) form.elements.guests.value = draft.guests;
      if (["Vegetarian", "Non-vegetarian", "Vegan", "No preference"].includes(draft.diet)) form.elements.diet.value = draft.diet;
      if (Array.isArray(draft.ceremonies)) $$("[name='ceremonies']", form).forEach(input => { input.checked = draft.ceremonies.includes(input.value); });
    }
  } catch { /* Corrupt or blocked drafts should never stop the invitation. */ }
  attendanceChanged();
  form.addEventListener("change", () => { attendanceChanged(); saveDraft(); });
  form.addEventListener("input", () => { feedback.hidden = true; saveDraft(); });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const reply = readReply();
    if (!reply.name) {
      form.elements.name.setCustomValidity("Please tell us your name.");
      form.elements.name.reportValidity();
      return;
    }
    form.elements.name.setCustomValidity("");
    if (reply.attendance === "yes" && reply.ceremonies.length === 0) {
      feedback.textContent = "Please choose at least one celebration you’ll join.";
      feedback.hidden = false;
      $("[name='ceremonies']", form).focus();
      return;
    }
    const attending = reply.attendance === "yes";
    const lines = [
      `Dear ${config.couple},`, "",
      attending ? "We joyfully accept your invitation!" : "We’re sending our love and will be celebrating with you in spirit.", "",
      `Name: ${reply.name}`, `Email: ${reply.email}`,
      ...(attending ? [`Number of guests: ${reply.guests}`, `Celebrations: ${reply.ceremonies.join(", ")}`, `Dietary preference: ${reply.diet}`] : []),
      ...(reply.note ? ["", `A little note: ${reply.note}`] : []),
      "", "With love,", reply.name
    ];
    const body = lines.join("\n");
    const subject = `Wedding RSVP · ${reply.name} · ${attending ? "Joyfully accept" : "Sending our love"}`;
    const href = `mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    saveDraft();
    feedback.replaceChildren();
    feedback.append(document.createTextNode("Your reply is ready. Send it from your email app to confirm. "));
    const emailLink = document.createElement("a");
    emailLink.href = href;
    emailLink.textContent = "Open email again";
    feedback.append(emailLink, document.createTextNode(" or "));
    const downloadLink = document.createElement("a");
    downloadLink.href = "#rsvp";
    downloadLink.textContent = "download your reply";
    downloadLink.addEventListener("click", downloadEvent => { downloadEvent.preventDefault(); downloadFile(body, "Our-wedding-RSVP.txt", "text/plain;charset=utf-8"); });
    feedback.append(downloadLink, document.createTextNode(` and email it to ${config.contactEmail}.`));
    feedback.hidden = false;
    window.location.href = href;
  });
  form.elements.name.addEventListener("input", () => form.elements.name.setCustomValidity(""));
})();
