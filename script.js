document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault(); // stop page refresh

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let message = document.getElementById("message").value;

    if (name === "" || email === "" || message === "") {
        alert("Sila isi semua maklumat");
    } else {
        alert("Terima kasih! Mesej anda telah dihantar.");
    }
});
