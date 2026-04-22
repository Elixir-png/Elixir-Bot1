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

    // Se l'utente scrive solo .play, mostriamo le info e istruzioni (i bottoni spesso non vanno)
    if (command === 'play') {
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
        infoMsg += `🎧  *ᴇʟɪxɪʀ ʙᴏᴛ ᴘʟᴀʏᴇʀ* 🎧\n`;
        infoMsg += `┗━━━━━━━━━━━━━━━━━━━┛\n\n`;
        infoMsg += `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n`;
        infoMsg += `◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n\n`;
        infoMsg += `*Digita:* \n- _${usedPrefix}playaud ${url}_ (Audio)\n- _${usedPrefix}playvid ${url}_ (Video)`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: 'ᴇʟɪxɪʀ ʙᴏᴛ • 𝟤𝟢𝟤𝟨'
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "🩸", key: m.key } });

    let downloadUrl = null;
    const isAudio = command === 'playaud';

    // Prova API 1: Dylux
    try {
        let res = isAudio ? await fg.yta(url) : await fg.ytv(url);
        if (res && res.dl_url) downloadUrl = res.dl_url;
    } catch (e) {
        // Prova API 2: Vreden
        try {
            let api = isAudio ? 'ytmp3' : 'ytmp4';
            let res = await fetch(`https://api.vreden.my.id/api/${api}?url=${url}`);
            let json = await res.json();
            downloadUrl = json.result?.download?.url || json.result?.url;
        } catch (e2) {
            // Prova API 3: Iniman (Fallback finale)
            let res = await fetch(`https://skizo.tech{url}&apikey=bocchi`);
            let json = await res.json();
            downloadUrl = isAudio ? json.audio : json.video;
        }
    }

    if (!downloadUrl) throw new Error("Link di download non generato");

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input_${Date.now()}`);
    const outputPath = path.join(tmpDir, `output_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

    const response = await fetch(downloadUrl);
    const buffer = await response.buffer();
    fs.writeFileSync(inputPath, buffer);

    if (isAudio) {
        // Conversione FFmpeg per garantire compatibilità MP3
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
            fileName: `${vid.title}.mp4`
        }, { quoted: m });
    }

    // Pulizia file temporanei
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error(e);
    m.reply('🚀 *ᴇʟɪxɪʀ ʙᴏᴛ 𝐄𝐑𝐑𝐎𝐑:* Il server YouTube o le API sono sovraccarichi. Riprova tra poco.');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
