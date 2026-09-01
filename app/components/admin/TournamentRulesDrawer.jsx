import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, ShieldAlert, Users, Network, Gavel, Globe, CheckCircle2 } from 'lucide-react';

const ruleData = [
  {
    id: "format",
    icon: Clock,
    titleEn: "1. Match Format",
    titleBn: "১. ম্যাচের ফরম্যাট",
    contentEn: (
      <ul className="space-y-2 text-sm text-slate-300">
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"/> Every Group Stage match will be played for 8 minutes.</li>
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"/> Injury: ON | Substitution: 6/3 | Form: Normal | ET: OFF | Pen: OFF</li>
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"/> Knockout Stage: Extra Time ON &amp; Penalty ON.</li>
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"/> Players are not allowed to change the match settings on their own.</li>
      </ul>
    ),
    contentBn: (
      <ul className="space-y-2 text-sm text-slate-300">
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"/> প্রতিটি টুরের Group Stage-এর প্রতিটি ম্যাচ ৮ মিনিটের হবে।</li>
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"/> Injury: ON | Substitution: ৬/৩ | Form: Normal | ET: OFF | Pen: OFF</li>
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"/> Knockout Stage-এ: Extra Time: ON &amp; Penalty: ON</li>
        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"/> নির্ধারিত Match Format পরিবর্তন করে ইচ্ছামতো ম্যাচ খেলা যাবে না।</li>
      </ul>
    )
  },
  {
    id: "deadline",
    icon: Clock,
    titleEn: "2. Match Deadline",
    titleBn: "২. ম্যাচের DEADLINE",
    contentEn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>Both players are responsible for completing their match within the given Deadline. If a match is not completed, the Admin will review activity, communication, and effort to play.</p>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mt-2 text-amber-200">
          <strong>Important:</strong> Simply saying &quot;we could not play&quot; will not automatically make either player the winner.
        </div>
      </div>
    ),
    contentBn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>নির্ধারিত Deadline-এর মধ্যেই ম্যাচ সম্পন্ন করতে হবে। ম্যাচ শেষ না হলে উভয় খেলোয়াড়ের Activity, যোগাযোগ এবং ম্যাচ সম্পন্ন করার প্রচেষ্টা বিবেচনা করে Admin সিদ্ধান্ত নেবেন।</p>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mt-2 text-amber-200">
          <strong>গুরুত্বপূর্ণ:</strong> শুধু &quot;ম্যাচ খেলা হয়নি&quot; বললেই কোনো পক্ষ স্বয়ংক্রিয়ভাবে জয়ী হবে না।
        </div>
      </div>
    )
  },
  {
    id: "quitting",
    icon: ShieldAlert,
    titleEn: "3. Quitting the Tournament",
    titleBn: "৩. মাঝপথে খেলা ছেড়ে দেওয়া",
    contentEn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>If a player decides to leave the Tournament in the middle of it, all of their remaining matches will be recorded as 0-1 Auto Loss.</p>
        <p>A player who intentionally leaves the Tournament may receive additional punishment, including a 3-goal penalty applied to results.</p>
      </div>
    ),
    contentBn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>কোনো খেলোয়াড় Tournament চলাকালীন মাঝপথে খেলা ছেড়ে দিলে, তার বাকি সব ম্যাচে ০-১ Auto Loss দেওয়া হবে।</p>
        <p>ইচ্ছাকৃতভাবে Tournament ছেড়ে দিলে বিশেষ ক্ষেত্রে অতিরিক্ত ৩ গোলের Penalty/শাস্তি প্রযোজ্য হবে।</p>
      </div>
    )
  },
  {
    id: "proxy",
    icon: Users,
    titleEn: "4. Proxy / Playing for Someone Else",
    titleBn: "৪. PROXY সংক্রান্ত নিয়ম",
    contentEn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>A player must always play their own matches. Asking another person to play on your behalf will be considered PROXY and is strictly prohibited.</p>
        <ul className="mt-2 space-y-1 pl-2 border-l-2 border-red-500/50">
          <li>• All matches of that player given Auto Loss.</li>
          <li>• Player may be BANNED from the next Tournament.</li>
        </ul>
      </div>
    ),
    contentBn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>কোনো খেলোয়াড় নিজের পরিবর্তে অন্য কাউকে দিয়ে ম্যাচ খেলালে সেটি PROXY হিসেবে গণ্য হবে এবং এটি সম্পূর্ণ নিষিদ্ধ।</p>
        <ul className="mt-2 space-y-1 pl-2 border-l-2 border-red-500/50">
          <li>• সব ম্যাচে Auto Loss দেওয়া হবে।</li>
          <li>• পরবর্তী Tournament থেকে Ban করা হতে পারে।</li>
        </ul>
      </div>
    )
  },
  {
    id: "squad",
    icon: ShieldAlert,
    titleEn: "5. Squad Rules",
    titleBn: "৫. SQUAD সংক্রান্ত নিয়ম",
    contentEn: (
      <p className="text-sm text-slate-300">
        Once a Tournament starts with a specific Squad Type (Authentic, Max, National, Club), that same Squad Type must be used throughout. Players cannot switch to another Squad Type in the middle of the Tournament.
      </p>
    ),
    contentBn: (
      <p className="text-sm text-slate-300">
        যে Tournament যে Squad Type দিয়ে শুরু হবে, সব ম্যাচে শুধুমাত্র সেই Squad Type ব্যবহার করতে হবে। Tournament-এর মাঝপথে Squad Type পরিবর্তন করা যাবে না।
      </p>
    )
  },
  {
    id: "network",
    icon: Network,
    titleEn: "6. Network Issues",
    titleBn: "৬. Network Issue",
    contentEn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>If a player faces a Network Issue during a match, they should record their screen and keep clear evidence. Without enough evidence, the Admin may reject the complaint.</p>
        <p className="text-xs text-slate-400 italic">For Network Issue disputes, the Group Admin&apos;s decision will be final.</p>
      </div>
    ),
    contentBn: (
      <div className="space-y-2 text-sm text-slate-300">
        <p>Network Issue হলে যত দ্রুত সম্ভব Screen Record করে সমস্যার প্রমাণ সংরক্ষণ করতে হবে। পর্যাপ্ত প্রমাণ না থাকলে Admin অভিযোগ গ্রহণ নাও করতে পারেন।</p>
        <p className="text-xs text-slate-400 italic">Network Issue সংক্রান্ত বিষয়ে Group Admin-এর সিদ্ধান্তই চূড়ান্ত।</p>
      </div>
    )
  },
  {
    id: "fairplay",
    icon: Gavel,
    titleEn: "Final Notice: Fair Play",
    titleBn: "চূড়ান্ত নোটিশ: FAIR PLAY",
    contentEn: (
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center">
        <h4 className="font-bold text-primary mb-2">PLAY FAIR • PLAY HARD • RESPECT THE GAME</h4>
        <p className="text-sm text-slate-300">Respect your opponent and communicate properly. For all GOLAZO HUB Tournament matters, the ADMIN&apos;S DECISION will be considered FINAL.</p>
      </div>
    ),
    contentBn: (
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center">
        <h4 className="font-bold text-primary mb-2">PLAY FAIR • PLAY HARD • RESPECT THE GAME</h4>
        <p className="text-sm text-slate-300">সকল খেলোয়াড়কে প্রতিপক্ষের প্রতি সম্মানজনক আচরণ করতে হবে। Tournament-এর ক্ষেত্রে ADMIN-এর সিদ্ধান্তই চূড়ান্ত বলে গণ্য হবে।</p>
      </div>
    )
  }
];

