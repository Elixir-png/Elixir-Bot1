// Plug-in creato da elixir
let handler = async (m, { conn, isAdmin }) => {
    // Il comando ora è utilizzabile da qualsiasi Amministratore
    if (!isAdmin) return 

    let message = '`[🍓] FRAGOLINA_REPRIMAND`' + `\n` +
                  '`--------------------------`' + `\n` +
                  '`> STATUS:` *⚠️ ULTIMATUM ATTIVO*' + `\n` +
                  '`> ALERT:` *Instabilità Sociale Rilevata*' + `\n` +
                  '`--------------------------`' + `\n\n` +
                  '*SE CONTINUATE A LITIGARE COME DELLE BESTIE NONOSTANTE I RICHIAMI, IL SISTEMA VERRÀ SIGILLATO.* 🔒' + `\n\n` +
                  '`> AZIONE:` *Chiusura Totale Gruppo*' + `\n` +
                  '`> NOTA:` *E vi beccate pure la ramanzina.* 🍓' + `\n\n` +
                  '`--------------------------`' + `\n` +
                  '`[!] Ultimo avvertimento prima del LOCKDOWN.`'

    await conn.sendMessage(m.chat, {
        text: message,
        contextInfo: {
            externalAdReply: {
                title: '🍓 FRAGOLINA: SYSTEM_WARNING',
                body: 'Smettetela di fare casino o blocco tutto.',
                thumbnailUrl: 'https://qu.ax', 
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
handler.admin = true // Questo garantisce che solo gli admin del gruppo possano attivarlo

export default handler
