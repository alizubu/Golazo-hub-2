export type NationalTeam = {
  id: string;
  name: string;
  confederation: string;
  isoCode: string; // ISO 3166-1 alpha-2 code for flag mapping
};

// 2026 FIFA World Cup - 48 Qualified Teams
export const NATIONAL_TEAMS: NationalTeam[] = [
  // Hosts
  { id: 'nt-can', name: 'Canada', confederation: 'Hosts (CONCACAF)', isoCode: 'ca' },
  { id: 'nt-mex', name: 'Mexico', confederation: 'Hosts (CONCACAF)', isoCode: 'mx' },
  { id: 'nt-usa', name: 'United States', confederation: 'Hosts (CONCACAF)', isoCode: 'us' },

  // AFC (Asia) - 9
  { id: 'nt-aus', name: 'Australia', confederation: 'AFC', isoCode: 'au' },
  { id: 'nt-irq', name: 'Iraq', confederation: 'AFC', isoCode: 'iq' },
  { id: 'nt-irn', name: 'IR Iran', confederation: 'AFC', isoCode: 'ir' },
  { id: 'nt-jpn', name: 'Japan', confederation: 'AFC', isoCode: 'jp' },
  { id: 'nt-jor', name: 'Jordan', confederation: 'AFC', isoCode: 'jo' },
  { id: 'nt-kor', name: 'Korea Republic', confederation: 'AFC', isoCode: 'kr' },
  { id: 'nt-qat', name: 'Qatar', confederation: 'AFC', isoCode: 'qa' },
  { id: 'nt-ksa', name: 'Saudi Arabia', confederation: 'AFC', isoCode: 'sa' },
  { id: 'nt-uzb', name: 'Uzbekistan', confederation: 'AFC', isoCode: 'uz' },

  // CAF (Africa) - 10
  { id: 'nt-alg', name: 'Algeria', confederation: 'CAF', isoCode: 'dz' },
  { id: 'nt-cpv', name: 'Cabo Verde', confederation: 'CAF', isoCode: 'cv' },
  { id: 'nt-cod', name: 'Congo DR', confederation: 'CAF', isoCode: 'cd' },
  { id: 'nt-civ', name: 'Côte d\'Ivoire', confederation: 'CAF', isoCode: 'ci' },
  { id: 'nt-egy', name: 'Egypt', confederation: 'CAF', isoCode: 'eg' },
  { id: 'nt-gha', name: 'Ghana', confederation: 'CAF', isoCode: 'gh' },
  { id: 'nt-mar', name: 'Morocco', confederation: 'CAF', isoCode: 'ma' },
  { id: 'nt-sen', name: 'Senegal', confederation: 'CAF', isoCode: 'sn' },
  { id: 'nt-rsa', name: 'South Africa', confederation: 'CAF', isoCode: 'za' },
  { id: 'nt-tun', name: 'Tunisia', confederation: 'CAF', isoCode: 'tn' },

  // CONCACAF - 3 (excluding hosts)
  { id: 'nt-cuw', name: 'Curaçao', confederation: 'CONCACAF', isoCode: 'cw' },
  { id: 'nt-hai', name: 'Haiti', confederation: 'CONCACAF', isoCode: 'ht' },
  { id: 'nt-pan', name: 'Panama', confederation: 'CONCACAF', isoCode: 'pa' },

  // CONMEBOL (South America) - 6
  { id: 'nt-arg', name: 'Argentina', confederation: 'CONMEBOL', isoCode: 'ar' },
  { id: 'nt-bra', name: 'Brazil', confederation: 'CONMEBOL', isoCode: 'br' },
  { id: 'nt-col', name: 'Colombia', confederation: 'CONMEBOL', isoCode: 'co' },
  { id: 'nt-ecu', name: 'Ecuador', confederation: 'CONMEBOL', isoCode: 'ec' },
  { id: 'nt-par', name: 'Paraguay', confederation: 'CONMEBOL', isoCode: 'py' },
  { id: 'nt-uru', name: 'Uruguay', confederation: 'CONMEBOL', isoCode: 'uy' },

  // OFC (Oceania) - 1
  { id: 'nt-nzl', name: 'New Zealand', confederation: 'OFC', isoCode: 'nz' },

  // UEFA (Europe) - 16
  { id: 'nt-aut', name: 'Austria', confederation: 'UEFA', isoCode: 'at' },
  { id: 'nt-bel', name: 'Belgium', confederation: 'UEFA', isoCode: 'be' },
  { id: 'nt-bih', name: 'Bosnia and Herzegovina', confederation: 'UEFA', isoCode: 'ba' },
  { id: 'nt-cro', name: 'Croatia', confederation: 'UEFA', isoCode: 'hr' },
  { id: 'nt-cze', name: 'Czechia', confederation: 'UEFA', isoCode: 'cz' },
  { id: 'nt-eng', name: 'England', confederation: 'UEFA', isoCode: 'gb-eng' },
  { id: 'nt-fra', name: 'France', confederation: 'UEFA', isoCode: 'fr' },
  { id: 'nt-ger', name: 'Germany', confederation: 'UEFA', isoCode: 'de' },
  { id: 'nt-ned', name: 'Netherlands', confederation: 'UEFA', isoCode: 'nl' },
  { id: 'nt-nor', name: 'Norway', confederation: 'UEFA', isoCode: 'no' },
  { id: 'nt-por', name: 'Portugal', confederation: 'UEFA', isoCode: 'pt' },
  { id: 'nt-sco', name: 'Scotland', confederation: 'UEFA', isoCode: 'gb-sct' },
  { id: 'nt-esp', name: 'Spain', confederation: 'UEFA', isoCode: 'es' },
  { id: 'nt-swe', name: 'Sweden', confederation: 'UEFA', isoCode: 'se' },
  { id: 'nt-sui', name: 'Switzerland', confederation: 'UEFA', isoCode: 'ch' },
  { id: 'nt-tur', name: 'Türkiye', confederation: 'UEFA', isoCode: 'tr' },
];
