export type Club = {
  id: string;
  name: string;
  league: string;
  country: string;
  slug: string;
  crestPath: string; // Now mapping to api-sports.io CDN
};

// IMPORTANT: This list should be refreshed each August based on promotion/relegation
export const CLUBS: Club[] = [
  // Premier League 2025–26 (20 clubs)
  { id: 'c-pl-1', name: 'Arsenal', league: 'Premier League', country: 'England', slug: 'arsenal', crestPath: 'https://media.api-sports.io/football/teams/42.png' },
  { id: 'c-pl-2', name: 'Aston Villa', league: 'Premier League', country: 'England', slug: 'aston-villa', crestPath: 'https://media.api-sports.io/football/teams/66.png' },
  { id: 'c-pl-3', name: 'Bournemouth', league: 'Premier League', country: 'England', slug: 'bournemouth', crestPath: 'https://media.api-sports.io/football/teams/35.png' },
  { id: 'c-pl-4', name: 'Brentford', league: 'Premier League', country: 'England', slug: 'brentford', crestPath: 'https://media.api-sports.io/football/teams/55.png' },
  { id: 'c-pl-5', name: 'Brighton & Hove Albion', league: 'Premier League', country: 'England', slug: 'brighton', crestPath: 'https://media.api-sports.io/football/teams/51.png' },
  { id: 'c-pl-6', name: 'Burnley', league: 'Premier League', country: 'England', slug: 'burnley', crestPath: 'https://media.api-sports.io/football/teams/44.png' },
  { id: 'c-pl-7', name: 'Chelsea', league: 'Premier League', country: 'England', slug: 'chelsea', crestPath: 'https://media.api-sports.io/football/teams/49.png' },
  { id: 'c-pl-8', name: 'Crystal Palace', league: 'Premier League', country: 'England', slug: 'crystal-palace', crestPath: 'https://media.api-sports.io/football/teams/52.png' },
  { id: 'c-pl-9', name: 'Everton', league: 'Premier League', country: 'England', slug: 'everton', crestPath: 'https://media.api-sports.io/football/teams/45.png' },
  { id: 'c-pl-10', name: 'Fulham', league: 'Premier League', country: 'England', slug: 'fulham', crestPath: 'https://media.api-sports.io/football/teams/36.png' },
  { id: 'c-pl-11', name: 'Leeds United', league: 'Premier League', country: 'England', slug: 'leeds-united', crestPath: 'https://media.api-sports.io/football/teams/63.png' },
  { id: 'c-pl-12', name: 'Liverpool', league: 'Premier League', country: 'England', slug: 'liverpool', crestPath: 'https://media.api-sports.io/football/teams/40.png' },
  { id: 'c-pl-13', name: 'Manchester City', league: 'Premier League', country: 'England', slug: 'manchester-city', crestPath: 'https://media.api-sports.io/football/teams/50.png' },
  { id: 'c-pl-14', name: 'Manchester United', league: 'Premier League', country: 'England', slug: 'manchester-united', crestPath: 'https://media.api-sports.io/football/teams/33.png' },
  { id: 'c-pl-15', name: 'Newcastle United', league: 'Premier League', country: 'England', slug: 'newcastle-united', crestPath: 'https://media.api-sports.io/football/teams/34.png' },
  { id: 'c-pl-16', name: 'Nottingham Forest', league: 'Premier League', country: 'England', slug: 'nottingham-forest', crestPath: 'https://media.api-sports.io/football/teams/65.png' },
  { id: 'c-pl-17', name: 'Sunderland', league: 'Premier League', country: 'England', slug: 'sunderland', crestPath: 'https://media.api-sports.io/football/teams/71.png' },
  { id: 'c-pl-18', name: 'Tottenham Hotspur', league: 'Premier League', country: 'England', slug: 'tottenham-hotspur', crestPath: 'https://media.api-sports.io/football/teams/47.png' },
  { id: 'c-pl-19', name: 'West Ham United', league: 'Premier League', country: 'England', slug: 'west-ham-united', crestPath: 'https://media.api-sports.io/football/teams/48.png' },
  { id: 'c-pl-20', name: 'Wolverhampton Wanderers', league: 'Premier League', country: 'England', slug: 'wolverhampton-wanderers', crestPath: 'https://media.api-sports.io/football/teams/39.png' },

  // La Liga 2025–26 (20 clubs)
  { id: 'c-ll-1', name: 'Alavés', league: 'La Liga', country: 'Spain', slug: 'alaves', crestPath: 'https://media.api-sports.io/football/teams/543.png' },
  { id: 'c-ll-2', name: 'Athletic Bilbao', league: 'La Liga', country: 'Spain', slug: 'athletic-bilbao', crestPath: 'https://media.api-sports.io/football/teams/531.png' },
  { id: 'c-ll-3', name: 'Atlético Madrid', league: 'La Liga', country: 'Spain', slug: 'atletico-madrid', crestPath: 'https://media.api-sports.io/football/teams/530.png' },
  { id: 'c-ll-4', name: 'Barcelona', league: 'La Liga', country: 'Spain', slug: 'barcelona', crestPath: 'https://media.api-sports.io/football/teams/529.png' },
  { id: 'c-ll-5', name: 'Celta Vigo', league: 'La Liga', country: 'Spain', slug: 'celta-vigo', crestPath: 'https://media.api-sports.io/football/teams/538.png' },
  { id: 'c-ll-6', name: 'Elche', league: 'La Liga', country: 'Spain', slug: 'elche', crestPath: 'https://media.api-sports.io/football/teams/798.png' },
  { id: 'c-ll-7', name: 'Espanyol', league: 'La Liga', country: 'Spain', slug: 'espanyol', crestPath: 'https://media.api-sports.io/football/teams/540.png' },
  { id: 'c-ll-8', name: 'Getafe', league: 'La Liga', country: 'Spain', slug: 'getafe', crestPath: 'https://media.api-sports.io/football/teams/546.png' },
  { id: 'c-ll-9', name: 'Girona', league: 'La Liga', country: 'Spain', slug: 'girona', crestPath: 'https://media.api-sports.io/football/teams/547.png' },
  { id: 'c-ll-10', name: 'Levante', league: 'La Liga', country: 'Spain', slug: 'levante', crestPath: 'https://media.api-sports.io/football/teams/539.png' },
  { id: 'c-ll-11', name: 'Mallorca', league: 'La Liga', country: 'Spain', slug: 'mallorca', crestPath: 'https://media.api-sports.io/football/teams/534.png' },
  { id: 'c-ll-12', name: 'Osasuna', league: 'La Liga', country: 'Spain', slug: 'osasuna', crestPath: 'https://media.api-sports.io/football/teams/533.png' },
  { id: 'c-ll-13', name: 'Rayo Vallecano', league: 'La Liga', country: 'Spain', slug: 'rayo-vallecano', crestPath: 'https://media.api-sports.io/football/teams/728.png' },
  { id: 'c-ll-14', name: 'Real Betis', league: 'La Liga', country: 'Spain', slug: 'real-betis', crestPath: 'https://media.api-sports.io/football/teams/544.png' },
  { id: 'c-ll-15', name: 'Real Madrid', league: 'La Liga', country: 'Spain', slug: 'real-madrid', crestPath: 'https://media.api-sports.io/football/teams/541.png' },
  { id: 'c-ll-16', name: 'Real Oviedo', league: 'La Liga', country: 'Spain', slug: 'real-oviedo', crestPath: 'https://media.api-sports.io/football/teams/714.png' },
  { id: 'c-ll-17', name: 'Real Sociedad', league: 'La Liga', country: 'Spain', slug: 'real-sociedad', crestPath: 'https://media.api-sports.io/football/teams/548.png' },
  { id: 'c-ll-18', name: 'Sevilla', league: 'La Liga', country: 'Spain', slug: 'sevilla', crestPath: 'https://media.api-sports.io/football/teams/536.png' },
  { id: 'c-ll-19', name: 'Valencia', league: 'La Liga', country: 'Spain', slug: 'valencia', crestPath: 'https://media.api-sports.io/football/teams/532.png' },
  { id: 'c-ll-20', name: 'Villarreal', league: 'La Liga', country: 'Spain', slug: 'villarreal', crestPath: 'https://media.api-sports.io/football/teams/533.png' }, // Villarreal is actually 533?
  // Bundesliga (Germany)
  { id: 'c-bl-1', name: 'Bayern Munich', league: 'Bundesliga', country: 'Germany', slug: 'bayern-munich', crestPath: 'https://media.api-sports.io/football/teams/157.png' },
  { id: 'c-bl-2', name: 'Borussia Dortmund', league: 'Bundesliga', country: 'Germany', slug: 'borussia-dortmund', crestPath: 'https://media.api-sports.io/football/teams/165.png' },
  { id: 'c-bl-3', name: 'Bayer Leverkusen', league: 'Bundesliga', country: 'Germany', slug: 'bayer-leverkusen', crestPath: 'https://media.api-sports.io/football/teams/168.png' },
  { id: 'c-bl-4', name: 'RB Leipzig', league: 'Bundesliga', country: 'Germany', slug: 'rb-leipzig', crestPath: 'https://media.api-sports.io/football/teams/173.png' },
  { id: 'c-bl-5', name: 'Eintracht Frankfurt', league: 'Bundesliga', country: 'Germany', slug: 'eintracht-frankfurt', crestPath: 'https://media.api-sports.io/football/teams/169.png' },
  { id: 'c-bl-6', name: 'VfB Stuttgart', league: 'Bundesliga', country: 'Germany', slug: 'vfb-stuttgart', crestPath: 'https://media.api-sports.io/football/teams/172.png' },

  // Serie A (Italy)
  { id: 'c-sa-1', name: 'Inter Milan', league: 'Serie A', country: 'Italy', slug: 'inter-milan', crestPath: 'https://media.api-sports.io/football/teams/505.png' },
  { id: 'c-sa-2', name: 'AC Milan', league: 'Serie A', country: 'Italy', slug: 'ac-milan', crestPath: 'https://media.api-sports.io/football/teams/489.png' },
  { id: 'c-sa-3', name: 'Juventus', league: 'Serie A', country: 'Italy', slug: 'juventus', crestPath: 'https://media.api-sports.io/football/teams/496.png' },
  { id: 'c-sa-4', name: 'Napoli', league: 'Serie A', country: 'Italy', slug: 'napoli', crestPath: 'https://media.api-sports.io/football/teams/492.png' },
  { id: 'c-sa-5', name: 'Roma', league: 'Serie A', country: 'Italy', slug: 'roma', crestPath: 'https://media.api-sports.io/football/teams/497.png' },
  { id: 'c-sa-6', name: 'Lazio', league: 'Serie A', country: 'Italy', slug: 'lazio', crestPath: 'https://media.api-sports.io/football/teams/487.png' },
  { id: 'c-sa-7', name: 'Atalanta', league: 'Serie A', country: 'Italy', slug: 'atalanta', crestPath: 'https://media.api-sports.io/football/teams/499.png' },
  { id: 'c-sa-8', name: 'Fiorentina', league: 'Serie A', country: 'Italy', slug: 'fiorentina', crestPath: 'https://media.api-sports.io/football/teams/502.png' },

  // Ligue 1 (France)
  { id: 'c-l1-1', name: 'Paris Saint-Germain', league: 'Ligue 1', country: 'France', slug: 'paris-saint-germain', crestPath: 'https://media.api-sports.io/football/teams/85.png' },
  { id: 'c-l1-2', name: 'Marseille', league: 'Ligue 1', country: 'France', slug: 'marseille', crestPath: 'https://media.api-sports.io/football/teams/81.png' },
  { id: 'c-l1-3', name: 'Lyon', league: 'Ligue 1', country: 'France', slug: 'lyon', crestPath: 'https://media.api-sports.io/football/teams/80.png' },
  { id: 'c-l1-4', name: 'Monaco', league: 'Ligue 1', country: 'France', slug: 'monaco', crestPath: 'https://media.api-sports.io/football/teams/79.png' },
  { id: 'c-l1-5', name: 'Lille', league: 'Ligue 1', country: 'France', slug: 'lille', crestPath: 'https://media.api-sports.io/football/teams/77.png' },
  { id: 'c-l1-6', name: 'Nice', league: 'Ligue 1', country: 'France', slug: 'nice', crestPath: 'https://media.api-sports.io/football/teams/84.png' }
];
