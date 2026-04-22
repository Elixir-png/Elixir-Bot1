import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🩸 *ᴇʟɪxɪʀ ʙᴏᴛ*\n\n💡 _Scrivi:_ ${usedPrefix + command} nome canzone`);

  try {
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('⚠️ *𝗥𝗶𝘀𝘂𝗹𝘁𝗮𝘁𝗼 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼.*');

    const url = vid.url;
    // Estrazione dati aggiuntivi
    const views = vid.views.toLocaleString('it-IT');
    const published = vid.ago || "Data non disponibile";

    if (command === 'play') {
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━━┓\n`;
        infoMsg += `   🎧  *ᴇʟɪxɪʀ ʙᴏᴛ ᴘʟᴀʏᴇʀ* 🎧\n`;
        infoMsg += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        infoMsg += `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n`;
        infoMsg += `◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n`;
        infoMsg += `◈ 👁️ *𝗩𝗶𝘀𝘂𝗮𝗹𝗶𝘇𝘇𝗮𝘇𝗶𝗼𝗻𝗶:* ${views}\n`;
        infoMsg += `◈ 📅 *𝗨𝘀𝗰𝗶𝘁𝗼:* ${published}\n\n`;
        infoMsg += `*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝗳𝗼𝗿𝗺𝗮𝘁𝗼:*`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: 'ᴇʟɪxɪʀ ʙᴏᴛ • 𝟤𝟢𝟤𝟨',
            buttons: [
                { buttonId: `${usedPrefix}playaud ${url}`, buttonText: { displayText: '🎵 𝗔𝗨𝗗𝗜𝗢 (𝗠𝗣𝟯)' }, type: 1 },
                { buttonId: `${usedPrefix}playvid ${url}`, buttonText: { displayText: '🎬 𝗩𝗜𝗗𝗘𝗢 (𝗠𝗣𝟰)' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "🩸", key: m.key } });

    let downloadUrl = null;
    const isAudio = command === 'playaud';

    // Sistema di Fallback API migliorato
    try {
        let res = isAudio ? await fg.yta(url) : await fg.ytv(url);
        if (res && res.dl_url) downloadUrl = res.dl_url;
    } catch {
        try {
            let api = isAudio ? 'ytmp3' : 'ytmp4';
            let res = await fetch(`https://vreden.my.id{api}?url=${url}`);
            let json = await res.json();
            downloadUrl = json.result?.download?.url || json.result?.url;
        } catch {
            let res = await fetch(`https://skizo.tech{url}&apikey=bocchi`);
            let json = await res.json();
            downloadUrl = isAudio ? json.audio : json.video;
        }
    }

    if (!downloadUrl) throw new Error("Link non trovato");

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input_${Date.now()}`);
    const outputPath = path.join(tmpDir, `output_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

    const resDownload = await fetch(downloadUrl);
    const buffer = await resDownload.buffer();
    fs.writeFileSync(inputPath, buffer);

    if (isAudio) {
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${inputPath}" -vn -ar 44100 -ac 2 -b:a 128k "${outputPath}"`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`,
            ptt: false
        }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(inputPath),
            mimetype: 'video/mp4',
            caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐝𝐚 ᴇʟɪxɪʀ ʙᴏᴛ*`,
        }, { quoted: m });
    }

    // Pulizia file
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error(e);
    m.reply('🚀 *ᴇʟɪxɪʀ ʙᴏᴛ 𝐄𝐑𝐑𝐎𝐑:* Impossibile scaricare il file. Prova con un altro titolo.');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
