// Plug-in creato da elixir
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler = async (m, { conn }) => {
  // Sceglie un numero casuale tra 1 e 6
  const num = Math.floor(Math.random() * 6) + 1;
  
  // URL creato pezzo per pezzo per essere sicuri al 100%
  const repo = "https://githubusercontent.com";
  const folder = "/media/SixSeven/";
  const file = `sixseven${num}.gif`;
  
  const finalUrl = repo + folder + file;
  
  const caption = "🕺 *67! 67! 67!* 🕺";

  try {
    console.log(`Tentativo di scaricamento: ${finalUrl}`); // Questo apparirà nel tuo terminale per controllo
    
    const response = await fetch(finalUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const buffer = await response.buffer();
    const tempGif = `./sixseven_${num}.gif`;
    const tempMp4 = `./sixseven_${num}.mp4`;

    fs.writeFileSync(tempGif, buffer);

    // Conversione FFMPEG
    await execAsync(`ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`);

    await conn.sendMessage(m.chat, {
      video: { url: tempMp4 },
      caption: caption,
      gifPlayback: true 
    }, { quoted: m });

    // Pulizia
    if (fs.existsSync(tempGif)) fs.unlinkSync(tempGif);
    if (fs.existsSync(tempMp4)) fs.unlinkSync(tempMp4);

  } catch (error) {
    console.error("Errore SixSeven:", error);
    m.reply("⚠️ Il bot non riesce a raggiungere GitHub o il file non esiste. Verifica che i nomi nella cartella siano sixseven1.gif, sixseven2.gif, ecc.");
  }
};

handler.help = ['sixseven', '67'];
handler.tags = ['fun'];
handler.command = ['sixseven', '67']; 

export default handler;
