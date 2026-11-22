
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
    {name:"প্যাকেজ ১", price:"0", date:"0", image:""},
    {name:"প্যাকেজ ২", price:"0", date:"0", image:""},
    {name:"প্যাকেজ ৩", price:"0", date:"0", image:""}
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

function getWebsiteData() {
  try {
    const saved = localStorage.getItem("storeWebsiteData");
    if (!saved) return DEFAULT_DATA;

    return {
      ...DEFAULT_DATA,
      ...JSON.parse(saved)
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function renderWebsite() {
  const data = getWebsiteData();

  document.title = data.siteName;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  setText("siteName", data.siteName);
  setText("heroTitle", data.heroTitle);
  setText("heroDescription", data.heroDescription);
  setText("footerText", data.footerText);
  setText("moreDetails", data.moreDetails);

  const logo = document.getElementById("siteLogo");
  if (logo) {
    logo.src = data.logo || "";
    logo.style.display = data.logo ? "block" : "none";
  }

  const packages = document.getElementById("packageContainer");

  if (packages) {
    packages.replaceChildren();

    data.packages.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "package-card";

      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = item.name;
        card.appendChild(img);
      }

      const name = document.createElement("h3");
      name.textContent = item.name;

      const price = document.createElement("div");
      price.className = "package-price";
      price.textContent = "৳ " + item.price;

      const date = document.createElement("p");
      date.className = "package-date";
      date.textContent = "মেয়াদ: " + item.date;

      const button = document.createElement("button");
      button.className = "buy-btn";
      button.textContent = "কিনুন";
      button.addEventListener("click", () => {
        alert("এই প্যাকেজের অর্ডার ব্যবস্থা এখনো সেটআপ করা হয়নি।");
      });

      card.append(name, price, date, button);
      packages.appendChild(card);
    });
  }

  const features = document.getElementById("features");

  if (features) {
    features.replaceChildren();

    data.features.forEach((item, index) => {
      const box = document.createElement("div");
      box.className = "feature-item";

      const number = document.createElement("span");
      number.textContent = "✓";

      const text = document.createElement("p");
      text.textContent = item;

      box.append(number, text);
      features.appendChild(box);
    });
  }

  const instructions = document.getElementById("buyInstructions");

  if (instructions) {
    instructions.replaceChildren();

    data.instructions.forEach((item, index) => {
      const box = document.createElement("div");
      box.className = "instruction-item";
      box.textContent = (index + 1) + ". " + item;
      instructions.appendChild(box);
    });
  }

  const whatsapp = document.getElementById("whatsappButton");

  if (whatsapp) {
    const number = String(data.whatsapp || "").replace(/\D/g, "");
    whatsapp.href = number
      ? "https://wa.me/" + number + "?text=" +
        encodeURIComponent(data.whatsappMessage)
      : "#";

    whatsapp.style.display = number ? "flex" : "none";
  }
}

document.addEventListener("DOMContentLoaded", renderWebsite);

window.addEventListener("storage", renderWebsite);
