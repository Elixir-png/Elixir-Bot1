// Plug-in creato da elixir
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Lista dei link originali convertiti in formati diretti per il bot
const sixSevenMoves = {
  "SixSeven Classico": "https://giphy.com",
  "SixSeven Windpress": "https://giphy.com",
  "SixSeven Tenor": "https://tenor.com"
};

const handler = async (m, { conn }) => {
  const moves = Object.keys(sixSevenMoves);
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  const gifUrl = sixSevenMoves[randomMove];
  
  const caption = "🕺 *67! 67! 67!* 🕺";

  try {
    const response = await fetch(gifUrl);
    if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const tempGif = `temp_67_${Date.now()}.gif`;
    const tempMp4 = `temp_67_${Date.now()}.mp4`;

    fs.writeFileSync(tempGif, buffer);

    // Converte la GIF in MP4 (necessario per Baileys/WhatsApp per l'effetto loop)
    await execAsync(`ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`);

    await conn.sendMessage(m.chat, {
      video: { url: tempMp4 },
      caption: caption,
      gifPlayback: true // Questo abilita l'invio come GIF animata su WhatsApp
    }, { quoted: m });

    // Pulizia file temporanei
    if (fs.existsSync(tempGif)) fs.unlinkSync(tempGif);
    if (fs.existsSync(tempMp4)) fs.unlinkSync(tempMp4);

  } catch (error) {
    console.error("Errore:", error);
    m.reply("⚠️ Errore nel caricamento del meme.");
  }
};

handler.help = ['sixseven', '67'];
handler.tags = ['fun'];
handler.command = ['sixseven', '67']; 

export default handler;
