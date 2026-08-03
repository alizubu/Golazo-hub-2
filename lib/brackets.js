export function generateDoubleEliminationBracket(players) {
  const num = players.length;
  if (num < 4 || num > 8) throw new Error("Double Elimination is supported for 4 to 8 players.");
  
  // Players should already be randomly seeded by the caller if they wanted random
  const seeds = players;
  const s = (i) => i < num ? seeds[i].id : null;
  
  let matches = [];
  
  // The structure defines the matches, their dependencies, and their label.
  if (num === 4) {
    matches = [
      { key: 'm1', round: 'W1', homeId: s(0), awayId: s(3), label: 'Winners Round 1' },
      { key: 'm2', round: 'W1', homeId: s(1), awayId: s(2), label: 'Winners Round 1' },
      { key: 'm3', round: 'WF', homeId: null, awayId: null, label: 'Winners Final', dependsOn: { home: { match: 'm1', type: 'winner' }, away: { match: 'm2', type: 'winner' } } },
      { key: 'm4', round: 'L1', homeId: null, awayId: null, label: 'Losers Round 1', dependsOn: { home: { match: 'm1', type: 'loser' }, away: { match: 'm2', type: 'loser' } } },
      { key: 'm5', round: 'LF', homeId: null, awayId: null, label: 'Losers Final', dependsOn: { home: { match: 'm4', type: 'winner' }, away: { match: 'm3', type: 'loser' } } },
      { key: 'm6', round: 'GF', homeId: null, awayId: null, label: 'Grand Final', dependsOn: { home: { match: 'm3', type: 'winner' }, away: { match: 'm5', type: 'winner' } } },
      { key: 'm7', round: 'GF_RESET', homeId: null, awayId: null, label: 'Grand Final (Reset)', dependsOn: { home: { match: 'm6', type: 'loser' }, away: { match: 'm6', type: 'winner' } }, isConditional: true }
    ];
  } else if (num === 5) {
    matches = [
      { key: 'm1', round: 'W1', homeId: s(3), awayId: s(4), label: 'Winners Round 1' },
      { key: 'm2', round: 'W2', homeId: s(0), awayId: null, label: 'Winners Round 2', dependsOn: { away: { match: 'm1', type: 'winner' } } },
      { key: 'm3', round: 'W2', homeId: s(1), awayId: s(2), label: 'Winners Round 2' },
      { key: 'm4', round: 'WF', homeId: null, awayId: null, label: 'Winners Final', dependsOn: { home: { match: 'm2', type: 'winner' }, away: { match: 'm3', type: 'winner' } } },
      { key: 'm5', round: 'L1', homeId: null, awayId: null, label: 'Losers Round 1', dependsOn: { home: { match: 'm1', type: 'loser' }, away: { match: 'm3', type: 'loser' } } },
      { key: 'm6', round: 'L2', homeId: null, awayId: null, label: 'Losers Round 2', dependsOn: { home: { match: 'm5', type: 'winner' }, away: { match: 'm2', type: 'loser' } } },
      { key: 'm7', round: 'LF', homeId: null, awayId: null, label: 'Losers Final', dependsOn: { home: { match: 'm6', type: 'winner' }, away: { match: 'm4', type: 'loser' } } },
      { key: 'm8', round: 'GF', homeId: null, awayId: null, label: 'Grand Final', dependsOn: { home: { match: 'm4', type: 'winner' }, away: { match: 'm7', type: 'winner' } } },
      { key: 'm9', round: 'GF_RESET', homeId: null, awayId: null, label: 'Grand Final (Reset)', dependsOn: { home: { match: 'm8', type: 'loser' }, away: { match: 'm8', type: 'winner' } }, isConditional: true }
    ];
  } else if (num === 6) {
    matches = [
      { key: 'm1', round: 'W1', homeId: s(3), awayId: s(4), label: 'Winners Round 1' },
      { key: 'm2', round: 'W1', homeId: s(2), awayId: s(5), label: 'Winners Round 1' },
      { key: 'm3', round: 'W2', homeId: s(0), awayId: null, label: 'Winners Round 2', dependsOn: { away: { match: 'm1', type: 'winner' } } },
      { key: 'm4', round: 'W2', homeId: s(1), awayId: null, label: 'Winners Round 2', dependsOn: { away: { match: 'm2', type: 'winner' } } },
      { key: 'm5', round: 'WF', homeId: null, awayId: null, label: 'Winners Final', dependsOn: { home: { match: 'm3', type: 'winner' }, away: { match: 'm4', type: 'winner' } } },
      { key: 'm6', round: 'L1', homeId: null, awayId: null, label: 'Losers Round 1', dependsOn: { home: { match: 'm1', type: 'loser' }, away: { match: 'm2', type: 'loser' } } },
      { key: 'm7', round: 'L2A', homeId: null, awayId: null, label: 'Losers Round 2', dependsOn: { home: { match: 'm6', type: 'winner' }, away: { match: 'm4', type: 'loser' } } },
      { key: 'm8', round: 'L3', homeId: null, awayId: null, label: 'Losers Round 3', dependsOn: { home: { match: 'm7', type: 'winner' }, away: { match: 'm3', type: 'loser' } } },
      { key: 'm9', round: 'LF', homeId: null, awayId: null, label: 'Losers Final', dependsOn: { home: { match: 'm8', type: 'winner' }, away: { match: 'm5', type: 'loser' } } },
      { key: 'm10', round: 'GF', homeId: null, awayId: null, label: 'Grand Final', dependsOn: { home: { match: 'm5', type: 'winner' }, away: { match: 'm9', type: 'winner' } } },
      { key: 'm11', round: 'GF_RESET', homeId: null, awayId: null, label: 'Grand Final (Reset)', dependsOn: { home: { match: 'm10', type: 'loser' }, away: { match: 'm10', type: 'winner' } }, isConditional: true }
    ];
  } else if (num === 7) {
    matches = [
      { key: 'm1', round: 'W1', homeId: s(3), awayId: s(4), label: 'Winners Round 1' },
      { key: 'm2', round: 'W1', homeId: s(2), awayId: s(5), label: 'Winners Round 1' },
      { key: 'm3', round: 'W1', homeId: s(1), awayId: s(6), label: 'Winners Round 1' },
      { key: 'm4', round: 'W2', homeId: s(0), awayId: null, label: 'Winners Round 2', dependsOn: { away: { match: 'm1', type: 'winner' } } },
      { key: 'm5', round: 'W2', homeId: null, awayId: null, label: 'Winners Round 2', dependsOn: { home: { match: 'm2', type: 'winner' }, away: { match: 'm3', type: 'winner' } } },
      { key: 'm6', round: 'WF', homeId: null, awayId: null, label: 'Winners Final', dependsOn: { home: { match: 'm4', type: 'winner' }, away: { match: 'm5', type: 'winner' } } },
      { key: 'm7', round: 'L1', homeId: null, awayId: null, label: 'Losers Round 1', dependsOn: { home: { match: 'm2', type: 'loser' }, away: { match: 'm3', type: 'loser' } } },
      { key: 'm8', round: 'L2A', homeId: null, awayId: null, label: 'Losers Round 2', dependsOn: { home: { match: 'm1', type: 'loser' }, away: { match: 'm5', type: 'loser' } } },
      { key: 'm9', round: 'L2B', homeId: null, awayId: null, label: 'Losers Round 2', dependsOn: { home: { match: 'm7', type: 'winner' }, away: { match: 'm4', type: 'loser' } } },
      { key: 'm10', round: 'L3', homeId: null, awayId: null, label: 'Losers Round 3', dependsOn: { home: { match: 'm8', type: 'winner' }, away: { match: 'm9', type: 'winner' } } },
      { key: 'm11', round: 'LF', homeId: null, awayId: null, label: 'Losers Final', dependsOn: { home: { match: 'm10', type: 'winner' }, away: { match: 'm6', type: 'loser' } } },
      { key: 'm12', round: 'GF', homeId: null, awayId: null, label: 'Grand Final', dependsOn: { home: { match: 'm6', type: 'winner' }, away: { match: 'm11', type: 'winner' } } },
      { key: 'm13', round: 'GF_RESET', homeId: null, awayId: null, label: 'Grand Final (Reset)', dependsOn: { home: { match: 'm12', type: 'loser' }, away: { match: 'm12', type: 'winner' } }, isConditional: true }
    ];
  } else if (num === 8) {
    matches = [
      { key: 'm1', round: 'W1', homeId: s(0), awayId: s(7), label: 'Winners Round 1' },
      { key: 'm2', round: 'W1', homeId: s(3), awayId: s(4), label: 'Winners Round 1' },
      { key: 'm3', round: 'W1', homeId: s(1), awayId: s(6), label: 'Winners Round 1' },
      { key: 'm4', round: 'W1', homeId: s(2), awayId: s(5), label: 'Winners Round 1' },
      { key: 'm5', round: 'W2', homeId: null, awayId: null, label: 'Winners Round 2', dependsOn: { home: { match: 'm1', type: 'winner' }, away: { match: 'm2', type: 'winner' } } },
      { key: 'm6', round: 'W2', homeId: null, awayId: null, label: 'Winners Round 2', dependsOn: { home: { match: 'm3', type: 'winner' }, away: { match: 'm4', type: 'winner' } } },
      { key: 'm7', round: 'WF', homeId: null, awayId: null, label: 'Winners Final', dependsOn: { home: { match: 'm5', type: 'winner' }, away: { match: 'm6', type: 'winner' } } },
      { key: 'm8', round: 'L1A', homeId: null, awayId: null, label: 'Losers Round 1', dependsOn: { home: { match: 'm1', type: 'loser' }, away: { match: 'm2', type: 'loser' } } },
      { key: 'm9', round: 'L1B', homeId: null, awayId: null, label: 'Losers Round 1', dependsOn: { home: { match: 'm3', type: 'loser' }, away: { match: 'm4', type: 'loser' } } },
      { key: 'm10', round: 'L2A', homeId: null, awayId: null, label: 'Losers Round 2', dependsOn: { home: { match: 'm8', type: 'winner' }, away: { match: 'm6', type: 'loser' } } },
      { key: 'm11', round: 'L2B', homeId: null, awayId: null, label: 'Losers Round 2', dependsOn: { home: { match: 'm9', type: 'winner' }, away: { match: 'm5', type: 'loser' } } },
      { key: 'm12', round: 'L3', homeId: null, awayId: null, label: 'Losers Round 3', dependsOn: { home: { match: 'm10', type: 'winner' }, away: { match: 'm11', type: 'winner' } } },
      { key: 'm13', round: 'LF', homeId: null, awayId: null, label: 'Losers Final', dependsOn: { home: { match: 'm12', type: 'winner' }, away: { match: 'm7', type: 'loser' } } },
      { key: 'm14', round: 'GF', homeId: null, awayId: null, label: 'Grand Final', dependsOn: { home: { match: 'm7', type: 'winner' }, away: { match: 'm13', type: 'winner' } } },
      { key: 'm15', round: 'GF_RESET', homeId: null, awayId: null, label: 'Grand Final (Reset)', dependsOn: { home: { match: 'm14', type: 'loser' }, away: { match: 'm14', type: 'winner' } }, isConditional: true }
    ];
  }
  
  return matches;
}
