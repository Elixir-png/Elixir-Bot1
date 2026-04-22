import fetch from 'node-fetch'

// Funzione per generare un account mail.tm
async function createMailTmAccount() {
  const domainRes = await fetch('https://mail.tm')
  const domainData = await domainRes.json()
  const domain = domainData['hydra:member'][0].domain

  const local = Math.random().toString(36).substring(2, 10)
  const email = `${local}@${domain}`
  const password = Math.random().toString(36).substring(2, 10)

  const res = await fetch('https://mail.tm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: email, password })
  })
  if (!res.ok) return null

  const loginRes = await fetch('https://mail.tm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: email, password })
  })
  const loginData = await loginRes.json()
  return { email, password, token: loginData.token }
}

// Funzioni di recupero messaggi
async function fetchMailTmMessages(token) {
  const res = await fetch('https://mail.tm', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.ok ? (await res.json())['hydra:member'] || [] : []
}

async function fetchMailTmMessageContent(id, token) {
  const res = await fetch(`https://mail.tm/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.ok ? await res.json() : null
}

let handler = async (m, { command, conn, text }) => {
  const userJid = m.sender
  global.db.data.users[userJid] = global.db.data.users[userJid] || {}
  const user = global.db.data.users[userJid]

  switch (command) {
    case 'permamail':
    case 'creamail': {
      if (user.mailAccount) {
        return m.reply(
          `*───〔 ✧ 𝐄𝐋𝐈𝐗𝐈𝐑 𝐌𝐀𝐈𝐋 ✧ 〕───*\n\n` +
          `✨ Hai già un indirizzo attivo:\n` +
          `📧 *${user.mailAccount.email}*\n\n` +
          `📩 Usa *.mail* per leggere i messaggi.\n` +
          `🗑️ Usa *.delmail* per eliminarla e crearne una nuova.`
        )
      }

      const account = await createMailTmAccount()
      if (!account) return m.reply('『 ❌ 』 Errore durante la generazione del server mail.')

      user.mailAccount = account
      
      return m.reply(
        `*───〔 ✧ 𝐄𝐋𝐈𝐗𝐈𝐑 𝐌𝐀𝐈𝐋 ✧ 〕───*\n\n` +
        `✅ *Indirizzo Permanente Creato!*\n\n` +
        `📧 *EMAIL:* ${account.email}\n` +
        `🔑 *PWD:* ${account.password}\n\n` +
        `📩 Usa *.mail* per controllare la posta.\n` +
        `💡 _I dati sono salvati nel tuo profilo Elixir._`
      )
    }

    case 'mail': {
      if (!user.mailAccount) 
        return m.reply('『 ❌ 』 Non possiedi ancora una mail. Creala con *.permamail*')

      const account = user.mailAccount
      const args = text.trim().split(/\s+/)

      if (!text) {
        const messages = await fetchMailTmMessages(account.token)
        if (messages.length === 0) return m.reply(`📭 Posta in arrivo vuota per:\n*${account.email}*`)

        let list = `*───〔 📥 𝐄𝐋𝐈𝐗𝐈𝐑 𝐈𝐍𝐁𝐎𝐗 〕───*\n\n`
        messages.slice(0, 10).forEach(msg => {
          list += `🆔 *ID:* ${msg.id.slice(0,6)}\n` +
                  `👤 *Da:* ${msg.from.address}\n` +
                  `📌 *Oggetto:* ${msg.subject}\n` +
                  `───────────────\n`
        })
        list += `\n🔍 Usa *.mail <ID>* per leggere il messaggio.`
        return m.reply(list)
      } else {
        const id = args[0]
        const messages = await fetchMailTmMessages(account.token)
        const msg = messages.find(m => m.id.startsWith(id))
        
        if (!msg) return m.reply('『 ❌ 』 Messaggio non trovato.')

        const content = await fetchMailTmMessageContent(msg.id, account.token)
        if (!content) return m.reply('『 ❌ 』 Impossibile caricare il contenuto.')

        return m.reply(
          `*───〔 ✉️ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈𝐎 〕───*\n\n` +
          `👤 *Da:* ${content.from.address}\n` +
          `📌 *Oggetto:* ${content.subject}\n\n` +
          `📝 *Testo:*\n${content.text || content.textHtml || '[Vuoto]'}`
        )
      }
    }

    case 'delmail': {
      if (!user.mailAccount) return m.reply('『 ❌ 』 Non hai alcuna mail da eliminare.')
      
      delete user.mailAccount
      return m.reply(`*───〔 ✧ 𝐄𝐋𝐈𝐗𝐈𝐑 𝐒𝐘𝐒𝐓𝐄𝐌 ✧ 〕───*\n\n🗑️ Indirizzo email eliminato correttamente.\n✨ Ora puoi crearne uno nuovo con *.permamail*`)
    }
  }
}

handler.command = ['permamail', 'creamail', 'mail', 'delmail']
handler.tags = ['strumenti']
handler.help = ['permamail', 'mail', 'delmail']

export default handler
