let handler = async (m, { conn }) => {
  let target = null;

  // 1. Identifica il target (chi riceve l'aura)
  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0]; // Se c'è un tag @user
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;   // Se è una risposta a un messaggio
  } else {
    target = m.sender;          // Se non c'è nulla, il target è chi scrive
  }

  // 2. Generatore di Aura con percentuali "super random"
  const generateAura = () => {
    const roll = Math.random() * 100;
    if (roll < 0.05) return Math.floor(Math.random() * 999999999); // 0.05% Divino
    if (roll < 1) return Math.floor(Math.random() * 1000000);      // 1% Leggendario
    if (roll < 10) return Math.floor(Math.random() * 50000);       // 9% Epico
    if (roll < 40) return Math.floor(Math.random() * 5000);        // 30% Raro
    return Math.floor(Math.random() * 500);                       // 60% Comune
  };

  const auraValue = generateAura();
  const pushName = target.split("@")[0];

  // 3. Costruzione del messaggio
  let messaggio = `✨ L'Aura di @${pushName} è di: *${auraValue.toLocaleString()}*`;
  
  if (auraValue > 1000000) messaggio += `\n\n👑 *Incredibile! Un'aura leggendaria!*`;
  if (auraValue === 0) messaggio += `\n\n💀 *Zero aura... che imbarazzo.*`;

  await conn.sendMessage(
    m.chat,
    {
      text: messaggio,
      mentions: [target]
    },
    { quoted: m }
  );
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i; // Risponde esattamente a .aura (o !aura / /aura a seconda dei prefissi)
handler.group = true; // Funziona nei gruppi

export default handler;
