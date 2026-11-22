
const { getDB, setupDB, json } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false });
  }

  try {
    await setupDB();

    const orderId = String(req.body?.orderId || "");
    const transactionId = String(req.body?.transactionId || "");

    if (!orderId || !transactionId) {
      return json(res, 400, {
        success: false,
        message: "Order ID ও Transaction ID প্রয়োজন"
      });
    }

    const sql = getDB();

    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;

    if (!orders.length) {
      return json(res, 404, {
        success: false,
        message: "অর্ডার পাওয়া যায়নি"
      });
    }

    const order = orders[0];

    if (order.status === "PAID") {
      if (order.transaction_id === transactionId) {
        return json(res, 200, {
          success: true,
          verified: true,
          message: "পেমেন্ট আগে থেকেই যাচাই করা হয়েছে"
        });
      }

      return json(res, 409, {
        success: false,
        verified: false,
        message: "অর্ডার ইতোমধ্যে সম্পন্ন"
      });
    }

    const apiKey = process.env.RUPANTORPAY_API_KEY;

    const response = await fetch(
      "https://payment.rupantorpay.com/api/payment/verify-payment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify({
          transaction_id: transactionId
        })
      }
    );

    const result = await response.json();

    const verifiedAmount = Number(result.amount);
    const orderAmount = Number(order.amount);

    if (
      !response.ok ||
      String(result.status).toUpperCase() !== "COMPLETED" ||
      String(result.transaction_id) !== transactionId ||
      !Number.isFinite(verifiedAmount) ||
      Math.round(verifiedAmount * 100) !==
        Math.round(orderAmount * 100) ||
      String(result.currency || "").toUpperCase() !== "BDT"
    ) {
      return json(res, 400, {
        success: false,
        verified: false,
        message: "পেমেন্ট যাচাই হয়নি"
      });
    }

    const updated = await sql`
      UPDATE orders
      SET status = 'PAID',
          transaction_id = ${transactionId},
          paid_at = NOW()
      WHERE id = ${orderId}
        AND status = 'PENDING'
        AND transaction_id IS NULL
      RETURNING id
    `;

    if (!updated.length) {
      const check = await sql`
        SELECT status, transaction_id
        FROM orders WHERE id = ${orderId}
      `;

      if (
        check[0]?.status !== "PAID" ||
        check[0]?.transaction_id !== transactionId
      ) {
        return json(res, 409, {
          success: false,
          verified: false,
          message: "অর্ডার আপডেট করা যায়নি"
        });
      }
    }

    return json(res, 200, {
      success: true,
      verified: true,
      message: "পেমেন্ট সফলভাবে যাচাই হয়েছে"
    });
  } catch (error) {
    console.error("Verify error:", error.message);

    return json(res, 500, {
      success: false,
      verified: false,
      message: "পেমেন্ট যাচাই করতে সমস্যা হয়েছে"
    });
  }
};
