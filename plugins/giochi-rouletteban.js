let handler = async (m, { conn, text, participants, usedPrefix }) => {
    const gAdmins = participants.filter(p => p.admin)
    const botId = conn.user.jid
    const gNoAdmins = participants.filter(p => p.id !== botId && !p.admin)

    if (gNoAdmins.length === 0) { 
        return m.reply('⚠️ *Errore:* Non ci sono utenti comuni (non admin) in questo gruppo.')
    }

    // Selezione casuale
    const randomUser = gNoAdmins[Math.floor(Math.random() * gNoAdmins.length)].id
    const probability = (100 / gNoAdmins.length).toFixed(2)
    
    // Messaggio con bottoni
    const sections = [
        {
            title: "⚖️ GIUDIZIO FINALE",
            rows: [
                { title: "✅ SÌ, ELIMINALO", rowId: `${usedPrefix}kick ${randomUser}`, description: `Espelli @${randomUser.split('@')[0]} dal gruppo.` },
                { title: "❌ NO, GRAZIA", rowId: `graziato`, description: "Annulla l'esecuzione e lascialo vivere." }
            ]
        }
    ]

    const listMessage = {
        text: `*┳━━━━━━━━━━━━━━━━┓*
*┃ 🎰 ROULETTE RUSSA 🎰 ┃*
*┻━━━━━━━━━━━━━━━━┛*

*🎯 BERSAGLIO:* @${randomUser.split('@')[0]}
*🎲 PROBABILITÀ:* ${probability}%
*💀 DESTINO:* In bilico...

_Admin, decidi il suo futuro usando i pulsanti qui sotto._`,
        footer: "ᴇʟɪxɪʀ ʙᴏᴛ • ꜱʏꜱᴛᴇᴍ ɢᴀᴍᴇ",
        mentions: [randomUser],
        buttons: [
            { buttonId: `${usedPrefix}kick ${randomUser}`, buttonText: { displayText: '✅ SÌ, ELIMINALO' }, type: 1 },
            { buttonId: `null`, buttonText: { displayText: '❌ NO, GRAZIA' }, type: 1 }
        ],
        headerType: 1
    }

    await conn.sendMessage(m.chat, listMessage, { quoted: m })
}

handler.help = ['rouletteban']
handler.tags = ['giochi']
handler.command = /^(kickrandom|rouletterussa|rban|rouletteban)$/i
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler
