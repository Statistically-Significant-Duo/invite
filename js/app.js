(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  document.documentElement.classList.add("js-ready");
  const canAnimateCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canAnimateCursor) {
    const cursorEffects = document.createElement("div");
    cursorEffects.className = "cursor-effects";
    cursorEffects.setAttribute("aria-hidden", "true");
    document.body.append(cursorEffects);
    const addClickEffect = (x, y) => {
      const effect = document.createElement("span");
      effect.className = "cursor-effect cursor-effect-click";
      effect.style.left = `${x}px`;
      effect.style.top = `${y}px`;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#i-flower");
      svg.append(use);
      effect.append(svg);
      effect.addEventListener("animationend", () => effect.remove(), { once: true });
      cursorEffects.append(effect);
    };
    document.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse" && event.button === 0) {
        addClickEffect(event.clientX, event.clientY);
      }
    }, { passive: true });
    $$(".moment").forEach(card => {
      card.addEventListener("pointermove", event => {
        const bounds = card.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width * 2 - 1;
        const vertical = (event.clientY - bounds.top) / bounds.height * 2 - 1;
        card.style.setProperty("--tilt-x", `${(horizontal * 3).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(-vertical * 3).toFixed(2)}deg`);
        card.style.setProperty("--image-x", `${(-horizontal * 4).toFixed(1)}px`);
        card.style.setProperty("--image-y", `${(-vertical * 4).toFixed(1)}px`);
        card.classList.add("is-tilting");
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.removeProperty("--image-x");
        card.style.removeProperty("--image-y");
      });
    });
  }
  const hero = $(".hero");
  const curtain = $(".hero-curtain", hero);
  const openButton = $(".hero-curtain-mark", curtain);
  const heroContent = $(".hero-content", hero);
  const heroBottom = $(".hero-bottom", hero);
  const flowerRain = $(".flower-rain", hero);
  const musicPlayer = $("#music-player");
  const musicFrame = $("#invitation-music");
  const musicMute = $("#music-mute");
  let musicMuted = false;
  let musicIsPlaying = false;
  const setMusicControl = (label, muted) => {
    if (!musicMute) return;
    musicMute.setAttribute("aria-label", label);
    musicMute.title = label;
    musicMute.setAttribute("aria-pressed", String(muted));
    $("use", musicMute).setAttribute("href", muted ? "#i-volume-off" : "#i-volume");
  };
  const sendMusicCommand = (func, args = []) => {
    musicFrame?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "https://www.youtube-nocookie.com"
    );
  };
  if (musicMute && musicFrame) {
    musicMute.addEventListener("click", () => {
      if (!musicIsPlaying) {
        sendMusicCommand("unMute");
        sendMusicCommand("playVideo");
        musicMuted = false;
        musicIsPlaying = true;
        setMusicControl("Mute music", false);
        return;
      }
      musicMuted = !musicMuted;
      sendMusicCommand(musicMuted ? "mute" : "unMute");
      if (!musicMuted) sendMusicCommand("playVideo");
      setMusicControl(musicMuted ? "Unmute music" : "Mute music", musicMuted);
    });
    window.addEventListener("message", event => {
      if (event.source !== musicFrame.contentWindow || event.origin !== "https://www.youtube-nocookie.com") return;
      let payload;
      try {
        payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (payload?.event !== "onStateChange") return;
      musicIsPlaying = payload.info === 1;
      if (!musicIsPlaying) {
        setMusicControl("Play music", musicMuted);
      } else {
        setMusicControl(musicMuted ? "Unmute music" : "Mute music", musicMuted);
      }
    });
  }
  if (hero && curtain && openButton) {
    [heroContent, heroBottom].filter(Boolean).forEach(element => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    const openInvitation = () => {
      if (hero.classList.contains("is-loaded")) return;
      hero.classList.add("is-loaded");
      openButton.blur();
      openButton.disabled = true;
      curtain.setAttribute("aria-hidden", "true");
      [heroContent, heroBottom].filter(Boolean).forEach(element => {
        element.inert = false;
        element.removeAttribute("aria-hidden");
      });
      if (musicPlayer && musicFrame && !musicFrame.src) {
        const origin = window.location.origin === "null" ? "" : `&origin=${encodeURIComponent(window.location.origin)}`;
        musicFrame.addEventListener("load", () => {
          if (musicMute) {
            musicMute.disabled = false;
          }
          sendMusicCommand("addEventListener", ["onStateChange"]);
        }, { once: true });
        musicFrame.src = `https://www.youtube-nocookie.com/embed/tdGLInZJF9I?autoplay=1&controls=0&enablejsapi=1&playsinline=1&rel=0${origin}`;
        musicPlayer.hidden = false;
      }
      if (flowerRain && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const colors = ["#f6dfb4", "#e8c77e", "#f0c2b9", "#fff4dc"];
        const flowers = Array.from({ length: 48 }, (_, index) => {
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("aria-hidden", "true");
          const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
          use.setAttribute("href", "#i-flower");
          svg.append(use);
          svg.style.setProperty("--flower-x", `${Math.random() * 100}vw`);
          svg.style.setProperty("--flower-size", `${18 + Math.random() * 20}px`);
          svg.style.setProperty("--flower-color", colors[index % colors.length]);
          svg.style.setProperty("--flower-duration", `${5.2 + Math.random() * 0.6}s`);
          svg.style.setProperty("--flower-delay", `${Math.random() * 4.2}s`);
          svg.style.setProperty("--flower-drift", `${Math.round(Math.random() * 180 - 90)}px`);
          svg.style.setProperty("--flower-turn", `${Math.round(Math.random() * 300 - 150)}deg`);
          return svg;
        });
        flowerRain.replaceChildren(...flowers);
        flowerRain.hidden = false;
        window.setTimeout(() => {
          flowerRain.hidden = true;
          flowerRain.replaceChildren();
        }, 10000);
      }
    };
    openButton.addEventListener("click", openInvitation);
    curtain.addEventListener("click", event => {
      if (event.target !== openButton) openInvitation();
    });
  }
  const config = window.WEDDING_CONFIG;
  const utils = window.WeddingUtils;
  const copy = utils.invitationText(config);
  $$('[data-wedding-text]').forEach(element => {
    const value = copy[element.dataset.weddingText];
    if (value !== undefined) element.textContent = value;
  });
  $$('[data-day]').forEach(card => {
    const event = config.events.find(item => item.day === card.dataset.day);
    if (!event) return;
    const fields = utils.eventText(event, config);
    $$('[data-event-field]', card).forEach(element => {
      if (fields[element.dataset.eventField] !== undefined) element.textContent = fields[element.dataset.eventField];
    });
  });
  $$('[data-ceremony-label]').forEach(element => {
    const event = config.events.find(item => item.day === element.dataset.ceremonyLabel || item.id === element.dataset.ceremonyLabel);
    if (event) element.textContent = `${utils.formatDate(event.date, config, { day: 'numeric', month: 'short' })} · ${event.shortName}`;
  });
  $$('[data-filter]').forEach(button => {
    const event = config.events.find(item => item.day === button.dataset.filter);
    if (!event) return;
    const name = event.filterName || event.shortName;
    const desktop = $('.filter-desktop', button);
    const mobile = $('.filter-mobile', button);
    if (desktop) desktop.textContent = `${utils.formatDate(event.date, config, { day: 'numeric', month: 'short' })} · ${name}`;
    if (mobile) mobile.textContent = name;
  });
  document.title = `${config.couple} — A beautiful beginning`;
  const description = `With full hearts, ${config.couple} invite you to celebrate their wedding. ${copy.celebrationDates} · ${copy.celebrationLocations}.`;
  $$('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach(meta => { meta.content = description; });
  $$('meta[property="og:title"], meta[name="twitter:title"]').forEach(meta => { meta.content = document.title; });
  $('.countdown')?.setAttribute('aria-label', `Time until the wedding on ${copy.weddingDateLong} at ${copy.weddingTimeZone}`);
  function safeWebUrl(value) {
    try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : ''; }
    catch { return ''; }
  }
  $$('[data-contact]').forEach(link => {
    const phone = String(config.contactPhone || '').replace(/[^+\d]/g, '');
    const value = link.dataset.contact === 'phone' ? phone : config.contactEmail;
    link.hidden = !value;
    if (!value) return;
    link.href = `${link.dataset.contact === 'phone' ? 'tel:' : 'mailto:'}${value}`;
    if (link.dataset.contactLabel === 'address') link.textContent = link.dataset.contact === 'phone' ? config.contactPhone : config.contactEmail;
  });
  $$('[data-venue-map]').forEach(link => {
    const url = config.venue.name && config.venue.address ? safeWebUrl(config.venue.mapUrl) : '';
    link.hidden = !url;
    if (url) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  });
  const socialLinks = {
    whatsapp: config.whatsappCommunity,
    instagram: config.instagram,
    youtube: config.youtube
  };
  $$("[data-social-link]").forEach(link => {
    const url = safeWebUrl(socialLinks[link.dataset.socialLink]);
    link.hidden = !url;
    if (!url) { link.removeAttribute("href"); return; }
    link.hidden = false;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.classList.remove("social-coming-soon");
    link.removeAttribute("aria-disabled");
    const status = $(".social-status", link);
    if (status) status.textContent = "VISIT";
  });
  if ($('.social-section')) $('.social-section').hidden = !$$('[data-social-link]').some(link => !link.hidden);
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
  $$("[data-calendar]").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.calendar === 'celebrations' ? 'celebrations' : 'ceremony';
    const filename = `${config.partner1}-and-${config.partner2}-${kind}.ics`;
    downloadFile(utils.makeCalendar(config, kind), filename, "text/calendar;charset=utf-8");
    toast(kind === 'ceremony' ? `Calendar file downloaded: ${copy.weddingDateLong}, ${copy.weddingTimeZone}.` : 'The celebration dates are ready to add to your calendar.');
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
  const submitButton = $('.submit-rsvp', form);
  const submitLabel = $('#submit-label');
  const formNote = $('#form-note') || $('.form-note', form);
  const deliveryStatus = $('#rsvp-status');
  let deliveryAvailable = false, pending = false;
  let submissionId = '', submissionFingerprint = '', confirmedFingerprint = '', confirmedReceipt = '';
  const generateId = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `reply-${Date.now()}-${Array.from(crypto.getRandomValues(new Uint32Array(4))).map(value => value.toString(16)).join('')}`;
  const replyFingerprint = reply => JSON.stringify(reply);
  function setLabel(label) { if (submitLabel) submitLabel.textContent = label; }
  function message(content, state = 'info') {
    feedback.textContent = content;
    feedback.dataset.state = state;
    feedback.hidden = false;
  }
  function updateDeliveryCopy() {
    if (deliveryStatus) deliveryStatus.textContent = deliveryAvailable ? 'Send your reply here. We’ll confirm once it’s received.' : 'Email replies are available. Send your prepared email to confirm.';
    if (formNote) formNote.textContent = deliveryAvailable ? 'A confirmation reference will appear after you send your reply.' : 'Prepare your reply to get an email link, then send it from your email app.';
    setLabel(deliveryAvailable ? 'Send our RSVP' : 'Prepare email reply');
  }
  async function fetchJson(url, options = {}, timeout = 6000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' });
      const body = await response.json().catch(() => null);
      return { response, body };
    } finally { clearTimeout(timer); }
  }
  let rsvpEndpoint = '';
  async function checkDelivery() {
    if (!/^https?:$/.test(window.location.protocol)) { updateDeliveryCopy(); return; }
    try {
      const endpoint = new URL(config.rsvpEndpoint || './api/rsvp', window.location.href);
      if (!/^https?:$/.test(endpoint.protocol)) throw new Error('Unsupported reply endpoint.');
      const statusUrl = config.rsvpStatusEndpoint
        ? new URL(config.rsvpStatusEndpoint, window.location.href)
        : new URL(`${endpoint.pathname.replace(/\/$/, '')}/status`, endpoint.origin);
      const { response, body } = await fetchJson(statusUrl.href, {}, 4000);
      deliveryAvailable = response.ok && body?.available === true && body?.protocol === 'wedding-rsvp-v1';
      if (deliveryAvailable) rsvpEndpoint = endpoint.href;
    } catch { deliveryAvailable = false; }
    updateDeliveryCopy();
  }
  const deliveryReady = checkDelivery();
  function attendanceChanged() {
    const accepted = form.elements.attendance.value === "yes";
    $("#guest-fields").hidden = !accepted;
    $$("input, select", $("#guest-fields")).forEach(input => { input.disabled = !accepted; });
  }
  function ceremonyId(value) {
    const event = config.events.find(item => item.id === value || item.day === value || item.shortName === String(value).split(' · ')[0]);
    return event ? event.id : String(value);
  }
  function readReply() {
    const values = new FormData(form);
    return {
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      attendance: String(values.get("attendance") || "yes"),
      guests: String(values.get("guests") || "0"),
      diet: String(values.get("diet") || ""),
      ceremonies: values.getAll("ceremonies").map(ceremonyId),
      note: String(values.get("note") || "").trim()
    };
  }
  function saveDraft() {
    const reply = readReply();
    const fingerprint = replyFingerprint(reply);
    if (fingerprint !== submissionFingerprint) { submissionId = generateId(); submissionFingerprint = fingerprint; }
    try { localStorage.setItem(config.draftStorageKey, JSON.stringify({ ...reply, submissionId, submissionFingerprint })); } catch { /* Replies work when storage is unavailable. */ }
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
      if (Array.isArray(draft.ceremonies)) {
        const selected = new Set(draft.ceremonies.map(ceremonyId));
        $$("[name='ceremonies']", form).forEach(input => { input.checked = selected.has(ceremonyId(input.value)); });
      }
      if (typeof draft.submissionId === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(draft.submissionId)) submissionId = draft.submissionId;
      if (typeof draft.submissionFingerprint === 'string') submissionFingerprint = draft.submissionFingerprint;
    }
  } catch { /* Corrupt or blocked drafts should never stop the invitation. */ }
  attendanceChanged();
  function replyText(reply) {
    const attending = reply.attendance === "yes";
    const ceremonies = reply.ceremonies.map(id => {
      const event = config.events.find(item => item.id === id);
      return event ? `${event.shortName} · ${utils.eventText(event, config).dateLong}` : id;
    });
    const lines = [
      `Dear ${config.couple},`, "",
      attending ? "We joyfully accept your invitation!" : "We’re sending our love and will be celebrating with you in spirit.", "",
      `Name: ${reply.name}`, `Email: ${reply.email}`,
      ...(attending ? [`Number of guests: ${reply.guests}`, `Celebrations: ${ceremonies.join(", ")}`, `Dietary preference: ${reply.diet}`] : []),
      ...(reply.note ? ["", `A little note: ${reply.note}`] : []),
      "", "With love,", reply.name
    ];
    return lines.join("\n");
  }
  function addEmailFallback(reply, prefix, state = 'info') {
    const attending = reply.attendance === 'yes';
    const body = replyText(reply);
    const subject = `Wedding RSVP · ${reply.name} · ${attending ? "Joyfully accept" : "Sending our love"}`;
    const href = `mailto:${encodeURIComponent(config.contactEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    feedback.replaceChildren();
    feedback.append(document.createTextNode(prefix + ' '));
    const emailLink = document.createElement("a");
    emailLink.href = href;
    emailLink.textContent = "Open email reply";
    feedback.append(emailLink, document.createTextNode(" or "));
    const downloadLink = document.createElement("a");
    downloadLink.href = "#rsvp";
    downloadLink.textContent = "download your reply";
    downloadLink.addEventListener("click", downloadEvent => { downloadEvent.preventDefault(); downloadFile(body, "Our-wedding-RSVP.txt", "text/plain;charset=utf-8"); });
    feedback.append(downloadLink, document.createTextNode(` and email it to ${config.contactEmail}. Please send the email to reach the family.`));
    feedback.dataset.state = state;
    feedback.hidden = false;
  }
  function replyEdited() {
    if (pending) return;
    attendanceChanged();
    feedback.hidden = true;
    if (confirmedFingerprint) {
      if (replyFingerprint(readReply()) !== confirmedFingerprint) updateDeliveryCopy();
      else if (deliveryStatus) deliveryStatus.textContent = 'Reply received. No further email is needed.';
    }
    saveDraft();
  }
  form.addEventListener('change', replyEdited);
  form.addEventListener('input', replyEdited);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending) return;
    const reply = readReply();
    if (!reply.name) {
      form.elements.name.setCustomValidity('Please tell us your name.');
      form.elements.name.reportValidity(); return;
    }
    form.elements.name.setCustomValidity('');
    if (reply.attendance === 'yes' && reply.ceremonies.length === 0) {
      message('Please choose at least one celebration you’ll join.', 'error');
      $("[name='ceremonies']", form).focus(); return;
    }
    if (confirmedFingerprint === replyFingerprint(reply)) {
      message(`Your reply has already been received. Your reference is ${confirmedReceipt}.`, 'success'); return;
    }
    saveDraft();
    pending = true;
    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    setLabel('Preparing your reply…');
    // Freeze the submitted details so edits cannot be lost during a save.
    const disabledStates = $$('input, select, textarea', form).map(control => [control, control.disabled]);
    disabledStates.forEach(([control]) => { control.disabled = true; });
    try {
      await deliveryReady;
      if (!deliveryAvailable) {
        addEmailFallback(reply, 'Your reply has not been submitted.');
        return;
      }
      setLabel('Saving your RSVP…');
      const { response, body } = await fetchJson(rsvpEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reply, submissionId })
      }, 12000);
      if (!response.ok || body?.ok !== true || body.protocol !== 'wedding-rsvp-v1' || typeof body.receiptId !== 'string') {
        if (response.status === 409) { submissionId = generateId(); submissionFingerprint = ''; }
        const error = new Error(body?.error || 'We could not confirm that your reply was saved.');
        error.confirmedNotSaved = response.status >= 400 && response.status < 500;
        throw error;
      }
      confirmedFingerprint = replyFingerprint(reply);
      confirmedReceipt = body.receiptId;
      try { localStorage.removeItem(config.draftStorageKey); } catch { /* A receipt confirms the server save even if storage is blocked. */ }
      message(`Thank you, ${reply.name}! Your reply has been received and saved. Your reference is ${body.receiptId}. Keep this reference if you need to contact us.`, 'success');
      if (deliveryStatus) deliveryStatus.textContent = 'Reply received. No further email is needed.';
    } catch (error) {
      const prefix = error.confirmedNotSaved
        ? `${error.message} Your reply has not been saved. Correct the details and try again, or use email.`
        : 'We could not confirm whether your reply was saved. Your details are kept here; retrying the same reply is safe, or contact the family by email.';
      addEmailFallback(reply, prefix, 'error');
    } finally {
      disabledStates.forEach(([control, disabled]) => { control.disabled = disabled; });
      pending = false;
      submitButton.disabled = false;
      form.removeAttribute('aria-busy');
      setLabel(deliveryAvailable ? 'Send our RSVP' : 'Prepare email reply');
    }
  });
  form.elements.name.addEventListener("input", () => form.elements.name.setCustomValidity(""));
})();
