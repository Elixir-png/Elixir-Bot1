let handler = async (m, { conn, command, text }) => {
  const message = `ᴇʟɪxɪʀ ᴇ ɪʟ ꜱɪᴄɪʟɪᴀɴᴏ ᴘɪᴜ ꜱɪᴍᴘᴀᴛɪᴄᴏ ᴅᴇʟʟᴇ ᴄᴏᴍᴍ, ɪʟ ᴍɪɢʟɪᴏʀᴇ.
ɴᴏɴ ʟᴏ ꜰᴀᴛᴇ ɪɴᴄᴀᴢᴢᴀʀᴇ ᴏ ᴠɪ ꜱᴀʟᴛᴀɴᴏ ɪ ɴᴜᴍᴇʀɪ ᴇ ᴘᴀʀᴛᴏɴᴏ ɪ ᴅᴏxx ᴅᴏᴠᴇ ᴠɪ ᴘʀᴇɴᴅᴇ ᴘᴜʀᴇ ɪ ᴘᴇʟɪ ᴅᴇʟ ᴄᴜʟᴏ.`;
  // manda il messaggio nella chat dove il comando è stato usato, citandolo
  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['elixir'];
handler.tags = ['giochi'];
handler.command = /^blood$/i;

export default handler;
