globalThis.abbracciRank = globalThis.abbracciRank || {};

let handler = async (m, { conn }) => {

  let sender = m.sender;
  let target = null;

  // Identificazione del destinatario (menzione o risposta)
  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno a cui vuoi dare un abbraccio! 🤗");
  }

  const frasi = [
    `@${sender.split("@")[0]} dà un fortissimo abbraccio a @${target.split("@")[0]}! 🤗`,
    `@${sender.split("@")[0]} ha deciso di regalare un abbraccio affettuoso a @${target.split("@")[0]}! ✨`,
    `Che bella scena! @${sender.split("@")[0]} sta abbracciando @${target.split("@")[0]}! 💖`,
    `Un abbraccio virtuale da parte di @${sender.split("@")[0]} per @${target.split("@")[0]}! 🌈`,
    `@${sender.split("@")[0]} corre verso @${target.split("@")[0]} e lo stringe in un grande abbraccio! 🫂`
  ];

  const fraseRandom = frasi[Math.floor(Math.random() * frasi.length)];

  // Aggiornamento Ranking Abbracci
  if (!globalThis.abbracciRank[target]) globalThis.abbracciRank[target] = 0;
  globalThis.abbracciRank[target] += 1;

  const testoFinale = `${fraseRandom}\n\n🫂 Abbracci totali ricevuti da @${target.split("@")[0]}: ${globalThis.abbracciRank[target]}`;

  await conn.sendMessage(
    m.chat,
    {
      text: testoFinale,
      mentions: [sender, target]
    },
    { quoted: m }
  );

};

handler.help = ['abbraccia'];
handler.tags = ['giochi'];
handler.command = /^(abbraccia|hug)$/i;
handler.group = true;
handler.botAdmin = false;
handler.fail = null;

export default handler;
