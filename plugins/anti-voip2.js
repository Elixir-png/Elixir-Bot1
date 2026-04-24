// Plug-in creato da elixir
/**
 * 🛡️ ULTIMATE VOIP BLOCKER v7.4
 * (Con accesso diretto al database, compatibile con anti-insta)
 * 
 * @description 
 * Blocca i numeri stranieri mostrando il nome del gruppo 
 * e salva i dati in un database JSON, rispettando l'impostazione antivoip.
 */

import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import path from 'path'

// ====================== COSTANTI ======================
const ITALIAN_CODE = 39
const LOG_CHAT = '120363408934217962@g.us'
const DB_FILE = 'voip.json'

// Set per prevenire duplicazione di messaggi
let processingNumbers = new Set()

// ====================== UTILS ======================

/**
 * Formatta una data nel formato GG/MM/AAAA HH:MM
 */
function formatDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Restituisce il paese da un numero
 */
function getCountryFromNumber(number) {
  try {
    const pn = new PhoneNumber(number)
    return pn.getRegionCode() || "Sconosciuto"
  } catch {
    return "Sconosciuto"
  }
}

// ====================== DATABASE ======================

/**
 * Gestisce il database dei numeri VOIP bloccati
 */
function manageVoipDatabase(number, groupName, nickname = "") {
  try {
    // Se il DB non esiste, crealo
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ blockedNumbers: [] }, null, 2))
    }

    const dbContent = fs.readFileSync(DB_FILE, 'utf8')
    const database = JSON.parse(dbContent)
    const existingEntry = database.blockedNumbers.find(entry => entry.numero === number)
    const timestamp = formatDate()

    if (existingEntry) {
      // Aggiorna entry esistente
      existingEntry.ultimoTentativo = timestamp
      existingEntry.gruppi = existingEntry.gruppi || []
      if (!existingEntry.gruppi.includes(groupName)) {
        existingEntry.gruppi.push(groupName)
      }
      existingEntry.tentativi = (existingEntry.tentativi || 0) + 1

      // Aggiorna nickname solo se valido e diverso
      if (nickname && (!existingEntry.nickname || existingEntry.nickname !== nickname)) {
        existingEntry.nickname = nickname
      }
    } else {
      // Nuovo entry
      database.blockedNumbers.push({
        numero: number,
        nickname: nickname || "Sconosciuto",
        primoTentativo: timestamp,
        ultimoTentativo: timestamp,
        gruppi: [groupName],
        tentativi: 1,
        paese: getCountryFromNumber(number),
        bloccato: true
      })
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2))
    console.log(`📊 Numero ${number} salvato nel DB con nickname: ${nickname || "N/D"}`)
    return true

  } catch (error) {
    console.error('❌ Errore nel gestire il database:', error)
    return false
  }
}

// ====================== NICKNAME ======================

/**
 * Recupera il nickname di un utente da diverse fonti
 */
