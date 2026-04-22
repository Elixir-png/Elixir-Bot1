import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const start = process.hrtime.bigint()
    await conn.readMessages([m.key])
    const end = process.hrtime.bigint()
    
    const latency = (Number(end - start) / 1000000).toFixed(3)
    const uptimeMs = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)

    const botStartTime = new Date(Date.now() - uptimeMs)
    const activationTime = botStartTime.toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const message = `
*ᴇʟɪxɪʀʙᴏᴛ* — ꜱʏꜱᴛᴇᴍ ʀᴇᴘᴏʀᴛ

  ✧ ʟᴀᴛᴇɴᴢᴀ: \`${latency} ms\`
  ✧ ᴜᴘᴛɪᴍᴇ: \`${uptimeStr}\`
  ✧ ᴀᴠᴠɪᴏ: \`${activationTime}\`

*ꜱᴛᴀᴛᴜꜱ:* ᴏɴʟɪɴᴇ
*ᴏᴡɴᴇʀ:* ᴇʟɪxɪʀ`.trim()

    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: `ᴇʟɪxɪʀʙᴏᴛ • ᴘᴇʀꜰᴏʀᴍᴀɴᴄᴇ`,
          body: `ʟᴀᴛᴇɴᴢᴀ ᴀᴛᴛᴜᴀʟᴇ: ${latency}ms`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: false,
          sourceUrl: ''
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
