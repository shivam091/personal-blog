export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let { token } = JSON.parse(event.body || "{}");
  if (!token) return { statusCode: 400, body: "Missing reCAPTCHA token" };

  try {
    const result = await verifyRecaptcha(token);

    if (!result.success || (result.score ?? 0) < 0.5) {
      return { statusCode: 403, body: JSON.stringify({ success: false, reason: "Failed reCAPTCHA" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Verification failed" };
  }
};

async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error("Missing reCAPTCHA secret");

  const params = new URLSearchParams({ secret, response: token });

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  return res.json();
}
