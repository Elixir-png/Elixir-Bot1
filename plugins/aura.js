import crypto from 'crypto';

let handler = async (m, { conn }) => {
  let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
               (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

  const pushName = target.split("@")[0];
  
  // 1. Primo messaggio: Scansione
  let { key } = await conn.sendMessage(m.chat, { 
    text: `🔍 *Analisi Aura per @${pushName}...*`,
    mentions: [target] 
  }, { quoted: m });

  // Funzione per aggiornare il messaggio in sicurezza
  const editMsg = async (txt) => {
    return await conn.sendMessage(m.chat, { text: txt, edit: key, mentions: [target] }).catch(e => null);
  };

  // 2. Animazione semplificata (3 step rapidi per evitare blocchi)
  await new Promise(r => setTimeout(r, 800));
  await editMsg("✨ [ ████▒▒▒▒▒▒ ] 40%");
  
  await new Promise(r => setTimeout(r, 800));
  await editMsg("✨ [ ████████▒▒ ] 80%");

  // 3. Calcolo Aura (Random o Fisso per oggi)
  const date = new Date().toISOString().slice(0, 10);
  const seed = `${target}-${date}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  const auraValue = parseInt(hash.slice(0, 8), 16) % 1000000; 

  let rank = auraValue > 800000 ? "👑 DIVINITÀ" : (auraValue > 400000 ? "💎 ELITE" : "⚔️ GUERRIERO");

  // 4. Risultato finale
  const finalReport = `
┏━━━━━━━━━━━━━━┓
   ✨ **REPORT AURA** ✨
┗━━━━━━━━━━━━━━┛
👤 **Target:** @${pushName}
🌀 **Valore:** ${auraValue.toLocaleString()}
📊 **Rango:** ${rank}
━━━━━━━━━━━━━━━`.trim();

  await new Promise(r => setTimeout(r, 800));
  await editMsg(finalReport);
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
