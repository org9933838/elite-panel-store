
const {
  makeToken,
  setCookie,
  json
} = require("./_lib");

const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "POST প্রয়োজন" });
  }

  const { username, password } = req.body || {};

  const savedUser = process.env.ADMIN_USERNAME || "";
  const savedPass = process.env.ADMIN_PASSWORD || "";

  if (!savedUser || !savedPass || !process.env.SESSION_SECRET) {
    return json(res, 500, {
      success: false,
      message: "Admin Environment Variables সেট করা হয়নি"
    });
  }

  const safeEqual = (a, b) => {
    const x = Buffer.from(String(a));
    const y = Buffer.from(String(b));
    return x.length === y.length &&
      crypto.timingSafeEqual(x, y);
  };

  if (!safeEqual(username || "", savedUser) ||
      !safeEqual(password || "", savedPass)) {
    return json(res, 401, {
      success: false,
      message: "Username অথবা Password ভুল"
    });
  }

  setCookie(res, makeToken(savedUser));

  return json(res, 200, {
    success: true,
    message: "Login সফল"
  });
};
