(() => {
  const root = document.documentElement;
  const config = window.APP_CONFIG || {};
  const business = config.business || {};
  const analyticsConfig = config.analytics || {};
  const defaultUnavailableRanges = Array.isArray(config.unavailableRanges) ? config.unavailableRanges : [];
  const ownerPassword = `${config.ownerPassword || ""}`.trim();
  const ownerApiEndpoint = `${config.ownerApiEndpoint || ""}`.trim();
  const bookingCalendarIcsUrl = `${config.bookingCalendarIcsUrl || ""}`.trim();
  const walkthroughVideoUrl = `${config.walkthroughVideoUrl || ""}`.trim();
  const ownerRangesStorageKey = "ownerUnavailableRanges";
  const ownerRangesUpdatedAtKey = "ownerUnavailableRangesUpdatedAt";
  const abVariantStorageKey = "abCtaVariant";
  const analyticsEventsStorageKey = "analyticsEvents";
  const funnelMetricsStorageKey = "funnelMetrics";
  let unavailableRanges = defaultUnavailableRanges.slice();
  let abVariantTracked = false;
  let hasTrackedFormStart = false;
  let lastAvailabilityState = "";

  const header = document.getElementById("siteHeader");
  const nav = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const finalCTA = document.querySelector(".final-cta");
  const floatingCta = document.getElementById("floatingCta");
  const backToTop = document.getElementById("backToTop");
  const dateForm = document.getElementById("dateForm");
  const formFeedback = document.getElementById("formFeedback");
  const formAvailabilityStatus = document.getElementById("formAvailabilityStatus");
  const availabilityList = document.getElementById("availabilityList");
  const availabilityCalendar = document.getElementById("availabilityCalendar");
  const availabilityUpdated = document.getElementById("availabilityUpdated");
  const ownerEditBtn = document.getElementById("ownerEditBtn");
  const ownerEditor = document.getElementById("ownerEditor");
  const ownerRangesInput = document.getElementById("ownerRangesInput");
  const ownerSaveBtn = document.getElementById("ownerSaveBtn");
  const ownerCancelBtn = document.getElementById("ownerCancelBtn");
  const ownerResetBtn = document.getElementById("ownerResetBtn");
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = themeToggle ? themeToggle.querySelector(".theme-label") : null;
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;
  const loadMapBtn = document.getElementById("loadMapBtn");
  const locationMap = document.getElementById("locationMap");
  const locationMapFrame = document.getElementById("locationMapFrame");
  const walkthroughVideo = document.getElementById("walkthroughVideo");
  const walkthroughSource = document.getElementById("walkthroughSource");
  const videoFallback = document.getElementById("videoFallback");
  const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
  const translatable = document.querySelectorAll("[data-bm][data-en]");
  const ariaTranslatable = document.querySelectorAll("[data-bm-aria-label][data-en-aria-label]");
  const altTranslatable = document.querySelectorAll("[data-bm-alt][data-en-alt]");
  const titleTranslatable = document.querySelectorAll("[data-bm-title][data-en-title]");
  const hrefTranslatable = document.querySelectorAll("[data-bm-href][data-en-href]");
  const placeholderTranslatable = document.querySelectorAll("[data-bm-placeholder][data-en-placeholder]");
  const abCtaLinks = Array.from(document.querySelectorAll(".ab-cta"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const galleryOpenImages = Array.from(document.querySelectorAll(".gallery-open"));
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  const trustCards = Array.from(document.querySelectorAll(".trust-card"));
  const waLinks = Array.from(document.querySelectorAll('a[href*="wa.me/"]'));
  const schemaNode = document.getElementById("lodgingSchema");
  const canonicalLink = document.querySelector('link[rel="canonical"]');

  const getSessionId = () => {
    try {
      const existing = sessionStorage.getItem("sessionId");
      if (existing) {
        return existing;
      }
      const next = `s_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
      sessionStorage.setItem("sessionId", next);
      return next;
    } catch (error) {
      return `s_${Date.now()}`;
    }
  };

  const sessionId = getSessionId();

  const readStorage = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage errors (private mode, blocked storage, etc.)
    }
  };

  const deleteStorage = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage errors.
    }
  };

  const loadOwnerRanges = () => {
    const raw = readStorage(ownerRangesStorageKey);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
      return null;
    }
  };

  const saveOwnerRanges = (ranges) => {
    writeStorage(ownerRangesStorageKey, JSON.stringify(ranges));
  };

  const loadAnalyticsEvents = () => {
    const raw = readStorage(analyticsEventsStorageKey);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const saveAnalyticsEvents = (events) => {
    writeStorage(analyticsEventsStorageKey, JSON.stringify(events.slice(-500)));
  };

  const recordLocalEvent = (eventName, params = {}) => {
    const events = loadAnalyticsEvents();
    events.push({
      event: eventName,
      ts: new Date().toISOString(),
      sessionId,
      params
    });
    saveAnalyticsEvents(events);
  };

  const loadOwnerTestimonials = () => {
    const raw = readStorage("ownerTestimonials");
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const markRangesUpdatedAt = () => {
    writeStorage(ownerRangesUpdatedAtKey, new Date().toISOString());
  };

  const getRangesUpdatedAt = () => readStorage(ownerRangesUpdatedAtKey) || "";

  const getSiteUrl = () => {
    const fromConfig = `${business.siteUrl || ""}`.trim().replace(/\/+$/, "");
    if (fromConfig) {
      return fromConfig;
    }
    return window.location.origin.replace(/\/+$/, "");
  };

  const fetchOwnerRangesFromApi = async () => {
    if (!ownerApiEndpoint) {
      return null;
    }
    try {
      const response = await fetch(ownerApiEndpoint, { method: "GET" });
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      return Array.isArray(payload?.ranges) ? payload.ranges : null;
    } catch (error) {
      return null;
    }
  };

  const saveOwnerRangesToApi = async (ranges, password) => {
    if (!ownerApiEndpoint) {
      return true;
    }
    try {
      const response = await fetch(ownerApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ranges })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const parseIcsDateToIso = (rawDate) => {
    if (!rawDate) {
      return "";
    }
    const clean = rawDate.trim();
    const match = clean.match(/^(\d{4})(\d{2})(\d{2})/);
    if (!match) {
      return "";
    }
    return `${match[1]}-${match[2]}-${match[3]}`;
  };

  const minusOneDayIso = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
  };

  const parseIcsRanges = (icsText) => {
    const ranges = [];
    if (!icsText) {
      return ranges;
    }
    const normalized = icsText.replace(/\r\n[ \t]/g, "");
    const blocks = normalized.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];

    blocks.forEach((block) => {
      const dtStartRaw = (block.match(/DTSTART(?:;[^:]+)?:([^\r\n]+)/) || [])[1];
      const dtEndRaw = (block.match(/DTEND(?:;[^:]+)?:([^\r\n]+)/) || [])[1];
      const summary = (block.match(/SUMMARY:([^\r\n]+)/) || [])[1] || "Booked";
      const start = parseIcsDateToIso(dtStartRaw);
      let end = parseIcsDateToIso(dtEndRaw);
      if (end) {
        end = minusOneDayIso(end);
      } else {
        end = start;
      }
      if (!start || !end) {
        return;
      }
      ranges.push({
        start,
        end: end < start ? start : end,
        labelBm: `Tempahan Kalendar: ${summary}`,
        labelEn: `Calendar Booking: ${summary}`
      });
    });

    return ranges;
  };

  const fetchIcsRanges = async () => {
    if (!bookingCalendarIcsUrl) {
      return [];
    }
    try {
      const response = await fetch(bookingCalendarIcsUrl, { method: "GET" });
      if (!response.ok) {
        return [];
      }
      const text = await response.text();
      return parseIcsRanges(text);
    } catch (error) {
      return [];
    }
  };

  const isDateWithinRange = (day, start, end) => day >= start && day <= end;

  const getDateValue = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const dateToIso = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isBlockedDay = (isoDate) => unavailableRanges.some((range) => {
    if (!range.start || !range.end) {
      return false;
    }
    return isoDate >= range.start && isoDate <= range.end;
  });

  const renderAvailabilityCalendar = (lang) => {
    if (!availabilityCalendar) {
      return;
    }

    availabilityCalendar.innerHTML = "";
    const locale = lang === "en" ? "en-MY" : "ms-MY";
    const weekdayNames = lang === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Aha"];
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let offset = 0; offset < 2; offset += 1) {
      const monthDate = new Date(todayStart.getFullYear(), todayStart.getMonth() + offset, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const monthLabel = monthDate.toLocaleString(locale, { month: "long", year: "numeric" });
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startWeekday = (monthDate.getDay() + 6) % 7;

      const monthCard = document.createElement("div");
      monthCard.className = "availability-month";

      const heading = document.createElement("p");
      heading.className = "availability-month-title";
      heading.textContent = monthLabel;
      monthCard.appendChild(heading);

      const weekdays = document.createElement("div");
      weekdays.className = "availability-weekdays";
      weekdayNames.forEach((dayName) => {
        const cell = document.createElement("span");
        cell.textContent = dayName;
        weekdays.appendChild(cell);
      });
      monthCard.appendChild(weekdays);

      const grid = document.createElement("div");
      grid.className = "availability-days";

      for (let i = 0; i < startWeekday; i += 1) {
        const empty = document.createElement("span");
        empty.className = "availability-day is-empty";
        empty.textContent = "";
        grid.appendChild(empty);
      }

      for (let day = 1; day <= daysInMonth; day += 1) {
        const currentDate = new Date(year, month, day);
        const isoDate = dateToIso(currentDate);
        const cell = document.createElement("span");
        const blocked = isBlockedDay(isoDate);
        const isPast = currentDate < todayStart;
        const isToday = isoDate === dateToIso(todayStart);

        cell.className = `availability-day ${blocked ? "is-blocked" : "is-open"}`;
        if (isPast) {
          cell.classList.add("is-past");
        }
        if (isToday) {
          cell.classList.add("is-today");
        }
        cell.textContent = `${day}`;
        cell.title = blocked
          ? (lang === "en" ? `${isoDate} booked` : `${isoDate} ditempah`)
          : (lang === "en" ? `${isoDate} available` : `${isoDate} tersedia`);
        grid.appendChild(cell);
      }

      monthCard.appendChild(grid);
      availabilityCalendar.appendChild(monthCard);
    }
  };

  const setupWalkthroughVideo = () => {
    if (!walkthroughVideo || !walkthroughSource) {
      return;
    }
    if (!walkthroughVideoUrl) {
      walkthroughVideo.hidden = true;
      if (videoFallback) {
        videoFallback.hidden = false;
      }
      return;
    }

    walkthroughSource.src = walkthroughVideoUrl;
    walkthroughVideo.hidden = false;
    walkthroughVideo.load();

    walkthroughVideo.addEventListener("error", () => {
      walkthroughVideo.hidden = true;
      if (videoFallback) {
        videoFallback.hidden = false;
      }
    });
  };

  const savedOwnerRanges = loadOwnerRanges();
  if (savedOwnerRanges && savedOwnerRanges.length >= 0) {
    unavailableRanges = savedOwnerRanges;
  }

  const overlapsWithUnavailable = (startDateText, endDateText) => {
    const startDate = getDateValue(startDateText);
    const endDate = getDateValue(endDateText);
    if (!startDate || !endDate) {
      return null;
    }

    const startValue = startDate.toISOString().slice(0, 10);
    const endValue = endDate.toISOString().slice(0, 10);

    return unavailableRanges.find((range) => {
      const blockedStart = range.start;
      const blockedEnd = range.end;
      if (!blockedStart || !blockedEnd) {
        return false;
      }
      return isDateWithinRange(startValue, blockedStart, blockedEnd) ||
        isDateWithinRange(endValue, blockedStart, blockedEnd) ||
        isDateWithinRange(blockedStart, startValue, endValue);
    }) || null;
  };

  const setupAnalytics = () => {
    const gaMeasurementId = analyticsConfig.gaMeasurementId;
    const plausibleDomain = analyticsConfig.plausibleDomain;

    if (gaMeasurementId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
      };

      window.gtag("js", new Date());
      window.gtag("config", gaMeasurementId, { anonymize_ip: true });

      const gaScript = document.createElement("script");
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaMeasurementId)}`;
      document.head.appendChild(gaScript);
    }

    if (plausibleDomain) {
      const plausibleScript = document.createElement("script");
      plausibleScript.defer = true;
      plausibleScript.dataset.domain = plausibleDomain;
      plausibleScript.src = "https://plausible.io/js/script.js";
      document.head.appendChild(plausibleScript);
    }
  };

  const trackEvent = (eventName, params = {}) => {
    recordLocalEvent(eventName, params);
    if (window.gtag) {
      window.gtag("event", eventName, params);
    }
    if (window.plausible && analyticsConfig.plausibleDomain) {
      window.plausible(eventName, { props: params });
    }
  };

  const openWhatsApp = (url, source = "unknown") => {
    if (!url) {
      return;
    }
    trackEvent("whatsapp_click", { source });
    window.open(url, "_blank", "noopener");
    if (config.enableThankYouRedirect) {
      window.setTimeout(() => {
        window.location.href = "thank-you.html";
      }, 160);
    }
  };

  const updateHeaderOffset = () => {
    if (!header) {
      return;
    }
    const height = header.getBoundingClientRect().height;
    root.style.setProperty("--header-offset", `${Math.ceil(height + 16)}px`);
  };

  const closeMobileNav = () => {
    if (!nav || !menuToggle) {
      return;
    }
    nav.classList.remove("show");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  const renderSchema = () => {
    const siteUrl = getSiteUrl();
    if (!schemaNode || !siteUrl) {
      return;
    }
    const schema = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": business.name || "Jitra2Stay",
      "url": siteUrl,
      "telephone": business.phone || "",
      "description": business.description || "Homestay Semi-D 2 tingkat di Jitra.",
      "image": business.image || `${siteUrl}/images/halaman.jpg`,
      "checkinTime": "15:00",
      "checkoutTime": "12:00",
      "hasMap": "https://goo.gl/maps/pjnMbwm5Pk2QqPeP8",
      "petsAllowed": false,
      "smokingAllowed": false,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "49, Taman Jitra Indah, Jalan Hospital Daerah",
        "addressLocality": "Jitra",
        "postalCode": "06000",
        "addressRegion": "Kedah",
        "addressCountry": "MY"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 6.2805462,
        "longitude": 100.4151952
      },
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Air Conditioning", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Kitchen", "value": true }
      ],
      "priceRange": "RM170-RM330 per night",
      "sameAs": [
        "https://www.facebook.com/media/set/?set=a.2393864657563587&type=3"
      ]
    };
    schemaNode.textContent = JSON.stringify(schema);
  };

  const applyCanonical = () => {
    if (!canonicalLink) {
      return;
    }
    const siteUrl = getSiteUrl();
    const path = window.location.pathname;
    const currentPath = (path === "/" || path.endsWith("/index.html")) ? "/" : path;
    canonicalLink.href = `${siteUrl}${currentPath}`;
  };

  const renderAvailability = (lang) => {
    if (!availabilityList) {
      return;
    }
    if (availabilityUpdated) {
      const updatedAt = getRangesUpdatedAt();
      if (updatedAt) {
        const formatted = new Date(updatedAt).toLocaleString(lang === "en" ? "en-MY" : "ms-MY");
        availabilityUpdated.textContent = lang === "en"
          ? `Last updated: ${formatted}`
          : `Dikemas kini: ${formatted}`;
      } else {
        availabilityUpdated.textContent = lang === "en"
          ? "Last updated: default schedule"
          : "Dikemas kini: jadual asal";
      }
    }
    availabilityList.innerHTML = "";
    if (unavailableRanges.length === 0) {
      const item = document.createElement("li");
      item.textContent = lang === "en"
        ? "No blocked dates listed yet."
        : "Tiada tarikh blok ditetapkan lagi.";
      availabilityList.appendChild(item);
      renderAvailabilityCalendar(lang);
      return;
    }

    unavailableRanges.forEach((range) => {
      const item = document.createElement("li");
      const label = lang === "en" ? (range.labelEn || range.labelBm) : (range.labelBm || range.labelEn);
      item.textContent = `${range.start} - ${range.end}  ${label ? `(${label})` : ""}`.trim();
      availabilityList.appendChild(item);
    });

    renderAvailabilityCalendar(lang);
  };

  const rangesToEditorText = (ranges) => ranges
    .map((range) => `${range.start}|${range.end}|${range.labelBm || ""}|${range.labelEn || ""}`)
    .join("\n");

  const parseEditorRanges = (text) => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed = [];
    for (const line of lines) {
      const parts = line.split("|").map((item) => item.trim());
      if (parts.length < 2) {
        return { ok: false, error: `Format tidak sah: ${line}` };
      }

      const [start, end, labelBm = "", labelEn = ""] = parts;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
        return { ok: false, error: `Tarikh mesti format YYYY-MM-DD: ${line}` };
      }
      if (end < start) {
        return { ok: false, error: `Tarikh akhir mesti selepas tarikh mula: ${line}` };
      }

      parsed.push({
        start,
        end,
        labelBm,
        labelEn
      });
    }

    return { ok: true, ranges: parsed };
  };

  const applyOwnerTestimonials = (lang) => {
    if (trustCards.length === 0) {
      return;
    }
    const ownerTestimonials = loadOwnerTestimonials();
    if (ownerTestimonials.length === 0) {
      return;
    }

    trustCards.forEach((card, index) => {
      const item = ownerTestimonials[index];
      if (!item) {
        return;
      }
      const quoteEl = card.querySelector("p");
      const authorEl = card.querySelector("span");
      if (quoteEl) {
        quoteEl.textContent = lang === "en"
          ? (item.quoteEn || item.quoteBm || "")
          : (item.quoteBm || item.quoteEn || "");
      }
      if (authorEl) {
        const name = lang === "en"
          ? (item.authorEn || item.authorBm || "")
          : (item.authorBm || item.authorEn || "");
        authorEl.textContent = name ? `- ${name}` : authorEl.textContent;
      }
    });
  };

  const getIntentText = (intentValue, lang) => {
    const value = `${intentValue || ""}`.toLowerCase();
    if (lang === "en") {
      if (value === "event") {
        return "Event / Gathering";
      }
      if (value === "convocation") {
        return "Convocation";
      }
      if (value === "work") {
        return "Work / Business";
      }
      return "Family";
    }
    if (value === "event") {
      return "Kenduri / Majlis";
    }
    if (value === "convocation") {
      return "Konvokesyen";
    }
    if (value === "work") {
      return "Kerja / Urusan";
    }
    return "Keluarga";
  };

  const updateLiveAvailabilityStatus = () => {
    if (!dateForm || !formAvailabilityStatus) {
      return;
    }
    const checkinInput = dateForm.querySelector('input[name="checkin"]');
    const checkoutInput = dateForm.querySelector('input[name="checkout"]');
    if (!checkinInput || !checkoutInput) {
      return;
    }

    const checkin = `${checkinInput.value || ""}`.trim();
    const checkout = `${checkoutInput.value || ""}`.trim();
    const lang = root.dataset.lang || "ms";

    formAvailabilityStatus.classList.remove("is-open", "is-blocked", "is-warn");
    if (!checkin || !checkout) {
      formAvailabilityStatus.textContent = lang === "en"
        ? "Choose check-in and check-out dates to see quick availability status."
        : "Pilih tarikh check-in dan check-out untuk lihat status ketersediaan segera.";
      return;
    }

    if (checkout <= checkin) {
      formAvailabilityStatus.classList.add("is-warn");
      formAvailabilityStatus.textContent = lang === "en"
        ? "Check-out must be after check-in."
        : "Tarikh check-out mesti selepas check-in.";
      return;
    }

    const conflict = overlapsWithUnavailable(checkin, checkout);
    const nextState = conflict ? "blocked" : "open";
    if (nextState !== lastAvailabilityState) {
      lastAvailabilityState = nextState;
      trackEvent("date_availability_check", {
        status: nextState,
        checkin,
        checkout
      });
    }

    if (conflict) {
      formAvailabilityStatus.classList.add("is-blocked");
      const label = lang === "en"
        ? (conflict.labelEn || conflict.labelBm || "")
        : (conflict.labelBm || conflict.labelEn || "");
      formAvailabilityStatus.textContent = lang === "en"
        ? `These dates overlap with booked range ${conflict.start} - ${conflict.end}${label ? ` (${label})` : ""}.`
        : `Tarikh ini bertindih dengan slot ditempah ${conflict.start} - ${conflict.end}${label ? ` (${label})` : ""}.`;
      return;
    }

    formAvailabilityStatus.classList.add("is-open");
    formAvailabilityStatus.textContent = lang === "en"
      ? "Great, these dates look available. Send now for final confirmation."
      : "Bagus, tarikh ini nampak tersedia. Hantar sekarang untuk pengesahan akhir.";
  };

  const getOrCreateAbVariant = () => {
    const saved = readStorage(abVariantStorageKey);
    if (saved === "A" || saved === "B") {
      return saved;
    }
    const generated = Math.random() < 0.5 ? "A" : "B";
    writeStorage(abVariantStorageKey, generated);
    return generated;
  };

  const applyAbCta = () => {
    const variant = getOrCreateAbVariant();
    const lang = root.dataset.lang || "ms";

    abCtaLinks.forEach((link) => {
      const bmText = variant === "A" ? link.dataset.abABm : link.dataset.abBBm;
      const enText = variant === "A" ? link.dataset.abAEn : link.dataset.abBEn;
      const nextHref = variant === "A" ? link.dataset.abAHref : link.dataset.abBHref;

      const text = lang === "en" ? (enText || bmText) : (bmText || enText);
      if (text) {
        link.innerHTML = text;
      }
      if (nextHref) {
        link.setAttribute("href", nextHref);
      }
      const isAnchor = nextHref ? nextHref.startsWith("#") : false;
      if (isAnchor) {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      } else {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
      }
    });

    if (!abVariantTracked) {
      trackEvent("ab_variant_assigned", { variant });
      abVariantTracked = true;
    }
  };

  const closeLightbox = () => {
    if (!lightbox) {
      return;
    }
    lightbox.hidden = true;
    if (lightboxImage) {
      lightboxImage.src = "";
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }
    document.body.style.overflow = "";
  };

  let activeGalleryIndex = -1;
  let touchStartX = 0;

  const openGalleryAtIndex = (index) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) {
      return;
    }
    const item = galleryOpenImages[index];
    if (!item) {
      return;
    }
    activeGalleryIndex = index;
    const full = item.dataset.full || item.currentSrc || item.src;
    const lang = root.dataset.lang || "ms";
    const caption = lang === "en" ? (item.dataset.enCaption || item.alt) : (item.dataset.bmCaption || item.alt);
    lightboxImage.src = full;
    lightboxImage.alt = caption || "Gallery image";
    lightboxCaption.textContent = caption || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    trackEvent("gallery_lightbox_open", { image: full, index });
  };

  const showNextGallery = () => {
    if (galleryOpenImages.length === 0) {
      return;
    }
    const nextIndex = activeGalleryIndex < 0
      ? 0
      : (activeGalleryIndex + 1) % galleryOpenImages.length;
    openGalleryAtIndex(nextIndex);
  };

  const showPrevGallery = () => {
    if (galleryOpenImages.length === 0) {
      return;
    }
    const prevIndex = activeGalleryIndex <= 0
      ? galleryOpenImages.length - 1
      : activeGalleryIndex - 1;
    openGalleryAtIndex(prevIndex);
  };

  const updateThemeToggleUI = () => {
    if (!themeToggle) {
      return;
    }
    const theme = root.dataset.theme || "light";
    const lang = root.dataset.lang || "ms";
    const isDark = theme === "dark";

    if (themeIcon) {
      const icon = isDark ? themeIcon.dataset.dark : themeIcon.dataset.light;
      if (icon) {
        themeIcon.innerHTML = icon;
      }
    }

    if (themeLabel) {
      const label = isDark
        ? (lang === "en" ? themeLabel.dataset.enDark : themeLabel.dataset.bmDark)
        : (lang === "en" ? themeLabel.dataset.enLight : themeLabel.dataset.bmLight);
      if (label) {
        themeLabel.textContent = label;
      }
    }

    const ariaLabel = isDark
      ? (lang === "en" ? "Switch to light mode" : "Tukar ke mod terang")
      : (lang === "en" ? "Switch to dark mode" : "Tukar ke mod gelap");
    themeToggle.setAttribute("aria-label", ariaLabel);
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
  };

  const setTheme = (theme, persist = true) => {
    root.dataset.theme = theme;
    updateThemeToggleUI();
    if (persist) {
      writeStorage("preferredTheme", theme);
    }
  };

  const getPreferredTheme = () => {
    const savedTheme = readStorage("preferredTheme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  };

  const applyLanguage = (lang) => {
    root.lang = lang;
    root.dataset.lang = lang;

    const title = lang === "en" ? root.dataset.titleEn : root.dataset.titleBm;
    if (title) {
      document.title = title;
    }

    translatable.forEach((el) => {
      const text = lang === "en" ? el.dataset.en : el.dataset.bm;
      if (text !== undefined) {
        el.innerHTML = text;
      }
    });

    ariaTranslatable.forEach((el) => {
      const label = lang === "en" ? el.dataset.enAriaLabel : el.dataset.bmAriaLabel;
      if (label) {
        el.setAttribute("aria-label", label);
      }
    });

    altTranslatable.forEach((el) => {
      const alt = lang === "en" ? el.dataset.enAlt : el.dataset.bmAlt;
      if (alt) {
        el.setAttribute("alt", alt);
      }
    });

    titleTranslatable.forEach((el) => {
      const titleText = lang === "en" ? el.dataset.enTitle : el.dataset.bmTitle;
      if (titleText) {
        el.setAttribute("title", titleText);
      }
    });

    hrefTranslatable.forEach((el) => {
      const href = lang === "en" ? el.dataset.enHref : el.dataset.bmHref;
      if (href) {
        el.setAttribute("href", href);
      }
    });

    placeholderTranslatable.forEach((el) => {
      const placeholder = lang === "en" ? el.dataset.enPlaceholder : el.dataset.bmPlaceholder;
      if (placeholder) {
        el.setAttribute("placeholder", placeholder);
      }
    });

    langButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderAvailability(lang);
    updateLiveAvailabilityStatus();
    applyOwnerTestimonials(lang);
    applyAbCta();
    updateThemeToggleUI();
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("show");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("show")) {
        return;
      }
      const target = event.target;
      if (target instanceof Node && !nav.contains(target) && !menuToggle.contains(target)) {
        closeMobileNav();
      }
    });
  }

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      trackEvent("back_to_top_click");
    });
  }

  if (faqItems.length > 0) {
    faqItems.forEach((item, index) => {
      const heading = item.querySelector("h4");
      if (!heading) {
        return;
      }
      heading.setAttribute("role", "button");
      heading.setAttribute("tabindex", "0");
      heading.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      item.classList.toggle("open", index === 0);

      const toggle = () => {
        const willOpen = !item.classList.contains("open");
        faqItems.forEach((other) => {
          other.classList.remove("open");
          const h = other.querySelector("h4");
          if (h) {
            h.setAttribute("aria-expanded", "false");
          }
        });
        if (willOpen) {
          item.classList.add("open");
          heading.setAttribute("aria-expanded", "true");
        }
      };

      heading.addEventListener("click", toggle);
      heading.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });
  }

  if (loadMapBtn && locationMap && locationMapFrame) {
    loadMapBtn.addEventListener("click", () => {
      if (!locationMapFrame.src) {
        locationMapFrame.src = locationMapFrame.dataset.src || "";
      }
      locationMap.classList.add("loaded");
      loadMapBtn.setAttribute("aria-expanded", "true");
      trackEvent("map_load_click");
    });
  }

  if (lightbox && lightboxImage && lightboxCaption) {
    galleryOpenImages.forEach((img, index) => {
      img.addEventListener("click", () => {
        openGalleryAtIndex(index);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }
    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", showPrevGallery);
    }
    if (lightboxNext) {
      lightboxNext.addEventListener("click", showNextGallery);
    }

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    lightbox.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
    }, { passive: true });

    lightbox.addEventListener("touchend", (event) => {
      const endX = event.changedTouches[0]?.clientX || 0;
      const delta = endX - touchStartX;
      if (Math.abs(delta) < 40) {
        return;
      }
      if (delta < 0) {
        showNextGallery();
      } else {
        showPrevGallery();
      }
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
      } else if (event.key === "ArrowRight" && !lightbox.hidden) {
        showNextGallery();
      } else if (event.key === "ArrowLeft" && !lightbox.hidden) {
        showPrevGallery();
      }
    });
  }

  const isOwnerPasswordConfigured = ownerPassword.length >= 8 && ownerPassword !== "1234" && !!ownerApiEndpoint;
  if (!isOwnerPasswordConfigured && ownerEditBtn) {
    ownerEditBtn.hidden = true;
  }

  if (isOwnerPasswordConfigured && ownerEditBtn && ownerEditor && ownerRangesInput) {
    ownerEditBtn.addEventListener("click", () => {
      const input = window.prompt("Owner password:");
      if (input !== ownerPassword) {
        window.alert("Password salah.");
        return;
      }

      ownerEditor.hidden = false;
      ownerRangesInput.value = rangesToEditorText(unavailableRanges);
      ownerRangesInput.focus();
      trackEvent("owner_editor_open");
    });
  }

  if (ownerCancelBtn && ownerEditor) {
    ownerCancelBtn.addEventListener("click", () => {
      ownerEditor.hidden = true;
    });
  }

  if (ownerSaveBtn && ownerEditor && ownerRangesInput) {
    ownerSaveBtn.addEventListener("click", async () => {
      const parsed = parseEditorRanges(ownerRangesInput.value);
      if (!parsed.ok) {
        window.alert(parsed.error || "Data tidak sah.");
        return;
      }

      const apiSaved = await saveOwnerRangesToApi(parsed.ranges || [], ownerPassword);
      if (!apiSaved) {
        window.alert("Simpan ke server gagal. Semak ownerApiEndpoint.");
        return;
      }

      unavailableRanges = parsed.ranges || [];
      saveOwnerRanges(unavailableRanges);
      markRangesUpdatedAt();
      renderAvailability(root.dataset.lang || "ms");
      ownerEditor.hidden = true;
      window.alert("Tarikh berjaya disimpan.");
      trackEvent("owner_editor_save", { count: unavailableRanges.length });
    });
  }

  if (ownerResetBtn && ownerRangesInput) {
    ownerResetBtn.addEventListener("click", () => {
      unavailableRanges = defaultUnavailableRanges.slice();
      deleteStorage(ownerRangesStorageKey);
      deleteStorage(ownerRangesUpdatedAtKey);
      ownerRangesInput.value = rangesToEditorText(unavailableRanges);
      renderAvailability(root.dataset.lang || "ms");
      window.alert("Tarikh reset ke data asal.");
      trackEvent("owner_editor_reset");
    });
  }

  waLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      if (!href.includes("wa.me/")) {
        return;
      }
      event.preventDefault();
      openWhatsApp(link.href, link.className || "wa_link");
    });
  });

  if (dateForm) {
    const checkinInput = dateForm.querySelector('input[name="checkin"]');
    const checkoutInput = dateForm.querySelector('input[name="checkout"]');
    const guestsInput = dateForm.querySelector('input[name="guests"]');
    const intentSelect = dateForm.querySelector('select[name="intent"]');

    if (checkinInput && checkoutInput) {
      const today = new Date().toISOString().split("T")[0];
      checkinInput.setAttribute("min", today);
      checkoutInput.setAttribute("min", today);

      checkinInput.addEventListener("change", () => {
        if (formFeedback) {
          formFeedback.textContent = "";
        }
        if (checkinInput.value) {
          checkoutInput.setAttribute("min", checkinInput.value);
          if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
            checkoutInput.value = "";
          }
        }
        updateLiveAvailabilityStatus();
      });

      checkoutInput.addEventListener("change", updateLiveAvailabilityStatus);
    }

    dateForm.addEventListener("input", () => {
      if (formFeedback) {
        formFeedback.textContent = "";
      }
      updateLiveAvailabilityStatus();
      if (!hasTrackedFormStart) {
        hasTrackedFormStart = true;
        trackEvent("date_form_start");
      }
    });

    dateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(dateForm);
      const checkin = `${data.get("checkin") || ""}`.trim();
      const checkout = `${data.get("checkout") || ""}`.trim();
      const guests = `${data.get("guests") || ""}`.trim();
      const rooms = `${data.get("rooms") || ""}`.trim();
      const intent = `${data.get("intent") || "family"}`.trim();
      const notes = `${data.get("notes") || ""}`.trim();
      const lang = root.dataset.lang || "ms";

      if (checkin && checkout && checkout <= checkin) {
        if (formFeedback) {
          formFeedback.textContent = lang === "en"
            ? "Please choose a valid check-out date."
            : "Sila pilih tarikh check-out yang sah.";
        }
        window.alert(
          lang === "en"
            ? "Check-out date must be after check-in date."
            : "Tarikh check-out mesti selepas check-in."
        );
        return;
      }

      const conflict = overlapsWithUnavailable(checkin, checkout);
      if (conflict) {
        if (formFeedback) {
          formFeedback.textContent = lang === "en"
            ? "Selected dates are unavailable. Please choose different dates."
            : "Tarikh dipilih tidak tersedia. Sila pilih tarikh lain.";
        }
        const label = lang === "en"
          ? (conflict.labelEn || conflict.labelBm || "")
          : (conflict.labelBm || conflict.labelEn || "");
        window.alert(
          lang === "en"
            ? `Selected dates overlap with unavailable dates: ${conflict.start} - ${conflict.end}${label ? ` (${label})` : ""}`
            : `Tarikh dipilih bertindih dengan tarikh tidak tersedia: ${conflict.start} - ${conflict.end}${label ? ` (${label})` : ""}`
        );
        return;
      }

      const lines = [];
      if (lang === "en") {
        lines.push(`Hi ${business.name || "Jitra2Stay"}, I would like to check availability:`);
        lines.push(`Check-in: ${checkin}`);
        lines.push(`Check-out: ${checkout}`);
        lines.push(`Guests: ${guests}`);
        lines.push(`Rooms: ${rooms}`);
        lines.push(`Purpose: ${getIntentText(intent, lang)}`);
        if (notes) {
          lines.push(`Notes: ${notes}`);
        }
      } else {
        lines.push(`Hai ${business.name || "Jitra2Stay"}, saya ingin semak ketersediaan:`);
        lines.push(`Check-in: ${checkin}`);
        lines.push(`Check-out: ${checkout}`);
        lines.push(`Tetamu: ${guests}`);
        lines.push(`Bilik: ${rooms}`);
        lines.push(`Tujuan: ${getIntentText(intent, lang)}`);
        if (notes) {
          lines.push(`Nota: ${notes}`);
        }
      }

      trackEvent("date_form_submit", {
        checkin,
        checkout,
        guests,
        rooms,
        intent
      });

      const phone = (business.phone || "+60194410666").replace(/\D/g, "");
      const message = encodeURIComponent(lines.join("\n"));
      if (formFeedback) {
        formFeedback.textContent = lang === "en"
          ? "Opening WhatsApp with your details..."
          : "Membuka WhatsApp dengan maklumat anda...";
      }
      openWhatsApp(`https://wa.me/${phone}?text=${message}`, "date_form_submit");
    });

    if (guestsInput) {
      guestsInput.addEventListener("change", () => {
        const value = Number(guestsInput.value);
        if (Number.isFinite(value) && value > 10) {
          trackEvent("guest_count_over_limit", { guests: value });
        }
      });
    }

    if (intentSelect) {
      intentSelect.addEventListener("change", () => {
        trackEvent("booking_intent_change", { intent: intentSelect.value || "family" });
      });
    }

    updateLiveAvailabilityStatus();
  }

  setupAnalytics();
  applyCanonical();
  renderSchema();
  setupWalkthroughVideo();
  setTheme(getPreferredTheme(), false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = (root.dataset.theme || "light") === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      trackEvent("theme_toggle", { nextTheme });
    });
  }

  let initialLang = root.dataset.lang || "ms";
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang === "ms" || urlLang === "en") {
    initialLang = urlLang;
    writeStorage("preferredLang", urlLang);
  }
  const savedLang = readStorage("preferredLang");
  if ((!urlLang || (urlLang !== "ms" && urlLang !== "en")) && (savedLang === "ms" || savedLang === "en")) {
    initialLang = savedLang;
  }
  applyLanguage(initialLang);
  trackEvent("page_view", { page: window.location.pathname, lang: initialLang });

  fetchOwnerRangesFromApi().then((ranges) => {
    if (!ranges) {
      return;
    }
    unavailableRanges = ranges;
    saveOwnerRanges(unavailableRanges);
    markRangesUpdatedAt();
    renderAvailability(root.dataset.lang || "ms");
  });

  fetchIcsRanges().then((calendarRanges) => {
    if (!calendarRanges || calendarRanges.length === 0) {
      return;
    }
    const map = new Map();
    unavailableRanges.forEach((range) => {
      map.set(`${range.start}|${range.end}|${range.labelBm || ""}|${range.labelEn || ""}`, range);
    });
    calendarRanges.forEach((range) => {
      map.set(`${range.start}|${range.end}|${range.labelBm || ""}|${range.labelEn || ""}`, range);
    });
    unavailableRanges = Array.from(map.values()).sort((a, b) => a.start.localeCompare(b.start));
    renderAvailability(root.dataset.lang || "ms");
    trackEvent("ical_sync_loaded", { count: calendarRanges.length });
  });

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (!lang) {
        return;
      }
      applyLanguage(lang);
      writeStorage("preferredLang", lang);
      trackEvent("language_switch", { lang });
    });
  });

  let didShrink = false;
  let ticking = false;

  const updateOnScroll = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    if (header) {
      const shouldShrink = scrollY > 80;
      if (shouldShrink !== didShrink) {
        header.classList.toggle("shrink", shouldShrink);
        didShrink = shouldShrink;
        updateHeaderOffset();
      }
    }

    reveals.forEach((section) => {
      if (section.classList.contains("active")) {
        return;
      }
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop < viewportHeight - 120) {
        section.classList.add("active");
      }
    });

    if (finalCTA && !finalCTA.classList.contains("show")) {
      const top = finalCTA.getBoundingClientRect().top;
      if (top < viewportHeight - 100) {
        finalCTA.classList.add("show");
      }
    }

    const showFloating = scrollY > 500;
    if (floatingCta) {
      floatingCta.classList.toggle("show", showFloating);
    }
    if (backToTop) {
      backToTop.classList.toggle("show", showFloating);
    }

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(updateOnScroll);
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", () => {
    updateHeaderOffset();
    requestScrollUpdate();
  });
  updateHeaderOffset();
  requestScrollUpdate();
})();
