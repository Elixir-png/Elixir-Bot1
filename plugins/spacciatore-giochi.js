import { createCanvas } from 'canvas'

global.market = global.market || { 
    lastReset: new Date().toDateString(),
    prezzi: { '1': 10, '2': 30, '3': 60, '4': 100 },
    bancaSpaccino: 0 // Il profitto accumulato dallo spaccino
}

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let oggi = new Date().toDateString()

    // --- LOGICA DECADIMENTO GIORNALIERO ---
    // Ogni giorno i prezzi cambiano e il mercato si resetta
    if (global.market.lastReset !== oggi) {
        global.market.lastReset = oggi
        global.market.prezzi = {
            '1': Math.floor(Math.random() * 15) + 5,
            '2': Math.floor(Math.random() * 40) + 20,
            '3': Math.floor(Math.random() * 80) + 50,
            '4': Math.floor(Math.random() * 150) + 90
        }
        global.market.bancaSpaccino = 0 
    }

    // Inizializzazione Database Utente
    global.db.data.users[user] = global.db.data.users[user] || {}
    let dbUser = global.db.data.users[user]

    // --- COMANDO .SPACCINO (MENU) ---
    if (command === 'spaccino') {
        let menu = `ㅤ⋆｡˚『 ╭ \`🍀 MERCATO NERO 🍀\` ╯ 』˚｡⋆\n╭\n`
        menu += `│ 『 🚬 』 *1. Erba* ➔ ${global.market.prezzi['1']}€\n`
        menu += `│ 『 🍋 』 *2. Haze* ➔ ${global.market.prezzi['2']}€\n`
        menu += `│ 『 🍫 』 *3. Resina* ➔ ${global.market.prezzi['3']}€\n`
        menu += `│ 『 👺 』 *4. Amnesia* ➔ ${global.market.prezzi['4']}€\n`
        menu += `│ ──────────────────\n`
        menu += `│ 『 📊 』 \`Profitto Totale:\` ${global.market.bancaSpaccino}€\n`
        menu += `│ 『 🛒 』 Usa: \`${usedPrefix}compra <numero>\`\n`
        menu += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        return m.reply(menu)
    }

    // --- COMANDO .COMPRA (BUSINESS) ---
    if (command === 'compra') {
        if (!text) return m.reply(`📦 Specifica il numero del prodotto!`)
        const nomi = { '1': 'Erba', '2': 'Haze', '3': 'Resina', '4': 'Amnesia' }
        let p = global.market.prezzi[text]
        
        if (!p) return m.reply('❌ Prodotto inesistente.')
        if (dbUser.euro < p) return m.reply(`📉 Non hai abbastanza euro!`)

        // Transazione
        dbUser.euro -= p
        global.market.bancaSpaccino += p // Lo spaccino incassa il profitto
        dbUser.droga = { tipo: nomi[text], qualita: parseInt(text) }

        return m.reply(`✅ Hai comprato *${nomi[text]}* per **${p}€**.\nUsa \`.fuma\` per sbloccare i bonus!`)
    }

    // --- COMANDO .FUMA (EFFETTI REALI) ---
    if (command === 'fuma') {
        if (!dbUser.droga) return m.reply('🤷‍♂️ Non hai nulla in tasca.')

        let qualita = dbUser.droga.qualita
        let tipo = dbUser.droga.tipo

        // Generazione Effetto/Bonus
        let bonusExp = qualita * 50
        let protezione = qualita > 2 ? true : false // Se compri roba alta, sei protetto dai furti

        dbUser.exp = (dbUser.exp || 0) + bonusExp
        if (protezione) dbUser.lastShield = Date.now() + (3600000 * qualita) // Scudo per X ore

        // CANVAS (Stile Battaglia Navale)
        const canvas = createCanvas(500, 200)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 500, 200)
        
        // Bordi colorati in base alla qualità
        const colori = ['#55ff55', '#ffff55', '#ffaa00', '#ff0000']
        ctx.strokeStyle = colori[qualita-1]; ctx.lineWidth = 10
        ctx.strokeRect(5, 5, 490, 190)

        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'
        ctx.fillText(`EFFETTO: ${tipo.toUpperCase()}`, 250, 80)
        
        ctx.fillStyle = colori[qualita-1]; ctx.font = '20px Arial'
        ctx.fillText(`+${bonusExp} EXP SBLOCCATA`, 250, 130)
        if (protezione) ctx.fillText(`🛡️ SCUDO ANTIPULA ATTIVO`, 250, 160)

        let cap = `ㅤ⋆｡˚『 ╭ \`🌬️ TI SEI FATTO UN GIRO\` ╯ 』˚｡⋆\n╭\n`
        cap += `│ 『 ✨ 』 \`Bonus:\` +${bonusExp} EXP\n`
        cap += `│ 『 🛡️ 』 \`Protezione:\` ${protezione ? 'ATTIVA' : 'ASSENTE'}\n`
        cap += `│ ──────────────────\n`
        cap += `│ *${protezione ? 'Nessuno può derubarti per un po\'.' : 'Occhio, sei vulnerabile!'}*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        delete dbUser.droga // Consumata
        return conn.sendMessage(chat, { image: canvas.toBuffer(), caption: cap, footer }, { quoted: m })
    }
}

handler.help = ['spaccino', 'compra', 'fuma']
handler.tags = ['giochi']
handler.command = /^(spaccino|compra|fuma)$/i
handler.group = true

export default handler
