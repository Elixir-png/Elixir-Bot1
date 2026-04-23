let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const isAntinukeOn = chat?.antinuke || false
  const sender = m.sender
  
  const mods = chat?.moderatori || []
  const isMod = mods.includes(sender)

  if (isMod && !isOwner) {
    return conn.reply(m.chat, '『 🚫 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Come Moderatore non hai il permesso di gestire i ruoli.', m)
  }

  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Solo gli amministratori possono usare questo comando.', m)
  }

  if (isAntinukeOn && !isOwner) {
    return conn.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨: Solo il Creatore può gestire i gradi.', m)
  }

  let number
  if (m.mentionedJid && m.mentionedJid[0]) {
    number = m.mentionedJid[0]
  } else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender
  } else if (text) {
    number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }

  if (!number || number.length < 10) {
    return conn.reply(m.chat, '『 👤 』 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 un utente, quota un messaggio o scrivi il numero.', m)
  }

  if (number === sender) return conn.reply(m.chat, '『 🤡 』 Non puoi farlo su te stesso.', m)
  if (number === conn.user.jid) return conn.reply(m.chat, '『 🤖 』 Non posso modificare i miei permessi.', m)

  const isPromote = ['promote', 'promuovi', 'p'].includes(command)
  const action = isPromote ? 'promote' : 'demote'

  // URL Immagine (Assicurati che sia quadrata per un risultato perfetto)
  const imgElixir = 'https://githubusercontent.com' 

  const textMsg = isPromote 
    ? `┌  『 𝐍𝐔𝐎𝐕𝐎 𝐀𝐃𝐌𝐈𝐍 』\n│  \n│  👤  𝐀: @${number.split('@')[0]}\n│  🛠️  𝐃𝐚: @${sender.split('@')[0]}\n└──────────────`
    : `『 ⚠️ 』 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 @${number.split('@')[0]} è stato retrocesso.`

  try {
    await conn.groupParticipantsUpdate(m.chat, [number], action)
    
    // Invio con anteprima quadrata (renderLargerThumbnail)
    await conn.sendMessage(m.chat, {
      text: textMsg,
      contextInfo: {
        mentionedJid: [sender, number],
        externalAdReply: {
          title: `test | 𝐄𝐥𝐢𝐱𝐢𝐫`,
          body: isPromote ? `NUOVO ADMIN PROMOSSO` : `ADMIN RETROCESSO`,
          thumbnailUrl: imgElixir,
          sourceUrl: null,
          mediaType: 1,
          renderLargerThumbnail: true // Forza il formato quadrato perfetto
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '『 ❌ 』 Errore durante l\'operazione.', m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = /^(promote|promuovi|p|demote|retrocedi|r)$/i
handler.group = true
handler.botAdmin = true 

export default handler
