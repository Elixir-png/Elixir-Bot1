import { createCanvas } from 'canvas';

globalThis.baciRank = globalThis.baciRank || {};

let handler = async (m, { conn }) => {
  let sender = m.sender;
  let target = null;

  // Identificazione del destinatario (menzione o risposta)
  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno o rispondere al suo messaggio per dargli un bacio! 💋");
  }

  // 1. Creazione dell'immagine con Canvas
  const canvas = createCanvas(400, 200);
  const ctx = canvas.getContext('2d');
  
  // Disegno labbra stilizzate
  ctx.fillStyle = '#ff0040'; 
  ctx.beginPath(); // Labbro superiore
  ctx.ellipse(200, 100, 80, 40, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#cc0033';
  ctx.beginPath(); // Labbro inferiore
  ctx.ellipse(200, 110, 80, 40, 0, 0, Math.PI);
  ctx.fill();

  const buffer = canvas.toBuffer();

  // 2. Logica Frasi e Ranking
  const frasi = [
    `@${sender.split("@")[0]} ha dato un bacio appassionato a @${target.split("@")[0]}! 💋`,
    `@${sender.split("@")[0]} ha stampato un bacio sulla guancia di @${target.split("@")[0]}! 😊`,
    `Che romantici! @${sender.split("@")[0]} bacia con dolcezza @${target.split("@")[0]}! ✨`,
    `@${sender.split("@")[0]} lancia un bacio volante a @${target.split("@")[0]}! 😙💨`,
    `Un bacio rubato! @${sender.split("@")[0]} ha baciato all'improvviso @${target.split("@")[0]}! 😳`
  ];

  const fraseRandom = frasi[Math.floor(Math.random() * frasi.length)];

  if (!globalThis.baciRank[target]) globalThis.baciRank[target] = 0;
  globalThis.baciRank[target] += 1;

  const testoFinale = `${fraseRandom}\n\n💋 Baci totali ricevuti da @${target.split("@")[0]}: ${globalThis.baciRank[target]}`;

  // 3. Invio Messaggio con Immagine
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

handler.help = ['bacia'];
handler.tags = ['giochi'];
handler.command = /^(bacia|kiss)$/i;
handler.group = true;

export default handler;
