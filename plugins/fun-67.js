// Plug-in creato da elixir
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler = async (m, { conn }) => {
  // Se vuoi che funzioni solo nei gruppi, lascia la riga sotto, altrimenti commentala
  // if (!m.isGroup) return;

  const gifUrl = "https://tenor.com"; // Link diretto alla GIF del meme
  const caption = "🕺 *SixSeven mood!* 🕺";

  try {
    const response = await fetch(gifUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync('sixseven.gif', buffer);

    // Converte la GIF in un formato video MP4 compatibile con WhatsApp per l'effetto GIF fluida
    await execAsync('ffmpeg -i sixseven.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" sixseven.mp4');

    await conn.sendMessage(m.chat, {
      video: { url: 'sixseven.mp4' },
      caption: caption,
      gifPlayback: true // Questo lo rende una GIF che si riproduce in loop
    }, { quoted: m });

    // Pulizia file temporanei
    fs.unlinkSync('sixseven.gif');
    fs.unlinkSync('sixseven.mp4');
  } catch (error) {
    console.error("Errore:", error);
    m.reply("⚠️ Errore nel caricamento della GIF di SixSeven.");
  }
};

handler.help = ['sixseven', '67'];
handler.tags = ['fun'];
handler.command = ['sixseven', '67']; // Risponde a entrambi i comandi

export default handler;
