
const $ = id => document.getElementById(id);

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "সমস্যা হয়েছে");
  }

  return data;
}

// LOGIN PAGE
const loginForm = $("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const message = $("loginMessage");
    message.textContent = "Login হচ্ছে...";

    try {
      await api("/api/admin-login", {
        method: "POST",
        body: JSON.stringify({
          username: $("username").value.trim(),
          password: $("password").value
        })
      });

      location.href = "/admin.html";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

// ADMIN DASHBOARD
const saveButton = $("saveButton");

if (saveButton) {
  startAdmin();
}

async function startAdmin() {
  try {
    const session = await api("/api/admin-session");

    if (!session.success) {
      location.href = "/login.html";
      return;
    }

    const result = await api("/api/store-data");
    fillAdmin(result.data);
  } catch (error) {
    alert("Admin Data লোড হয়নি: " + error.message);
  }
}

let currentData = null;

function fillAdmin(data) {
  currentData = data;

  $("siteNameInput").value = data.siteName || "";
  $("logoInput").value = data.logo || "";
  $("heroTitleInput").value = data.heroTitle || "";
  $("heroDescriptionInput").value = data.heroDescription || "";
  $("footerInput").value = data.footerText || "";
  $("whatsappInput").value = data.whatsapp || "";
  $("whatsappMessageInput").value = data.whatsappMessage || "";
  $("detailsInput").value = data.moreDetails || "";

  const packageEditor = $("packageEditor");
  packageEditor.innerHTML = "";

  (data.packages || []).forEach((item, index) => {
    const box = document.createElement("div");
    box.className = "package-editor-item";

    const title = document.createElement("h3");
    title.textContent = "পণ্য " + (index + 1);
    box.appendChild(title);

    addField(box, "পণ্যের নাম", "pkgName" + index, item.name);
    addField(box, "দাম (টাকা)", "pkgPrice" + index, item.price);
    addField(box, "স্টক / বিবরণ", "pkgDate" + index, item.date);
    addField(box, "ছবির URL", "pkgImage" + index, item.image);

    packageEditor.appendChild(box);
  });

  $("featureEditor").innerHTML = "";
  const features = document.createElement("textarea");
  features.id = "featuresText";
  features.rows = 6;
  features.value = (data.features || []).join("\n");
  $("featureEditor").appendChild(features);

  $("instructionEditor").innerHTML = "";
  const instructions = document.createElement("textarea");
  instructions.id = "instructionsText";
  instructions.rows = 6;
  instructions.value = (data.instructions || []).join("\n");
  $("instructionEditor").appendChild(instructions);
}

function addField(parent, labelText, id, value) {
  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = id;

  const input = document.createElement("input");
  input.id = id;
  input.value = value ?? "";

  parent.appendChild(label);
  parent.appendChild(input);
}

saveButton?.addEventListener("click", async () => {
  const message = $("saveMessage");
  message.textContent = "সংরক্ষণ হচ্ছে...";
  saveButton.disabled = true;

  try {
    const data = {
      ...currentData,
      siteName: $("siteNameInput").value.trim(),
      logo: $("logoInput").value.trim(),
      heroTitle: $("heroTitleInput").value.trim(),
      heroDescription: $("heroDescriptionInput").value.trim(),
      footerText: $("footerInput").value.trim(),
      whatsapp: $("whatsappInput").value.trim(),
      whatsappMessage: $("whatsappMessageInput").value.trim(),
      moreDetails: $("detailsInput").value.trim(),

      packages: currentData.packages.map((item, index) => ({
        ...item,
        name: $("pkgName" + index).value.trim(),
        price: $("pkgPrice" + index).value.trim(),
        date: $("pkgDate" + index).value.trim(),
        image: $("pkgImage" + index).value.trim()
      })),

      features: $("featuresText").value
        .split("\n").map(x => x.trim()).filter(Boolean),

      instructions: $("instructionsText").value
        .split("\n").map(x => x.trim()).filter(Boolean)
    };

    const result = await api("/api/store-data", {
      method: "PUT",
      body: JSON.stringify(data)
    });

    currentData = data;
    message.textContent = result.message;
  } catch (error) {
    message.textContent = error.message;
  } finally {
    saveButton.disabled = false;
  }
});

$("logoutButton")?.addEventListener("click", async () => {
  try {
    await api("/api/admin-logout", { method: "POST" });
  } finally {
    location.href = "/login.html";
  }
});
