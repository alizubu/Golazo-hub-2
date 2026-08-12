export type NationalTeam = {
  id: string;
  name: string;
  confederation: string;
  isoCode: string; // ISO 3166-1 alpha-2 code for flag mapping
  flag_url: string; // Resolved from flagcdn.com
};

// Helper to build flag URL from isoCode
const flagUrl = (code: string) => `https://flagcdn.com/w80/${code.toLowerCase()}.png`;

// 2026 FIFA World Cup - 48 Qualified Teams
export const NATIONAL_TEAMS: NationalTeam[] = [
  // Hosts
  { id: 'nt-can', name: 'Canada', confederation: 'Hosts (CONCACAF)', isoCode: 'ca', flag_url: flagUrl('ca') },
  { id: 'nt-mex', name: 'Mexico', confederation: 'Hosts (CONCACAF)', isoCode: 'mx', flag_url: flagUrl('mx') },
  { id: 'nt-usa', name: 'United States', confederation: 'Hosts (CONCACAF)', isoCode: 'us', flag_url: flagUrl('us') },

  // AFC (Asia) - 9
  { id: 'nt-aus', name: 'Australia', confederation: 'AFC', isoCode: 'au', flag_url: flagUrl('au') },
  { id: 'nt-irq', name: 'Iraq', confederation: 'AFC', isoCode: 'iq', flag_url: flagUrl('iq') },
  { id: 'nt-irn', name: 'IR Iran', confederation: 'AFC', isoCode: 'ir', flag_url: flagUrl('ir') },
  { id: 'nt-jpn', name: 'Japan', confederation: 'AFC', isoCode: 'jp', flag_url: flagUrl('jp') },
  { id: 'nt-jor', name: 'Jordan', confederation: 'AFC', isoCode: 'jo', flag_url: flagUrl('jo') },
  { id: 'nt-kor', name: 'Korea Republic', confederation: 'AFC', isoCode: 'kr', flag_url: flagUrl('kr') },
  { id: 'nt-qat', name: 'Qatar', confederation: 'AFC', isoCode: 'qa', flag_url: flagUrl('qa') },
  { id: 'nt-ksa', name: 'Saudi Arabia', confederation: 'AFC', isoCode: 'sa', flag_url: flagUrl('sa') },
  { id: 'nt-uzb', name: 'Uzbekistan', confederation: 'AFC', isoCode: 'uz', flag_url: flagUrl('uz') },

  // CAF (Africa) - 10
  { id: 'nt-alg', name: 'Algeria', confederation: 'CAF', isoCode: 'dz', flag_url: flagUrl('dz') },
  { id: 'nt-cpv', name: 'Cabo Verde', confederation: 'CAF', isoCode: 'cv', flag_url: flagUrl('cv') },
  { id: 'nt-cod', name: 'Congo DR', confederation: 'CAF', isoCode: 'cd', flag_url: flagUrl('cd') },
  { id: 'nt-civ', name: "Côte d'Ivoire", confederation: 'CAF', isoCode: 'ci', flag_url: flagUrl('ci') },
  { id: 'nt-egy', name: 'Egypt', confederation: 'CAF', isoCode: 'eg', flag_url: flagUrl('eg') },
  { id: 'nt-gha', name: 'Ghana', confederation: 'CAF', isoCode: 'gh', flag_url: flagUrl('gh') },
  { id: 'nt-mar', name: 'Morocco', confederation: 'CAF', isoCode: 'ma', flag_url: flagUrl('ma') },
  { id: 'nt-sen', name: 'Senegal', confederation: 'CAF', isoCode: 'sn', flag_url: flagUrl('sn') },
  { id: 'nt-rsa', name: 'South Africa', confederation: 'CAF', isoCode: 'za', flag_url: flagUrl('za') },
  { id: 'nt-tun', name: 'Tunisia', confederation: 'CAF', isoCode: 'tn', flag_url: flagUrl('tn') },

  // CONCACAF - 3 (excluding hosts)
  { id: 'nt-cuw', name: 'Curaçao', confederation: 'CONCACAF', isoCode: 'cw', flag_url: flagUrl('cw') },
  { id: 'nt-hai', name: 'Haiti', confederation: 'CONCACAF', isoCode: 'ht', flag_url: flagUrl('ht') },
  { id: 'nt-pan', name: 'Panama', confederation: 'CONCACAF', isoCode: 'pa', flag_url: flagUrl('pa') },

  // CONMEBOL (South America) - 6
  { id: 'nt-arg', name: 'Argentina', confederation: 'CONMEBOL', isoCode: 'ar', flag_url: flagUrl('ar') },
  { id: 'nt-bra', name: 'Brazil', confederation: 'CONMEBOL', isoCode: 'br', flag_url: flagUrl('br') },
  { id: 'nt-col', name: 'Colombia', confederation: 'CONMEBOL', isoCode: 'co', flag_url: flagUrl('co') },
  { id: 'nt-ecu', name: 'Ecuador', confederation: 'CONMEBOL', isoCode: 'ec', flag_url: flagUrl('ec') },
  { id: 'nt-par', name: 'Paraguay', confederation: 'CONMEBOL', isoCode: 'py', flag_url: flagUrl('py') },
  { id: 'nt-uru', name: 'Uruguay', confederation: 'CONMEBOL', isoCode: 'uy', flag_url: flagUrl('uy') },

  // OFC (Oceania) - 1
  { id: 'nt-nzl', name: 'New Zealand', confederation: 'OFC', isoCode: 'nz', flag_url: flagUrl('nz') },

  // UEFA (Europe) - 16
  { id: 'nt-aut', name: 'Austria', confederation: 'UEFA', isoCode: 'at', flag_url: flagUrl('at') },
  { id: 'nt-bel', name: 'Belgium', confederation: 'UEFA', isoCode: 'be', flag_url: flagUrl('be') },
  { id: 'nt-bih', name: 'Bosnia and Herzegovina', confederation: 'UEFA', isoCode: 'ba', flag_url: flagUrl('ba') },
  { id: 'nt-cro', name: 'Croatia', confederation: 'UEFA', isoCode: 'hr', flag_url: flagUrl('hr') },
  { id: 'nt-cze', name: 'Czechia', confederation: 'UEFA', isoCode: 'cz', flag_url: flagUrl('cz') },
  { id: 'nt-eng', name: 'England', confederation: 'UEFA', isoCode: 'gb-eng', flag_url: 'https://flagcdn.com/w80/gb-eng.png' },
  { id: 'nt-fra', name: 'France', confederation: 'UEFA', isoCode: 'fr', flag_url: flagUrl('fr') },
  { id: 'nt-ger', name: 'Germany', confederation: 'UEFA', isoCode: 'de', flag_url: flagUrl('de') },
  { id: 'nt-ned', name: 'Netherlands', confederation: 'UEFA', isoCode: 'nl', flag_url: flagUrl('nl') },
  { id: 'nt-nor', name: 'Norway', confederation: 'UEFA', isoCode: 'no', flag_url: flagUrl('no') },
  { id: 'nt-por', name: 'Portugal', confederation: 'UEFA', isoCode: 'pt', flag_url: flagUrl('pt') },
  { id: 'nt-sco', name: 'Scotland', confederation: 'UEFA', isoCode: 'gb-sct', flag_url: 'https://flagcdn.com/w80/gb-sct.png' },
  { id: 'nt-esp', name: 'Spain', confederation: 'UEFA', isoCode: 'es', flag_url: flagUrl('es') },
  { id: 'nt-swe', name: 'Sweden', confederation: 'UEFA', isoCode: 'se', flag_url: flagUrl('se') },
  { id: 'nt-sui', name: 'Switzerland', confederation: 'UEFA', isoCode: 'ch', flag_url: flagUrl('ch') },
  { id: 'nt-tur', name: 'Türkiye', confederation: 'UEFA', isoCode: 'tr', flag_url: flagUrl('tr') },
];

