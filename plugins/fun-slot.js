import { createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gif-encoder-2'

// --- CONFIGURAZIONI ---
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}
const cavalliConfig = [
    { nome: 'ROSSO', color: '#ff4d4d' },
    { nome: 'BLU', color: '#4d94ff' },
    { nome: 'VERDE', color: '#4dff88' },
    { nome: 'GIALLO', color: '#ffff4d' }
]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    // --- SISTEMA EURO (mantenuto) ---
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.euro === undefined) user.euro = 1000

    const checkMoney = (costo) => {
        if (user.euro < costo) {
            m.reply(`⚠️ Non hai abbastanza Euro! (Saldo: ${user.euro}€)`)
            return false
        }
        return true
    }

    // --- 1. MENU ---
    if (command === 'casino') {
        let intro = `*🎰 GRAND CASINÒ ANIMATO 🎰*\n*💰 SALDO:* *${user.euro}€*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // INFO TASTI (mantenuto)
    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nPunta 100€!`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 TIRA' }, type: 1 }] })
    if (command === 'inforigore') return conn.sendMessage(m.chat, { text: `*⚽ RIGORI*\nScegli dove tirare (100€):`, buttons: [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }] })
    if (command === 'infocorsa') return conn.sendMessage(m.chat, { text: `*🏇 CORSA*\nPunta 100€ sul vincitore:`, buttons: cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: c.nome }, type: 1 })) })
    if (command === 'infogratta') return conn.sendMessage(m.chat, { text: `*🎟️ GRATTA*\nCosto 200€`, buttons: [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ COMPRA' }, type: 1 }] })

    // --- 2. LOGICHE ANIMATE CORRETTE ---

    // 🎰 SLOT ANIMATA (CORRETTA)
    if (command === 'slot') {
        if (!checkMoney(100)) return
        const width = 600, height = 250;
        const encoder = new GIFEncoder(width, height); 
        encoder.start(); encoder.setRepeat(0); encoder.setDelay(100); encoder.setQuality(10);
        const canvas = createCanvas(width, height); const ctx = canvas.getContext('2d');
        
        let final = [fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)]];
        let win = (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]);
        const imgs = {}; for(let f of fruits) imgs[f] = await loadImage(fruitURLs[f]);

        // Frame animazione (12 frame)
        for(let i=0; i<12; i++) {
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,width,height);
            for(let j=0; j<3; j++) {
                const randomFruit = fruits[Math.floor(Math.random()*6)];
                ctx.drawImage(imgs[randomFruit], 100+(j*150), 50, 100, 100);
            }
            encoder.addFrame(ctx);
        }

        // Frame finale (risultato reale)
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,width,height);
        ctx.drawImage(imgs[final[0]], 100, 50, 100, 100);
        ctx.drawImage(imgs[final[1]], 250, 50, 100, 100);
        ctx.drawImage(imgs[final[2]], 400, 50, 100, 100);
        
        // Aggiungiamo il frame finale più volte per farlo "restare"
        for(let i=0; i<10; i++) encoder.addFrame(ctx);
        
        encoder.finish(); 
        user.euro += win ? 200 : -100;
        
        // --- INVIO CORRETTO COME GIF ---
        return conn.sendMessage(m.chat, { 
            video: encoder.out.getData(), 
            mimetype: 'video/gif', // Forza WhatsApp a trattarlo come GIF
            gifPlayback: true, 
            caption: win ? '✅ VINTO!' : '❌ PERSO!', 
            buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }] 
        }, { quoted: m });
    }

    // 🏇 CORSA ANIMATA (CORRETTA)
    if (command === 'puntacorsa') {
        if (!checkMoney(100)) return
        const width = 700, height = 400;
        const encoder = new GIFEncoder(width, height); 
        encoder.start(); encoder.setRepeat(0); encoder.setDelay(100);
        const canvas = createCanvas(width, height); const ctx = canvas.getContext('2d');
        
        let winnerIdx = Math.floor(Math.random()*4), win = args[0]?.toUpperCase() === cavalliConfig[winnerIdx].nome;
        let positions = [100, 100, 100, 100];

        // 20 Frame di corsa
        for(let f=0; f<20; f++) {
            ctx.fillStyle = '#2e7d32'; ctx.fillRect(0,0,width,height);
            
            // Linee di corsia
            for(let l=0; l<=4; l++) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 50+(l*80)); ctx.lineTo(700, 50+(l*80)); ctx.stroke(); }
            
            cavalliConfig.forEach((c, i) => {
                // Il vincitore scatta all'ultimo frame
                positions[i] += (f === 19 && i === winnerIdx) ? 450 : Math.random()*25;
                // Disegna cavallo
                ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(positions[i], 90+(i*80), 20, 0, Math.PI*2); ctx.fill();
                // Testo cavallo
                ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.fillText(c.nome, 20, 95+(i*80));
            });
            encoder.addFrame(ctx);
        }
        
        // Frame finale bloccato sul vincitore
        for(let i=0; i<15; i++) encoder.addFrame(ctx);

        encoder.finish(); 
        user.euro += win ? 250 : -100;
        
        // --- INVIO CORRETTO COME GIF ---
        return conn.sendMessage(m.chat, { 
            video: encoder.out.getData(), 
            mimetype: 'video/gif',
            gifPlayback: true, 
            caption: win ? '🏆 HAI VINTO!' : `💀 PERSO! VINCE IL ${cavalliConfig[winnerIdx].nome}`,
            buttons: [{ buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 RIGIOCA' }, type: 1 }]
        }, { quoted: m });
    }

    // ⚽ RIGORE ANIMATO (CORRETTO)
    if (command === 'rigore') {
        if (!checkMoney(100)) return
        const width = 600, height = 350;
        const encoder = new GIFEncoder(width, height); 
        encoder.start(); encoder.setRepeat(0); encoder.setDelay(100);
        const canvas = createCanvas(width, height); const ctx = canvas.getContext('2d');
        
        let tiro = args[0], parata = ['sx', 'cx', 'dx'][Math.floor(Math.random()*3)], win = tiro !== parata;
        let posPortiere = { sx: 160, cx: 300, dx: 440 };
        let posPallaFinal = { sx: 150, cx: 300, dx: 450 };

        // Animazione (10 frame)
        for(let f=0; f<10; f++) {
            ctx.fillStyle = '#4caf50'; ctx.fillRect(0,0,width,height);
            // Porta
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.strokeRect(100, 50, 400, 250);
            
            // Portiere che para o si tuffa
            ctx.fillStyle = '#111'; ctx.fillRect(posPortiere[parata]-40, 160, 80, 20);
            
            // Palla che si muove in profondità e in direzione
            // X: movimento orizzontale. Y: movimento verticale. R: rimpicciolimento (simulazione profondità)
            let moveRatio = f/10;
            let ballX = 300 + (posPallaFinal[tiro]-300)*moveRatio;
            let ballY = 320 - (150*moveRatio); // La palla sale
            let ballR = 20 - (8*moveRatio); // La palla si rimpicciolisce
            
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ballX, ballY, ballR, 0, Math.PI*2); ctx.fill();
            encoder.addFrame(ctx);
        }
        
        // Frame finale bloccato
        for(let i=0; i<10; i++) encoder.addFrame(ctx);

        encoder.finish(); 
        user.euro += win ? 150 : -100;
        
        // --- INVIO CORRETTO COME GIF ---
        return conn.sendMessage(m.chat, { 
            video: encoder.out.getData(), 
            mimetype: 'video/gif',
            gifPlayback: true, 
            caption: win ? '⚽ GOOOL!' : '🧤 PARATA!',
            buttons: [{ buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGIOCA' }, type: 1 }]
        }, { quoted: m });
    }

    // 🎟️ GRATTA (mantenuto statico)
    if (command === 'gratta') {
        if (!checkMoney(200)) return
        let v = [0, 0, 500, 0, 1000, 5000][Math.floor(Math.random()*6)];
        const canvas = createCanvas(400, 200); const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffd700'; ctx.fillRect(0,0,400,200);
        ctx.fillStyle = '#000'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center';
        ctx.fillText(v > 0 ? `HAI VINTO ${v}€!` : 'NON HAI VINTO', 200, 110);
        user.euro += (v - 200);
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `Saldo attuale: ${user.euro}€`, buttons: [{ buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ RIGIOCA' }, type: 1 }] });
    }
}

handler.command = /^(casino|infoslot|infogratta|inforigore|infocorsa|slot|gratta|rigore|puntacorsa)$/i
handler.group = true
export default handler
