
const { getDB, setupDB, isAdmin, json } = require("./_lib");

module.exports = async function handler(req, res) {
  try {
    await setupDB();
    const sql = getDB();

    if (req.method === "GET") {
      const rows = await sql`
        SELECT data FROM store_data WHERE id = 1
      `;

      return json(res, 200, {
        success: true,
        data: rows[0].data
      });
    }

    if (req.method === "PUT") {
      if (!isAdmin(req)) {
        return json(res, 401, {
          success: false,
          message: "Admin Login প্রয়োজন"
        });
      }

      const data = req.body;

      if (!data || !Array.isArray(data.packages) ||
          data.packages.length !== 3) {
        return json(res, 400, {
          success: false,
          message: "ঠিক ৩টি প্যাকেজ দিতে হবে"
        });
      }

      for (const p of data.packages) {
        const price = Number(p.price);

        if (!p.id || !p.name || !Number.isFinite(price) ||
            price <= 0 || price > 10000000) {
          return json(res, 400, {
            success: false,
            message: "পণ্যের নাম ও সঠিক দাম দিন"
          });
        }
      }

      await sql`
        UPDATE store_data
        SET data = ${JSON.stringify(data)}::jsonb
        WHERE id = 1
      `;

      return json(res, 200, {
        success: true,
        message: "পরিবর্তন সংরক্ষণ হয়েছে"
      });
    }

    return json(res, 405, {
      success: false,
      message: "Method গ্রহণযোগ্য নয়"
    });
  } catch (error) {
    console.error("Store data error:", error.message);
    return json(res, 500, {
      success: false,
      message: "সার্ভারে সমস্যা হয়েছে"
    });
  }
};
