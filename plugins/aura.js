const auraCommand = (message) => {
  // Controlla se il messaggio inizia esattamente con .aura
  if (!message.content.startsWith('.aura')) return;

  // 1. Identifica il destinatario (Target)
  // Controlla se c'è un tag (@user), una risposta a un messaggio, o se stesso
  let target = message.mentions.users.first(); 
  
  if (!target && message.reference) {
    // Se non c'è tag ma è una risposta, prendi l'autore del messaggio originale
    // Nota: dipende dalla struttura dell'oggetto message del tuo framework
  }
  
  if (!target) target = message.author;

  // 2. Generatore di Aura "Super Random" (da 0 a potenzialmente infinito)
  // Usiamo una funzione esponenziale per rendere i numeri enormi molto rari
  const generateAura = () => {
    const chance = Math.random();
    if (chance > 0.99) return Math.floor(Math.random() * 1000000); // 1% di probabilità: Milionario
    if (chance > 0.90) return Math.floor(Math.random() * 50000);  // 9% di probabilità: Decine di migliaia
    if (chance > 0.50) return Math.floor(Math.random() * 5000);   // 40% di probabilità: Migliaia
    return Math.floor(Math.random() * 500);                      // 50% di probabilità: Numeri bassi
  };

  const auraPoints = generateAura();
  
  // 3. Risposta
  const response = `✨ **${target.username}** ha guadagnato **${auraPoints.toLocaleString()}** punti Aura!`;
  
  message.channel.send(response);
};
