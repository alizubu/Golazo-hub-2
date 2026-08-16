const fs = require('fs');
const path = 'c:\\Users\\acer\\Documents\\Golazo Hub\\app\\components\\admin\\AdminBroadcast.jsx';
let content = fs.readFileSync(path, 'utf8');

const s_master = '{/* -- Master Controls ';
const s_feed = '{/* -- Content Feed Source ';
const s_theme = '{/* -- Theme Gallery ';
const s_visual = '{/* -- Visual Settings ';
const s_smart = '{/* -- Smart Content ';
const s_breaking = '{/* -- Breaking News / Custom Marquee ';
const s_save = '{/* -- Save Button ';

const p_master = content.indexOf(s_master);
const p_feed = content.indexOf(s_feed);
const p_theme = content.indexOf(s_theme);
const p_visual = content.indexOf(s_visual);
const p_smart = content.indexOf(s_smart);
const p_breaking = content.indexOf(s_breaking);
const p_save = content.indexOf(s_save);

const headerPart = content.slice(0, p_master);
const masterPart = content.slice(p_master, p_feed);
const feedPart = content.slice(p_feed, p_theme);
const themePart = content.slice(p_theme, p_visual);
const visualPart = content.slice(p_visual, p_smart);
const smartPart = content.slice(p_smart, p_breaking);
const breakingPart = content.slice(p_breaking, p_save);
const savePart = content.slice(p_save);

// Modify headerPart to add Tabs
const tabsHeader = \
      {/* -- Tabs Container ---------------------------------------------------- */}
      <Tabs defaultValue="feed" className="w-full mt-6">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto bg-transparent border-b border-border/50 rounded-none pb-0 h-auto custom-scrollbar">
          <TabsTrigger value="feed" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm transition-all"><Radio size={16} className="text-amber-500" /> Feed & Content</TabsTrigger>
          <TabsTrigger value="themes" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm transition-all"><Palette size={16} className="text-blue-400" /> Themes & Visuals</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm transition-all"><Megaphone size={16} className="text-red-400" /> Alert Studio</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6 mt-0">
\;

// Modify themePart to make it horizontal scrolling
const themeGridStart = themePart.indexOf('<div className="grid grid-cols-1');
const themeGridEnd = themePart.indexOf('</AnimatePresence>') + '</AnimatePresence>\\n          </div>'.length;

const themeBefore = themePart.slice(0, themeGridStart);
let themeInside = themePart.slice(themeGridStart, themeGridEnd);
const themeAfter = themePart.slice(themeGridEnd);

themeInside = themeInside.replace('<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">', '<div className="flex overflow-x-auto snap-x gap-3 pb-4 custom-scrollbar">');
themeInside = themeInside.replace('<ThemeCard key={t.id} theme={t} isSelected={draft.theme === t.id} onSelect={v => update(\\'theme\\', v)} />', '<div key={t.id} className="snap-start shrink-0 w-[240px]"><ThemeCard theme={t} isSelected={draft.theme === t.id} onSelect={v => update(\\'theme\\', v)} /></div>');
// Remove the original map wrapper if needed or just replace the inner part
// Actually the previous replace handles it perfectly since it replaces the exact line.

const newThemePart = themeBefore + themeInside + themeAfter;

// Reassemble
const newContent = headerPart + tabsHeader + masterPart + feedPart + smartPart + 
  "\\n        </TabsContent>\\n\\n        <TabsContent value=\\"themes\\" className=\\"space-y-6 mt-0\\">\\n\\n" + 
  newThemePart + visualPart + 
  "\\n        </TabsContent>\\n\\n        <TabsContent value=\\"alerts\\" className=\\"space-y-6 mt-0\\">\\n\\n" + 
  breakingPart + 
  "\\n        </TabsContent>\\n      </Tabs>\\n\\n" + savePart;

fs.writeFileSync(path, newContent, 'utf8');
console.log('Refactor complete.');
