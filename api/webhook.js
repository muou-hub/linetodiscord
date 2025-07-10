import express from "express";
import { middleware, Client } from "@line/bot-sdk";
import fetch from "node-fetch";
import FormData from "form-data";

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const discordWebhookURL = process.env.DISCORD_WEBHOOK_URL;

const app = express();
app.use(express.json());
app.use(middleware(config));

const client = new Client(config);

async function sendToDiscord(content, fileBuffer = null, filename = null) {
  if (fileBuffer && filename) {
    const form = new FormData();
    form.append("file", fileBuffer, { filename });
    form.append("content", content);

    const res = await fetch(discordWebhookURL, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Discord upload failed:", res.status, text);
    }
  } else {
    const res = await fetch(discordWebhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Discord message failed:", res.status, text);
    }
  }
}

app.post("/webhook", async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      if (event.type === "message") {
        if (event.message.type === "text") {
          await sendToDiscord(`🔔[轉發] ${event.message.text}`);
        } else if (event.message.type === "image") {
          const messageId = event.message.id;
          const stream = await client.getMessageContent(messageId);

          const chunks = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          await sendToDiscord(
            `🔔[轉發] ${event.source.userId}`,
            buffer,
            "image.jpg"
          );
        }
      }
    }
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE webhook server running at port ${port}`);
});
