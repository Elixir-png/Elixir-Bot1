// by elixir
// Codice di tools-cur.js

//Plugin fatto da Axtral_WiZaRd
import Jimp from 'jimp'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const USERS_FILE = path.join(__dirname, '..', 'lastfm_users.json')


if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}')

const LASTFM_API_KEY = '36f859a1fc4121e7f0e931806507d5f9'


function getLastfmUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
}

function saveLastfmUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

function getLastfmUsername(userId) {
  const users = getLastfmUsers()
  return users[userId] || null
}

function setLastfmUsername(userId, username) {
  const users = getLastfmUsers()
  users[userId] = username
  saveLastfmUsers(users)
}


async function getRecentTrack(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
  const res = await fetch(url)
  const json = await res.json()
  return json?.recenttracks?.track?.[0]
}

async function getRecentTracks(username, limit = 5) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`
  const res = await fetch(url)
  const json = await res.json()
  return json?.recenttracks?.track || []
}

async function getTrackInfo(username, artist, track) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&username=${username}&format=json`
  const res = await fetch(url)
  const json = await res.json()
  return json?.track
}


async function generateTrackImage(track) {
  const width = 600
  const height = 600
  const imageUrl = track.image?.find(img => img.size === 'extralarge')?.['#text'] || 'https://via.placeholder.com/600x500'

  const img = await Jimp.read(imageUrl)
  img.cover(width, height)

  return await img.getBufferAsync(Jimp.MIME_JPEG)
}


const handler = async (m, { conn, args, usedPrefix, text, command }) => {
  if (command === 'setuser') {
    const username = text.trim()
    if (!username) {
      await conn.sendMessage(m.chat, { text: `❌ 𝐔𝐬𝐚 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐜𝐨𝐬𝐢̀: ${usedPrefix}setuser <username>` })
      return
    }

    setLastfmUsername(m.sender, username)
    await conn.sendMessage(m.chat, { text: `✅ 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 *${username}* 𝐬𝐚𝐥𝐯𝐚𝐭𝐨!` })
    return
  }

  const user = getLastfmUsername(m.sender)
  if (!user) {
    await conn.sendMessage(m.chat, {
      text: `🎵 𝐃𝐞𝐯𝐢 𝐫𝐞𝐠𝐢𝐬𝐭𝐚𝐫𝐞 𝐢𝐥 𝐭𝐮𝐨 𝐮𝐬𝐞𝐫𝐧𝐚𝐦𝐞 Last.fm 𝐜𝐨𝐧:\n${usedPrefix}setuser <tuo_username>`,
    })
    return
  }

  if (command === 'cur') {
    const track = await getRecentTrack(user)
    if (!track) return conn.sendMessage(m.chat, { text: '❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐭𝐫𝐚𝐜𝐜𝐢𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.' })

    const detailedTrack = await getTrackInfo(user, track.artist['#text'], track.name)
    const userPlaycount = parseInt(detailedTrack?.userplaycount) || 0
    const globalPlaycount = parseInt(detailedTrack?.playcount) || 0
    const globalListeners = parseInt(detailedTrack?.listeners) || 0

    const caption = track['@attr']?.nowplaying === 'true'
      ? `🎧 𝐈𝐧 𝐫𝐢𝐩𝐫𝐨𝐝𝐮𝐳𝐢𝐨𝐧𝐞 𝐨𝐫𝐚 • @${m.sender.split('@')[0]}\n\n` +
        `🎵 *${track.name}*\n🎤 ${track.artist['#text']}\n💿 ${track.album?.['#text'] || '𝐀𝐥𝐛𝐮𝐦 𝐬𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'}\n\n` +
        `📊 ${userPlaycount} 𝐬𝐜𝐫𝐨𝐛𝐛𝐥𝐞 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐢\n🔁 ${globalPlaycount.toLocaleString()} 𝐠𝐥𝐨𝐛𝐚𝐥𝐢 • 🌍 ${globalListeners.toLocaleString()} 𝐚𝐬𝐜𝐨𝐥𝐭𝐚𝐭𝐨𝐫𝐢\n\n> 𝐁𝐲 𝔸𝕩𝕥𝕣𝕒𝕝_𝕎𝕚ℤ𝕒ℝ𝕕`
      : `⏹️ 𝐔𝐥𝐭𝐢𝐦𝐨 𝐛𝐫𝐚𝐧𝐨 𝐝𝐢 @${m.sender.split('@')[0]}:\n\n` +
        `🎵 *${track.name}*\n🎤 ${track.artist['#text']}\n💿 ${track.album?.['#text'] || '𝐀𝐥𝐛𝐮𝐦 𝐬𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'}\n\n` +
        `📊 ${userPlaycount} 𝐬𝐜𝐫𝐨𝐛𝐛𝐥𝐞 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐢\n🔁 ${globalPlaycount.toLocaleString()} 𝐠𝐥𝐨𝐛𝐚𝐥𝐢 • 🌍 ${globalListeners.toLocaleString()} 𝐚𝐬𝐜𝐨𝐥𝐭𝐚𝐭𝐨𝐫𝐢\n\n> 𝐁𝐲 𝔸𝕩𝕥𝕣𝕒𝕝_𝕎𝕚ℤ𝕒ℝ𝕕`

    const buffer = await generateTrackImage(track)
    await conn.sendMessage(m.chat, { image: buffer, caption, mentions: conn.parseMention(caption) })
    return
  }

  if (command === 'cronologia') {
    const tracks = await getRecentTracks(user, 5)
    if (!tracks.length) return conn.sendMessage(m.chat, { text: '❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐜𝐫𝐨𝐧𝐨𝐥𝐨𝐠𝐢𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.' })

    const trackList = tracks.map((t, i) => {
      const icon = t['@attr']?.nowplaying === 'true' ? '▶️' : `${i + 1}.`
      return `${icon} ${t.name}\n   🎤 ${t.artist['#text']}`
    }).join('\n\n')

    const cron = `📜 *𝐂𝐫𝐨𝐧𝐨𝐥𝐨𝐠𝐢𝐚 𝐝𝐢 ${user}*\n\n${trackList}`
    await conn.sendMessage(m.chat, { text: cron })
    return
  }
}

handler.command = ['setuser', 'cur', 'cronologia']
handler.group = true

export default handler
