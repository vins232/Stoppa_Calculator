const { useState } = React;

function StoppaCalculator() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [selectedCards, setSelectedCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  
  const seeds = ["Denari", "Spade", "Coppe", "Bastoni"];
  const values = Array.from({length: 10}, (_, i) => i + 1);

  const getCardValue = (value) => {
    switch(value) {
      case 1: return 16;
      case 3: return 13;
      case 8: return 12;
      case 9: return 14;
      case 10: return 15;
      default: return value;
    }
  };

  const calculatePoints = (cards) => {
    if (!cards.length) return 0;
    return cards.reduce((sum, card) => sum + getCardValue(card.value), 0);
  };

  const getMaxTurns = () => numPlayers === 4 ? 5 : 4;
  
  const getCardsPerTurn = (turn) => {
    if (numPlayers === 4) {
      return turn <= 3 ? 3 : turn === 4 ? 1 : 3;
    } else {
      return turn <= 2 ? 3 : turn === 3 ? 2 : 3;
    }
  };

  const handleAddCard = (value, seed) => {
    const newCard = { value, seed };
    if (selectedCards.length < getCardsPerTurn(currentTurn)) {
      setSelectedCards([...selectedCards, newCard]);
      setAllCards([...allCards, newCard]);
    }
  };

  const handleNextTurn = () => {
    if (currentTurn < getMaxTurns()) {
      setCurrentTurn(currentTurn + 1);
      setSelectedCards([]);
    }
  };

  const getBestCombination = () => {
    if (allCards.length < 3) return allCards;
    
    let maxPoints = 0;
    let bestCombo = [];
    
    for (let i = 0; i < allCards.length - 2; i++) {
      for (let j = i + 1; j < allCards.length - 1; j++) {
        for (let k = j + 1; k < allCards.length; k++) {
          const combo = [allCards[i], allCards[j], allCards[k]];
          const points = calculatePoints(combo);
          if (points > maxPoints) {
            maxPoints = points;
            bestCombo = combo;
          }
        }
      }
    }
    
    return bestCombo;
  };

  return (
    <div className="card max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Calcolatore Stoppa</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <label className="font-medium">Giocatori:</label>
          <select 
            value={numPlayers}
            onChange={(e) => setNumPlayers(parseInt(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div className="text-lg font-medium">
          Turno {currentTurn} di {getMaxTurns()}
          {currentTurn === getMaxTurns() && " (Finale)"}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {seeds.map((seed) => (
            <div key={seed} className="space-y-2">
              <div className="font-medium">{seed}</div>
              <div className="grid grid-cols-5 gap-1">
                {values.map((value) => (
                  <button
                    key={`${seed}-${value}`}
                    className="btn p-1"
                    onClick={() => handleAddCard(value, seed)}
                    disabled={selectedCards.length >= getCardsPerTurn(currentTurn)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="font-medium">Carte Selezionate:</div>
          <div className="flex gap-2 flex-wrap">
            {selectedCards.map((card, idx) => (
              <div key={idx} className="p-2 bg-blue-100 rounded">
                {card.value} di {card.seed}
              </div>
            ))}
          </div>
          <div className="mt-2">
            Punti: {calculatePoints(selectedCards)}
          </div>
        </div>

        {currentTurn === getMaxTurns() && (
          <div className="mt-4">
            <div className="font-medium">Miglior Combinazione:</div>
            <div className="flex gap-2 flex-wrap">
              {getBestCombination().map((card, idx) => (
                <div key={idx} className="p-2 bg-green-100 rounded">
                  {card.value} di {card.seed}
                </div>
              ))}
            </div>
            <div className="mt-2">
              Punti Totali: {calculatePoints(getBestCombination())}
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
