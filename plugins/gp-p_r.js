let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const isAntinukeOn = chat?.antinuke || false
  const sender = m.sender
  
  const mods = chat?.moderatori || []
  const isMod = mods.includes(sender)

  if (isMod && !isOwner) return conn.reply(m.chat, '『 🚫 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨.', m)
  if (!isAdmin && !isOwner) return conn.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨.', m)
  if (isAntinukeOn && !isOwner) return conn.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨.', m)

  let number = m.mentionedJid?.[0] || m.quoted?.sender || (text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
  if (!number || number.length < 10) return conn.reply(m.chat, '『 👤 』 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 qualcuno.', m)

  const isPromote = ['promote', 'promuovi', 'p'].includes(command)
  const action = isPromote ? 'promote' : 'demote'

  // LOGICA ADATTAMENTO:
  // Assicurati che questo link punti a un'immagine QUADRATA.
  const imgElixir = 'https://percorso-tua-immagine-quadrata.jpg' 

  const titleText = `test | 𝐄𝐥𝐢𝐱𝐢𝐫`
  const bodyText = isPromote ? 'NUOVO ADMIN PROMOSSO' : 'ADMIN RETROCESSO'
  
  const decorativeText = `*｡  °  ┌  ⌜  ${isPromote ? 'NUOVO ADMIN' : 'ADMIN RETRO'}  ⌟  ┘  °  ｡*
  
┌   
│  ⌜ 👤 ⌟   𝐀: @${number.split('@')[0]}
│  ⌜ 🛠️ ⌟   𝐃𝐚: @${sender.split('@')[0]}
└──────────────`

  try {
    await conn.groupParticipantsUpdate(m.chat, [number], action)
    
    await conn.sendMessage(m.chat, {
      text: decorativeText,
      contextInfo: {
        mentionedJid: [sender, number],
        externalAdReply: {
          title: titleText,
          body: bodyText,
          thumbnailUrl: imgElixir, // L'immagine deve essere 1:1 per non essere tagliata
          sourceUrl: null,
          mediaType: 1,
          renderLargerThumbnail: true, // Questo crea il "cuadratino" grande
          showAdAttribution: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '『 ❌ 』 Errore.', m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = /^(promote|promuovi|p|demote|retrocedi|r)$/i
handler.group = true
handler.botAdmin = true 

export default handler
