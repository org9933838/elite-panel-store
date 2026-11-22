
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "শুধু POST Request গ্রহণ করা যাবে।"
    });
  }

  return res.status(501).json({
    success: false,
    message: "পেমেন্ট গেটওয়ে এখনো সংযুক্ত করা হয়নি।"
  });
};
