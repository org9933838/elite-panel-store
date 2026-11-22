
let websiteData = null;

async function loadWebsite() {
  const container = document.getElementById("packageContainer");

  try {
    const response = await fetch("/api/store-data");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error("Website data load failed");
    }

    websiteData = result.data;
    renderWebsite();
  } catch (error) {
    container.textContent =
      "পণ্যের তথ্য লোড হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।";
    console.error(error);
  }
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || "";
}

function renderWebsite() {
  if (!websiteData) return;

  const data = websiteData;

  document.title = data.siteName || "Saikat Store";

  setText("siteName", data.siteName);
  setText("heroTitle", data.heroTitle);
  setText("heroDescription", data.heroDescription);
  setText("footerText", data.footerText);
  setText("moreDetails", data.moreDetails);

  const logo = document.getElementById("siteLogo");

  if (data.logo) {
    logo.src = data.logo;
    logo.style.display = "block";
  } else {
    logo.style.display = "none";
  }

  const container = document.getElementById("packageContainer");
  container.innerHTML = "";

  (data.packages || []).forEach(product => {
    const card = document.createElement("div");
    card.className = "package-card";

    if (product.image) {
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.name;
      image.loading = "lazy";
      card.appendChild(image);
    }

    const name = document.createElement("h3");
    name.textContent = product.name;
    card.appendChild(name);

    const price = document.createElement("div");
    price.className = "package-price";
    price.textContent = "৳" + Number(product.price).toLocaleString("en-IN");
    card.appendChild(price);

    const description = document.createElement("p");
    description.className = "package-date";
    description.textContent = product.date || "";
    card.appendChild(description);

    const button = document.createElement("button");
    button.className = "buy-btn";
    button.textContent = "এখনই কিনুন";

    button.addEventListener("click", () => buyProduct(product.id, button));

    card.appendChild(button);
    container.appendChild(card);
  });

  const features = document.getElementById("features");
  features.innerHTML = "";

  (data.features || []).forEach((item, index) => {
    const box = document.createElement("div");
    box.className = "feature-item";

    const number = document.createElement("span");
    number.textContent = "✓";

    const text = document.createElement("p");
    text.textContent = item;

    box.append(number, text);
    features.appendChild(box);
  });

  const instructions = document.getElementById("buyInstructions");
  instructions.innerHTML = "";

  (data.instructions || []).forEach((item, index) => {
    const box = document.createElement("div");
    box.className = "instruction-item";
    box.textContent = (index + 1) + ". " + item;
    instructions.appendChild(box);
  });

  const whatsapp = document.getElementById("whatsappButton");
  const number = String(data.whatsapp || "").replace(/\D/g, "");

  if (number) {
    const message = encodeURIComponent(
      data.whatsappMessage || "আসসালামু আলাইকুম। আমি অর্ডার করতে চাই।"
    );
    whatsapp.href = "https://wa.me/" + number + "?text=" + message;
    whatsapp.style.display = "flex";
  } else {
    whatsapp.style.display = "none";
  }
}

async function buyProduct(packageId, button) {
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "অপেক্ষা করুন...";

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ packageId })
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.paymentUrl) {
      throw new Error(result.message || "পেমেন্ট শুরু করা যায়নি");
    }

    location.href = result.paymentUrl;
  } catch (error) {
    alert(error.message);
    button.disabled = false;
    button.textContent = originalText;
  }
}

document.addEventListener("DOMContentLoaded", loadWebsite);
