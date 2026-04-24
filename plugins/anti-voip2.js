// Plug-in creato da elixir
/**
 * 🛡️ ULTIMATE VOIP BLOCKER v7.5 FIXED
 */

import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'

// ====================== COSTANTI ======================
const LOG_CHAT = global.logChat || null
const DB_FILE = 'voip.json'

let processingNumbers = new Set()

// ====================== UTILS ======================

function formatDate(date = new Date()) {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${d}/${m}/${y} ${h}:${min}`
}

function getCountryFromNumber(number) {
  try {
    const pn = new PhoneNumber(number)
    return pn.getRegionCode() || "Sconosciuto"
  } catch {
    return "Sconosciuto"
  }
}

// ====================== DATABASE ======================

function manageVoipDatabase(number, groupName, nickname = "") {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ blockedNumbers: [] }, null, 2))
    }

    const db = JSON.parse(fs.readFileSync(DB_FILE))
    const existing = db.blockedNumbers.find(e => e.numero === number)
    const time = formatDate()

    if (existing) {
      existing.ultimoTentativo = time
      existing.tentativi = (existing.tentativi || 0) + 1
      if (!existing.gruppi.includes(groupName)) existing.gruppi.push(groupName)
      if (nickname) existing.nickname = nickname
    } else {
      db.blockedNumbers.push({
        numero: number,
        nickname: nickname || "Sconosciuto",
        primoTentativo: time,
        ultimoTentativo: time,
        gruppi: [groupName],
        tentativi: 1,
        paese: getCountryFromNumber(number),
        bloccato: true
      })
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
  } catch (e) {
    console.error('DB error:', e)
  }
}

// ====================== HOOK ======================

export async function before(m, { conn }) {
  if (!m.isGroup) return true

  // 🔥 FIX: hook più robusto
  const isJoinRequest =
    m.messageStubType === 21 ||
    m.messageStubType === 27 ||
    m.messageStubType === 31 ||
    m.message?.protocolMessage?.type === 5 ||
    m.messageStubParameters?.length

  if (!isJoinRequest) return true

  try {
    // 🔥 FIX: recupero jid migliorato
    let requesterJid =
      m.messageStubParameters?.[0] ||
      m.message?.protocolMessage?.key?.participant ||
      m.participant ||
      m.sender

    if (!requesterJid) return true

    const raw = requesterJid.split('@')[0]
    const number = raw.startsWith('+') ? raw : `+${raw}`

    if (processingNumbers.has(number)) return true
    processingNumbers.add(number)

    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    const groupName = groupMetadata?.subject || 'Gruppo sconosciuto'

    const isBotAdmin = groupMetadata?.participants?.some(p => p.id === conn.user.jid && p.admin) || false
    const isAdmin = groupMetadata?.participants?.some(p => p.id === requesterJid && p.admin) || false

    // 🔥 FIX: chatData sicuro
    const chatData = global.db.data.chats[m.chat] || {}
    const antivoipEnabled = chatData.antivoip2 === true

    console.log('🧪 DEBUG:', { antivoipEnabled, number, groupName, isBotAdmin })

    if (!antivoipEnabled) {
      processingNumbers.delete(number)
      return true
    }

    // 🔥 FIX: controllo paese reale
    const country = getCountryFromNumber(number)
    const isItalian = country === 'IT'

    if (!isItalian) {
      await executeBlock(conn, m.chat, requesterJid, number, groupName, isAdmin, isBotAdmin)
      setTimeout(() => processingNumbers.delete(number), 5000)
      return false
    }

    processingNumbers.delete(number)
    return true

  } catch (e) {
    console.error('🔥 ERRORE:', e)

    if (LOG_CHAT) {
      await conn.sendMessage(LOG_CHAT, {
        text: `Errore firewall: ${e.message}`
      })
    }

    return true
  }
}

// ====================== BLOCCO ======================

async function executeBlock(conn, chatJid, userJid, number, groupName, isAdmin, isBotAdmin) {
  if (isAdmin || !isBotAdmin) return

  try {
    const jid = userJid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    const mention = '@' + jid.split('@')[0]

    await conn.groupRequestParticipantsUpdate(chatJid, [userJid], 'reject')

    console.log(`🚫 BLOCCATO: ${number} in ${groupName}`)

    manageVoipDatabase(number, groupName, mention)

    if (LOG_CHAT) {
      await conn.sendMessage(LOG_CHAT, {
        text:
          `🚫 BLOCCATO\n` +
          `Numero: ${number}\n` +
          `Gruppo: ${groupName}\n` +
          `Data: ${formatDate()}`,
        mentions: [jid]
      })
    }

  } catch {
    try {
      await conn.groupParticipantsUpdate(chatJid, [userJid], 'remove')
    } catch (e) {
      console.error('Fallback error:', e.message)
    }
  }
}

// ====================== INIT ======================

export function init() {
  console.log('🛡️ Anti-VOIP v7.5 FIXED attivo')

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ blockedNumbers: [] }, null, 2))
  }

  return {
    name: 'voip-firewall',
    priority: 9999
  }
}
