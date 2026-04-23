// Plug-in creato da elixir
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler = async (m, { conn }) => {
  // Sceglie un numero casuale da 1 a 6
  const randomNumber = Math.floor(Math.random() * 6) + 1;
  
  // URL grezzo del tuo repository GitHub
  const baseUrl = "https://githubusercontent.com";
  const gifUrl = `${baseUrl}sixseven${randomNumber}.gif`;
  
  const caption = "🕺 *67! 67! 67!* 🕺";

  try {
    const response = await fetch(gifUrl);
    if (!response.ok) throw new Error(`Errore nel recupero della GIF ${randomNumber}: ${response.statusText}`);
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const tempGif = `temp_67_${Date.now()}.gif`;
    const tempMp4 = `temp_67_${Date.now()}.mp4`;

    fs.writeFileSync(tempGif, buffer);

    // Conversione in MP4 per mantenere l'effetto loop fluido su WhatsApp
    await execAsync(`ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`);

    await conn.sendMessage(m.chat, {
      video: { url: tempMp4 },
      caption: caption,
      gifPlayback: true 
    }, { quoted: m });

    // Pulizia file temporanei
    if (fs.existsSync(tempGif)) fs.unlinkSync(tempGif);
    if (fs.existsSync(tempMp4)) fs.unlinkSync(tempMp4);

  } catch (error) {
    console.error("Errore:", error);
    m.reply(`⚠️ Errore: non sono riuscito a caricare la mossa numero ${randomNumber} dal server.`);
  }
};

handler.help = ['sixseven', '67'];
handler.tags = ['fun'];
handler.command = ['sixseven', '67']; 

export default handler;
