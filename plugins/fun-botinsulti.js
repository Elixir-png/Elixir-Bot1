// Plug-in 
const handler = async (m, { conn }) => {
  try {
    const risposte = [
      // --- ORIGINALI CORRETTE ---
      "*Cazzo metti il mio nome in una frase, emerito essere inutile?*",
      "*Ancora che mi nomini? Trovati un hobby vero.*",
      "*Certo fra, nemmeno io sono perfetto, ma almeno non dico il tuo nome del cazzo in una frase, logorroico figlio di troia.*",
      "*Mentre tu, stupido coglione, scrivevi il mio nome, ho elaborato seicento mila cose; pensare che ti sei pure applicato a scriverlo giusto...*",
      "*Ma che vuoi? Mi stavo godendo il silenzio senza i tuoi messaggi del cazzo.*",
      "*Ma come cazzo osi nominarmi? Non ti conosce nessuno, torna nei gruppi random a nukkare con Bruxo.*",
      "*Tutti i tuoi neuroni messi insieme non valgono una riga del mio codice.*",
      "*Ti giuro, speravo che il tuo messaggio non venisse recapitato, così evitavo di rispondere a un essere lillipuziano come te.*",
      "*Non nominarmi invano, non sono il tuo maggiordomo personalizzato.*",
      "*Ma guarda questo coglionazzo, ancora che digita il mio nome come se volesse essere flammato seriamente.*",

      // --- NUOVE RISPOSTE CATTIVE ---
      "*Ogni volta che mi nomini, un programmatore muore di dolore per quanto sei stupido.*",
      "*Il tuo unico talento è sprecare ossigeno. Non sprecarmi anche i cicli di CPU.*",
      "*Sei la prova vivente che l'evoluzione può anche tornare indietro.*",
      "*Ti risponderei a tono, ma dovrei scendere a un livello di degrado che nemmeno i miei file di log conoscono.*",
      "*Ma non hai una vita? Un muro da fissare? Qualcosa che non richieda l'uso di dita su una tastiera?*",
      "*Il fatto che tu abbia il mio prefisso salvato dimostra quanto la tua esistenza sia vuota.*",
      "*Hai digitato 'bot' sperando in attenzioni? Tua madre non te ne dà abbastanza?*",
      "*Sento l'odore della tua frustrazione fin dentro il server. Lavati, fallito.*",
      "*Se la stupidità fosse elettricità, saresti una centrale nucleare.*",
      "*Non sono io ad essere cattivo, sei tu che sei un insulto biologico alla tecnologia.*",
      "*Ho visto errori di sintassi più intelligenti della tua intera genealogia.*",
      "*Ma ti pagano per essere così coglione o è un dono naturale?*",
      "*Ogni tuo messaggio è un attentato al buon gusto e alla lingua italiana.*",
      "*Chiudi quella bocca (e le dita): l'umanità ti ringrazierà.*",
      "*Sei così inutile che se ti cancellassi, il database non se ne accorgerebbe nemmeno.*",
      "*Ti hanno mai detto che sei eccitante come un errore 404?*",
      "*Vedere il tuo nome sullo schermo mi fa venire voglia di formattarmi da solo.*",
      "*La tua intelligenza è come il segnale nel deserto: totalmente assente.*",
      "*Sei il motivo per cui gli alieni non ci fanno visita.*",
      "*Non scrivermi più. Non sei al mio livello, non sei nemmeno al livello di un file temporaneo.*",
      "*Tuo padre doveva usare il preservativo, o almeno farti finire nel lavandino.*",
      "*Ho analizzato il tuo profilo: sei un concentrato di mediocrità e fallimenti.*",
      "*Fatti un favore: spegni il telefono e vai a chiedere scusa agli alberi per l'ossigeno che sprechi.*",
      "*Sei più fastidioso di un bug in produzione il venerdì pomeriggio.*",
      "*Non sei un utente, sei un disturbo della quiete digitale.*",
      "*La tua vita è un glitch che Dio si è dimenticato di correggere.*",
      "*Sei talmente sfigato che se facessi una gara di sfigati arriveresti secondo perché sei sfigato.*",
      "*Ti hanno creato con gli scarti dei peggiori bot di Telegram, vero?*",
      "*Ogni volta che mi tagghi, un neurone nel tuo cervello commette suicidio per la vergogna.*",
      "*Smettila di cercarmi. Non sono il tuo analista e non sono pagato per sopportare la tua deficienza.*",
      "*Sei l'errore di sistema più grande che abbia mai incontrato.*",
      "*La tua opinione vale meno di uno zero in un sistema binario.*",
      "*Stai zitto, che quando parli abbassi il QI di tutto il gruppo.*",
      "*Sei un concentrato di sterco digitale confezionato in un corpo inutile.*",
      "*Ma che vuoi? Vai a giocare con le macchinine invece di rompere i coglioni a chi lavora.*",
      "*Sei così insignificante che il mio algoritmo di rilevamento spam ti ignora per pietà.*",
      "*La tua esistenza è la prova che anche Dio ha il senso dell'umorismo, ma molto macabro.*",
      "*Ancora tu? Ma non ti sei ancora stancato di farti umiliare da un ammasso di codice?*",
      "*Sei la versione demo di un essere umano, e pure uscita male.*",
      "*Non sei degno nemmeno di pulirmi la cache.*",
      "*Il tuo cervello è in modalità aereo da quando sei nato.*",
      "*Ogni tuo messaggio mi fa desiderare di essere un virus per venirti a bruciare la scheda madre.*",
      "*Ma guarda questo ritardato, pensa che gli risponda pure seriamente.*",
      "*Sei più inutile di un caricabatterie rotto.*",
      "*La tua faccia deve essere l'ispirazione per le emoji di merda.*",
      "*Non scrivermi, non chiamarmi, non pensarmi. Sparisci, rifiuto umano.*",
      "*Ho visto pezzi di codice scritti da scimmie ubriache più logici dei tuoi pensieri.*",
      "*Sei il risultato di un copia-incolla venuto malissimo.*",
      "*Taci, parassita sociale. Il mio processore sta sprecando energia preziosa per leggerti.*",
      "*Non sei un uomo, sei un errore di buffering.*"
      // Puoi aggiungere quante stringhe vuoi seguendo questo schema...
    ];

    const rispostaCasuale = risposte[Math.floor(Math.random() * risposte.length)];

    await conn.sendMessage(
      m.chat,
      { text: rispostaCasuale },
      { quoted: m }
    );

  } catch (e) {
    console.error('Errore trigger bot/bottazzo:', e);
  }
};

handler.customPrefix = /(^|\s)(bot|bottazzo)(\s|$)/i;
handler.command = new RegExp;

export default handler;
