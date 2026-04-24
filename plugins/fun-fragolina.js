let handler = async (m, { conn }) => {
    // Messaggio estetico in stile ELIXIR/MOMO SYSTEM
    let message = `
` + '`[🍓] FRAGOLINA_REPRIMAND`' + `
` + '`--------------------------`' + `
` + '`> STATUS:` *⚠️ ULTIMATUM ATTIVO*
` + '`> ALERT:` *Comportamento Animale Rilevato*
` + '`--------------------------`' + `

*SE CONTINUATE A LITIGARE COME DELLE BESTIE NONOSTANTE I RICHIAMI, IL SISTEMA VERRÀ SIGILLATO.* 🔒

` + '`> AZIONE:` *Chiusura Totale Gruppo*
` + '`> NOTA:` *E vi beccate pure la ramanzina.* 🍓

` + '`--------------------------`' + `
` + '`[!] Ultimo avvertimento prima del LOCKDOWN.`'

    await conn.sendMessage(m.chat, {
        text: message,
        contextInfo: {
            externalAdReply: {
                title: '🍓 FRAGOLINA: SYSTEM_WARNING',
                body: 'Smettetela di fare casino o blocco tutto.',
                thumbnailUrl: 'https://qu.ax', // Puoi cambiare questa immagine con una fragola se preferisci
                sourceUrl: '𝕸𝕺𝕸𝕺 𝕭𝕺𝕿',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['fragolina']
handler.tags = ['staff']
handler.command = /^(fragolina)$/i

handler.group = true
handler.admin = true // Solo gli admin possono lanciare questo comando

export default handler
