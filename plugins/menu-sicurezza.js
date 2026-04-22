import fetch from 'node-fetch'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'User'
  
  // --- PERCORSO IMMAGINE LOCALE ---
  const localImg = join(process.cwd(), 'menu-sicurezza.jpeg')

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  // --- CONFIGURAZIONE MODULI ---
  const securityFeatures = [
    { key: 'antigore', name: 'ᴀɴᴛɪɢᴏʀᴇ', desc: 'Filtro contenuti sensibili' },
    { key: 'modoadmin', name: 'ᴀᴅᴍɪɴ ᴍᴏᴅᴇ', desc: 'Restrizione comandi per admin' },
    { key: 'antivoip', name: 'ᴀɴᴛɪ-ᴠᴏɪᴘ', desc: 'Rifiuta chiamate in entrata' },
    { key: 'antilink', name: 'ᴀɴᴛɪ-ʟɪɴᴋ', desc: 'Rimozione link gruppi WA' },
    { key: 'antilinksocial', name: 'sᴏᴄɪᴀʟ-ʟɪɴᴋ', desc: 'Rimozione link social media' },
    { key: 'antitrava', name: 'ᴀɴᴛɪ-ᴄʀᴀsʜ', desc: 'Protezione contro messaggi binari' },
    { key: 'antinuke', name: 'ᴀɴᴛɪ-ɴᴜᴋᴇ', desc: 'Sicurezza avanzata del gruppo' },
    { key: 'antiviewonce', name: 'ᴀɴᴛɪ-ᴠɪᴇᴡᴏɴᴄᴇ', desc: 'Recupero messaggi temporanei' },
    { key: 'antispam', name: 'ᴀɴᴛɪ-sᴘᴀᴍ', desc: 'Protezione flussi di comandi' }
  ]

  const automationFeatures = [
    { key: 'ai', name: 'ɪ.ᴀ. ᴄᴏɴᴛʀᴏʟ', desc: 'Risposta intelligente attiva' },
    { key: 'vocali', name: 'ᴠᴏɪᴄᴇ ᴀssɪsᴛᴀɴᴛ', desc: 'Risposte vocali automatiche' },
    { key: 'reaction', name: 'ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ', desc: 'Reazioni smart ai messaggi' },
    { key: 'autolevelup', name: 'ʟᴇᴠᴇʟ-ᴜᴘ', desc: 'Notifica avanzamento livello' },
    { key: 'welcome', name: 'ᴡᴇʟᴄᴏᴍᴇ', desc: 'Messaggio di benvenuto' }
  ]

  const ownerFeatures = [
    { key: 'anticall', name: 'ᴀɴᴛɪ-ᴄᴀʟʟ', desc: 'Blocco chiamate globale' },
    { key: 'antiprivate', name: 'ᴀɴᴛɪ-ᴘʀɪᴠᴀᴛᴇ', desc: 'Esclusività nei gruppi' },
    { key: 'solocreatore', name: 'ᴘʀɪᴏʀɪᴛʏ ᴍᴏᴅᴇ', desc: 'Risposta esclusiva owner' }
  ]

  // --- GENERAZIONE MENU ---
  if (!args.length || /menu|help/i.test(args[0])) {
    let text = `
╭─━━  〔 ᴇʟɪxɪʀ ʙᴏᴛ 〕  ━━─╮
┃ 𝖢𝖮𝖭𝖳𝖱𝖮𝖫 𝖯𝖠𝖭𝖤𝖫 𝖲𝖸𝖲𝖳𝖤𝖬 ┃
╰───────────────╯

「 ɪɴғᴏ ᴜᴛᴇɴᴛᴇ 」
  👤 ᴜsᴇʀ: ${userName}
  🌐 sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ

「 ᴏᴘᴇʀᴀᴢɪᴏɴɪ 」
  ⊸ ${_p}ᴀᴛᴛɪᴠᴀ <ɴᴏᴍᴇ>
  ⊸ ${_p}ᴅɪsᴀᴛᴛɪᴠᴀ <ɴᴏᴍᴇ>

╭─  🛡️ sɪᴄᴜʀᴇᴢᴢᴀ  ─╮
${securityFeatures.map(f => `  ﹫${f.name}\n  └─ ${f.key}`).join('\n\n')}

╭─  🤖 ᴀᴜᴛᴏᴍᴀᴢɪᴏɴᴇ  ─╮
${automationFeatures.map(f => `  ﹫${f.name}\n  └─ ${f.key}`).join('\n\n')}

╭─  👑 ᴏᴡɴᴇʀ sᴇᴛᴛɪɴɢs  ─╮
${ownerFeatures.map(f => `  ﹫${f.name}\n  └─ ${f.key}`).join('\n\n')}

_ᴇʟɪxɪʀ ɪɴᴛᴇʟʟɪɢᴇɴᴄᴇ sʏsᴛᴇᴍ ᴠ𝟸.𝟶_`

    await conn.sendMessage(m.chat, { 
      image: { url: localImg }, 
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🛡️ ELIXIR SYSTEM SECURITY 🛡️"
        }
      }
    }, { quoted: m })
    return
  }

  // --- LOGICA DI ATTIVAZIONE ---
  let isEnable = !/disattiva|off|0/i.test(command)
  let type = args[0].toLowerCase()
  let status = isEnable ? 'ᴀᴛᴛɪᴠᴀᴛᴏ' : 'ᴅɪsᴀᴛᴛɪᴠᴀᴛᴏ'

  let dbKey = type
  if (type === 'antilink') dbKey = 'antiLink'
  if (type === 'antilinksocial') dbKey = 'antiLink2'
  if (type === 'antiviewonce') dbKey = 'antioneview'
  if (type === 'antiprivate') dbKey = 'antiPrivate'
  if (type === 'solocreatore') dbKey = 'soloCreatore'

  const isSecurity = securityFeatures.some(f => f.key.toLowerCase() === type)
  const isAuto = automationFeatures.some(f => f.key.toLowerCase() === type)
  const isOwnerKey = ownerFeatures.some(f => f.key.toLowerCase() === type)

  if (isSecurity || isAuto) {
    if (!m.isGroup && !isOwner) return m.reply('❌ ᴇʟɪxɪʀ: ǫᴜᴇsᴛᴏ ᴄᴏᴍᴀɴᴅᴏ è ᴅɪsᴘᴏɴɪʙɪʟᴇ sᴏʟᴏ ɴᴇɪ ɢʀᴜᴘᴘɪ.')
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('🛡️ ᴇʟɪxɪʀ: ᴀᴄᴄᴇssᴏ ɴᴇɢᴀᴛᴏ. sᴏʟᴏ ᴘᴇʀ ᴀᴅᴍɪɴ.')
    chat[dbKey] = isEnable
  } else if (isOwnerKey) {
    if (!isOwner) return m.reply('👑 ᴇʟɪxɪʀ: ᴀᴄᴄᴇssᴏ ʀɪsᴇʀᴠᴀᴛᴏ ᴀʟʟ\'ᴏᴡɴᴇʀ.')
    bot[dbKey] = isEnable
  } else {
    return m.reply('❓ ᴍᴏᴅᴜʟᴏ ɴᴏɴ ʀɪᴄᴏɴᴏsᴄɪᴜᴛᴏ ᴅᴀ ᴇʟɪxɪʀ.')
  }

  await m.react(isEnable ? '✅' : '❌')
  m.reply(`┏━━━━━━━━━━━━━━━━━━┓\n  ᴇʟɪxɪʀ sʏsᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ\n┗━━━━━━━━━━━━━━━━━━┛\n\n▢ ᴍᴏᴅᴜʟᴏ: *${type.toUpperCase()}*\n▢ sᴛᴀᴛᴏ: *${status}*`)
}

handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable']
export default handler
