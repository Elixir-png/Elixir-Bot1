// Plug-in creato da elixir
import { performance } from "perf_hooks";

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Chi deve twerkare? Scrivi qualcosa tipo:\n*.twerk @utente*");

    // Estrai l'utente menzionato (se presente)
    let mentionedJid = text.match(/@(\d{5,})/);
    let target = mentionedJid ? [mentionedJid[1] + '@s.whatsapp.net'] : [];

    // Messaggi con animazione del twerk
    const messaggi = [
        `💃 *${text}* inizia a scaldarsi per twerkare...`,
        `🍑 Preparati per lo spettacolo!`,
        `🔥 Sta iniziando a muovere il sedere...`,
        `🎶 Il ritmo si fa più incalzante!`,
        `💫 Shake it, baby!`,
        `✨ Il twerk si fa sempre più intenso!`,
        `🌟 Wow, che movimenti sensuali!`,
        `💥 Sta dando il massimo!`,
        `🚀 Il twerk è al suo apice!`,
        `🎉 Che spettacolo incredibile!`,
        `🏆 Twerk livello professionista!`,
        `✅ Performance completata con successo!`,
    ];

    // Calcolo del tempo prima di iniziare
    let start = performance.now();

    // Invia i messaggi con delay
    for (let i = 0; i < messaggi.length; i++) {
        await conn.sendMessage(m.chat, { 
            text: messaggi[i], 
            mentions: i === 0 ? target : [], // Solo il primo messaggio tagga l'utente
        }, { quoted: m });
        await new Promise(res => setTimeout(res, 600));
    }

    // Calcolo del tempo dopo aver finito
    let end = performance.now();
    let durationMs = end - start;
    let durationSec = (durationMs / 1000).toFixed(2);

    let finale = `💃 *${text}* ha completato una sessione di twerk epica! 🍑\nDurata: *${durationSec} secondi* di pura energia!`;

    // Messaggio finale con tag
    await conn.sendMessage(m.chat, { text: finale, mentions: target }, { quoted: m });
};

handler.help = ['twerk @utente'];
handler.tags = ['fun'];
handler.command = /^(twerk)$/i;

export default handler;
