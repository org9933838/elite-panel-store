
const products = [
  {
    id: "digital-basic",
    name: "ডিজিটাল প্যাকেজ – বেসিক",
    price: 199,
    description: "বৈধ ডিজিটাল সেবা ও প্রয়োজনীয় সুবিধা।"
  },
  {
    id: "digital-standard",
    name: "ডিজিটাল প্যাকেজ – স্ট্যান্ডার্ড",
    price: 299,
    description: "আরও বেশি সুবিধাসহ ডিজিটাল প্যাকেজ।"
  },
  {
    id: "digital-premium",
    name: "ডিজিটাল প্যাকেজ – প্রিমিয়াম",
    price: 499,
    description: "প্রিমিয়াম ডিজিটাল সেবা ও সহায়তা।"
  }
];

let selectedProduct = null;

const list = document.getElementById("product-list");

products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product";

  const heading = document.createElement("h3");
  heading.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const price = document.createElement("div");
  price.className = "price";
  price.textContent = `৳${product.price}`;

  const button = document.createElement("button");
  button.textContent = "প্যাকেজ নির্বাচন করুন";
  button.addEventListener("click", () => selectProduct(product));

  card.append(heading, description, price, button);
  list.appendChild(card);
});

function selectProduct(product) {
  selectedProduct = product;

  document.getElementById("checkout").classList.remove("hidden");
  document.getElementById("selected-product").textContent =
    `${product.name} — ৳${product.price}`;

  document.getElementById("checkout").scrollIntoView({
    behavior: "smooth"
  });
}

document.getElementById("pay-button").addEventListener("click", async () => {
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const message = document.getElementById("message");

  if (!selectedProduct) {
    message.textContent = "আগে একটি প্যাকেজ নির্বাচন করুন।";
    return;
  }

  if (name.length < 2 || !/^01[3-9]\d{8}$/.test(phone)) {
    message.textContent = "সঠিক নাম ও মোবাইল নম্বর লিখুন।";
    return;
  }

  message.textContent = "পেমেন্ট ব্যবস্থা প্রস্তুত হলে এখানে চালু হবে।";
});
