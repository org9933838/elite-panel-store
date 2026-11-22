
const { clearCookie, json } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false });
  }

  clearCookie(res);

  return json(res, 200, {
    success: true,
    message: "Logout সফল"
  });
};
