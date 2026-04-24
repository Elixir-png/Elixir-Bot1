import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'

const LOG_CHAT = '120363408934217962@g.us'
const DB_FILE = 'voip.json'

let processingNumbers = new Set()

function formatDate() {
  const d = new Date()
  return d.toLocaleString('it-IT', { hour12: false })
}

function getCountry(number) {
  try {
    return new PhoneNumber(number).getRegionCode() || 'Sconosciuto'
  } catch {
    return 'Sconosciuto'
  }
}

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ blocked: [] }, null, 2))
  }
  return JSON.parse(fs.readFileSync(DB_FILE))
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

function saveNumber(number, group, nick) {
  let db = loadDB()

  let found = db.blocked.find(v => v.number === number)

  if (!found) {
    db.blocked.push({
      number,
      nick,
      group,
      count: 1,
      first: formatDate(),
      last: formatDate(),
      country: getCountry(number)
    })
  } else {
    found.count++
    found.last = formatDate()
    if (!found.group.includes(group)) found.group = group
  }

  saveDB(db)
}

export async function before(m, { conn }) {
  if (!m.isGroup) return true

  try {
    const chat = global.db.data.chats[m.chat] || {}

    const enabled =
      chat.antivoip2 === true ||
      chat.antivoip2 === 'true' ||
      chat.antivoip2 === 1

    if (!enabled) return true

    let jid =
      m.messageStubParameters?.[0] ||
      m.key?.participant ||
      m.sender

    if (!jid) return true

    let num = jid.split('@')[0]
    if (processingNumbers.has(num)) return true

    processingNumbers.add(num)

    const isItalian = num.startsWith('39') || num.startsWith('+39')

    if (!isItalian) {
      const group = await conn.groupMetadata(m.chat).catch(() => ({}))
      const groupName = group.subject || 'unknown'

      // 🔥 FIX: SOLO RIFIUTO RICHIESTA (NO REMOVE)
      try {
        if (conn.groupRequestParticipantsUpdate) {
          await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'reject')
        }
      } catch (e) {
        console.log('reject error:', e)
      }

      saveNumber(num, groupName, jid)

      await conn.sendMessage(LOG_CHAT, {
        text:
          `🚫 VOIP BLOCK\n` +
          `👤 ${num}\n` +
          `👥 ${groupName}\n` +
          `📅 ${formatDate()}`
      })

      setTimeout(() => processingNumbers.delete(num), 5000)
      return false
    }

    processingNumbers.delete(num)
    return true

  } catch (e) {
    console.log('VOIP ERROR:', e)
    return true
  }
}

export function init() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ blocked: [] }, null, 2))
  }
}
