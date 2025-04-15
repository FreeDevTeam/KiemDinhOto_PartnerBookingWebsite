import axios from 'axios'

const TELEGRAM_BOT_TOKEN = '8010877742:AAFzqtxL8Hvl1J5MrwWmi57xIrt2aYzJy_Q'
// const TELEGRAM_CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID; // groud TTDk
const TELEGRAM_CHAT_ID = '-4651954831'; // groud bot TTDK

// Function to send Telegram message
export async function sendTelegramNotification(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  const params = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  }

  try {
    await axios.post(url, params)
    console.log('Notification sent to Telegram.')
  } catch (error) {
    console.error('Failed to send notification to Telegram:', error)
  }
}
