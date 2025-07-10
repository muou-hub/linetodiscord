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

async function sendDiscordMessage(payload, isForm = false) {
  try {
    const options = {
      method: "POST",
      body: payload,
      headers: {},
    };
    if (!isForm) {
      options.headers["Content-Type"] = "application/json";
    } else {
      options.headers = payload.getHeaders();
    }
    const res = await fetch(discordWebhookURL, options);
    if (!res.ok) {
      const text = await res.text();
      console.error(`Discord 發送失敗: ${res.status} - ${text}`);
    } else {
      console.log("✅ Discord 發送成功");
    }
  } catch (e) {
    console.error("❌ Discord 發送錯誤:", e);
  }
}

app.post("/api/webhook", async (req, res) => {
  try {
    const events = req.body.events;
    if (!events) {
      console.warn("收到空 events");
      return res.status(400).send("No events");
    }
    for (const event of events) {
      if (event.type === "message") {
        if (event.message.type === "text") {
          await sendDiscordMessage(
            JSON.stringify({ content: `🔔[轉發] ${event.message.text}` })
          );
        } else if (event.message.type === "image") {
          const messageId = event.message.id;
          const stream = await client.getMessageContent(messageId);
          const chunks = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          const form = new FormData();
          form.append("file", buffer, { filename: "image.jpg" });
          form.append(
            "content",
            `🔔[轉發] 收到一張圖片，來自 userId: ${event.source.userId}`
          );

          await sendDiscordMessage(form, true);
        }
      }
    }
    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook 處理錯誤:", err);
    res.status(500).send("Error");
  }
});

// 匯出給 Vercel 運行
export default app;
