(() => {
  const root = document.documentElement;
  const config = window.APP_CONFIG || {};
  const business = config.business || {};
  const analyticsConfig = config.analytics || {};
  const unavailableRanges = Array.isArray(config.unavailableRanges) ? config.unavailableRanges : [];

  const header = document.getElementById("siteHeader");
  const nav = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const finalCTA = document.querySelector(".final-cta");
  const floatingCta = document.getElementById("floatingCta");
  const backToTop = document.getElementById("backToTop");
  const dateForm = document.getElementById("dateForm");
  const availabilityList = document.getElementById("availabilityList");
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = themeToggle ? themeToggle.querySelector(".theme-label") : null;
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;
  const loadMapBtn = document.getElementById("loadMapBtn");
  const locationMap = document.getElementById("locationMap");
  const locationMapFrame = document.getElementById("locationMapFrame");
  const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
  const translatable = document.querySelectorAll("[data-bm][data-en]");
  const ariaTranslatable = document.querySelectorAll("[data-bm-aria-label][data-en-aria-label]");
  const altTranslatable = document.querySelectorAll("[data-bm-alt][data-en-alt]");
  const titleTranslatable = document.querySelectorAll("[data-bm-title][data-en-title]");
  const hrefTranslatable = document.querySelectorAll("[data-bm-href][data-en-href]");
  const waLinks = Array.from(document.querySelectorAll('a[href*="wa.me/"]'));
  const schemaNode = document.getElementById("lodgingSchema");

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

  const isDateWithinRange = (day, start, end) => day >= start && day <= end;

  const getDateValue = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

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
    if (!schemaNode || !business.siteUrl) {
      return;
    }
    const schema = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": business.name || "Jitra2Stay",
      "url": business.siteUrl,
      "telephone": business.phone || "",
      "description": business.description || "Homestay Semi-D 2 tingkat di Jitra.",
      "image": business.image || `${business.siteUrl}/images/halaman.jpg`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "49, Taman Jitra Indah, Jalan Hospital Daerah",
        "addressLocality": "Jitra",
        "postalCode": "06000",
        "addressRegion": "Kedah",
        "addressCountry": "MY"
      },
      "priceRange": "RM170-RM330 per night"
    };
    schemaNode.textContent = JSON.stringify(schema);
  };

  const renderAvailability = (lang) => {
    if (!availabilityList) {
      return;
    }
    availabilityList.innerHTML = "";
    if (unavailableRanges.length === 0) {
      const item = document.createElement("li");
      item.textContent = lang === "en"
        ? "No blocked dates listed yet."
        : "Tiada tarikh blok ditetapkan lagi.";
      availabilityList.appendChild(item);
      return;
    }

    unavailableRanges.forEach((range) => {
      const item = document.createElement("li");
      const label = lang === "en" ? (range.labelEn || range.labelBm) : (range.labelBm || range.labelEn);
      item.textContent = `${range.start} - ${range.end}  ${label ? `(${label})` : ""}`.trim();
      availabilityList.appendChild(item);
    });
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

    langButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderAvailability(lang);
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

  waLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openWhatsApp(link.href, link.className || "wa_link");
    });
  });

  if (dateForm) {
    const checkinInput = dateForm.querySelector('input[name="checkin"]');
    const checkoutInput = dateForm.querySelector('input[name="checkout"]');

    if (checkinInput && checkoutInput) {
      const today = new Date().toISOString().split("T")[0];
      checkinInput.setAttribute("min", today);
      checkoutInput.setAttribute("min", today);

      checkinInput.addEventListener("change", () => {
        if (checkinInput.value) {
          checkoutInput.setAttribute("min", checkinInput.value);
          if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
            checkoutInput.value = "";
          }
        }
      });
    }

    dateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(dateForm);
      const checkin = `${data.get("checkin") || ""}`.trim();
      const checkout = `${data.get("checkout") || ""}`.trim();
      const guests = `${data.get("guests") || ""}`.trim();
      const rooms = `${data.get("rooms") || ""}`.trim();
      const notes = `${data.get("notes") || ""}`.trim();
      const lang = root.dataset.lang || "ms";

      if (checkin && checkout && checkout <= checkin) {
        window.alert(
          lang === "en"
            ? "Check-out date must be after check-in date."
            : "Tarikh check-out mesti selepas check-in."
        );
        return;
      }

      const conflict = overlapsWithUnavailable(checkin, checkout);
      if (conflict) {
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
        if (notes) {
          lines.push(`Notes: ${notes}`);
        }
      } else {
        lines.push(`Hai ${business.name || "Jitra2Stay"}, saya ingin semak ketersediaan:`);
        lines.push(`Check-in: ${checkin}`);
        lines.push(`Check-out: ${checkout}`);
        lines.push(`Tetamu: ${guests}`);
        lines.push(`Bilik: ${rooms}`);
        if (notes) {
          lines.push(`Nota: ${notes}`);
        }
      }

      const phone = (business.phone || "+60194410666").replace(/\D/g, "");
      const message = encodeURIComponent(lines.join("\n"));
      openWhatsApp(`https://wa.me/${phone}?text=${message}`, "date_form_submit");
    });
  }

  setupAnalytics();
  renderSchema();
  setTheme(getPreferredTheme(), false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = (root.dataset.theme || "light") === "dark" ? "light" : "dark";
      setTheme(nextTheme);
      trackEvent("theme_toggle", { nextTheme });
    });
  }

  let initialLang = root.dataset.lang || "ms";
  const savedLang = readStorage("preferredLang");
  if (savedLang === "ms" || savedLang === "en") {
    initialLang = savedLang;
  }
  applyLanguage(initialLang);

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
