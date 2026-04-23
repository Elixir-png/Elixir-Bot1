// Plugin Autoadmin forzato per MOMO
// Riservato esclusivamente agli Owner e Momo

let handler = async (m, { conn, isOwner }) => {
  // Lista numeri autorizzati (Owner e numero specifico di Momo)
  const authorized = [
    '393784409415@s.whatsapp.net',
    '393514722317@s.whatsapp.net',
    conn.user.jid
  ];

  const isMomo = authorized.includes(m.sender);

  // --- PROTEZIONE OWNER & MOMO ---
  if (!isOwner && !isMomo) return 

  // Bersaglio: chi tagghi, chi quoti o te stesso
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender

  try {
    // Invio diretto del comando di promozione
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    // Messaggio estetico di conferma in stile MOMO SYSTEM
    await conn.sendMessage(m.chat, {
        text: `
` + '`[⚡] MOMO_SYSTEM_OVERRIDE`' + `
` + '`--------------------------`' + `
` + '`> STATUS:` *Privilegi Iniettati*
` + '`> TARGET:` @${who.split('@')[0]}
` + '`> AUTH:` *Level: Creator*
` + '`--------------------------`' + `
` + '`[!] Accesso root garantito con successo.`',
        contextInfo: { 
            mentionedJid: [who],
            externalAdReply: {
                title: '⚡ MOMO BYPASS: EXPLOIT_OK',
                body: 'Iniezione privilegi di sistema completata.',
                thumbnailUrl: 'https://qu.ax/TfUj.jpg', 
                sourceUrl: '𝕸𝕺𝕸𝕺 𝕭𝕺𝕿',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '`[CRITICAL_ERROR]: Il bot non è admin o il sistema ha rifiutato l\'iniezione.`', m)
  }
}

handler.help = ['MOMO']
handler.tags = ['owner']
handler.command = /^(MOMO)$/i

handler.group = true
handler.rowner = true 

export default handler
