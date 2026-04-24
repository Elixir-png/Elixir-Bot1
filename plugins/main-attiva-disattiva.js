import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'bestemmiometro', store: 'chat', perm: PERM.ADMIN, name: '🤬 Bestemmiometro', desc: 'Rileva e conta le bestemmie' },
  { key: 'antidelete', store: 'chat', perm: PERM.ADMIN, name: '🗑️ Antidelete', desc: 'Recupera messaggi eliminati' },
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '🛑 Antispam', desc: 'Protezione flood e spam' },
  { key: 'antisondaggi', store: 'chat', perm: PERM.ADMIN, name: '📊 Anti-sondaggi', desc: 'Blocca creazione sondaggi' },
  { key: 'antiparolacce', store: 'chat', perm: PERM.ADMIN, name: '🧼 Filtro parolacce', desc: 'Rimuove insulti' },
  { key: 'antiBot', store: 'chat', perm: PERM.ADMIN, name: '🤖 Antibot', desc: 'Rimuove bot esterni' },
  { key: 'antiBot2', store: 'chat', perm: PERM.ADMIN, name: '🤖 Anti-subbots', desc: 'Blocca sub-bot' },
  { key: 'antitrava', store: 'chat', perm: PERM.ADMIN, name: '🧨 Antitrava', desc: 'Blocca crash' },
  { key: 'antimedia', store: 'chat', perm: PERM.ADMIN, name: '🖼️ Antimedia', desc: 'Elimina media' },
  { key: 'antioneview', store: 'chat', perm: PERM.ADMIN, name: '👁️ Antiviewonce', desc: 'Blocca view once' },
  { key: 'antitagall', store: 'chat', perm: PERM.ADMIN, name: '🏷️ Anti-tagall', desc: 'Blocca tag massa' },
  { key: 'autotrascrizione', store: 'chat', perm: PERM.ADMIN, name: '📝 Auto-trascrizione', desc: 'Trascrive vocali' },
  { key: 'autotraduzione', store: 'chat', perm: PERM.ADMIN, name: '🌍 Auto-traduzione', desc: 'Traduce messaggi' },
  { key: 'rileva', store: 'chat', perm: PERM.ADMIN, name: '📡 Rileva', desc: 'Modifiche gruppo' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, name: '🔞 Antiporno', desc: 'Filtro NSFW' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, name: '🚫 Antigore', desc: 'Blocca gore' },
  { key: 'modoadmin', store: 'chat', perm: PERM.ADMIN, name: '🛡️ Soloadmin', desc: 'Solo admin' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '🧠 IA', desc: 'AI attiva' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, name: '🎤 Siri', desc: 'Risponde audio' },

  // 🔥 FIX QUI
  { key: 'antivoip', store: 'chat', perm: PERM.ADMIN, name: '📞 Antivoip', desc: 'Blocca numeri non IT' },
  { key: 'antivoip2', store: 'chat', perm: PERM.ADMIN, name: '📛 AntiVoip2', desc: 'Firewall VOIP avanzato' },

  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, name: '🔗 Antilink', desc: 'Blocca link WA' },
  { key: 'antiLinkUni', store: 'chat', perm: PERM.ADMIN, name: '🌍 Antilink Uni', desc: 'Blocca tutti link' },
  { key: 'antiLink2', store: 'chat', perm: PERM.ADMIN, name: '🌐 Antilinksocial', desc: 'Blocca social' },

  { key: 'reaction', store: 'chat', perm: PERM.ADMIN, name: '😎 Reazioni', desc: 'Auto reaction' },
  { key: 'autolevelup', store: 'chat', perm: PERM.ADMIN, name: '⬆️ Autolivello', desc: 'Level up' },

  { key: 'antinuke', store: 'chat', perm: PERM.OWNER, name: '🛡️ Antinuke', desc: 'Anti raid' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, name: '🔒 Blocco privato', desc: 'Blocca DM' },
  { key: 'soloe', store: 'bot', perm: PERM.OWNER, name: '👑 Solocreatore', desc: 'Solo owner' },
  { key: 'multiprefix', store: 'bot', perm: PERM.OWNER, name: '🔣 Multiprefix', desc: 'Multi prefix' },
  { key: 'jadibotmd', store: 'bot', perm: PERM.OWNER, name: '🧬 Subbots', desc: 'Sessioni secondarie' },
  { key: 'antispambot', store: 'bot', perm: PERM.OWNER, name: '🤖 Anti-spam', desc: 'Limita comandi' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, name: '👀 Lettura', desc: 'Auto read' },
  { key: 'anticall', store: 'bot', perm: PERM.sam, name: '❌ Antichiamate', desc: 'Blocca call' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, name: '📛 Registrazione', desc: 'Obbligatoria' },
];

const aliasMap = new Map();
featureRegistry.forEach(f => aliasMap.set(f.key.toLowerCase(), f));

let handler = async (m, { conn, command, args, isOwner, isAdmin, isSam }) => {
  let isEnable = ['enable', 'attiva', 'on', '1'].includes(command.toLowerCase());

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.settings = global.db.data.settings || {};

  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const botJid = conn.decodeJid(conn.user.jid);
  const bot = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  if (args[0]) {
    const feat = aliasMap.get(args[0].toLowerCase());
    if (!feat) return m.reply('Modulo non trovato');

    if (feat.perm === PERM.ADMIN && m.isGroup && !(isAdmin || isOwner || isSam))
      return m.reply('Serve admin');

    const target = feat.store === 'bot' ? bot : chat;
    target[feat.key] = isEnable;

    return m.reply(`${feat.name} → ${isEnable ? 'ATTIVO 🟢' : 'OFF 🔴'}`);
  }
};

export default handler;
