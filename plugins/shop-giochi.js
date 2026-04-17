let handler = async (m, { conn, command, usedPrefix, args }) => {
    let user = global.db.data.users[m.sender];
    
    // Elenco oggetti dello shop
    const items = {
        'pozione': { costo: 500, descrizione: 'Ripristina l’energia per i lavori.', emoji: '🧪' },
        'xp': { costo: 1000, descrizione: 'Ottieni 500 punti esperienza.', emoji: '✨' },
        'scudo': { costo: 5000, descrizione: 'Protegge dai furti per 24h.', emoji: '🛡️' },
        'business': { costo: 20000, descrizione: 'Aumenta il guadagno passivo.', emoji: '🏢' }
    };

    let item = args[0]?.toLowerCase();
    let quantità = parseInt(args[1]) || 1;

    // Se l'utente non specifica cosa comprare, mostra il menu
    if (!item || !items[item]) {
        let listaShop = Object.entries(items).map(([name, info]) => {
            return `  ${info.emoji} *${name.toUpperCase()}*\n  ┠ \`${info.costo.toLocaleString('it-IT')} €\`\n  ┖ _${info.descrizione}_`;
        }).join('\n\n');

        let menu = `
╔══════════════════╗
      *🛒 MARKETPLACE*
╚══════════════════╝

  👤 *BILANCIO:* \`${user.euro.toLocaleString('it-IT')} €\`

  ┏━━━━━━━━━━━━━━━━━━┓
  ┃      *ARTICOLI*
  ┗━━━━━━━━━━━━━━━━━━┛
${listaShop}

  ┏━━━━━━━━━━━━━━━━━━┓
  ┃   *COME COMPRARE*
  ┗━━━━━━━━━━━━━━━━━━┛
  💡 \`${usedPrefix}${command} [nome] [quantità]\`
  _Es: ${usedPrefix}${command} pozione 2_

  *–––––––––––––––––––––––––*`.trim();
        
        return m.reply(menu);
    }

    // Logica di acquisto
    if (quantità < 1) return m.reply('『 ⚠️ 』- La quantità deve essere almeno 1.');
    let prezzoTotale = items[item].costo * quantità;

    if (user.euro < prezzoTotale) {
        return m.reply(`『 ❌ 』- Non hai abbastanza soldi! Ti mancano \`${(prezzoTotale - user.euro).toLocaleString('it-IT')} €\`.`);
    }

    // Sottrazione soldi e assegnazione oggetto
    user.euro -= prezzoTotale;
    
    // Esempio di assegnazione (modifica in base al tuo database)
    if (item === 'xp') user.exp += 500 * quantità;
    else user[item] = (user[item] || 0) + quantità;

    let successo = `
╔══════════════════╗
     *✅ ACQUISTO OK*
╚══════════════════╝

  📦 *Oggetto:* ${items[item].emoji} ${item.toUpperCase()}
  🔢 *Quantità:* ${quantità}
  💰 *Spesa:* \`${prezzoTotale.toLocaleString('it-IT')} €\`

  *–––––––––––––––––––––––––*
  _Nuovo bilancio:_ \`${user.euro.toLocaleString('it-IT')} €\``.trim();

    await m.reply(successo);
};

handler.help = ['shop'];
handler.tags = ['euro'];
handler.command = ['shop', 'compra', 'buy'];
handler.register = true;

export default handler;
