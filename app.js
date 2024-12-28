const { useState, useEffect } = React;

function StoppaCalculator() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [selectedCards, setSelectedCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [usedCards, setUsedCards] = useState(new Set());
  const [playerPosition, setPlayerPosition] = useState(1); // Posizione del giocatore (1 = primo di mano)
  
  const seeds = ["Denari", "Spade", "Coppe", "Bastoni"];
  const values = Array.from({length: 10}, (_, i) => i + 1); // 1-10 dove 8=Fante, 9=Cavallo, 10=Re

  const getCardValue = (value) => {
    switch(value) {
      case 7: return 21; // Sette
      case 6: return 18; // Sei
      case 1: return 16; // Asso
      case 5: return 15; // Cinque
      case 4: return 14; // Quattro
      case 3: return 13; // Tre
      case 2: return 12; // Due
      case 8: // Fante
      case 9: // Cavallo
      case 10: // Re
        return 10;
      default: return value;
    }
  };

  // Raggruppa le carte per seme e restituisce il gruppo più forte
  const getBestSeedGroup = (cards) => {
    const bySeed = {};
    cards.forEach(card => {
      if (!bySeed[card.seed]) bySeed[card.seed] = [];
      bySeed[card.seed].push(card.value);
    });

    let bestSeed = null;
    let maxCards = 0;
    let maxPoints = 0;

    for (const seed in bySeed) {
      const cardsInSeed = bySeed[seed].length;
      const points = bySeed[seed].reduce((sum, value) => sum + getCardValue(value), 0);
      
      if (cardsInSeed > maxCards || (cardsInSeed === maxCards && points > maxPoints)) {
        maxCards = cardsInSeed;
        maxPoints = points;
        bestSeed = seed;
      }
    }

    return {
      seed: bestSeed,
      cards: bestSeed ? bySeed[bestSeed] : [],
      numCards: maxCards,
      points: maxPoints
    };
  };

  // Calcola la probabilità di vittoria
  const calculateProbability = () => {
    const currentGroup = getBestSeedGroup(selectedCards);
    if (!currentGroup.seed) return 0;

    const remainingCards = [];
    seeds.forEach(seed => {
      values.forEach(value => {
        const cardKey = `${seed}-${value}`;
        if (!usedCards.has(cardKey)) {
          remainingCards.push({ seed, value });
        }
      });
    });

    let betterCombinations = 0;
    let totalCombinations = 0;
    const cardsNeeded = getCardsPerTurn(currentTurn);

    // Genera tutte le possibili combinazioni delle carte rimanenti
    function* combinations(arr, size) {
      if (size > arr.length) return;
      if (size === 1) {
        for (let i = 0; i < arr.length; i++) {
          yield [arr[i]];
        }
        return;
      }
      for (let i = 0; i < arr.length - size + 1; i++) {
        const head = arr[i];
        const tail = combinations(arr.slice(i + 1), size - 1);
        for (const c of tail) {
          yield [head, ...c];
        }
      }
    }

    for (const combo of combinations(remainingCards, cardsNeeded)) {
      totalCombinations++;
      const opponentGroup = getBestSeedGroup(combo);
      
      if (opponentGroup.numCards > currentGroup.numCards || 
          (opponentGroup.numCards === currentGroup.numCards && 
           opponentGroup.points > currentGroup.points)) {
        betterCombinations++;
      }
    }

    if (totalCombinations === 0) return 100;
    return Math.round(((totalCombinations - betterCombinations) / totalCombinations) * 100);
  };

  const getMaxTurns = () => {
    switch(numPlayers) {
      case 3: return 5;
      case 4: return 4;
      case 5: return 3;
      case 6: return 2;
      default: return 4;
    }
  };
  
  const getCardsPerTurn = (turn) => {
    const maxTurns = getMaxTurns();
    if (turn === maxTurns) {
      switch(numPlayers) {
        case 3: return 1;
        case 4: return 1;
        case 5: return 2;
        case 6: return 3;
        default: return 3;
      }
    }
    return 3;
  };

  const handleAddCard = (value, seed) => {
    const cardKey = `${seed}-${value}`;
    if (!usedCards.has(cardKey) && selectedCards.length < getCardsPerTurn(currentTurn)) {
      const newCard = { value, seed };
      setSelectedCards(prev => [...prev, newCard]);
      setAllCards(prev => [...prev, newCard]);
      setUsedCards(prev => new Set([...prev, cardKey]));
    }
  };

  const handleNextTurn = () => {
    if (currentTurn < getMaxTurns()) {
      setCurrentTurn(currentTurn + 1);
      setSelectedCards([]);
    }
  };

  const getBestFinalCombination = () => {
    if (allCards.length < 3) return allCards;
    
    let bestGroup = getBestSeedGroup(allCards);
    return allCards.filter(card => card.seed === bestGroup.seed)
                  .slice(0, 3)
                  .sort((a, b) => getCardValue(b.value) - getCardValue(a.value));
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calcolatore Stoppa</h1>
        <button onClick={() => {
          setCurrentTurn(1);
          setSelectedCards([]);
          setAllCards([]);
          setUsedCards(new Set());
        }} className="btn bg-red-500">Reset</button>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <label className="font-medium">Giocatori:</label>
          <select 
            value={numPlayers}
            onChange={(e) => {
              setNumPlayers(parseInt(e.target.value));
              setCurrentTurn(1);
              setSelectedCards([]);
              setAllCards([]);
              setUsedCards(new Set());
            }}
            className="p-2 border rounded"
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
          
          <label className="font-medium ml-4">Posizione:</label>
          <select 
            value={playerPosition}
            onChange={(e) => setPlayerPosition(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            {Array.from({length: numPlayers}, (_, i) => (
              <option key={i+1} value={i+1}>{i+1}º</option>
            ))}
          </select>
        </div>

        <div className="text-lg font-medium">
          Turno {currentTurn} di {getMaxTurns()}
          {currentTurn === getMaxTurns() ? " (Finale)" : ""}
          {` - ${getCardsPerTurn(currentTurn)} carte`}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {seeds.map((seed) => (
            <div key={seed} className="space-y-2">
              <div className="font-medium">{seed}</div>
              <div className="grid grid-cols-5 gap-1">
                {values.map((value) => (
                  <button
                    key={`${seed}-${value}`}
                    className={`btn ${usedCards.has(`${seed}-${value}`) ? 'bg-gray-400' : ''}`}
                    onClick={() => handleAddCard(value, seed)}
                    disabled={usedCards.has(`${seed}-${value}`) || 
                             selectedCards.length >= getCardsPerTurn(currentTurn)}
                  >
                    {value <= 7 ? value : value === 8 ? 'F' : value === 9 ? 'C' : 'R'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded">
          <div className="font-medium">Mano Corrente:</div>
          <div className="flex gap-2 flex-wrap mb-2">
            {selectedCards.map((card, idx) => (
              <div key={idx} className="p-2 bg-white rounded shadow">
                {card.value <= 7 ? card.value : 
                 card.value === 8 ? 'Fante' : 
                 card.value === 9 ? 'Cavallo' : 'Re'} 
                di {card.seed}
              </div>
            ))}
          </div>
          {selectedCards.length > 0 && (
            <>
              <div className="font-medium mt-2">
                Miglior combinazione nel seme:
              </div>
              <div className="text-lg">
                {getBestSeedGroup(selectedCards).seed}: {getBestSeedGroup(selectedCards).points} punti
                ({getBestSeedGroup(selectedCards).numCards} carte)
              </div>
              <div className="text-lg mt-2">
                Probabilità di vittoria: {calculateProbability()}%
              </div>
            </>
          )}
        </div>

        {currentTurn === getMaxTurns() && allCards.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <div className="font-medium">Miglior Tris Finale:</div>
            <div className="flex gap-2 flex-wrap">
              {getBestFinalCombination().map((card, idx) => (
                <div key={idx} className="p-2 bg-white rounded shadow">
                  {card.value <= 7 ? card.value : 
                   card.value === 8 ? 'Fante' : 
                   card.value === 9 ? 'Cavallo' : 'Re'} 
                  di {card.seed}
                </div>
              ))}
            </div>
            <div className="mt-2 text-lg">
              Punti Totali: {getBestSeedGroup(getBestFinalCombination()).points}
            </div>
          </div>
        )}

        {selectedCards.length === getCardsPerTurn(currentTurn) && currentTurn < getMaxTurns() && (
          <button 
            className="btn w-full mt-4"
            onClick={handleNextTurn}
          >
            Prossimo Turno
          </button>
        )}
      </div>
    </div>
  );
}

ReactDOM.render(<StoppaCalculator />, document.getElementById('root'));
