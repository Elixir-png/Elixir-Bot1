import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import fs, { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { getAggregateVotesInPollMessage, toJid } from '@realvare/based'

// --- CONFIGURAZIONE DATABASE GRUPPOTEMPO ---
const FILE_PATH = './media/database/gruppotempo.json';
if (!fs.existsSync('./media/database')) fs.mkdirSync('./media/database', { recursive: true });

let savedTimers = {};
if (fs.existsSync(FILE_PATH)) {
    try { savedTimers = JSON.parse(fs.readFileSync(FILE_PATH)); } 
    catch (e) { savedTimers = {}; }
}

const salvaTimer = () => fs.writeFileSync(FILE_PATH, JSON.stringify(savedTimers, null, 2));
const timerGruppo = {};

// --- FUNZIONI DI SUPPORTO ---
async function cambiaStatoGruppo(conn, chatId, stato) {
    try { await conn.groupSettingUpdate(chatId, stato); } 
    catch (e) { console.error('Errore stato gruppo:', e); }
}

function parseDuration(str) {
    if (!str) return 0;
    const match = str.match(/^(\d+)(s|m|h|g)$/);
    if (!match) return 0;
    const num = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return num * 1000;
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        case 'g': return num * 24 * 60 * 60 * 1000;
        default: return 0;
    }
}

// --- GENERATORI DI MENU (BOTTONI) ---
function creaMenuPrincipale(usedPrefix) {
    return {
        text: `🏠 *GESTIONE GRUPPO*\nScegli un'opzione:`,
        buttons: [
            { buttonId: `${usedPrefix}gt-menu-stato`, buttonText: { displayText: "🔄 Cambia Stato" }, type: 1 },
            { buttonId: `${usedPrefix}gt-menu-timer`, buttonText: { displayText: "⏲️ Timer" }, type: 1 },
            { buttonId: `${usedPrefix}gt-reset`, buttonText: { displayText: "🗑️ Reset" }, type: 1 }
        ],
        headerType: 1
    };
}

function creaMenuStato(usedPrefix, isChiuso) {
    return {
        text: `🔄 *STATO ATTUALE:* ${isChiuso ? '🔒 Chiuso' : '🔓 Aperto'}`,
        buttons: [
            { buttonId: `${usedPrefix}gt-apri`, buttonText: { displayText: "🔓 Apri" }, type: 1 },
            { buttonId: `${usedPrefix}gt-chiudi`, buttonText: { displayText: "🔒 Chiudi" }, type: 1 }
        ],
        headerType: 1
    };
}

function creaMenuTimer(usedPrefix) {
    return {
        text: `⏲️ *TIMER TEMPORANEO*\nScegli l'azione da temporizzare:`,
        buttons: [
            { buttonId: `${usedPrefix}gt-timer-chiudi`, buttonText: { displayText: "🔒 Chiudi Temporaneamente" }, type: 1 },
            { buttonId: `${usedPrefix}gt-timer-apri`, buttonText: { displayText: "🔓 Apri Temporaneamente" }, type: 1 }
        ],
        headerType: 1
    };
}

function creaMenuDurata(usedPrefix, azione) {
    return {
        text: `⏳ *DURATA*\nPer quanto tempo vuoi ${azione === 'chiudi' ? 'chiudere' : 'aprire'} il gruppo?`,
        buttons: [
            { buttonId: `${usedPrefix}gt-${azione}-15m`, buttonText: { displayText: "15 Minuti" }, type: 1 },
            { buttonId: `${usedPrefix}gt-${azione}-1h`, buttonText: { displayText: "1 Ora" }, type: 1 }
        ],
        headerType: 1
    };
}

// --- HANDLER PRINCIPALE ---
export async function handler(m, { conn, isAdmin, isOwner, args, usedPrefix, command }) {
    if (!(isAdmin || isOwner)) return;

    const chatId = m.chat;
    
    // Rileva se è stato premuto un bottone
    const buttonId = m.message?.buttonsResponseMessage?.selectedButtonId || 
                     m.message?.templateButtonReplyMessage?.selectedId || 
                     m.msg?.selectedButtonId || null;

    let action = buttonId || command;
    if (!action) return;
    const cleanAction = action.replace(usedPrefix, '').trim();

    try {
        const info = await conn.groupMetadata(chatId);
        const isChiuso = info.announce;

        // Logica Menu
        if (cleanAction === 'gruppotempo' || cleanAction === 'gt') {
            return conn.sendMessage(chatId, creaMenuPrincipale(usedPrefix), { quoted: m });
        }

        if (cleanAction === 'gt-menu-stato') {
            return conn.sendMessage(chatId, creaMenuStato(usedPrefix, isChiuso), { quoted: m });
        }

        if (cleanAction === 'gt-menu-timer') {
            return conn.sendMessage(chatId, creaMenuTimer(usedPrefix), { quoted: m });
        }

        // Azioni Dirette
        if (cleanAction === 'gt-apri') {
            await cambiaStatoGruppo(conn, chatId, 'not_announcement');
            return m.reply('🔓 Gruppo aperto!');
        }

        if (cleanAction === 'gt-chiudi') {
            await cambiaStatoGruppo(conn, chatId, 'announcement');
            return m.reply('🔒 Gruppo chiuso!');
        }

        // Gestione Menu Durata
        if (cleanAction === 'gt-timer-chiudi') return conn.sendMessage(chatId, creaMenuDurata(usedPrefix, 'chiudi'), { quoted: m });
        if (cleanAction === 'gt-timer-apri') return conn.sendMessage(chatId, creaMenuDurata(usedPrefix, 'apri'), { quoted: m });

        // Esecuzione Timer (es. gt-chiudi-15m)
        if (cleanAction.match(/^gt-(chiudi|apri)-\d+[smhg]/)) {
            const parts = cleanAction.split('-');
            const tipo = parts[1]; 
            const durataStr = parts[2];
            const ms = parseDuration(durataStr);

            const stato = tipo === 'chiudi' ? 'announcement' : 'not_announcement';
            const opposto = stato === 'announcement' ? 'not_announcement' : 'announcement';

            await cambiaStatoGruppo(conn, chatId, stato);
            m.reply(`${tipo === 'chiudi' ? '🔒' : '🔓'} Gruppo ${tipo}to per ${durataStr}.`);

            setTimeout(async () => {
                await cambiaStatoGruppo(conn, chatId, opposto);
                conn.sendMessage(chatId, { text: `⏰ Timer scaduto! Il gruppo è stato ${tipo === 'chiudi' ? 'riaperto' : 'richiuso'}.` });
            }, ms);
        }

        if (cleanAction === 'gt-reset') {
            delete savedTimers[chatId];
            salvaTimer();
            return m.reply('🗑️ Impostazioni resettate.');
        }

    } catch (e) {
        console.error(e);
    }
}

handler.command = /^(gruppotempo|gt)$/i;
export default handler;
