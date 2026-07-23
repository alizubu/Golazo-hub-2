const fs = require('fs');

let content = fs.readFileSync('app/components/AdminConsole.jsx', 'utf8');

// 1. Add imports to the top
content = content.replace(
  "import { generateFixtures, generatePlayoffs } from '@/app/actions/match';",
  "import { generateFixtures, generatePlayoffs, updateMatchStatus, updateMatchScore } from '@/app/actions/match';\nimport { getTrophyTemplates, awardTrophy, removeTrophy, updateTrophy, createTrophyTemplate, deleteTrophyTemplate, createAnnouncement, deleteAnnouncement } from '@/app/actions/admin';"
);

// 2. Remove all dynamic imports
const linesToRemove = [
  "const { updateMatchStatus } = await import('@/app/actions/match');",
  "const { updateMatchScore } = await import('@/app/actions/match');",
  "const { getTrophyTemplates } = await import('@/app/actions/admin');",
  "const { awardTrophy } = await import('@/app/actions/admin');",
  "const { removeTrophy } = await import('@/app/actions/admin');",
  "const { updateTrophy } = await import('@/app/actions/admin');",
  "const { createTrophyTemplate } = await import('@/app/actions/admin');",
  "const { deleteTrophyTemplate } = await import('@/app/actions/admin');",
  "const { createAnnouncement } = await import('@/app/actions/admin');",
  "const { deleteAnnouncement } = await import('@/app/actions/admin');"
];

for (const line of linesToRemove) {
  content = content.replace(new RegExp(`\\s*${line.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}`, 'g'), '');
}

fs.writeFileSync('app/components/AdminConsole.jsx', content);
console.log("Refactored AdminConsole.jsx");
