// Plugin Autoadmin forzato per Elixir & Momo
// Riservato esclusivamente agli Owner

let handler = async (m, { conn, isOwner }) => {
  // --- PROTEZIONE OWNER ---
  // isOwner controlla se chi scrive è nei numeri definiti come proprietari del bot
  if (!isOwner) return 

  // Bersaglio: chi tagghi, chi quoti o te stesso
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender

  try {
    // Invio diretto del comando di promozione (Promuove ad Admin)
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    // Messaggio estetico di conferma in stile Cyberpunk
    await conn.sendMessage(m.chat, {
        text: `
` + '`[⚡] ELIXIR_SYSTEM_OVERRIDE`' + `
` + '`--------------------------`' + `
` + '`> STATUS:` *Privilegi Iniettati*
` + '`> TARGET:` @${who.split('@')[0]}
` + '`> AUTH:` *Level: Creator*
` + '`--------------------------`' + `
` + '`[!] Accesso root garantito con successo.`',
        contextInfo: { 
            mentionedJid: [who],
            externalAdReply: {
                title: '⚡ ELIXIR BYPASS: EXPLOIT_OK',
                body: 'Iniezione privilegi di sistema completata.',
                thumbnailUrl: 'https://qu.ax/TfUj.jpg', 
                sourceUrl: '𝕰𝕷𝕴𝖃𝕴𝕽𝕭𝕺𝕿',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '`[CRITICAL_ERROR]: Il bot non ha permessi di scrittura nel database del gruppo (Non è Admin).`', m)
  }
}

handler.help = ['ELIXIRO', 'MOMO']
handler.tags = ['owner']
// Configurazione comandi richiesti
handler.command = /^(ELIXIRO|MOMO)$/i

handler.group = true
handler.rowner = true // Assicura che solo i creatori possano usarlo

export default handler
