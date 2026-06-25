const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

// --- HIER DEINE DATEN EINTRAGEN ---
const TELEGRAM_TOKEN = '8994875536:AAFCIMWobz-Osnh0CgutHfxIwALZHCs7DkM';
const MY_CHAT_ID = '8613621189'; 
// ----------------------------------

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Hier werden die Teilnehmer gespeichert
let participants = [];

// 1. Endpunkt für die HTML-Webseite (Namen eintragen)
app.post('/register', (expressReq, res) => {
    const { name } = expressReq.body;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Name darf nicht leer sein." });
    }

    // Namen zur Liste hinzufügen
    participants.push(name.trim());

    // Nachricht an DICH über Telegram senden
    bot.sendMessage(MY_CHAT_ID, `Anmeldung: 👤 ${name} hat sich für das Giveaway angemeldet!\nAktuelle Teilnehmerzahl: ${participants.length}`);

    res.status(200).json({ message: "Erfolgreich eingetragen." });
});

// 2. Telegram Bot Befehle verarbeiten
bot.onText(/\/random/, (msg) => {
    const chatId = msg.chat.id;

    // Sicherheitscheck: Nur DU darfst auslosen
    if (chatId.toString() !== MY_CHAT_ID.toString()) {
        return bot.sendMessage(chatId, "Du bist nicht berechtigt, die Auslosung zu starten.");
    }

    if (participants.length === 0) {
        return bot.sendMessage(chatId, "Die Liste ist noch leer. Es gibt keine Teilnehmer.");
    }

    // Zufälligen Namen auswählen
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];

    bot.sendMessage(chatId, `🎉 *DIE AUSLOSUNG IS GESTARTET!* 🎉\n\nAus insgesamt ${participants.length} Teilnehmern ist der Gewinner:\n\n🏆 **${winner}** 🏆`, { parse_mode: 'Markdown' });
});

// Hilfsbefehl um die Liste anzuzeigen
bot.onText(/\/liste/, (msg) => {
    if (msg.chat.id.toString() !== MY_CHAT_ID.toString()) return;
    
    if (participants.length === 0) return bot.sendMessage(msg.chat.id, "Liste ist leer.");
    
    const listeText = participants.map((p, i) => `${i + 1}. ${p}`).join('\n');
    bot.sendMessage(msg.chat.id, `Teilnehmer:\n${listeText}`);
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
    console.log(`Telegram Bot ist aktiv und wartet auf Befehle...`);
});
