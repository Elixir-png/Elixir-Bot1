import { createCanvas, loadImage, registerFont } from 'canvas';
import crypto from 'crypto';

let handler = async (m, { conn }) => {
  let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
               (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

  const pushName = target.split("@")[0];
  
  // Messaggio di attesa
  await conn.sendMessage(m.chat, { text: 🎨 Generando il report aura per @${pushName}..., mentions: [target] }, { quoted: m });

  // Calcolo logica (costante per il giorno stesso)
  const date = new Date().toISOString().slice(0, 10);
  const seed = ${target}-${date};
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  const auraValue = parseInt(hash.slice(0, 8), 16) % 1000000; 

  let rank = "GUERRIERO";
  let color = "#3498db"; // Blu
  if (auraValue > 400000) { rank = "ELITE"; color = "#9b59b6"; } // Viola
  if (auraValue > 800000) { rank = "DIVINITÀ"; color = "#f1c40f"; } // Oro

  // --- COSTRUZIONE CANVAS ---
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // 1. Sfondo sfumato
  const gradient = ctx.createLinearGradient(0, 0, 800, 400);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Decorazioni grafiche (Rettangolo bordo)
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, 760, 360);

  // 3. Testo Titolo
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('REPORT AURA', 50, 80);

  // 4. Info Utente
  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#bdc3c7';
  ctx.fillText(Utente: ${pushName}, 50, 150);

  // 5. Valore Aura
  ctx.font = 'bold 60px sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(${auraValue.toLocaleString()} pts, 50, 230);

  // 6. Barra dell'Aura (Background)
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(50, 260, 700, 40);

  // 7. Barra dell'Aura (Progresso)
  const barWidth = (auraValue / 1000000) * 700;
  ctx.fillStyle = color;
  ctx.fillRect(50, 260, barWidth, 40);

  // 8. Rango
  ctx.font = 'bold 35px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(rank, 750, 350);

  // Conversione in Buffer e invio
  const buffer = canvas.toBuffer('image/png');
  
  await conn.sendMessage(m.chat, { 
    image: buffer, 
    caption: ✨ Ecco il livello di aura di @${pushName} per oggi!,
    mentions: [target] 
  }, { quoted: m });
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
