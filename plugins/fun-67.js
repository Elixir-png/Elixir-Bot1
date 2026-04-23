// Plug-in creato da elixir
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler = async (m, { conn }) => {
  // Sceglie a caso una delle 6 gif che hai caricato
  const num = Math.floor(Math.random() * 6) + 1;
  
  // Percorso: media/SixSeven/sixsevenX.gif
  const url = `https://githubusercontent.com{num}.gif`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`File non trovato: ${url}`);
    
    const buffer = await response.buffer();
    const tempGif = `./temp67_${num}.gif`;
    const tempMp4 = `./temp67_${num}.mp4`;

    fs.writeFileSync(tempGif, buffer);

    // Converte in MP4 per WhatsApp (effetto GIF animata)
    await execAsync(`ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`);

    await conn.sendMessage(m.chat, {
      video: { url: tempMp4 },
      caption: "🕺 *67! 67! 67!* 🕺",
      gifPlayback: true 
    }, { quoted: m });

    // Pulizia file temporanei
    if (fs.existsSync(tempGif)) fs.unlinkSync(tempGif);
    if (fs.existsSync(tempMp4)) fs.unlinkSync(tempMp4);

  } catch (error) {
    console.error(error);
    m.reply(`⚠️ Errore nel caricamento della gif numero ${num}. Assicurati che i file si chiamino esattamente sixseven1.gif, sixseven2.gif ecc. nella cartella SixSeven.`);
  }
};

handler.help = ['sixseven', '67'];
handler.tags = ['fun'];
handler.command = ['sixseven', '67']; 

export default handler;
