
const crypto = require("crypto");
const { getDB, setupDB, json } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false });
  }

  try {
    await setupDB();

    const {
      RUPANTORPAY_API_KEY,
      SITE_URL,
      STORE_CUSTOMER_NAME,
      STORE_CUSTOMER_EMAIL
    } = process.env;

    if (!RUPANTORPAY_API_KEY || !SITE_URL ||
        !STORE_CUSTOMER_NAME || !STORE_CUSTOMER_EMAIL) {
      return json(res, 500, {
        success: false,
        message: "Payment Environment Variables অসম্পূর্ণ"
      });
    }

    const packageId = String(req.body?.packageId || "");
    const sql = getDB();

    const rows = await sql`
      SELECT data FROM store_data WHERE id = 1
    `;

    const packages = rows[0]?.data?.packages || [];
    const product = packages.find(p => p.id === packageId);

    if (!product) {
      return json(res, 404, {
        success: false,
        message: "পণ্য পাওয়া যায়নি"
      });
    }

    const amount = Number(product.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      return json(res, 400, {
        success: false,
        message: "পণ্যের দাম সঠিক নয়"
      });
    }

    const orderId = crypto.randomUUID();

    await sql`
      INSERT INTO orders
      (id, package_id, package_name, amount, status)
      VALUES (
        ${orderId},
        ${product.id},
        ${product.name},
        ${amount},
        'PENDING'
      )
    `;

    const base = SITE_URL.replace(/\/+$/, "");

    const payload = {
      fullname: STORE_CUSTOMER_NAME,
      email: STORE_CUSTOMER_EMAIL,
      amount: amount.toFixed(2),
      success_url: `${base}/payment-success.html?orderId=${encodeURIComponent(orderId)}`,
      cancel_url: `${base}/payment-cancel.html?orderId=${encodeURIComponent(orderId)}`,
      meta_data: {
        order_id: orderId,
        product_id: product.id
      }
    };

    const response = await fetch(
      "https://payment.rupantorpay.com/api/payment/checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": RUPANTORPAY_API_KEY,
          "X-CLIENT": new URL(base).host
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok || Number(result.status) !== 1 ||
        !result.payment_url ||
        !result.payment_url.startsWith("https://")) {
      console.error("RupantorPay checkout failed:", result);

      return json(res, 502, {
        success: false,
        message: "পেমেন্ট লিংক তৈরি হয়নি। আবার চেষ্টা করুন।"
      });
    }

    await sql`
      UPDATE orders
      SET payment_url = ${result.payment_url}
      WHERE id = ${orderId}
    `;

    return json(res, 200, {
      success: true,
      paymentUrl: result.payment_url,
      orderId
    });
  } catch (error) {
    console.error("Checkout error:", error.message);

    return json(res, 500, {
      success: false,
      message: "Checkout তৈরি করা যায়নি"
    });
  }
};
