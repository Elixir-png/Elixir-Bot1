import { createCanvas, registerFont } from 'canvas';
import crypto from 'crypto';

// Nota: Assicurati di avere i font installati sul sistema o usa registerFont
// Se sei su Linux/Heroku, i font standard come 'sans-serif' o 'Arial' funzioneranno.

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
                 (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

    const pushName = conn.getName(target) || "User";
    
    await m.reply('🌀 *Sincronizzazione con il Sistema Aura...*');

    const date = new Date().toISOString().slice(0, 10);
    const seed = `${target}-${date}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const auraValue = parseInt(hash.slice(0, 8), 16) % 1000000; 

    // Logica Rank migliorata per i testi dell'immagine
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

    const width = 1000; // Leggermente più largo per somigliare al formato dell'immagine
    const height = 562;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. SFONDO E GRIGLIA
    ctx.fillStyle = '#0a0b14';
    ctx.fillRect(0, 0, width, height);

    // Disegno griglia sottile
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=30) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    for(let i=0; i<height; i+=30) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

    // 2. CORNICE NEON DOPPIA
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    ctx.shadowBlur = 0; // Reset per non sfocare il testo
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, width - 50, height - 50);

    // 3. INTESTAZIONE (AURA SYSTEM)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 45px Arial';
    ctx.fillText('AURA SYSTEM IDENTIFICATION', 60, 85);
    
    ctx.fillStyle = color;
    ctx.fillRect(60, 105, 380, 5); // Linea sotto titolo

    // 4. CODICI IDENTIFICATIVI (I quadratini bianchi nell'immagine)
    ctx.font = '16px monospace';
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<6; i++) {
        let fakeCode = Math.random().toString(16).substring(2, 6).toUpperCase();
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(60 + (i * 65), 140, 60, 50);
        ctx.fillText('01D', 70 + (i * 65), 160);
        ctx.fillText(fakeCode, 70 + (i * 65), 180);
    }
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`+39 #${pushName.toLowerCase()}`, 460, 175);

    // 5. POWER POINTS (Il numero grande)
    const formattedAura = auraValue.toLocaleString();
    ctx.font = 'bold 120px Arial';
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillText(formattedAura, 60, 320);
    
    ctx.shadowBlur = 0;
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#ffffff';
    const textWidth = ctx.measureText(formattedAura).width;
    ctx.fillText('POWER POINTS', 80 + textWidth, 310);

    // 6. BARRA DI CARICAMENTO STILE CYBER
    // Sfondo barra
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(60, 380, 880, 65, 10);
    ctx.fill();

    // Progresso
    const barWidth = (auraValue / 1000000) * 880;
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.roundRect(60, 380, barWidth, 65, 10);
    ctx.fill();

    // 7. RANGO (In basso a destra)
    ctx.shadowBlur = 0;
    ctx.textAlign = 'right';
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(rank, 940, 510);

    const buffer = canvas.toBuffer();
    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `🚨 *Rilevamento Completato*\n👤 *User:* ${pushName}\n💠 *Livello Aura:* ${formattedAura}`,
      mentions: [target] 
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Errore critico nel sistema Aura.');
  }
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
