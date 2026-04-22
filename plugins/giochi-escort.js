import { getDevice } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Fix identificazione: controlla menzioni, poi risposta, poi se stesso
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
  
  let nome = await conn.getName(who);
  
  await m.reply('🔍 *Analisi dei pacchetti in corso...*');

  const realDeviceInfo = await getRealDeviceInfo(m, conn, who);
  const fakeData = generateFakeData(realDeviceInfo);
  
  // Passiamo il JID intero alla funzione format per creare il tag corretto
  const doxMessage = formatDoxMessage(nome, fakeData, realDeviceInfo, who);
  
  await conn.sendMessage(m.chat, { 
    text: doxMessage, 
    mentions: [who] // Questa riga rende il tag blu e cliccabile
  }, { quoted: m });
};

handler.help = ['dox'];
handler.tags = ['giochi'];
handler.command = /^dox/i;

export default handler;

// === FUNZIONI HELPER (Fixate) ===

async function getRealDeviceInfo(m, conn, target) {
  let numeroTelefono = target.split('@')[0];
  let msgId = m.quoted ? m.quoted.id : m.key.id;
  let rawDevice = getDevice(msgId);
  
  let deviceModel = '';
  switch(rawDevice) {
    case 'android': deviceModel = pickRandom(['Samsung Galaxy S23 Ultra', 'Xiaomi 13 Pro', 'Google Pixel 8', 'OnePlus 11']); break;
    case 'ios': deviceModel = pickRandom(['iPhone 15 Pro Max', 'iPhone 14', 'iPhone 13 Mini']); break;
    case 'web': deviceModel = 'WhatsApp Web (Chrome/Win10)'; break;
    default: deviceModel = 'PC Desktop (Windows 11)';
  }

  return {
    numero: `+${numeroTelefono.substring(0, 2)} ${numeroTelefono.substring(2, 5)} *** **`,
    modello: deviceModel,
    rawDevice
  };
}

function generateFakeData(realInfo) {
  return {
    ip: `151.42.${randomInt(1, 255)}.${randomInt(1, 255)}`,
    mac: `${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`,
    isp: pickRandom(['TIM SpA', 'Vodafone Italia', 'Wind Tre S.p.A', 'Fastweb']),
    citta: pickRandom(['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova']),
    batteria: `${randomInt(5, 98)}%`,
    archiviazione: `${randomInt(40, 90)}% pieno`,
    lat: (41.8 + Math.random()).toFixed(4),
    lon: (12.4 + Math.random()).toFixed(4)
  };
}

function formatDoxMessage(nome, data, realInfo, who) {
  // Il segreto è usare @ + il numero estratto dal JID
  return `*[ ✔ ] DOX COMPLETATO PER @${who.split('@')[0]}*

*🎯 DATI PERSONALI:*
• *Nome:* ${nome}
• *Numero:* ${realInfo.numero}
• *Codice Fiscale:* ${generateFakeCF()}
• *Email:* ${nome.toLowerCase().replace(/ /g, '.')}@gmail.com

*📱 DISPOSITIVO:*
• *Modello:* ${realInfo.modello}
• *Batteria:* ${data.batteria}
• *Storage:* ${data.archiviazione}
• *WhatsApp:* v2.24.${randomInt(10, 80)}

*🌐 RETE & POSIZIONE:*
• *IP:* ${data.ip}
• *MAC:* ${data.mac}
• *ISP:* ${data.isp}
• *Città:* ${data.citta}
• *Coordinate:* ${data.lat}, ${data.lon}

*⚠️ VULNERABILITÀ:*
• *Porte aperte:* 80, 443, 8080
• *Rischio Ban:* Basso
• *Sicurezza:* WPA2-PSK`.trim();
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomHex() { return Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0'); }
function generateFakeCF() { 
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = '';
  for(let i=0; i<16; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}
