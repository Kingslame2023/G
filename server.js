const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// CORS erlaubt es deiner Netlify-Webseite, Daten an diesen Server zu senden
app.use(cors());
app.use(express.json());

// --- HIER DEINE TELEGRAM DATEN EINTRAGEN ---
const TELEGRAM_TOKEN = '8994875536:AAFCIMWobz-Osnh0CgutHfxIwALZHCs7DkM';
const MY_CHAT_ID = '8613621189'; 
// -------------------------------------------

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Die Liste, in der alle Namen während der Laufzeit gespeichert werden
let participants = [];

// Route 1: Empfängt die Namen von der HTML-Webseite
app.post('/register', (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Name darf nicht leer sein." });
    }

    const cleanedName = name.trim();
    participants.push(cleanedName);

    // Benachrichtigung direkt an dich auf Telegram senden
    bot.sendMessage(MY_CHAT_ID, `📥 *Neue Anmeldung!*\n👤 Name: ${cleanedName}\n\nInsgesamt im Lostopf: ${participants.length}`, { parse_mode: 'Markdown' });

    res.status(200).json({ message: "Erfolgreich eingetragen." });
});

// Route 2: Telegram-Befehl /random zum Auslosen
bot.onText(/\/random/, (msg) => {
    const chatId = msg.chat.id;

    // Sicherheitsprüfung: Nur du darfst auslosen!
    if (chatId.toString() !== MY_CHAT_ID.toString()) {
        return bot.sendMessage(chatId, "❌ Du bist nicht berechtigt, die Auslosung zu starten.");
    }

    if (participants.length === 0) {
        return bot.sendMessage(chatId, "🤷‍♂️ Die Liste ist aktuell leer. Es gibt keine Teilnehmer zum Auslosen.");
    }

    // Zufälligen Gewinner ziehen
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];

    // Gewinner-Nachricht senden
    bot.sendMessage(chatId, `🎉 *DIE AUSLOSUNG IST BEENDET!* 🎉\n\nTeilnehmer insgesamt: ${participants.length}\n\nDer glückliche Gewinner ist:\n🏆 **${winner}** 🏆`, { parse_mode: 'Markdown' });
});

// Route 3: Hilfsbefehl /liste um die aktuelle Liste zu prüfen
bot.onText(/\/liste/, (msg) => {
    if (msg.chat.id.toString() !== MY_CHAT_ID.toString()) return;
    
    if (participants.length === 0) {
        return bot.sendMessage(msg.chat.id, "Die Teilnehmerliste ist aktuell leer.");
    }
    
    const listText = participants.map((p, index) => `${index + 1}. ${p}`).join('\n');
    bot.sendMessage(msg.chat.id, `📋 *Aktuelle Teilnehmerliste:*\n\n${listText}`, { parse_mode: 'Markdown' });
});

// Port-Zuweisung für Render (Render nutzt den Umgebungshintergrund PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft stabil auf Port ${PORT}`);
});
