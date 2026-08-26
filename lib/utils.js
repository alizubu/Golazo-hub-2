import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function shortenClubName(name, maxLength = 12) {
  if (!name) return "";

  const CLUB_ABBREVIATIONS = {
    "Paris Saint-Germain": "PSG",
    "Manchester United": "Man Utd",
    "Manchester City": "Man City",
    "Tottenham Hotspur": "Spurs",
    "Borussia Dortmund": "Dortmund",
    "Atletico Madrid": "Atletico",
    "Bayern Munich": "Bayern",
    "FC Barcelona": "Barça",
  };

  if (CLUB_ABBREVIATIONS[name]) return CLUB_ABBREVIATIONS[name];

  if (name.length <= maxLength) return name;

  const words = name.split(/[\s-]+/);
  if (words.length >= 3) {
    return words.map(w => w[0]).join('').toUpperCase();
  }

  return name;
}
