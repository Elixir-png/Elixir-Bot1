import { createCanvas } from 'canvas';
import crypto from 'crypto';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
                 (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

    const pushName = conn.getName(target) || "User";
    
    await m.reply('🌀 *Analisi Aura in corso...*');

    const date = new Date().toISOString().slice(0, 10);
    const seed = `${target}-${date}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const auraValue = parseInt(hash.slice(0, 8), 16) % 1000000; 

    // Definizione Rank e Colori
    let rank, color;
    if (auraValue > 850000) {
      rank = "DIVINITÀ";
      color = "#FFD700"; 
    } else if (auraValue > 500000) {
      rank = "ELITE";
      color = "#A020F0";
    } else {
      rank = "GUERRIERO";
      color = "#00F2FF"; 
    }

    const width = 1000;
    const height = 562;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. SFONDO PULITO
    ctx.fillStyle = '#0a0b14';
    ctx.fillRect(0, 0, width, height);

    // Griglia molto tenue
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.03)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

    // 2. CORNICE NEON MINIMAL
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.shadowBlur = 0;

    // 3. INTESTAZIONE
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Sans-serif';
    ctx.fillText('AURA SYSTEM IDENTIFICATION', 70, 90);
    
    ctx.fillStyle = color;
    ctx.fillRect(70, 110, 450, 4);

    // 4. INFO UTENTE (Sostituisce i vecchi codici)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '30px Sans-serif';
    ctx.fillText(`SUBJECT: ${pushName.toUpperCase()}`, 70, 165);

    // 5. POWER POINTS
    const formattedAura = auraValue.toLocaleString();
    ctx.shadowBlur = 25;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = 'bold 130px Sans-serif';
    ctx.fillText(formattedAura, 70, 330);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 35px Sans-serif';
    const textWidth = ctx.measureText(formattedAura).width;
    ctx.fillText('POWER POINTS', 90 + textWidth, 315);

    // 6. BARRA DI CARICAMENTO
    // Sfondo barra (vuoto)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(70, 390, 860, 50, 5);
    ctx.fill();

    // Caricamento effettivo
    const barWidth = (auraValue / 1000000) * 860;
    const gradient = ctx.createLinearGradient(70, 0, 70 + barWidth, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#ffffff');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(70, 390, barWidth, 50, 5);
    ctx.fill();

    // 7. RANGO (In basso a destra)
    ctx.textAlign = 'right';
    ctx.font = 'italic bold 70px Sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(rank, 930, 510);

    const buffer = canvas.toBuffer();
    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `✅ *Analisi Completata*\n👤 *Soggetto:* @${target.split('@')[0]}\n📊 *Grado:* ${rank}`,
      mentions: [target] 
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Errore durante la generazione dell\'aura.');
  }
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
