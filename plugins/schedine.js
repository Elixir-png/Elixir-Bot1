
import fs from 'fs'
import crypto from 'crypto'

const SNAI_PATH = './media/snai.png'

const CAMPIONATI = {
  "SERIE A": ["Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"],
  "MONDIALI": ["Italia", "Argentina", "Brasile", "Francia", "Germania", "Spagna", "Inghilterra", "Portogallo", "Olanda", "Belgio", "Croazia", "Marocco", "Giappone", "Uruguay", "Svizzera", "USA"]
}

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num) }

// Genera 3 match unici basati sull'ID utente
function getPersistentMatches(seed, lista) {
  let matches = []
  let tempLista = [...lista]
  for (let i = 0; i < 3; i++) {
    const hash = crypto.createHash('md5').update(seed + i).digest('hex')
    const idx1 = parseInt(hash.substring(0, 8), 16) % tempLista.length
    const casa = tempLista.splice(idx1, 1)[0]
    const idx2 = parseInt(hash.substring(8, 16), 16) % tempLista.length
    const trasf = tempLista.splice(idx2, 1)[0]
    matches.push({ casa, trasf, quota: (Math.random() * (2.2 - 1.5) + 1.5).toFixed(2) })
  }
  return matches
}

async function modificaMessaggio(conn, chatId, key, testo) {
  await conn.relayMessage(chatId, { protocolMessage: { key, type: 14, editedMessage: { extendedTextMessage: { text: testo } } } }, {})
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender
  const user = global.db.data.users[who]
  const puntata = parseInt(args[0])
  const tipoCampionato = args[1] 
  const combinazione = args[2] // Es: 1X2, 111, X21...

  // STEP 1: Puntata
  if (!puntata || isNaN(puntata)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: '💵 100€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: '💵 500€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 1000`, buttonText: { displayText: '💵 1000€' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, {
      ...(fs.existsSync(SNAI_PATH) ? { image: fs.readFileSync(SNAI_PATH) } : {}),
      caption: `🚀 *SNAI MULTIPLA* 🚀\n\nScommetti su *3 PARTITE* contemporaneamente per moltiplicare la tua vincita!\n\n💰 *SALDO:* ${formatNumber(user.euro)}€\n💸 _Quanto vuoi puntare?_`,
      buttons
    }, { quoted: m })
  }

  // STEP 2: Campionato
  if (!tipoCampionato) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${puntata} SERIEA`, buttonText: { displayText: '🇮🇹 SERIE A' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} MONDIALI`, buttonText: { displayText: '🌎 MONDIALI' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, { text: `💵 *PUNTATA:* ${formatNumber(puntata)}€\n🏆 _Scegli la competizione per la tua multipla:_`, buttons }, { quoted: m })
  }

  const lista = CAMPIONATI[tipoCampionato === 'SERIEA' ? "SERIE A" : "MONDIALI"]
  const matches = getPersistentMatches(who + tipoCampionato, lista)

  // STEP 3: Creazione Multipla (L'utente clicca per comporre la sua schedina)
  // Per semplicità di bottoni, offriamo alcune combinazioni popolari o lasciamo scegliere la prima
  if (!combinazione) {
    const combos = ['111', '1X2', '2X1', 'XXX', '222']
    const buttons = combos.map(c => ({
        buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} ${c}`,
        buttonText: { displayText: `Punta: ${c}` },
        type: 1
    }))

    let textMultipla = `📝 *COMPONI LA TUA MULTIPLA*\n\n`
    matches.forEach((match, i) => {
        textMultipla += `⚽ *M${i+1}:* ${match.casa} vs ${match.trasf} (x${match.quota})\n`
    })
    textMultipla += `\n🎯 _Scegli una combinazione di esiti (Es: 1X2 significa Match1: Casa, Match2: Pareggio, Match3: Trasferta)_`

    return conn.sendMessage(m.chat, { text: textMultipla, buttons }, { quoted: m })
  }

  if (user.euro < puntata) return m.reply(`❌ *SALDO INSUFFICIENTE!*`)
  user.euro -= puntata

  // LOGICA SIMULAZIONE MULTIPLA
  let quotaTotale = 1
  matches.forEach(m => quotaTotale *= parseFloat(m.quota))
  const vincitaPotenziale = Math.floor(puntata * quotaTotale)
  
  const risultatiMatch = matches.map((m, i) => {
    const gC = Math.floor(Math.random() * 4)
    const gT = Math.floor(Math.random() * 4)
    const esito = gC > gT ? '1' : (gC < gT ? '2' : 'X')
    return { gC, gT, esito, giocato: combinazione[i], vinto: esito === combinazione[i] }
  })

  const schedinaVinta = risultatiMatch.every(r => r.vinto)

  let liveText = `🎟️ *SCHEDINA MULTIPLA* 🎟️\n💰 *PUNTATA:* ${formatNumber(puntata)}€\n📈 *QUOTA TOT:* x${quotaTotale.toFixed(2)}\n💎 *POTENZIALE VINCITA:* ${formatNumber(vincitaPotenziale)}€\n\n────────────────────\n`
  
  const live = await conn.sendMessage(m.chat, { text: liveText + `⏳ _Elaborazione risultati in corso..._` })

  for (let i = 0; i < 3; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const r = risultatiMatch[i]
    const m = matches[i]
    liveText += `${r.vinto ? '✅' : '❌'} *M${i+1}:* ${m.casa} ${r.gC}-${r.gT} ${m.trasf} (Segno: ${r.giocato})\n`
    await modificaMessaggio(conn, m.chat, live.key, liveText)
  }

  await new Promise(r => setTimeout(r, 1500))
  if (schedinaVinta) user.euro += vincitaPotenziale

  liveText += `\n────────────────────\n${schedinaVinta ? `🏆 *BOLLETTA CASSA!!!* +${formatNumber(vincitaPotenziale)}€` : `💀 *MULTIPLA BRUCIATA!* -${formatNumber(puntata)}€`}\n🏦 *SALDO:* ${formatNumber(user.euro)}€`
  await modificaMessaggio(conn, m.chat, live.key, liveText)
}

handler.help = ['multipla']
handler.tags = ['game']
handler.command = /^(schedina|bet|multipla)$/i
handler.group = true

export default handler
