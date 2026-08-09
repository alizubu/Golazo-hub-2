export type Club = {
  id: string;
  name: string;
  league: string;
  country: string;
  slug: string;
  crestPath: string;
};

// IMPORTANT: This list should be refreshed each August based on promotion/relegation
export const CLUBS: Club[] = [
  // Premier League 2025–26 (20 clubs)
  { id: 'c-pl-1', name: 'Arsenal', league: 'Premier League', country: 'England', slug: 'arsenal', crestPath: '/assets/crests/arsenal.svg' },
  { id: 'c-pl-2', name: 'Aston Villa', league: 'Premier League', country: 'England', slug: 'aston-villa', crestPath: '/assets/crests/aston-villa.svg' },
  { id: 'c-pl-3', name: 'Bournemouth', league: 'Premier League', country: 'England', slug: 'bournemouth', crestPath: '/assets/crests/bournemouth.svg' },
  { id: 'c-pl-4', name: 'Brentford', league: 'Premier League', country: 'England', slug: 'brentford', crestPath: '/assets/crests/brentford.svg' },
  { id: 'c-pl-5', name: 'Brighton & Hove Albion', league: 'Premier League', country: 'England', slug: 'brighton', crestPath: '/assets/crests/brighton.svg' },
  { id: 'c-pl-6', name: 'Burnley', league: 'Premier League', country: 'England', slug: 'burnley', crestPath: '/assets/crests/burnley.svg' },
  { id: 'c-pl-7', name: 'Chelsea', league: 'Premier League', country: 'England', slug: 'chelsea', crestPath: '/assets/crests/chelsea.svg' },
  { id: 'c-pl-8', name: 'Crystal Palace', league: 'Premier League', country: 'England', slug: 'crystal-palace', crestPath: '/assets/crests/crystal-palace.svg' },
  { id: 'c-pl-9', name: 'Everton', league: 'Premier League', country: 'England', slug: 'everton', crestPath: '/assets/crests/everton.svg' },
  { id: 'c-pl-10', name: 'Fulham', league: 'Premier League', country: 'England', slug: 'fulham', crestPath: '/assets/crests/fulham.svg' },
  { id: 'c-pl-11', name: 'Leeds United', league: 'Premier League', country: 'England', slug: 'leeds-united', crestPath: '/assets/crests/leeds-united.svg' },
  { id: 'c-pl-12', name: 'Liverpool', league: 'Premier League', country: 'England', slug: 'liverpool', crestPath: '/assets/crests/liverpool.svg' },
  { id: 'c-pl-13', name: 'Manchester City', league: 'Premier League', country: 'England', slug: 'manchester-city', crestPath: '/assets/crests/manchester-city.svg' },
  { id: 'c-pl-14', name: 'Manchester United', league: 'Premier League', country: 'England', slug: 'manchester-united', crestPath: '/assets/crests/manchester-united.svg' },
  { id: 'c-pl-15', name: 'Newcastle United', league: 'Premier League', country: 'England', slug: 'newcastle-united', crestPath: '/assets/crests/newcastle-united.svg' },
  { id: 'c-pl-16', name: 'Nottingham Forest', league: 'Premier League', country: 'England', slug: 'nottingham-forest', crestPath: '/assets/crests/nottingham-forest.svg' },
  { id: 'c-pl-17', name: 'Sunderland', league: 'Premier League', country: 'England', slug: 'sunderland', crestPath: '/assets/crests/sunderland.svg' },
  { id: 'c-pl-18', name: 'Tottenham Hotspur', league: 'Premier League', country: 'England', slug: 'tottenham-hotspur', crestPath: '/assets/crests/tottenham-hotspur.svg' },
  { id: 'c-pl-19', name: 'West Ham United', league: 'Premier League', country: 'England', slug: 'west-ham-united', crestPath: '/assets/crests/west-ham-united.svg' },
  { id: 'c-pl-20', name: 'Wolverhampton Wanderers', league: 'Premier League', country: 'England', slug: 'wolverhampton-wanderers', crestPath: '/assets/crests/wolverhampton-wanderers.svg' },

  // La Liga 2025–26 (20 clubs)
  { id: 'c-ll-1', name: 'Alavés', league: 'La Liga', country: 'Spain', slug: 'alaves', crestPath: '/assets/crests/alaves.svg' },
  { id: 'c-ll-2', name: 'Athletic Bilbao', league: 'La Liga', country: 'Spain', slug: 'athletic-bilbao', crestPath: '/assets/crests/athletic-bilbao.svg' },
  { id: 'c-ll-3', name: 'Atlético Madrid', league: 'La Liga', country: 'Spain', slug: 'atletico-madrid', crestPath: '/assets/crests/atletico-madrid.svg' },
  { id: 'c-ll-4', name: 'Barcelona', league: 'La Liga', country: 'Spain', slug: 'barcelona', crestPath: '/assets/crests/barcelona.svg' },
  { id: 'c-ll-5', name: 'Celta Vigo', league: 'La Liga', country: 'Spain', slug: 'celta-vigo', crestPath: '/assets/crests/celta-vigo.svg' },
  { id: 'c-ll-6', name: 'Elche', league: 'La Liga', country: 'Spain', slug: 'elche', crestPath: '/assets/crests/elche.svg' },
  { id: 'c-ll-7', name: 'Espanyol', league: 'La Liga', country: 'Spain', slug: 'espanyol', crestPath: '/assets/crests/espanyol.svg' },
  { id: 'c-ll-8', name: 'Getafe', league: 'La Liga', country: 'Spain', slug: 'getafe', crestPath: '/assets/crests/getafe.svg' },
  { id: 'c-ll-9', name: 'Girona', league: 'La Liga', country: 'Spain', slug: 'girona', crestPath: '/assets/crests/girona.svg' },
  { id: 'c-ll-10', name: 'Levante', league: 'La Liga', country: 'Spain', slug: 'levante', crestPath: '/assets/crests/levante.svg' },
  { id: 'c-ll-11', name: 'Mallorca', league: 'La Liga', country: 'Spain', slug: 'mallorca', crestPath: '/assets/crests/mallorca.svg' },
  { id: 'c-ll-12', name: 'Osasuna', league: 'La Liga', country: 'Spain', slug: 'osasuna', crestPath: '/assets/crests/osasuna.svg' },
  { id: 'c-ll-13', name: 'Rayo Vallecano', league: 'La Liga', country: 'Spain', slug: 'rayo-vallecano', crestPath: '/assets/crests/rayo-vallecano.svg' },
  { id: 'c-ll-14', name: 'Real Betis', league: 'La Liga', country: 'Spain', slug: 'real-betis', crestPath: '/assets/crests/real-betis.svg' },
  { id: 'c-ll-15', name: 'Real Madrid', league: 'La Liga', country: 'Spain', slug: 'real-madrid', crestPath: '/assets/crests/real-madrid.svg' },
  { id: 'c-ll-16', name: 'Real Oviedo', league: 'La Liga', country: 'Spain', slug: 'real-oviedo', crestPath: '/assets/crests/real-oviedo.svg' },
  { id: 'c-ll-17', name: 'Real Sociedad', league: 'La Liga', country: 'Spain', slug: 'real-sociedad', crestPath: '/assets/crests/real-sociedad.svg' },
  { id: 'c-ll-18', name: 'Sevilla', league: 'La Liga', country: 'Spain', slug: 'sevilla', crestPath: '/assets/crests/sevilla.svg' },
  { id: 'c-ll-19', name: 'Valencia', league: 'La Liga', country: 'Spain', slug: 'valencia', crestPath: '/assets/crests/valencia.svg' },
  { id: 'c-ll-20', name: 'Villarreal', league: 'La Liga', country: 'Spain', slug: 'villarreal', crestPath: '/assets/crests/villarreal.svg' },
];
