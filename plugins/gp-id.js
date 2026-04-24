// Plug-in creato da elixir
var handler = async (m, { conn, groupMetadata }) => {
  const groupId = await groupMetadata.id
  console.log(`ID del gruppo: ${groupId}`) // Stampa nella console
  conn.reply(m.chat, `ⓘ 𝐋' 𝐢𝐝 𝐝𝐢 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐞' ${groupId}`, m)
}

handler.command = /^(id|gpid|gcid)$/i
handler.group = true
export default handler
