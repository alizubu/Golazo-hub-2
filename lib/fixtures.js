/**
 * Generates round-robin fixtures using the Circle Method.
 * @param {Array} players - Array of player objects with at least { id }
 * @param {boolean} doubleRound - If true, generates home and away matches
 * @returns {Array} Array of rounds, where each round is an array of matches { homeId, awayId }
 */
export function generateRoundRobinFixtures(players, doubleRound = false) {
  if (!players || players.length < 2) return [];

  // Create a copy so we don't mutate the original array
  const teamList = [...players];
  
  // If odd number of players, add a dummy "BYE" player
  const hasBye = teamList.length % 2 !== 0;
  if (hasBye) {
    teamList.push({ id: 'BYE' });
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  
  const rounds = [];
  
  for (let round = 0; round < numRounds; round++) {
    const currentRoundMatches = [];
    
    for (let match = 0; match < matchesPerRound; match++) {
      const home = teamList[match];
      const away = teamList[numTeams - 1 - match];
      
      // Skip the match if one of the teams is the BYE dummy
      if (home.id !== 'BYE' && away.id !== 'BYE') {
        // Alternate home/away for the fixed first team based on round parity
        if (match === 0 && round % 2 !== 0) {
          currentRoundMatches.push({ homeId: away.id, awayId: home.id });
        } else {
          currentRoundMatches.push({ homeId: home.id, awayId: away.id });
        }
      }
    }
    
    rounds.push(currentRoundMatches);
    
    // Rotate teams clockwise, keeping the first team fixed
    teamList.splice(1, 0, teamList.pop());
  }

  // If double round-robin, mirror the schedule with home/away swapped
  if (doubleRound) {
    const secondHalfRounds = rounds.map(roundMatches => 
      roundMatches.map(match => ({
        homeId: match.awayId,
        awayId: match.homeId
      }))
    );
    rounds.push(...secondHalfRounds);
  }

  return rounds;
}
