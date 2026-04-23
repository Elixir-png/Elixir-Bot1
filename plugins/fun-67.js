// Plug-in creato da elixir
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const handler = async (m, { conn }) => {
  // Sceglie un numero casuale tra 1 e 6 basato sui tuoi file
  const randomNumber = Math.floor(Math.random() * 6) + 1;
  
  // URL RAW della tua cartella specifica su GitHub
  const baseUrl = "https://githubusercontent.com";
  const fileName = `sixseven${randomNumber}.gif`;
  const finalUrl = baseUrl + fileName;
  
  const caption = "🕺 *67! 67! 67!* 🕺";

  try {
    const response = await fetch(finalUrl);
    
    if (!response.ok) throw new Error(`Impossibile scaricare ${fileName}`);
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const tempGif = `./temp_67_${Date.now()}.gif`;
    const tempMp4 = `./temp_67_${Date.now()}.mp4`;

    fs.writeFileSync(tempGif, buffer);

    // Conversione in MP4 per garantire che WhatsApp la veda come GIF animata
    await execAsync(`ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`);

    await conn.sendMessage(m.chat, {
      video: { url: tempMp4 },
      caption: caption,
      gifPlayback: true 
    }, { quoted: m });

    // Pulizia immediata dei file temporanei
    if (fs.existsSync(tempGif)) fs.unlinkSync(tempGif);
    if (fs.existsSync(tempMp4)) fs.unlinkSync(tempMp4);

  } catch (error) {
    console.error("Errore SixSeven:", error);
    m.reply(`⚠️ Non sono riuscito a recuperare il file *${fileName}* dal tuo repository. Verifica che il nome sia tutto minuscolo!`);
  }
};

handler.help = ['sixseven', '67'];
handler.tags = ['fun'];
handler.command = ['sixseven', '67']; 

export default handler;
