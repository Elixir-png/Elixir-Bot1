// Plug-in creato da elixir
let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text && !m.mentionedJid[0]) return;

    let percent = Math.floor(Math.random() * 101);
    let reply = '';
    
    // Se c'è un tag, usa il nome del tag, altrimenti usa il testo normale
    let target = m.mentionedJid[0] ? `@${m.mentionedJid[0].split('@')[0]}` : text;
    let upperTarget = target.toUpperCase();

    switch (command) {
        case 'pajero':
            reply = 'oko';
            break;
        case 'gay':
            reply = `${upperTarget} è 𝐆𝐀𝐘 🏳️‍🌈 ${percent}% GAY`;
            break;
        case 'lesbica':
            reply = `${upperTarget} è 𝐋𝐄𝐒𝐁𝐈𝐂𝐀 🏳️‍🌈 ${percent}% LESBICA`;
            break;
        case 'puttana':
            reply = `${upperTarget} è 𝐏𝐔𝐓𝐓𝐀𝐍𝐀🔞 ${percent}% PUTTANA`;
            break;
        case 'pinocchio':
            reply = `${upperTarget} è pinocchio al ${percent}% 🤥`;
            break;
        case 'cane':
            reply = `${upperTarget} è CANE 🐶 al ${percent}%`;
            break;
        case 'cagna':
            reply = `${upperTarget} è CAGNA 🐶 al ${percent}%`;
            break;
    }

    if (reply) {
        conn.reply(m.chat, reply, m, { 
            mentions: m.mentionedJid.length > 0 ? m.mentionedJid : [m.sender] 
        });
    }
}

handler.help = ['gay', 'lesbica', 'pajero', 'puttana', 'pinocchio', 'cane', 'cagna'].map(v => v + ' @tag')
handler.tags = ['calculator']
handler.command = /^(gay|lesbica|pajero|pajera|puto|puttana|manco|manca|rata|prostituta|prostituto|pinocchio|cane|cagna)$/i

export default handler