function SegmentedControl({ lang, setLang }) {
  const options = [
    { id: 'en', label: 'English', icon: Globe },
    { id: 'bn', label: 'বাংলা', icon: Globe },
  ];

  return (
    <div className="mt-6 flex bg-black/40 p-1.5 rounded-xl border border-white/10 relative z-10 w-full sm:w-fit backdrop-blur-md shadow-inner">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setLang(opt.id)}
          className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-colors z-10 ${
            lang === opt.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {lang === opt.id && (
            <motion.div
              layoutId="active-lang-pill"
              className="absolute inset-0 bg-primary/90 shadow-[0_0_15px_rgba(20,184,166,0.4)] rounded-lg -z-10"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
          <opt.icon size={14} className={lang === opt.id ? 'opacity-100' : 'opacity-60'} /> {opt.label}
        </button>
      ))}
    </div>
  );
}

function RuleCard({ rule, lang, delayIdx }) {
  const Icon = rule.icon;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayIdx * 0.05 + 0.1, duration: 0.4, ease: "easeOut" }}
      className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      {/* Subtle Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="p-4 sm:p-5 relative z-10">
        <h3 className="flex items-center gap-3 text-base sm:text-lg font-bold text-white mb-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon size={18} className="relative z-10" />
          </div>
          <span className="tracking-tight">{lang === 'en' ? rule.titleEn : rule.titleBn}</span>
        </h3>
        <div className="pl-[3.25rem]">
          {lang === 'en' ? rule.contentEn : rule.contentBn}
        </div>
      </div>
    </motion.div>
  );
}

export function TournamentRulesDrawer({ isOpen, onClose }) {
  const [lang, setLang] = useState('en');

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragDirectionLock
            onDragEnd={(e, info) => {
              // Swipe right to close
              if (info.offset.x > 100 || info.velocity.x > 200) {
                onClose();
              }
            }}
            className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-md bg-[#0c0e12]/95 border-l border-white/10 shadow-2xl flex flex-col backdrop-blur-2xl"
          >
            {/* Mobile Drag Handle */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full md:hidden" />

            {/* Header */}
            <div className="relative p-6 pt-8 md:pt-6 border-b border-white/10 shrink-0 overflow-hidden bg-secondary/30">
              <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h2 className="text-2xl font-black font-heading tracking-tight text-white flex items-center gap-2">
                    <BookOpen className="text-primary" size={24} /> Official Rules
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Golazo Hub eFootball Regulations</p>
                </div>
                
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Language Toggle */}
              <SegmentedControl lang={lang} setLang={setLang} />
            </div>

            {/* Rules Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative custom-scrollbar">
              {ruleData.map((rule, idx) => (
                <RuleCard key={rule.id} rule={rule} lang={lang} delayIdx={idx} />
              ))}
              
              <div className="py-8 text-center opacity-50">
                <p className="text-xs font-bold tracking-widest uppercase">END OF RULEBOOK</p>
              </div>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
