const fs = require('fs');

let code = fs.readFileSync('app/components/PlayerViews.jsx', 'utf8');

// 1. Add imports
if (!code.includes('import MatchesPage')) {
  code = code.replace(
    "import SettingsView from './SettingsView';",
    "import SettingsView from './SettingsView';\nimport MatchesPage from './MatchesPage';\nimport MatchStatsModal from './MatchStatsModal';"
  );
}

// 2. Add state for match stats modal
if (!code.includes('const [selectedMatchId, setSelectedMatchId] = React.useState(null);')) {
  code = code.replace(
    "export default function PlayerViews(props) {",
    "export default function PlayerViews(props) {\n  const [selectedMatchId, setSelectedMatchId] = React.useState(null);\n  const handleMatchClick = (id) => setSelectedMatchId(id);\n  const handleCloseModal = () => setSelectedMatchId(null);\n  const newProps = { ...props, onMatchClick: handleMatchClick };"
  );
  
  // Replace the rendering to include the modal and pass newProps
  code = code.replace(
    /if \(tab === "dashboard"\) return <PlayerDashboard \{\.\.\.props\} \/>;[\s\S]*?return null;\n\}/,
    `if (tab === "dashboard") return <><PlayerDashboard {...newProps} />{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "matches") return <><PageHeader title="Matches" onBack={() => props.setTab('dashboard')} /><div className="p-4 sm:p-8"><MatchesPage {...newProps} /></div>{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "players") return <><RosterView {...props} />{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "history") return <><HistoryView {...props} />{selectedMatchId && <MatchStatsModal matchId={selectedMatchId} onClose={handleCloseModal} />}</>;
  if (tab === "notifications") return <NotificationsView {...props} />;
  if (tab === "settings") return <SettingsView {...props} />;
  return null;
}`
  );
}

// 3. Remove old functions: StandingsView, MatchesView, PlayoffsView, MatchCard, LiveScoreboard, computeStandings, PlayoffBracketDisplay
// This might be tricky with regex, so I'll just leave them in the file as dead code, or use a robust AST parser if needed. 
// However, I CAN just let them be dead code to avoid breaking things, since they are internal to PlayerViews.jsx and aren't exported.
// Wait, `PlayerDashboard` uses `MatchCard` and `LiveScoreboard`!
// Wait! I need to ensure `PlayerDashboard` uses the new `MatchCard` from the props or import. 
// But I exported `MatchCard` in `MatchCard.jsx`, so I can import it.
// Actually, `PlayerViews.jsx` HAS its own `MatchCard` function. I need to remove or rename it so it uses the imported one.
if (!code.includes("import MatchCard from './MatchCard';")) {
  code = code.replace(
    "import MatchesPage from './MatchesPage';",
    "import MatchesPage from './MatchesPage';\nimport MatchCard from './MatchCard';"
  );
}

// Remove the local MatchCard, LiveScoreboard, computeStandings, PlayoffBracketDisplay, MatchesView, PlayoffsView, StandingsView by replacing their definitions with empty strings.
// Since regex over multiple lines for functions can be brittle, I'll just comment out the local `MatchCard` and let the import take over.
code = code.replace(/function MatchCard\(\{/g, 'function OldMatchCard({');
code = code.replace(/<MatchCard /g, '<MatchCard onClick={props.onMatchClick} ');

// In PlayerDashboard, pass `onMatchClick` to elements.
code = code.replace(/function PlayerDashboard\(\{ me, activeSeason, matches, players, announcements = \[\], trophies = \[\], notifications = \[\], setTab, persistPlayers \}\) \{/g, 'function PlayerDashboard({ me, activeSeason, matches, players, announcements = [], trophies = [], notifications = [], setTab, persistPlayers, onMatchClick }) {');

// The `MatchCard` usage in PlayerDashboard:
// e.g., `<MatchCard m={recentMatches[0]} players={players} />`
// It is already covered by the replacement above: `<MatchCard onClick={props.onMatchClick} `

// Wait, the new `MatchCard` handles LIVE state internally, so we don't need `LiveScoreboard` anymore.
// In PlayerDashboard, there is `recentMatches` and `upcomingFixture`.
// If `m.status === 'live'`, the new `MatchCard` renders it beautifully.
// So let's replace `<LiveScoreboard m={...} players={...} />` with `<MatchCard m={...} players={...} onClick={onMatchClick} />`
code = code.replace(/<LiveScoreboard m=\{(.*?)\} players=\{players\} \/>/g, '<MatchCard m={$1} players={players} onClick={onMatchClick} />');


fs.writeFileSync('app/components/PlayerViews.jsx', code);
console.log('PlayerViews updated.');
