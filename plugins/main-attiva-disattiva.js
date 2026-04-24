import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
}

const featureRegistry = [
  { key: 'bestemmiometro', store: 'chat', perm: PERM.ADMIN, name: '🤬 Bestemmiometro', desc: 'Rileva e conta le bestemmie' },
  { key: 'antidelete', store: 'chat', perm: PERM.ADMIN, name: '🗑️ Antidelete', desc: 'Recupera messaggi eliminati' },
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '🛑 Antispam', desc: 'Protezione flood e spam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, name: '📊 Anti-sondaggi', desc: 'Blocca sondaggi' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, name: '🧼 Filtro parolacce', desc: 'Filtro insulti' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, name: '🤖 Antibot', desc: 'Blocca bot esterni' },
  { key: 'antiBot2', store: 'chat', perm: PERM.ADMIN, name: '🤖 Anti-subbots', desc: 'Blocca subbot' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, name: '🧨 Antitrava', desc: 'Crash protection' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, name: '🖼️ Antimedia', desc: 'Blocca media' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, name: '👁️ Antiviewonce', desc: 'Blocca viewonce' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, name: '🏷️ Anti-tagall', desc: 'Blocca tag massivi' },
  { key: 'autotrascrizione', store: 'chat', perm: PERM.ADMIN, name: '📝 Auto-trascrizione', desc: 'Vocali in testo' },
  { key: 'autotraduzione', store: 'chat', perm: PERM.ADMIN, name: '🌍 Auto-traduzione', desc: 'Traduzione automatica' },
  { key: 'rileva', store: 'chat', perm: PERM.ADMIN, name: '📡 Rileva', desc: 'Log modifiche gruppo' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, name: '🔞 Antiporno', desc: 'Filtro NSFW' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, name: '🚫 Antigore', desc: 'Filtro gore' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, name: '🛡️ Solo admin', desc: 'Comandi admin' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '🧠 IA', desc: 'AI attiva' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, name: '🎤 Siri', desc: 'Risposte vocali' },

  // FIX IMPORTANTE QUI 👇
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, name: '📞 Antivoip', desc: 'Blocca non italiani' },
  { key: 'antivoip2', store: 'chat', perm: PERM.ADMIN, name: '📛 AntiVoip2', desc: 'Firewall avanzato VOIP' },

  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, name: '🔗 Antilink', desc: 'Blocca link' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, name: '🌍 Antilink Uni', desc: 'Blocca URL' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, name: '🌐 Social link', desc: 'Blocca social' },
  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, name: '😎 Reazioni', desc: 'Auto reaction' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, name: '⬆️ Level up', desc: 'Level system' },

  { key: 'antinuke', store: 'chat', perm: PERM.OWNER, name: '🛡️ Antinuke', desc: 'Anti raid' },

  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, name: '🔒 Blocco DM', desc: 'Blocca privati' },
  { key: 'soloe', store: 'bot', perm: PERM.OWNER, name: '👑 Solo owner', desc: 'Solo creatore' },
  { key: 'multiprefix', store: 'bot', perm: PERM.OWNER, name: '🔣 Prefix', desc: 'Multi prefix' },
  { key: 'jadibotmd', store: 'bot', perm: PERM.OWNER, name: '🧬 Subbot', desc: 'Sub bot' },
  { key: 'antispambot', store: 'bot', perm: PERM.OWNER, name: '🤖 Anti spam bot', desc: 'Spam control' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, name: '👀 Autoread', desc: 'Auto read' },
  { key: 'anticall', store: 'bot', perm: PERM.sam, name: '📵 Anti call', desc: 'Blocca chiamate' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, name: '📛 Reg', desc: 'Registrazione' },
]

const aliasMap = new Map(featureRegistry.map(f => [f.key.toLowerCase(), f]))

let handler = async (m, { conn, command, args, isOwner, isAdmin, isSam }) => {
  const isEnable = ['enable', 'attiva', 'on', '1'].includes(command.toLowerCase())

  global.db.data.chats = global.db.data.chats || {}
  global.db.data.settings = global.db.data.settings || {}

  const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const bot = global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}

  if (args[0]) {
    let type = args[0].toLowerCase()
    const feat = aliasMap.get(type)
    if (!feat) return m.reply('Modulo non trovato')

    if (feat.perm === PERM.ADMIN && m.isGroup && !(isAdmin || isOwner || isSam))
      return m.reply('Solo admin')

    if (feat.perm === PERM.OWNER && !isOwner && !isSam)
      return m.reply('Solo owner')

    const target = feat.store === 'bot' ? bot : chat
    target[feat.key] = isEnable

    return m.reply(`Modulo ${feat.key} → ${isEnable}`)
  }

  let menu = featureRegistry.map(f =>
    `• ${f.name} (${f.key}) = ${f.store}`
  ).join('\n')

  await conn.sendMessage(m.chat, { text: menu }, { quoted: m })
}

handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable']
export default handler
