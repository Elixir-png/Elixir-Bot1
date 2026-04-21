let handler = async (m, { conn }) => {
  let target = null;

  // Identifica il target (Tag, Risposta o se stesso)
  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    target = m.sender;
  }

  const pushName = target.split("@")[0];

  // 1. Invia il messaggio iniziale e salva la "key" per modificarlo
  let { key } = await conn.sendMessage(m.chat, { 
    text: `🔍 *Analisi frequenza aura per @${pushName}...*`,
    mentions: [target] 
  }, { quoted: m });

  // 2. Sequenza di caricamento (modifica lo stesso messaggio)
  const frames = [
    "✨ ▒▒▒▒▒▒▒▒▒▒ 10%",
    "✨ ███▒▒▒▒▒▒▒ 35%",
    "✨ ██████▒▒▒▒ 60%",
    "✨ █████████▒ 90%",
    "✨ ██████████ 100%",
    "🔮 **ANALISI COMPLETATA** 🔮"
  ];

  for (let frame of frames) {
    // Aspetta un breve istante tra un frame e l'altro
    await new Promise(resolve => setTimeout(resolve, 350)); 
    await conn.sendMessage(m.chat, { text: frame, edit: key, mentions: [target] });
  }

  // 3. Calcolo Aura
  const generateAura = () => {
    const roll = Math.random() * 100;
    if (roll < 0.1) return Math.floor(Math.random() * 1000000000); 
    if (roll < 5) return Math.floor(Math.random() * 1000000);      
    if (roll < 30) return Math.floor(Math.random() * 50000);       
    return Math.floor(Math.random() * 5000);                      
  };

  const auraValue = generateAura();
  
  let rank = "";
  let emoji = "";
  if (auraValue > 1000000) { rank = "DIVINITÀ"; emoji = "🌌"; }
  else if (auraValue > 50000) { rank = "ELITE"; emoji = "💎"; }
  else if (auraValue > 5000) { rank = "GUERRIERO"; emoji = "⚔️"; }
  else { rank = "PLEBEO"; emoji = "🍂"; }

  // 4. Risultato finale (modifica finale del messaggio)
  const report = `
┏━━━━━━━━━━━━━━┓
  ${emoji} **REPORT AURA** ${emoji}
┗━━━━━━━━━━━━━━┛
👤 **Utente:** @${pushName}
🌀 **Aura:** ${auraValue.toLocaleString()}
📊 **Rango:** ${rank}
━━━━━━━━━━━━━━━`.trim();

  // Pausa finale prima di mostrare il risultato
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await conn.sendMessage(m.chat, { 
    text: report, 
    edit: key, 
    mentions: [target] 
  });
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
