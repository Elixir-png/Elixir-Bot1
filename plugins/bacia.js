const { createCanvas } = require('canvas');

module.exports = {
    name: 'bacia',
    description: 'Manda un bacio a un utente',
    async execute(m, { conn, text }) {
        // 1. Identifica chi riceve il bacio (mention o risposta)
        let who;
        if (m.isGroup) {
            who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
        } else {
            who = m.chat;
        }

        if (!who) return m.reply('Tagga qualcuno o rispondi a un messaggio per baciarlo! 😘');

        // 2. Creazione dell'immagine con Canvas
        const canvas = createCanvas(400, 200);
        const ctx = canvas.getContext('2d');

        // Disegno delle labbra stilizzate
        ctx.fillStyle = '#ff0040'; // Colore rossetto
        // Labbro superiore
        ctx.beginPath();
        ctx.ellipse(200, 100, 80, 40, 0, Math.PI, 0);
        ctx.fill();
        // Labbro inferiore
        ctx.fillStyle = '#cc0033';
        ctx.beginPath();
        ctx.ellipse(200, 110, 80, 40, 0, 0, Math.PI);
        ctx.fill();

        const buffer = canvas.toBuffer();

        // 3. Formattazione nomi
        const baciato = `@${who.split('@')[0]}`;
        const baciatore = `@${m.sender.split('@')[0]}`;
        const testo = `${baciato} è stato baciato da ${baciatore}! 💋`;

        // 4. Invio messaggio con immagine e menzioni
        await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: testo,
            mentions: [who, m.sender]
        }, { quoted: m });
    }
};
