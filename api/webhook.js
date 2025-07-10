import express from "express";
import { middleware, Client, MessageAPIResponseBase } from "@line/bot-sdk";
import fetch from "node-fetch";
import FormData from "form-data";

const config = {
  channelAccessToken: "F1xs4queDPDV2gxRyWSs0HjqQaMmZRJTklFBt/TnmMPIdNAUJ6E3Tkxi5xsuUgq3rJ27VjYhje56zaGqHEheB5LEXTjgSbSCAvsIBslEmTtspuJ59HUk+pdZF5RZqG9j5JaqF/lfJyLDd72Bkku0iAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "e399030b9cfa05d2571a220f4cfac375",
};

const discordWebhookURL = "https://discord.com/api/webhooks/1392570606783959150/PKn8bECItnaFWk3TD_pWtse0Gn3PB17zVp_CzZoNSDaCsbU_2QmMyBeiAuEP1Hj5hJ0C";

const app = express();
app.use(express.json());
app.use(middleware(config));

const client = new Client(config);

app.post("/webhook", async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      if (event.type === "message") {
        if (event.message.type === "text") {
          // 文字訊息直接發Discord
          await fetch(discordWebhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `[LINE OA] ${event.message.text}`,
            }),
          });
        } else if (event.message.type === "image") {
          // 圖片訊息先下載，再發給Discord
          const messageId = event.message.id;
          const stream = await client.getMessageContent(messageId);
          // 用 buffer 存取圖片
          const chunks = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          // 準備 FormData 上傳圖片到 Discord Webhook
          const form = new FormData();
          form.append("file", buffer, { filename: "image.jpg" });
          form.append("content", `[LINE OA] 收到一張圖片，來自 userId: ${event.source.userId}`);

          await fetch(discordWebhookURL, {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
          });
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
