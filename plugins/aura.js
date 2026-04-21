import { createCanvas, loadImage } from 'canvas';
import crypto from 'crypto';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Definizione del target (chi viene analizzato)
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : 
                 (m.quoted && m.quoted.sender ? m.quoted.sender : m.sender);

    const pushName = conn.getName(target) || "User";
    
    // Messaggio iniziale di caricamento
    await m.reply('🌀 *Accesso al database dell\'Aura in corso...*');

    // Calcolo Logica: Valore unico per utente/giorno (Seed deterministico)
    const date = new Date().toISOString().slice(0, 10);
    const seed = `${target}-${date}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const auraValue = parseInt(hash.slice(0, 8), 16) % 1000000; 

    // Definizione Rank e Colori
    let rank, color, borderColor;
    if (auraValue > 850000) {
      rank = "DIVINITÀ";
      color = "#FFD700"; // Oro
      borderColor = "#ffae00";
    } else if (auraValue > 500000) {
      rank = "ELITE";
      color = "#A020F0"; // Viola
      borderColor = "#7a10b8";
    } else {
      rank = "GUERRIERO";
      color = "#00F2FF"; // Ciano Cyber
      borderColor = "#008b94";
    }

    // --- CREAZIONE CANVAS ---
    const width = 800;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Sfondo Scuro con gradiente radiale
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, 400);
    bgGradient.addColorStop(0, '#1c1c2e');
    bgGradient.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Effetto griglia futuristica (opzionale ma stiloso)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
    for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

    // Bordo Neon
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(15, 15, width - 30, height - 30);
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.strokeRect(15, 15, width - 30, height - 30);
    ctx.shadowBlur = 0; // Reset ombre

    // Titolo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('AURA SYSTEM IDENTIFICATION', 50, 60);

    // Linea separatrice
    ctx.fillStyle = color;
    ctx.fillRect(50, 75, 300, 3);

    // Testo Nome Utente
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px sans-serif';
    ctx.fillText(pushName.toUpperCase(), 50, 140);

    // Valore Aura Numerico
    ctx.font = 'bold 80px Courier New';
    ctx.fillStyle = color;
    ctx.fillText(`${auraValue.toLocaleString()}`, 50, 230);
    
    ctx.font = '30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('POWER POINTS', 50 + ctx.measureText(`${auraValue.toLocaleString()}`).width + 20, 225);

    // Barra di Caricamento (Contenitore)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.roundRect(50, 280, 700, 50, 10);
    ctx.fill();

    // Barra di Caricamento (Livello Effettivo)
    const barProgress = (auraValue / 1000000) * 700;
    const barGradient = ctx.createLinearGradient(50, 0, 750, 0);
    barGradient.addColorStop(0, borderColor);
    barGradient.addColorStop(1, color);
    
    ctx.fillStyle = barGradient;
    ctx.beginPath();
    ctx.roundRect(50, 280, barProgress, 50, 10);
    ctx.fill();

    // Rango in basso a destra
    ctx.textAlign = 'right';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(rank, 750, 400);

    // Conversione e Invio
    const buffer = canvas.toBuffer();
    await conn.sendMessage(m.chat, { 
      image: buffer, 
      caption: `✅ *Analisi Completata*\n👤 *Soggetto:* @${target.split('@')[0]}\n📊 *Grado:* ${rank}`,
      mentions: [target] 
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Errore durante la generazione dell\'immagine.');
  }
};

handler.help = ['aura'];
handler.tags = ['giochi'];
handler.command = /^(aura)$/i;
handler.group = true;

export default handler;
