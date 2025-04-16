const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Ключи (замените на свои!)
const DEEPL_API_KEY = process.env.DEEPL_API_KEY; 
const LIVECHAT_TOKEN = process.env.LIVECHAT_TOKEN;

// Обработчик для LiveChat Webhook
app.post('/webhook', async (req, res) => {
  try {
    const { chat_id, event } = req.body;
    const message = event.text;
    const userLang = event.visitor.language || 'EN';

    // Переводим сообщение пользователя → русский
    const translatedToRU = await translateText(message, 'RU');
    await sendToLiveChat(chat_id, `[Перевод] ${translatedToRU}`);

    res.sendStatus(200);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error');
  }
});

// Функция перевода через DeepL
async function translateText(text, targetLang) {
  const response = await axios.post('https://api-free.deepl.com/v2/translate', {
    text: [text],
    target_lang: targetLang
  }, {
    headers: { 'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}` }
  });
  return response.data.translations[0].text;
}

// Отправка ответа в LiveChat
async function sendToLiveChat(chatId, text) {
  await axios.post('https://api.livechatinc.com/v3.5/agent/action/send_event', {
    chat_id: chatId,
    event: { type: 'message', text: text }
  }, {
    headers: { 'Authorization': `Bearer ${LIVECHAT_TOKEN}` }
  });
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
