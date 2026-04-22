let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝓔𝓵𝓲𝔁𝓲𝓻`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    // 🔹 MESSAGGI MODIFICATI
    await conn.sendMessage(m.chat, {
        text: "𝔈𝔩𝔦𝔵𝔦𝔯 è 𝔢𝔫𝔱𝔯𝔞𝔱𝔬 𝔦𝔫 𝔠𝔦𝔯𝔠𝔬𝔩𝔞𝔷𝔦𝔬𝔫𝔢. 𝔔𝔲𝔢𝔰𝔱𝔬 𝔰𝔦𝔤𝔫𝔦𝔣𝔦𝔠𝔞 𝔰𝔬𝔩𝔬 𝔲𝔫𝔞 𝔠𝔬𝔰𝔞: 𝔡𝔢𝔳𝔞𝔰𝔱𝔬. 𝔘𝔫𝔞 𝔩𝔞𝔪𝔞 𝔰𝔦𝔩𝔢𝔫𝔷𝔦𝔬𝔰𝔞 𝔠𝔥𝔢 𝔳𝔦 𝔠𝔬𝔩𝔭𝔦𝔰𝔠𝔢 𝔫𝔢𝔩 𝔟𝔲𝔦𝔬, 𝔩𝔞𝔰𝔠𝔦𝔞𝔫𝔡𝔬 𝔰𝔬𝔩𝔬 𝔦𝔩 𝔳𝔲𝔬𝔱𝔬."
    });

    await conn.sendMessage(m.chat, {
        text: "𝓐𝓿𝓮𝓽𝓮 𝓻𝓲𝓬𝓮𝓿𝓾𝓽𝓸 𝓵'𝓸𝓷𝓸𝓻𝓮 𝓭𝓲 𝓮𝓼𝓼𝓮𝓻𝓮 𝓽𝓻𝓪𝓯𝓲𝓽𝓽𝓲 𝓭𝓪 𝓔𝓵𝓲𝔁𝓲𝓻. 𝓥𝓲 𝓪𝓼𝓹𝓮𝓽𝓽𝓲𝓪𝓶𝓸 𝓷𝓮𝓵𝓵'𝓸𝓼𝓬𝓾𝓻𝓲𝓽𝓪̀:\n\nhttps://whatsapp.com",
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['trafiggi'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
