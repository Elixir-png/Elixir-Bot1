import { createCanvas } from 'canvas';
import crypto from 'crypto';

let handler = async (m, { conn }) => {
  try {
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
                 (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

    const pushName = conn.getName(target) || "User";
    
    await m.reply('🌀 *Scansione frequenza Aura in corso...*');

    // RENDIAMO L'AURA CASUALE OGNI VOLTA
    // Usiamo il timestamp per far sì che il valore cambi a ogni esecuzione
    const auraValue = Math.floor(Math.random() * 1000000); 

    // SISTEMA GRADI CORRETTO
    let rank, color;
    if (auraValue >= 900000) {
      rank = "DIVINITÀ";
      color = "#FFD700"; // Oro
    } else if (auraValue >= 700000) {
      rank = "CAMPIONE";
      color = "#FF4500"; // Arancio/Rosso
    } else if (auraValue >= 400000) {
      rank = "ELITE";
      color = "#A020F0"; // Viola
    } else if (auraValue >= 100000) {
      rank = "GUERRIERO";
      color = "#00F2FF"; // Ciano
    } else {
      rank = "RECLUTA";
      color = "#7FFF00"; // Verde
    }

    const width = 1000;
    const height = 562;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. SFONDO
    ctx.fillStyle = '#0a0b14';
    ctx.fillRect(0, 0, width, height);

    // Griglia
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

    // 2. CORNICE NEON
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    ctx.shadowBlur = 0;

    // 3. INTESTAZIONE
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('AURA SYSTEM IDENTIFICATION', 70, 90);
    
    ctx.fillStyle = color;
    ctx.fillRect(70, 110, 450, 4);

    // 4. SUBJECT (NOME)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '35px Arial';
    ctx.fillText(`SUBJECT: ${pushName.toUpperCase()}`, 70, 175);

    // 5. POWER POINTS (SISTEMATA SOVRAPPOSIZIONE)
    const formattedAura = auraValue.toLocaleString();
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = 'bold 130px Arial';
    ctx.fillText(formattedAura, 70, 320); // Numero Grande
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    // Posizioniamo "POWER POINTS" dopo il numero, con un margine di sicurezza
    const textWidth = ctx.measureText(formattedAura).width;
    ctx.fillText('POWER POINTS', 90 + textWidth, 310);

    // 6. BARRA DI CARICAMENTO DINAMICA
    // Sfondo barra
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(70, 390, 860, 50, 10);
    ctx.fill();

    // Calcolo larghezza barra in base all'aura (percentuale su 1.000.000)
    const barWidth = (auraValue / 1000000) * 860;
    
    // Gradiente barra
    const grad = ctx.createLinearGradient(70, 0, 70 + barWidth, 0);
    grad.addColorStop(0, color);
    grad.addColorStop(1, '#ffffff');

    ctx.fillStyle = grad;
    ctx.beginPath();
    // La barra ora cresce correttamente in base al valore
    ctx.roundRect(70, 390, Math.max(barWidth, 20), 50, 10); 
    ctx.fill();

    // 7. RANK (In basso a destra)
    ctx.textAlign = 'right';
    ctx.font = 'italic bold 80px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(rank, 930, 510);

    const buffer = canvas.toBuffer();
    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `✅ *Analisi Completata*\n👤 *Soggetto:* ${pushName}\n📊 *Valore:* ${formattedAura}\n🏆 *Grado:* ${rank}`,
      mentions: [target] 
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Errore nel processamento dei dati Aura.');
  }
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
