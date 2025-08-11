document.getElementById("verifyBtn").addEventListener("click", async () => {
    const key = document.getElementById("licenseInput").value.trim();
    const resultBox = document.getElementById("result");

    if (!key) {
        resultBox.textContent = "Please enter a license key.";
        return;
    }

    resultBox.textContent = "Verifying...";

    try {
        const res = await fetch(`/api/verify?licenseKey=${encodeURIComponent(key)}`);
        const data = await res.json();
        resultBox.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        resultBox.textContent = "Error verifying license.";
    }
});
