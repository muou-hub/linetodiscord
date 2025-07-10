export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST allowed');
  }

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1392570606783959150/PKn8bECItnaFWk3TD_pWtse0Gn3PB17zVp_CzZoNSDaCsbU_2QmMyBeiAuEP1Hj5hJ0Cy";

  try {
    const events = req.body.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const content = `[LINE OA] ${event.message.text}`;

        await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
      }
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Error forwarding to Discord:', err);
    return res.status(500).send('Internal Server Error');
  }
}
