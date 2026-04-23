// Plug-in creato da elixir
let handler = async (m, { conn, command, text, usedPrefix }) => {
	if (!text) return;
	let percent = Math.floor(Math.random() * 101);
	let reply = '';
	switch (command) {
		case 'pajero':
			reply = 'oko';
			break;
		case 'gay':
			reply = `${text.toUpperCase()} è 𝐆𝐀𝐘 🏳️‍🌈 ${percent}% GAY`;
			break;
		case 'lesbica':
			reply = `${text.toUpperCase()} è 𝐋𝐄𝐒𝐁𝐈𝐂𝐀 🏳️‍🌈 ${percent}% LESBICA`;
			break;
		case 'puttana':
			reply = `${text.toUpperCase()} è 𝐏𝐔𝐓𝐓𝐀𝐍𝐀🔞 ${percent}% PUTTANA`;
			break;
		case 'pinocchio':
			reply = `${text.toUpperCase()} è pinocchio al ${percent}% 🤥`;
			break;
		case 'cane':
			reply = `${text.toUpperCase()} è CANE 🐶 al ${percent}%`;
			break;
		case 'cagna':
			reply = `${text.toUpperCase()} è CAGNA 🐶 al ${percent}%`;
			break;
		// puoi aggiungere altri casi qui
	}
	if (reply) {
		conn.reply(m.chat, reply, m, m.mentionedJid ? { mentions: m.mentionedJid } : {});
	}
}
handler.help = ['gay', 'lesbica', 'pajero', 'pajera', 'puto', 'puttana', 'manco', 'manca', 'rata', 'prostituta', 'prostituto', 'pinocchio', 'cane', 'cagna'].map(v => v + ' @tag | nome')
handler.tags = ['calculator']
handler.command = /^gay|lesbica|pajero|pajera|puto|puttana|manco|manca|rata|prostituta|prostituto|pinocchio|cane|cagna/i
export default handler
