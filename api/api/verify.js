
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "শুধু POST Request গ্রহণ করা যাবে।"
    });
  }

  return res.status(501).json({
    success: false,
    verified: false,
    message: "সার্ভার পেমেন্ট যাচাই ব্যবস্থা এখনো সেটআপ করা হয়নি।"
  });
};
