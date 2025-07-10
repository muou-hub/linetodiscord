export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST allowed');
  }

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/你的ID/你的TOKEN"; // ← 請改成你自己的

  try {
    console.log("📩 收到 LINE Webhook：", JSON.stringify(req.body, null, 2));

    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const content = `[LINE OA] ${event.message.text}`;
        console.log("📤 發送到 Discord：", content);

        const response = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        const result = await response.text();
        console.log("✅ Discord 回應：", result);
      } else {
        console.log("⛔ 非文字訊息，已略過");
      }
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error("❌ 發送失敗：", err);
    return res.status(500).send('Internal Server Error');
  }
}
