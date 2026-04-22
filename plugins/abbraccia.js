import { createCanvas } from 'canvas';

globalThis.abbracciRank = globalThis.abbracciRank || {};

let handler = async (m, { conn }) => {
  let sender = m.sender;
  let target = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno a cui vuoi dare un abbraccio! 🤗");
  }

  // --- CREAZIONE CANVAS ABBRACCIO ---
  const canvas = createCanvas(500, 300);
  const ctx = canvas.getContext('2d');

  // Sfondo semplice (chiaro)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 500, 300);

  // Disegno stilizzato di due persone che si abbracciano
  // Persona 1 (Azzurro)
  ctx.fillStyle = '#3498db';
  ctx.beginPath();
  ctx.arc(210, 120, 40, 0, Math.PI * 2); // Testa 1
  ctx.fill();
  
  // Persona 2 (Rosa/Arancio)
  ctx.fillStyle = '#e67e22';
  ctx.beginPath();
  ctx.arc(290, 120, 40, 0, Math.PI * 2); // Testa 2
  ctx.fill();

  // Braccia (Arco che unisce)
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(250, 180, 80, 0, Math.PI, true); // Abbraccio
  ctx.stroke();

  const buffer = canvas.toBuffer();

  // --- LOGICA FRASI E RANKING ---
  const frasi = [
    `@${sender.split("@")[0]} dà un fortissimo abbraccio a @${target.split("@")[0]}! 🤗`,
    `@${sender.split("@")} ha deciso di regalare un abbraccio affettuoso a @${target.split("@")[0]}! ✨`,
    `Un abbraccio virtuale da parte di @${sender.split("@")[0]} per @${target.split("@")[0]}! 🌈`,
    `@${sender.split("@")[0]} corre verso @${target.split("@")[0]} e lo stringe forte! 🫂`
  ];

  const fraseRandom = frasi[Math.floor(Math.random() * frasi.length)];

  if (!globalThis.abbracciRank[target]) globalThis.abbracciRank[target] = 0;
  globalThis.abbracciRank[target] += 1;

  const testoFinale = `${fraseRandom}\n\n🫂 Abbracci totali ricevuti da @${target.split("@")[0]}: ${globalThis.abbracciRank[target]}`;

  await conn.sendMessage(
    m.chat,
    {
      image: buffer,
      caption: testoFinale,
      mentions: [sender, target]
    },
    { quoted: m }
  );
};

handler.help = ['abbraccia'];
handler.tags = ['giochi'];
handler.command = /^(abbraccia|hug)$/i;
handler.group = true;

export default handler;
