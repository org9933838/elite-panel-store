
const { isAdmin, json } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { success: false });
  }

  return json(res, 200, {
    success: isAdmin(req)
  });
};
