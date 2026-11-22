
const { neon } = require("@neondatabase/serverless");
const crypto = require("crypto");

function getDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL সেট করা হয়নি");
  }
  return neon(process.env.DATABASE_URL);
}

async function setupDB() {
  const sql = getDB();

  await sql`
    CREATE TABLE IF NOT EXISTS store_data (
      id INTEGER PRIMARY KEY,
      data JSONB NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      package_id TEXT NOT NULL,
      package_name TEXT NOT NULL,
      amount NUMERIC(12,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      transaction_id TEXT UNIQUE,
      payment_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      paid_at TIMESTAMPTZ
    )
  `;

  const rows = await sql`
    SELECT id FROM store_data WHERE id = 1
  `;

  if (!rows.length) {
    const defaults = {
      siteName: "Saikat Store",
      logo: "",
      heroTitle: "আপনার পছন্দের টি-শার্ট",
      heroDescription: "সহজে পছন্দ করুন এবং নিরাপদে অর্ডার করুন।",
      footerText: "সর্বস্বত্ব সংরক্ষিত।",
      whatsapp: "",
      whatsappMessage: "আসসালামু আলাইকুম। আমি অর্ডার করতে চাই।",
      moreDetails: "আমাদের টি-শার্ট সম্পর্কে বিস্তারিত জানতে WhatsApp করুন।",
      packages: [
        { id: "shirt-1", name: "টি-শার্ট ১", price: "500", date: "স্টক আছে", image: "" },
        { id: "shirt-2", name: "টি-শার্ট ২", price: "600", date: "স্টক আছে", image: "" },
        { id: "shirt-3", name: "টি-শার্ট ৩", price: "700", date: "স্টক আছে", image: "" }
      ],
      features: [
        "ভালো মানের কাপড়",
        "আকর্ষণীয় ডিজাইন",
        "সারা বাংলাদেশে ডেলিভারি",
        "নিরাপদ পেমেন্ট",
        "WhatsApp সাপোর্ট"
      ],
      instructions: [
        "পছন্দের টি-শার্ট নির্বাচন করুন",
        "কিনুন বাটনে ক্লিক করুন",
        "পেমেন্ট সম্পন্ন করুন",
        "WhatsApp-এ সাইজ ও ঠিকানা জানান"
      ]
    };

    await sql`
      INSERT INTO store_data (id, data)
      VALUES (1, ${JSON.stringify(defaults)}::jsonb)
    `;
  }
}

function makeToken(username) {
  const time = Date.now().toString();
  const payload = `${username}:${time}`;
  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(payload)
    .digest("hex");

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

function verifyToken(token) {
  try {
    if (!token || !process.env.SESSION_SECRET) return false;

    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");

    if (parts.length !== 3) return false;

    const [username, time, signature] = parts;
    const age = Date.now() - Number(time);

    if (
      username !== process.env.ADMIN_USERNAME ||
      !Number.isFinite(age) ||
      age < 0 ||
      age > 12 * 60 * 60 * 1000
    ) return false;

    const expected = crypto
      .createHmac("sha256", process.env.SESSION_SECRET)
      .update(`${username}:${time}`)
      .digest("hex");

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    return a.length === b.length &&
      crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function getCookie(req, name) {
  const cookie = req.headers.cookie || "";
  const item = cookie.split(";").map(x => x.trim())
    .find(x => x.startsWith(name + "="));

  return item ? decodeURIComponent(item.substring(name.length + 1)) : "";
}

function isAdmin(req) {
  return verifyToken(getCookie(req, "admin_session"));
}

function setCookie(res, value) {
  res.setHeader(
    "Set-Cookie",
    `admin_session=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`
  );
}

function clearCookie(res) {
  res.setHeader(
    "Set-Cookie",
    "admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
  );
}

function json(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(data);
}

module.exports = {
  getDB,
  setupDB,
  makeToken,
  isAdmin,
  setCookie,
  clearCookie,
  json
};
