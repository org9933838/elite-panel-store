
const { setupDB, json } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "POST প্রয়োজন" });
  }

  if (!process.env.SETUP_SECRET ||
      req.headers["x-setup-secret"] !== process.env.SETUP_SECRET) {
    return json(res, 403, { success: false, message: "অনুমতি নেই" });
  }

  try {
    await setupDB();
    return json(res, 200, {
      success: true,
      message: "Database তৈরি হয়েছে"
    });
  } catch (error) {
    console.error("Setup error:", error.message);
    return json(res, 500, {
      success: false,
      message: "Database setup ব্যর্থ হয়েছে"
    });
  }
};
