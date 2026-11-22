
const DEFAULT_DATA = {
  siteName: "আমাদের ওয়েবসাইট",
  logo: "",
  heroTitle: "আপনার পছন্দের সেবা এখন আরও সহজে!",
  heroDescription: "নিরাপদ ও সহজ উপায়ে আপনার পছন্দের সেবা গ্রহণ করুন।",
  footerText: "সর্বস্বত্ব সংরক্ষিত।",
  whatsapp: "",
  whatsappMessage: "আসসালামু আলাইকুম। আমি বিস্তারিত জানতে চাই।",
  moreDetails: "আমাদের সেবা সম্পর্কে বিস্তারিত জানতে যোগাযোগ করুন।",
  packages: [
    {name:"প্যাকেজ ১",price:"0",date:"0",image:""},
    {name:"প্যাকেজ ২",price:"0",date:"0",image:""},
    {name:"প্যাকেজ ৩",price:"0",date:"0",image:""}
  ],
  features: [
    "সহজ অর্ডার করার সুবিধা",
    "গ্রাহক সহায়তা",
    "নিরাপদ পেমেন্ট ব্যবস্থা",
    "দ্রুত সেবা প্রদান",
    "বিশ্বস্ত কাস্টমার সাপোর্ট"
  ],
  instructions: [
    "আপনার পছন্দের প্যাকেজ নির্বাচন করুন।",
    "প্যাকেজের বিস্তারিত দেখে নিন।",
    "নিরাপদ পেমেন্ট সম্পন্ন করুন।",
    "প্রয়োজনে WhatsApp-এ যোগাযোগ করুন।"
  ]
};

function loadData() {
  try {
    return {
      ...DEFAULT_DATA,
      ...JSON.parse(localStorage.getItem("storeWebsiteData") || "{}")
    };
  } catch {
    return {...DEFAULT_DATA};
  }
}

function saveData(data) {
  localStorage.setItem("storeWebsiteData", JSON.stringify(data));
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? "";
}

function getValue(id) {
  return document.getElementById(id)?.value ?? "";
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const message = document.getElementById("loginMessage");
    message.textContent =
      "নিরাপদ Admin Login চালু করতে Firebase Authentication সেটআপ করুন।";

    message.style.color = "#dc2626";
  });
}

// ADMIN DASHBOARD
const adminPage = document.getElementById("saveButton");

if (adminPage) {
  const data = loadData();

  setValue("siteNameInput", data.siteName);
  setValue("logoInput", data.logo);
  setValue("heroTitleInput", data.heroTitle);
  setValue("heroDescriptionInput", data.heroDescription);
  setValue("footerInput", data.footerText);
  setValue("whatsappInput", data.whatsapp);
  setValue("whatsappMessageInput", data.whatsappMessage);
  setValue("detailsInput", data.moreDetails);

  const packageEditor = document.getElementById("packageEditor");

  data.packages.forEach((item, index) => {
    const box = document.createElement("div");
    box.className = "package-editor-item";

    const heading = document.createElement("h3");
    heading.textContent = "প্যাকেজ " + (index + 1);

    box.appendChild(heading);

    const fields = [
      ["নাম", "name", item.name],
      ["মূল্য", "price", item.price],
      ["মেয়াদ", "date", item.date],
      ["ছবির URL", "image", item.image]
    ];

    fields.forEach(([label, key, value]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "editor-row";

      const caption = document.createElement("label");
      caption.textContent = label;

      const input = document.createElement("input");
      input.type = "text";
      input.value = value || "";
      input.dataset.package = index;
      input.dataset.field = key;

      wrapper.append(caption, input);
      box.appendChild(wrapper);
    });

    packageEditor.appendChild(box);
  });

  function createListEditor(containerId, items, type) {
    const container = document.getElementById(containerId);

    items.forEach((value, index) => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = value;
      input.dataset.list = type;
      input.dataset.index = index;
      input.style.marginBottom = "12px";
      container.appendChild(input);
    });
  }

  createListEditor("featureEditor", data.features, "features");
  createListEditor("instructionEditor", data.instructions, "instructions");

  adminPage.addEventListener("click", function() {
    const updated = loadData();

    updated.siteName = getValue("siteNameInput");
    updated.logo = getValue("logoInput");
    updated.heroTitle = getValue("heroTitleInput");
    updated.heroDescription = getValue("heroDescriptionInput");
    updated.footerText = getValue("footerInput");
    updated.whatsapp = getValue("whatsappInput");
    updated.whatsappMessage = getValue("whatsappMessageInput");
    updated.moreDetails = getValue("detailsInput");

    document.querySelectorAll("[data-package]").forEach(input => {
      const index = Number(input.dataset.package);
      const field = input.dataset.field;

      if (updated.packages[index]) {
        updated.packages[index][field] = input.value;
      }
    });

    document.querySelectorAll("[data-list]").forEach(input => {
      const type = input.dataset.list;
      const index = Number(input.dataset.index);

      if (updated[type]) {
        updated[type][index] = input.value;
      }
    });

    saveData(updated);

    const message = document.getElementById("saveMessage");
    message.textContent = "পরিবর্তন এই ব্রাউজারে সংরক্ষিত হয়েছে।";
  });
}

// LOGOUT
const logout = document.getElementById("logoutButton");

if (logout) {
  logout.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}