async function getUserNickname(conn, userJid) {
  try {
    const rawNumber = userJid.split('@')[0]
    const formattedNumber = rawNumber.startsWith('+') ? rawNumber : `+${rawNumber}`
    let nickname = null

    // Metodo 1: conn.getName
    try {
      if (typeof conn.getName === 'function') {
        nickname = await conn.getName(userJid)
        if (nickname && nickname.trim() !== '' && !nickname.match(/^\+?\d+$/)) {
          console.log(`👤 Nome trovato via getName: ${nickname}`)
          return nickname.trim()
        }
      }
    } catch (e) {
      console.log('⚠️ Errore in getName:', e.message)
    }

    // Metodo 2: fetchContactInfo / getContact
    try {
      let contact = null
      if (typeof conn.fetchContactInfo === 'function') {
        contact = await conn.fetchContactInfo(userJid)
      } else if (typeof conn.getContact === 'function') {
        contact = await conn.getContact(userJid)
      }

      if (contact?.pushname && contact.pushname.trim() !== '' && !contact.pushname.match(/^\+?\d+$/)) {
        console.log(`👤 Nome trovato via pushname: ${contact.pushname}`)
        return contact.pushname.trim()
      }

      if (contact?.notify && contact.notify.trim() !== '' && !contact.notify.match(/^\+?\d+$/)) {
        console.log(`👤 Nome trovato via notify: ${contact.notify}`)
        return contact.notify.trim()
      }

      if (contact?.name && contact.name.trim() !== '' && !contact.name.match(/^\+?\d+$/)) {
        console.log(`👤 Nome trovato via name: ${contact.name}`)
        return contact.name.trim()
      }
    } catch (e) {
      console.log('⚠️ Errore in fetchContactInfo:', e.message)
    }

    // Metodo 3: business profile
    try {
      if (typeof conn.getBusinessProfile === 'function') {
        const businessProfile = await conn.getBusinessProfile(userJid)
        if (businessProfile?.name?.trim()) {
          console.log(`👤 Nome via business profile: ${businessProfile.name}`)
          return businessProfile.name.trim()
        }
      }
    } catch (e) {
      console.log('⚠️ Errore in getBusinessProfile:', e.message)
    }

    // Metodo 4: status con ~nickname~
    try {
      if (typeof conn.fetchStatus === 'function') {
        const status = await conn.fetchStatus(userJid)
        const match = status?.status?.match(/~([^~]+)~/)
        if (match?.[1]?.trim()) {
          console.log(`👤 Nome via status: ${match[1]}`)
          return match[1].trim()
        }
      }
    } catch (e) {
      console.log('⚠️ Errore in fetchStatus:', e.message)
    }

    // Metodo 5: DB
    try {
      if (fs.existsSync(DB_FILE)) {
        const dbContent = fs.readFileSync(DB_FILE, 'utf8')
        const database = JSON.parse(dbContent)
        const existingEntry = database.blockedNumbers.find(entry => entry.numero === formattedNumber)
        if (existingEntry?.nickname && existingEntry.nickname !== "Sconosciuto" && !existingEntry.nickname.match(/^\+?\d+$/)) {
          console.log(`👤 Nome trovato nel DB: ${existingEntry.nickname}`)
          return existingEntry.nickname
        }
      }
    } catch (e) {
      console.log('⚠️ Errore nella lettura DB:', e.message)
    }

    console.log(`⚠️ Nessun nome trovato per ${formattedNumber}, uso numero come fallback`)
    return formattedNumber

  } catch (error) {
    console.error('❌ Errore nel recupero nickname:', error)
    const number = userJid.split('@')[0]
    return number.startsWith('+') ? number : `+${number}`
  }
}

// ====================== HOOK PRINCIPALE ======================

export async function before(m, { conn }) {
  if (!m.isGroup) return true

  const isJoinRequest = (
    m.messageStubType === 21 ||
    m.message?.protocolMessage?.type === 5 ||
    (m.messageStubParameters?.length > 0)
  )

  if (!isJoinRequest) return true

  try {
    let requesterJid = m.messageStubParameters?.[0] || 
                       m.message?.protocolMessage?.key?.participant || 
                       m.sender
    if (!requesterJid) return true

    const rawNumber = requesterJid.split('@')[0]
    const formattedNumber = rawNumber.startsWith('+') ? rawNumber : `+${rawNumber}`

    if (processingNumbers.has(formattedNumber)) {
      console.log(`⚠️ Duplicazione evitata per ${formattedNumber}`)
      return true
    }

    processingNumbers.add(formattedNumber)

    const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
    const groupName = groupMetadata?.subject || 'Gruppo sconosciuto'
    const isBotAdmin = groupMetadata?.participants?.some(p => p.id === conn.user.jid && p.admin !== null) || false
    const isAdmin = groupMetadata?.participants?.some(p => p.id === requesterJid && p.admin !== null) || false
    const chatData = global.db.data.chats[m.chat]
    const antivoipEnabled = chatData?.antivoip !== false

    if (!antivoipEnabled) {
      console.log(`ℹ️ Anti-VOIP disabilitato per "${groupName}". Accesso consentito.`)
      processingNumbers.delete(formattedNumber)
      return true
    }

    const isItalian = formattedNumber.startsWith('+39')
    if (!isItalian) {
      await executeBlock(conn, m.chat, requesterJid, formattedNumber, groupName, isAdmin, groupMetadata, isBotAdmin)
      setTimeout(() => processingNumbers.delete(formattedNumber), 5000)
      return false
    }

    processingNumbers.delete(formattedNumber)
    return true

  } catch (error) {
    console.error('🔥 ERRORE:', error)
    if (isJoinRequest) {
      await conn.sendMessage(LOG_CHAT, {
        text: `*ERRORE FIREWALL*\n• Errore: ${error.message}`
      })
    }
    return true
  }
}

