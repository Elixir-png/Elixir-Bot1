let handler = async (m, { conn }) => {
  let target = null;

  // Identifica il target
  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    target = m.sender;
  }

  const pushName = target.split("@")[0];

  // 1. Messaggio iniziale di "scansione"
  let { key } = await conn.sendMessage(m.chat, { 
    text: `🔍 Scansione dell'aura per @${pushName} in corso...`,
    mentions: [target] 
  }, { quoted: m });

  // 2. Animazione elegante (sequenza di messaggi)
  const frames = [
    "✨ ▒▒▒▒▒▒▒▒▒▒ 0%",
    "✨ █▒▒▒▒▒▒▒▒▒ 10%",
    "✨ ███▒▒▒▒▒▒▒ 30%",
    "✨ █████▒▒▒▒▒ 50%",
    "✨ ███████▒▒▒ 75%",
    "✨ ██████████ 100%",
    "🔮 **ANALISI COMPLETATA** 🔮"
  ];

  for (let frame of frames) {
    await new Promise(resolve => setTimeout(resolve, 400)); // Velocità dell'animazione
    await conn.sendMessage(m.chat, { text: frame, edit: key });
  }

  // 3. Calcolo Aura Super Random
  const generateAura = () => {
    const roll = Math.random() * 100;
    if (roll < 0.01) return Math.floor(Math.random() * 999999999999); // Divinità
    if (roll < 1) return Math.floor(Math.random() * 100000000);      // Leggendario
    if (roll < 10) return Math.floor(Math.random() * 500000);        // Epico
    if (roll < 40) return Math.floor(Math.random() * 10000);         // Raro
    return Math.floor(Math.random() * 1000);                         // Comune
  };

  const auraValue = generateAura();
  let rank = "";
  if (auraValue > 100000000) rank = "🌌 **LIVELLO: DIVINITÀ SUPREMA**";
  else if (auraValue > 1000000) rank = "👑 **LIVELLO: RE DELL'AURA**";
  else if (auraValue > 10000) rank = "💎 **LIVELLO: ELITE**";
  else if (auraValue > 1000) rank = "⚔️ **LIVELLO: GUERRIERO**";
  else rank = "🍂 **LIVELLO: PLEBEO**";

  // 4. Risultato Finale
  const messaggioFinale = `
┏━━━━━━━━━━━━━━┓
  ✨ **REPORT AURA** ✨
┗━━━━━━━━━━━━━━┛
👤 **Utente:** @${pushName}
🌀 **Aura:** ${auraValue.toLocaleString()}
📊 ${rank}
━━━━━━━━━━━━━━━`.trim();

  await conn.sendMessage(m.chat, { 
    text: messaggioFinale, 
    edit: key, 
    mentions: [target] 
  });
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
