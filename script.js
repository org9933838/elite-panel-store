
const products = [
  {
    id: "basic",
    name: "বেসিক ডিজিটাল প্যাকেজ",
    price: 199,
    description: "প্রাথমিক ডিজিটাল সেবা ও প্রয়োজনীয় সুবিধা।"
  },
  {
    id: "standard",
    name: "স্ট্যান্ডার্ড ডিজিটাল প্যাকেজ",
    price: 299,
    description: "আরও বেশি সুবিধাসহ ডিজিটাল সেবা।"
  },
  {
    id: "premium",
    name: "প্রিমিয়াম ডিজিটাল প্যাকেজ",
    price: 499,
    description: "প্রিমিয়াম সেবা ও গ্রাহক সহায়তা।"
  }
];

let selectedProduct = null;

const productList = document.getElementById("product-list");
const checkout = document.getElementById("checkout");
const selectedProductBox = document.getElementById("selected-product");
const message = document.getElementById("message");

products.forEach(product => {
  const card = document.createElement("article");
  card.className = "product";

  const title = document.createElement("h3");
  title.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const price = document.createElement("div");
  price.className = "price";
  price.textContent = `৳${product.price}`;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "এই প্যাকেজটি নিন";

  button.addEventListener("click", () => {
    selectedProduct = product;

    selectedProductBox.textContent =
      `${product.name} — ৳${product.price}`;

    checkout.classList.remove("hidden");
    message.textContent = "";

    checkout.scrollIntoView({ behavior: "smooth" });
  });

  card.append(title, description, price, button);
  productList.appendChild(card);
});

document.getElementById("order-form")
  .addEventListener("submit", async event => {
    event.preventDefault();

    if (!selectedProduct) {
      message.textContent = "প্রথমে একটি প্যাকেজ নির্বাচন করুন।";
      return;
    }

    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const method = document.getElementById("payment-method").value;

    if (name.length < 2) {
      message.textContent = "আপনার সঠিক নাম লিখুন।";
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(phone)) {
      message.textContent = "সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন।";
      return;
    }

    if (!method) {
      message.textContent = "একটি পেমেন্ট পদ্ধতি নির্বাচন করুন।";
      return;
    }

    message.textContent =
      "অনলাইন পেমেন্ট সংযোগ এখনো চালু করা হয়নি।";

    // এখানে RupantorPay-এর সার্ভার-সাইড Checkout API
    // যুক্ত করতে হবে। API Secret কখনো এই ফাইলে রাখবেন না।
  });
