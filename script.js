/* =========================
   CONTACT FORM (SAFE CHECK)
========================= */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        if (name === "" || email === "" || message === "") {
            alert("Sila isi semua maklumat");
        } else {
            alert("Terima kasih! Mesej anda telah dihantar.");
        }
    });
}

/* =========================
   SCROLL REVEAL
========================= */
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
    reveals.forEach(section => {
        const top = section.getBoundingClientRect().top;
        const trigger = window.innerHeight - 100;

        if (top < trigger) {
            section.classList.add("active");
        }
    });

    /* =========================
       NAVBAR SHADOW
    ========================= */
    const header = document.querySelector("header");
    if (window.scrollY > 20) {
        header.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
    } else {
        header.style.boxShadow = "none";
    }
});

// Hide floating WhatsApp when footer is visible
const footer = document.querySelector("footer");
const waBtn = document.querySelector(".floating-whatsapp");

window.addEventListener("scroll", () => {
    if (!footer || !waBtn) return;

    const footerTop = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (footerTop < windowHeight) {
        waBtn.style.opacity = "0";
        waBtn.style.pointerEvents = "none";
    } else {
        waBtn.style.opacity = "1";
        waBtn.style.pointerEvents = "auto";
    }
});
