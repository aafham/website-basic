(() => {
  const root = document.documentElement;
  const header = document.getElementById("siteHeader");
  const nav = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const finalCTA = document.querySelector(".final-cta");
  const floatingCta = document.getElementById("floatingCta");
  const backToTop = document.getElementById("backToTop");
  const dateForm = document.getElementById("dateForm");
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = themeToggle ? themeToggle.querySelector(".theme-label") : null;
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;
  const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
  const translatable = document.querySelectorAll("[data-bm][data-en]");
  const ariaTranslatable = document.querySelectorAll("[data-bm-aria-label][data-en-aria-label]");
  const altTranslatable = document.querySelectorAll("[data-bm-alt][data-en-alt]");
  const titleTranslatable = document.querySelectorAll("[data-bm-title][data-en-title]");
  const hrefTranslatable = document.querySelectorAll("[data-bm-href][data-en-href]");

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
    });
  }

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
          if (checkoutInput.value && checkoutInput.value < checkinInput.value) {
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

      const lines = [];
      if (lang === "en") {
        lines.push("Hi Jitra2Stay, I would like to check availability:");
        lines.push(`Check-in: ${checkin}`);
        lines.push(`Check-out: ${checkout}`);
        lines.push(`Guests: ${guests}`);
        lines.push(`Rooms: ${rooms}`);
        if (notes) {
          lines.push(`Notes: ${notes}`);
        }
      } else {
        lines.push("Hai Jitra2Stay, saya ingin semak ketersediaan:");
        lines.push(`Check-in: ${checkin}`);
        lines.push(`Check-out: ${checkout}`);
        lines.push(`Tetamu: ${guests}`);
        lines.push(`Bilik: ${rooms}`);
        if (notes) {
          lines.push(`Nota: ${notes}`);
        }
      }

      const message = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/60194410666?text=${message}`, "_blank", "noopener");
    });
  }

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

  setTheme(getPreferredTheme(), false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = (root.dataset.theme || "light") === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

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

    updateThemeToggleUI();
  };

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
