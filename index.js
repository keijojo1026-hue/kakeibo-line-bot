const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios'); // ← 追加

const sheetsWebhookUrl = 'https://script.google.com/macros/s/AKfycbyn4p-C_YlRJpN2WwtYWgABkSiBYn1d4bBU45KiYV5cn1qexWLqalrROblo-Lq81O1DuA/exec';

const app = express();

const config = {
  channelAccessToken: process.env.ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end());
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;

  // Google Sheetsに送信
  try {
    await axios.post(sheetsWebhookUrl, {
      events: [{ message: { text: userMessage } }]
    });
  } catch (error) {
    console.error('Google Sheets送信エラー:', error);
  }

  const message = {
    type: 'text',
    text: `受け取ったよ：「${userMessage}」`
  };

  return client.replyMessage(event.replyToken, message);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
