const playerIds = [1, 2, 3, 4, 5, 6, 7, 8];
const doubleRound = true;

let allLegs = [];
for (let i = 0; i < playerIds.length; i++) {
  for (let j = i + 1; j < playerIds.length; j++) {
    allLegs.push({ homeId: playerIds[i], awayId: playerIds[j] });
    if (doubleRound) {
      allLegs.push({ homeId: playerIds[j], awayId: playerIds[i] });
    }
  }
}

let bestLegs = [];
let fewestBackToBacks = Infinity;

for (let attempt = 0; attempt < 50; attempt++) {
  let tempAllLegs = [...allLegs];
  
  for (let i = tempAllLegs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempAllLegs[i], tempAllLegs[j]] = [tempAllLegs[j], tempAllLegs[i]];
  }

  const currentLegs = [];
  let backToBackCount = 0;
  
  while (tempAllLegs.length > 0) {
    let selectedIdx = -1;
    for (let i = 0; i < tempAllLegs.length; i++) {
      const match = tempAllLegs[i];
      if (currentLegs.length === 0) {
        selectedIdx = i;
        break;
      }
      const lastMatch = currentLegs[currentLegs.length - 1];
      if (
        match.homeId !== lastMatch.homeId && match.homeId !== lastMatch.awayId &&
        match.awayId !== lastMatch.homeId && match.awayId !== lastMatch.awayId
      ) {
        selectedIdx = i;
        break;
      }
    }
    
    if (selectedIdx === -1) {
      selectedIdx = 0;
      backToBackCount++;
    }
    currentLegs.push(tempAllLegs.splice(selectedIdx, 1)[0]);
  }

  if (backToBackCount < fewestBackToBacks) {
    fewestBackToBacks = backToBackCount;
    bestLegs = currentLegs;
    if (backToBackCount === 0) break;
  }
}

console.log('Fewest back-to-backs:', fewestBackToBacks);
