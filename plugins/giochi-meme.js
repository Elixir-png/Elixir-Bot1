import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    // URL di ricerca per l'hashtag #meme
    let searchUrl = `https://www.tikwm.com/api/feed/search?keywords=meme&count=15&cursor=0`;
    
    // Messaggio di attesa (opzionale, puoi rimuoverlo)
    m.reply('⏳ Sto cercando e scaricando un meme casuale...');

    try {
        let res = await fetch(searchUrl);
        let json = await res.json();

        if (!json.data || !json.data.videos || json.data.videos.length === 0) {
            return m.reply('❌ Non ho trovato alcun video. Riprova tra poco.');
        }

        // Seleziona un video casuale dai risultati
        let videos = json.data.videos;
        let randomVideo = videos[Math.floor(Math.random() * videos.length)];

        // 'play' è l'URL del video senza watermark
        let videoUrl = randomVideo.play;

        // Invia il video direttamente (il bot lo scarica e lo inoltra)
        await conn.sendMessage(
            m.chat,
            {
                video: { url: videoUrl },
                caption: `✨ *Meme trovato!*\n\n👤 *User:* ${randomVideo.author.unique_id}\n📝 *Titolo:* ${randomVideo.title || 'Senza titolo'}\n🎵 *Audio:* ${randomVideo.music_info.title}`,
                mimetype: 'video/mp4'
            },
            { quoted: m }
        );

    } catch (e) {
        console.error(e);
        m.reply('⚠️ Errore durante lo scaricamento del video. Riprova.');
    }
};

handler.help = ['meme'];
handler.tags = ['giochi'];
handler.command = ['meme'];

export default handler;
