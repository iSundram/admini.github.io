// public/script.js
const elKey = document.getElementById("licenseKey");
const elBtn = document.getElementById("verifyBtn");
const elStatus = document.getElementById("status");
const elOutput = document.getElementById("output");

elBtn.addEventListener("click", () => verify(elKey.value.trim()));

// Auto-check ?key=...
const params = new URLSearchParams(window.location.search);
if (params.has("key")) {
  const key = params.get("key");
  elKey.value = key;
  verify(key);
}

function setStatus(text, color=null) {
  elStatus.textContent = text;
  elStatus.style.color = color || "";
}

function showRaw(obj) {
  elOutput.textContent = JSON.stringify(obj, null, 2);
}

function renderLicenseInfo(cl) {
  // `cl` expected to be the Cryptolens JSON root (contains licenseKey, result, message, etc.)
  const out = document.createElement("div");

  // Show summary line
  const ok = Number(cl.result) === 0;
  const summary = document.createElement("div");
  summary.innerHTML = `<strong>${ok ? "License valid ✅" : "License invalid ❌"}</strong> — message: ${cl.message || "(none)"}`;
  summary.style.marginBottom = "10px";
  out.appendChild(summary);

  // If licenseKey exists, show formatted grid
  if (cl.licenseKey) {
    const lk = cl.licenseKey;
    const grid = document.createElement("div");
    grid.className = "kv-grid";

    const addKV = (k,v) => {
      const el = document.createElement("div");
      el.className = "kv";
      el.innerHTML = `<b>${k}</b><small>${v === null || v === undefined ? "-" : v}</small>`;
      grid.appendChild(el);
    };

    addKV("Key", lk.key || lk);
    addKV("ProductId", lk.productId);
    addKV("License ID", lk.id);
    addKV("Created", lk.created);
    addKV("Expires", lk.expires);
    addKV("Blocked", lk.block ? "Yes" : "No");
    addKV("Trial Activation", lk.trialActivation ? "Yes" : "No");
    addKV("Max Machines", lk.maxNoOfMachines);
    addKV("Activated Machines", (lk.activatedMachines && lk.activatedMachines.length) || 0);
    addKV("Customer", (lk.customer && lk.customer.name) || "-");
    addKV("Customer Email", (lk.customer && lk.customer.email) || "-");
    addKV("Customer Company", (lk.customer && lk.customer.companyName) || "-");
    addKV("Notes", lk.notes || "-");
    // add more if needed...

    out.appendChild(grid);
  } else {
    // fallback: show raw
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(cl, null, 2);
    out.appendChild(pre);
  }

  // Replace output
  elOutput.innerHTML = "";
  elOutput.appendChild(out);
}

async function verify(key) {
  if (!key) {
    setStatus("Please enter a license key.", "crimson");
    elOutput.textContent = "";
    return;
  }

  setStatus("Verifying…", "black");
  elOutput.textContent = "";

  try {
    const resp = await fetch(`/api/verify?licenseKey=${encodeURIComponent(key)}`, { cache: "no-store" });
    const json = await resp.json();

    // If our wrapper returned an error (e.g. missing env), show it
    if (json.error) {
      setStatus("Error", "crimson");
      showRaw(json);
      return;
    }

    // cryptolens payload expected under json.cryptolens
    const cl = json.cryptolens || json;

    // If cryptolens had a "result" field:
    if ("result" in cl) {
      // result == 0 => success according to docs
      if (Number(cl.result) === 0) {
        setStatus("License is valid ✅", "green");
      } else {
        setStatus(`License check returned error (result=${cl.result})`, "crimson");
      }
      // Show full cryptolens data (nicely)
      renderLicenseInfo(cl);
      return;
    }

    // Fallback: show what we got
    setStatus("Received response", "orange");
    showRaw(cl);

  } catch (err) {
    setStatus("Request failed", "crimson");
    elOutput.textContent = `Network or server error:\n${err.message}`;
    console.error(err);
  }
}
