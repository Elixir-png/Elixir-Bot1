import { execSync } from 'child_process'

let handler = async (m, { conn, text }) => {
  // Verifica se l'utente è autorizzato (proprietario/bot stesso)
  if (conn.user.jid !== conn.user.jid) return 

  try {
    await m.react('⏳')
    
    // Sincronizzazione con il repository remoto
    execSync('git fetch')
    let status = execSync('git status -uno', { encoding: 'utf-8' })

    if (status.includes('Your branch is up to date') || status.includes('nothing to commit')) {
      await conn.reply(m.chat, '✅ *Il bot è già aggiornato all\'ultima versione.*', m)
      await m.react('✅')
      return
    }

    // Esecuzione dell'aggiornamento
    let updateOutput = execSync('git reset --hard && git pull' + (m.fromMe && text ? ' ' + text : ''), { encoding: 'utf-8' })
    
    // Estrazione statistiche (intersezioni/modifiche)
    let stats = parseGitStats(updateOutput)

    let message = `
🚀 *PLUGIN AGGIORNATO*: Update System

━━━━━━━━━━━━━━━━━━━━
${stats.insertions > 0 ? `➕ *Intersezioni aggiunte:* ${stats.insertions}` : ''}
${stats.deletions > 0 ? `➖ *Intersezioni rimosse:* ${stats.deletions}` : ''}
${stats.files > 0 ? `📂 *File modificati:* ${stats.files}` : ''}
━━━━━━━━━━━━━━━━━━━━

✅ *BLD BLOOD Bot aggiornato con successo!*`.trim()

    await conn.reply(m.chat, message, m)
    await m.react('🍥')

  } catch (err) {
    await conn.reply(m.chat, `❌ *ERRORE DURANTE L'AGGIORNAMENTO*\n\n> ${err.message}`, m)
    await m.react('❌')
  }
}

// Funzione Helper per formattare i dati di Git
function parseGitStats(output) {
  let files = (output.match(/(\d+) file(s)? changed/) || [0, 0])[1]
  let insertions = (output.match(/(\d+) insertion(s)?\(\+\)/) || [0, 0])[1]
  let deletions = (output.match(/(\d+) deletion(s)?\(-\)/) || [0, 0])[1]
  
  return {
    files: parseInt(files),
    insertions: parseInt(insertions),
    deletions: parseInt(deletions)
  }
}

handler.help = ['aggiorna']
handler.tags = ['creatore']
handler.command = ['aggiorna', 'update', 'aggiornabot']

export default handler