// ====================== BLOCCO ======================

async function executeBlock(conn, chatJid, userJid, number, groupName, isAdmin, groupMetadata, isBotAdmin) {
  if (!isAdmin && isBotAdmin) {  
    try {
      const normalizeJid = (jid) => jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      const normalizedJid = normalizeJid(userJid)
      const mention = '@' + normalizedJid.split('@')[0]
      const nickname = mention

      await conn.groupRequestParticipantsUpdate(chatJid, [userJid], 'reject')
      console.log(`☠️ VOIP BLOCCATO: ${number} (${nickname}) in "${groupName}"`)

      manageVoipDatabase(number, groupName, nickname)

      await conn.sendMessage(LOG_CHAT, {
        text: 
          `🚫 *RICHIESTA BLOCCATA*\n` +
          `──────────────────────\n` +
          `👤 *Numero:* ${number}\n` +
          `🏷️ *Menzione:* ${mention}\n` +
          `👥 *Gruppo:* ${groupName}\n` +
          `📅 *Data:* ${formatDate()}\n` +
          `──────────────────────\n` +
          `🛡️ *Firewall Anti-VOIP v7.4*`,
        mentions: [normalizedJid]
      })

    } catch (error) {
      try {
        if (!groupMetadata) groupMetadata = await conn.groupMetadata(chatJid)
        const alreadyInGroup = groupMetadata?.participants?.some(p => p.id === userJid)

        if (!alreadyInGroup) {
          const normalizeJid = (jid) => jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
          const normalizedJid = normalizeJid(userJid)
          const mention = '@' + normalizedJid.split('@')[0]

          await conn.groupParticipantsUpdate(chatJid, [userJid], 'remove')
          console.log(`☠️ VOIP BLOCCATO (fallback): ${number} (${mention}) in "${groupName}"`)

          manageVoipDatabase(number, groupName, mention)

          await conn.sendMessage(LOG_CHAT, {
            text: 
              `🚫 *RICHIESTA BLOCCATA (Fallback)*\n` +
              `──────────────────────\n` +
              `👤 *Numero:* ${number}\n` +
              `🏷️ *Menzione:* ${mention}\n` +
              `👥 *Gruppo:* ${groupName}\n` +
              `📅 *Data:* ${formatDate()}\n` +
              `──────────────────────\n` +
              `🛡️ *Firewall Anti-VOIP v7.4*`,
            mentions: [normalizedJid]
          })
        } else {
          console.warn(`❗ Utente ${number} è già nel gruppo, non lo rimuovo.`)
        }
      } catch (innerError) {
        console.error(`❌ Errore nel fallback per ${number}:`, innerError.message)
      }
    }
  }
}

// ====================== INIT ======================

export function init() {
  console.log('🛡️ Firewall Anti-VOIP v7.4 attivato con DB diretto e compatibilità anti-instagram')

  if (!fs.existsSync(DB_FILE)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify({ blockedNumbers: [] }, null, 2))
      console.log('📁 Database voip.json creato con successo')
    } catch (error) {
      console.error('❌ Errore nella creazione del database:', error)
    }
  }

  return {
    name: 'voip-firewall',
    description: 'Blocca numeri stranieri in base alle impostazioni del gruppo e salva i dati in un database JSON',
    priority: 9999
  }
}
