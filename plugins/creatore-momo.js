let handler = async (m, { conn, isAdmin }) => {  
    // Numero autorizzato
    const numeroAutorizzato = '393514722317@s.whatsapp.net'; 


    // Verifica se l'utente che esegue il comando è il numero autorizzato
    if (m.sender !== numeroAutorizzato) {
        await conn.sendMessage(m.chat, { text: '' });
        return;
    }

    if (m.fromMe) return;
    if (isAdmin) throw 'Sei già admin padrone';

    try {  
        // Invia il messaggio prima di eseguire l'azione
        await conn.sendMessage(m.chat, { text: 'Il trono è stato dato all\'unico vero re di questo gruppo' });

        // Promuove l'utente a admin
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote");
    } catch {
        await m.reply('coglione cosa fai? non sei momo');
    }
};

handler.command = /^MOMINO/i;
handler.group = true;
handler.botAdmin = true;
export default handler;
