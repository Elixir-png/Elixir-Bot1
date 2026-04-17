let handler = m => m
// Database temporaneo in memoria
const msgStorage = {}

handler.before = async function (m, { sock }) {
    if (!m) return
    const chat = m.chat
    const msgId = m.id || m.key.id

    // 1. SALVATAGGIO: Salva ogni messaggio in entrata
    // Ignoriamo i messaggi di eliminazione stessi
    if (!m.message?.protocolMessage) {
        msgStorage[msgId] = m
    }

    // 2. RILEVAMENTO ELIMINAZIONE
    if (m.message?.protocolMessage && m.message.protocolMessage.type === 0) {
        const deletedKey = m.message.protocolMessage.key
        const savedMsg = msgStorage[deletedKey.id]

        if (savedMsg) {
            const user = deletedKey.participant || deletedKey.remoteJid
            
            await sock.sendMessage(chat, { 
                text: `🚨 *ANTI-DELETE RILEVATO* 🚨\n\nL'utente @${user.split('@')[0]} ha eliminato un messaggio.`,
                mentions: [user]
            }, { quoted: savedMsg })

            // Inoltra il messaggio recuperato
            await sock.copyNForward(chat, savedMsg, true)

            // Pulizia per non intasare la RAM della VPS
            delete msgStorage[deletedKey.id]
        }
    }
    return true
}

export default handler
