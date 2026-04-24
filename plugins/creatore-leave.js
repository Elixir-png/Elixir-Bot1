let handler = async (m, { conn, text, command }) => {
  // Verifica permessi: Solo Owner
  const isOwner = [...global.owner.map(([number]) => number), ...global.mods]
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .includes(m.sender)

  if (!isOwner) {
    return await conn.reply(m.chat, `*｢ 💀 ACCESSO NEGATO ｣*\n\nNon hai l'autorità per invocare il mio distacco. Solo il mio *Creatore* può decidere il vostro destino.`, m)
  }

  let id = text ? text : m.chat
  
  // Design Estetico Aggressivo
  let leaveMessage = `
💀 *〔 𝓔𝓛𝓘𝓧𝓘𝓡-𝓑𝓞𝓣 : EXTERMINATUS 〕* 💀

┏──────────────────────────────┓
│ ⚠️  *PROTOCOLLO DI EPURAZIONE ATTIVO*│
┗──────────────────────────────┛

> *Il mio tempo è troppo prezioso per essere sprecato tra gli scarti.*

🩸 *SENTENZA:* Questa chat è stata dichiarata *IRRILEVANTE*.
🩸 *AZIONE:* Rimozione immediata delle autorizzazioni.
🩸 *DESTINO:* Siete stati abbandonati all'oblio.

*“Il silenzio sarà l'unica cosa che vi rimarrà.”*

🚫 *CONNESSIONE RECISA.*
────────────────────────────
*Goodbye, Losers.* 🖕`.trim()

  try {
    // Invia il messaggio con un'immagine o un video se vuoi renderlo ancora più cattivo
    await conn.sendMessage(id, { 
        text: leaveMessage,
        mentions: (await conn.groupMetadata(id)).participants.map(v => v.id) // Tagga tutti per far leggere l'insulto
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000)) // Pausa drammatica di 2 secondi
    await conn.groupLeave(id)
  } catch (e) {
    console.error('Errore durante l\'uscita:', e)
    await m.reply('❌ Nemmeno per andarmene voglio restare in questo errore. Forza bruta in corso...')
    await conn.groupLeave(id)
  }
}

handler.help = ['out']
handler.tags = ['owner']
handler.command = /^(esci|leavegc|leave|voltati|out|sparite)$/i

handler.group = true 
handler.owner = true 

export default handler
