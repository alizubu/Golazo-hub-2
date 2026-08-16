const fs = require('fs');

// 1. Update AdminConsole.jsx
let admin = fs.readFileSync('app/components/admin/AdminConsole.jsx', 'utf8');

// Replace the old img classes for flags/logos with the new one: w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm
admin = admin.replace(/className="w-4 h-3 sm:w-5 sm:h-3\.5 object-cover rounded-\[2px\] shadow-sm shrink-0"/g, 'className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm shrink-0"');
admin = admin.replace(/className="w-3\.5 h-2\.5 sm:w-5 sm:h-3\.5 object-cover rounded-\[2px\] shadow-sm shrink-0"/g, 'className="w-4 h-4 sm:w-5 sm:h-5 object-contain drop-shadow-sm shrink-0"'); // For AdminMatchControl, the avatar is w-6 h-6 sm:w-10 sm:h-10. So half is 3 (12px) and 5 (20px). Using w-4 and w-5 is fine.

fs.writeFileSync('app/components/admin/AdminConsole.jsx', admin);

// 2. Update PlayerViews.jsx (User side Match Fixtures and Points Table)
let userView = fs.readFileSync('app/components/user/PlayerViews.jsx', 'utf8');

if (!userView.includes("getPlayerIdentityBadgeUrl")) {
  userView = userView.replace("import { AvatarWithBadge }", "import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';\nimport { AvatarWithBadge }");
}

// Update matches to show logo (Scheduled Match Card)
// Search for: <Avatar p={h} size={56} />\n            <span className="text-sm font-semibold truncate text-center">{h?.name}</span>
const homeMatchOld = <Avatar p={h} size={56} />\n            <span className="text-sm font-semibold truncate text-center">{h?.name}</span>;
const homeMatchNew = <Avatar p={h} size={56} />\n            <div className="flex items-center gap-1.5 justify-center w-full px-1">\n              {getPlayerIdentityBadgeUrl(h) && <img src={getPlayerIdentityBadgeUrl(h)} alt="badge" className="w-7 h-7 object-contain drop-shadow-sm shrink-0" />}\n              <span className="text-sm font-semibold truncate text-center">{h?.name}</span>\n            </div>;
userView = userView.replace(homeMatchOld, homeMatchNew);

const awayMatchOld = <Avatar p={a} size={56} />\n            <span className="text-sm font-semibold truncate text-center">{a?.name}</span>;
const awayMatchNew = <Avatar p={a} size={56} />\n            <div className="flex items-center gap-1.5 justify-center w-full px-1">\n              {getPlayerIdentityBadgeUrl(a) && <img src={getPlayerIdentityBadgeUrl(a)} alt="badge" className="w-7 h-7 object-contain drop-shadow-sm shrink-0" />}\n              <span className="text-sm font-semibold truncate text-center">{a?.name}</span>\n            </div>;
userView = userView.replace(awayMatchOld, awayMatchNew);

// Update Points Table
// Search for: <Avatar p={s} size={24} />\n                      <span className="font-semibold">{s.name}</span>\n                      <span className="text-lg">{s.flag}</span>
const tableOld = <Avatar p={s} size={24} />\n                      <span className="font-semibold">{s.name}</span>\n                      <span className="text-lg">{s.flag}</span>;
const tableNew = <Avatar p={s} size={24} />\n                      {getPlayerIdentityBadgeUrl(s) && <img src={getPlayerIdentityBadgeUrl(s)} alt="badge" className="w-4 h-4 object-contain drop-shadow-sm shrink-0" />}\n                      <span className="font-semibold">{s.name}</span>;
userView = userView.replace(tableOld, tableNew);

fs.writeFileSync('app/components/user/PlayerViews.jsx', userView);
console.log('PlayerViews updated');
