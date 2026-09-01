import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Clock, ShieldAlert, Users, Network, Gavel, Globe, CheckCircle2, ChevronDown } from 'lucide-react';

const ruleData = [
  {
    id: "format",
    icon: Clock,
    titleEn: "1. Match Format",
    titleBn: "১. ম্যাচের ফরম্যাট",
    contentEn: (
      <>
        <p className="mb-2">Every Group Stage match will be played for 8 minutes, with these settings:</p>
        <div className="mb-2">
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Injury: ON</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Substitution: 6/3</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Form: Both Normal</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Extra Time: OFF</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Penalty: OFF</span>
        </div>
        <p className="mb-2">Every Group Stage match must be played using this exact format. In the Knockout Stage, Extra Time and Penalty are both ON.</p>
        <p className="mb-2">Players may not change match settings on their own — contact the Admin first for any special situation.</p>
      </>
    ),
    contentBn: (
      <>
        <p className="mb-2">Group Stage-এর প্রতিটি ম্যাচ ৮ মিনিটের হবে, নিচের সেটিংসে:</p>
        <div className="mb-2">
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Injury: ON</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Substitution: ৬/৩</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Form: Both Normal</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Extra Time: OFF</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">Penalty: OFF</span>
        </div>
        <p className="mb-2">প্রতিটি Group Stage ম্যাচ এই ফরম্যাটেই খেলতে হবে। Knockout Stage-এ Extra Time ও Penalty দুটোই ON থাকবে।</p>
        <p className="mb-2">নিজের ইচ্ছায় সেটিংস পরিবর্তন করা যাবে না — ব্যতিক্রম প্রয়োজন হলে আগে Admin-এর অনুমতি নিন।</p>
      </>
    )
  },
  {
    id: "deadline",
    icon: Clock,
    titleEn: "2. Match Deadline",
    titleBn: "২. ম্যাচের ডেডলাইন",
    contentEn: (
      <>
        <p className="mb-2">Each match has a specific deadline. Both players are responsible for completing it on time.</p>
        <p className="mb-2">If a match isn&apos;t finished before the deadline, the Admin reviews both players&apos; activity, communication, and effort to play, and may award an Auto Win.</p>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          Simply saying &quot;we could not play&quot; does not automatically make either player the winner — both sides are reviewed first.
        </div>
      </>
    ),
    contentBn: (
      <>
        <p className="mb-2">প্রতিটি ম্যাচের নির্দিষ্ট Deadline থাকবে। এর মধ্যে ম্যাচ সম্পন্ন করার দায়িত্ব উভয় খেলোয়াড়ের।</p>
        <p className="mb-2">Deadline-এর মধ্যে ম্যাচ শেষ না হলে Admin উভয় পক্ষের Activity ও চেষ্টা বিবেচনা করে Auto Win দিতে পারেন।</p>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          শুধু &quot;ম্যাচ খেলা হয়নি&quot; বললেই কেউ স্বয়ংক্রিয়ভাবে জয়ী হবে না — উভয় পক্ষ পর্যালোচনা করা হবে।
        </div>
      </>
    )
  },
  {
    id: "quitting",
    icon: ShieldAlert,
    titleEn: "3. Quitting the Tournament",
    titleBn: "৩. মাঝপথে খেলা ছেড়ে দেওয়া",
    contentEn: (
      <>
        <p className="mb-2">Leaving mid-tournament results in all remaining matches being recorded as a <b>0–1 Auto Loss</b>, submitted to the official website.</p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>Intentionally leaving may bring additional punishment from the Admin.</li>
          <li>In serious cases, an extra 3-goal penalty may apply, at the Admin&apos;s discretion.</li>
        </ul>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          Make sure you have time to complete the tournament before joining.
        </div>
      </>
    ),
    contentBn: (
      <>
        <p className="mb-2">মাঝপথে ছেড়ে দিলে বাকি সব ম্যাচে <b>০–১ Auto Loss</b> দেওয়া হবে এবং ফলাফল ওয়েবসাইটে সাবমিট হবে।</p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>ইচ্ছাকৃতভাবে ছাড়লে Admin অতিরিক্ত শাস্তি দিতে পারেন।</li>
          <li>বিশেষ ক্ষেত্রে অতিরিক্ত ৩ গোলের Penalty প্রযোজ্য হতে পারে।</li>
        </ul>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          Tournament শুরু করার আগে নিজের সময় নিশ্চিত করে নিন।
        </div>
      </>
    )
  },
  {
    id: "proxy",
    icon: Users,
    titleEn: "4. Proxy / Playing for Someone Else",
    titleBn: "৪. Proxy সংক্রান্ত নিয়ম",
    contentEn: (
      <>
        <p className="mb-2">Players must always play their own matches. Asking someone else to play for you, or playing on someone else&apos;s account, is strictly prohibited — in either direction.</p>
        <p className="mb-2"><b>If proxy is confirmed:</b></p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>All of that player&apos;s matches may be given an Auto Loss.</li>
          <li>Tournament results may be corrected or removed.</li>
          <li>The player may be banned from the next tournament.</li>
          <li>Repeated or serious violations may lead to stronger action.</li>
        </ul>
        <p className="text-[12.3px] text-slate-500 mt-2">Screenshots, screen recordings, and match records may be reviewed as evidence.</p>
      </>
    ),
    contentBn: (
      <>
        <p className="mb-2">নিজের ম্যাচ নিজেকেই খেলতে হবে। অন্য কাউকে দিয়ে খেলানো বা অন্যের Account দিয়ে খেলা — দুটোই সম্পূর্ণ নিষিদ্ধ।</p>
        <p className="mb-2"><b>প্রমাণিত হলে:</b></p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>সব ম্যাচে Auto Loss দেওয়া হবে।</li>
          <li>ফলাফল সংশোধন বা বাতিল করা হতে পারে।</li>
          <li>পরবর্তী Tournament থেকে Ban হতে পারে।</li>
          <li>গুরুতর বা পুনরাবৃত্ত হলে আরও কঠোর ব্যবস্থা নেওয়া হবে।</li>
        </ul>
        <p className="text-[12.3px] text-slate-500 mt-2">প্রমাণ হিসেবে Screenshot, Screen Record ও Match Record বিবেচনা করা হবে।</p>
      </>
    )
  },
  {
    id: "squad",
    icon: ShieldAlert,
    titleEn: "5. Squad Rules",
    titleBn: "৫. Squad সংক্রান্ত নিয়ম",
    contentEn: (
      <>
        <p className="mb-2">Each tournament uses a specific squad type — e.g. Authentic, Max, National, Club, or another announced type.</p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>Once a tournament starts with a squad type, it must be used for every match, start to finish.</li>
          <li>Switching squad types mid-tournament is not allowed.</li>
          <li>Playing with an unauthorized squad may be treated as a rule violation, with the Admin able to change the result, apply an Auto Loss, or issue another penalty.</li>
        </ul>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          Confirm the correct squad type with your opponent before starting a match.
        </div>
      </>
    ),
    contentBn: (
      <>
        <p className="mb-2">প্রতিটি Tournament নির্দিষ্ট Squad Type অনুযায়ী হবে — Authentic, Max, National, Club বা অন্য কোনো ঘোষিত টাইপ।</p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>যে Squad দিয়ে Tournament শুরু হবে, শেষ পর্যন্ত সেটাই ব্যবহার করতে হবে।</li>
          <li>মাঝপথে Squad Type পরিবর্তন করা যাবে না।</li>
          <li>অনুমোদিত নয় এমন Squad ব্যবহার করলে তা Rule Violation, এবং Admin ফলাফল পরিবর্তন, Auto Loss বা অন্য শাস্তি দিতে পারেন।</li>
        </ul>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          ম্যাচ শুরুর আগে প্রতিপক্ষের সঙ্গে Squad Type নিশ্চিত করে নিন।
        </div>
      </>
    )
  },
  {
    id: "stats",
    icon: BookOpen,
    titleEn: "6. Website Progress & Statistics",
    titleBn: "৬. ওয়েবসাইটে Progress ও Statistics",
    contentEn: (
      <>
        <p className="mb-2">Results are updated on the official website after every match, so players can track:</p>
        <div className="mb-2">
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">🏆 Wins</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">🎮 Matches Played</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">⚽ Goals</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">📈 Other Stats</span>
        </div>
        <p className="mb-2">The Admin updates official results and statistics as needed.</p>
      </>
    ),
    contentBn: (
      <>
        <p className="mb-2">প্রতিটি ম্যাচের পর ফলাফল ওয়েবসাইটে আপডেট হয়, যাতে দেখা যায়:</p>
        <div className="mb-2">
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">🏆 Wins</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">🎮 Matches Played</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">⚽ Goals</span>
          <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md mr-1.5 mb-1">📈 Other Stats</span>
        </div>
        <p className="mb-2">প্রয়োজন অনুযায়ী Admin ফলাফল ও Statistics আপডেট করবেন।</p>
      </>
    )
  },
  {
    id: "network",
    icon: Network,
    titleEn: "7. Network Issues During a Match",
    titleBn: "৭. ম্যাচ চলাকালীন Network Issue",
    contentEn: (
      <>
        <p className="mb-2">If you hit a network issue mid-match, start a screen recording immediately and keep it as proof.</p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>Valid evidence is required — without it, the Admin may reject the complaint.</li>
          <li>Both players&apos; recordings, match state, and activity are reviewed before a decision.</li>
          <li>The Admin may allow the match to continue, request a replay, or decide the final result.</li>
        </ul>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          Fake complaints or misleading evidence about network issues are a serious rule violation. The Group Admin&apos;s decision is final.
        </div>
      </>
    ),
    contentBn: (
      <>
        <p className="mb-2">ম্যাচ চলাকালীন Network Issue হলে সঙ্গে সঙ্গে Screen Record করে প্রমাণ রাখতে হবে।</p>
        <ul className="list-disc pl-5 my-1.5 space-y-1">
          <li>যথাযথ প্রমাণ ছাড়া Admin অভিযোগ গ্রহণ নাও করতে পারেন।</li>
          <li>উভয় পক্ষের Record, Match Situation ও Activity পর্যালোচনা করা হবে।</li>
          <li>Admin ম্যাচ Continue করা, Replay বা চূড়ান্ত ফলাফল নির্ধারণ করতে পারেন।</li>
        </ul>
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-200/90 text-[12.6px]">
          মিথ্যা অভিযোগ বা বিভ্রান্তিকর প্রমাণ গুরুতর Rule Violation। Group Admin-এর সিদ্ধান্তই চূড়ান্ত।
        </div>
      </>
    )
  }
];

const finalNoticeData = {
  titleEn: "Final Notice — Fair Play",
  titleBn: "চূড়ান্ত নোটিশ — Fair Play",
  contentEn: (
    <>
      <p className="mb-2">Help us keep GOLAZO HUB fair, friendly, and competitive.</p>
      <ul className="list-disc pl-5 my-2 space-y-1">
        <li>No proxy or cheating.</li>
        <li>No fake or edited evidence.</li>
        <li>Respect your opponent and communicate properly.</li>
        <li>Follow the announced match format, squad rules, and deadlines.</li>
        <li>Unsure about a rule? Ask the Admin before playing.</li>
      </ul>
      <p className="mb-3">Any rule violation may lead to a warning, Auto Loss, result change, ban, or another penalty depending on the situation.</p>
      <div className="text-center mt-3 pt-3 border-t border-amber-500/25 font-heading font-bold text-[13px] text-amber-300">
        👑 The Admin&apos;s decision is final on all GOLAZO HUB tournament matters.
      </div>
    </>
  ),
  contentBn: (
    <>
      <p className="mb-2">GOLAZO HUB-কে সুন্দর, বন্ধুত্বপূর্ণ ও প্রতিযোগিতামূলক রাখতে সবাই সহযোগিতা করুন।</p>
      <ul className="list-disc pl-5 my-2 space-y-1">
        <li>PROXY বা Cheating নয়।</li>
        <li>ভুয়া বা এডিট করা প্রমাণ নয়।</li>
        <li>প্রতিপক্ষকে সম্মান করুন ও ঠিকভাবে যোগাযোগ করুন।</li>
        <li>নির্ধারিত Match Format, Squad Rule ও Deadline মেনে চলুন।</li>
        <li>নিয়ম নিয়ে সন্দেহ থাকলে খেলার আগেই Admin-কে জিজ্ঞাসা করুন।</li>
      </ul>
      <p className="mb-3">কোনো Rule Violation-এর ক্ষেত্রে পরিস্থিতি অনুযায়ী Warning, Auto Loss, ফলাফল পরিবর্তন, Ban বা অন্য শাস্তি হতে পারে।</p>
      <div className="text-center mt-3 pt-3 border-t border-amber-500/25 font-heading font-bold text-[13px] text-amber-300">
        👑 GOLAZO HUB-এর সব বিষয়ে Admin-এর সিদ্ধান্তই চূড়ান্ত।
      </div>
    </>
  )
};

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
  const [isOpen, setIsOpen] = useState(false);
  const Icon = rule.icon;
  
  // Extract number and title (assuming format "1. Title")
  const titleText = lang === 'en' ? rule.titleEn : rule.titleBn;
  const splitIndex = titleText.indexOf('.');
  const hasNumber = splitIndex !== -1 && splitIndex < 4; // safely assume it's a number
  const ruleNumber = hasNumber ? titleText.substring(0, splitIndex) : '';
  const ruleTitle = hasNumber ? titleText.substring(splitIndex + 1).trim() : titleText;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayIdx * 0.05 + 0.1, duration: 0.4, ease: "easeOut" }}
      className={`group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${isOpen ? 'bg-white/[0.04] shadow-lg shadow-primary/5' : ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 sm:p-5 relative z-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon size={20} className="relative z-10" />
          </div>
          <div>
            {hasNumber && (
              <div className="mb-1">
                <span className="inline-block px-2 py-0.5 rounded bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest shadow-sm border border-white/5">
                  Rule {ruleNumber}
                </span>
              </div>
            )}
            <h3 className={`text-base sm:text-lg text-white tracking-tight ${lang === 'bn' ? 'font-bn font-bold' : 'font-bold'}`}>
              {ruleTitle}
            </h3>
          </div>
        </div>
        
        <div className="shrink-0 ml-4 text-white/40 group-hover:text-white/80 transition-colors bg-white/5 p-2 rounded-full">
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`p-4 sm:p-5 pt-0 pl-[4.75rem] text-slate-300 ${lang === 'bn' ? 'font-bn font-normal text-[15px]' : 'text-sm'}`}>
              <div className="border-t border-white/5 pt-4 leading-relaxed">
                {lang === 'en' ? rule.contentEn : rule.contentBn}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
            className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-xl bg-[#0c0e12]/95 border-l border-white/10 shadow-2xl flex flex-col backdrop-blur-2xl"
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
              
              {/* Final Notice */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ruleData.length * 0.05 + 0.1, duration: 0.4 }}
                className={`mt-4 p-4 sm:p-5 border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-amber-500/5 rounded-2xl shadow-lg shadow-amber-500/5 ${lang === 'bn' ? 'font-bn text-[14.5px]' : 'text-[13px]'}`}
              >
                <h3 className="font-heading text-[14.5px] font-bold text-amber-400 mb-3 flex items-center gap-2">
                  ⚠️ {lang === 'en' ? finalNoticeData.titleEn : finalNoticeData.titleBn}
                </h3>
                <div className="text-amber-100/80 leading-relaxed">
                  {lang === 'en' ? finalNoticeData.contentEn : finalNoticeData.contentBn}
                </div>
              </motion.div>

              <div className="py-8 text-center opacity-50">
                <p className="text-xs font-bold tracking-widest uppercase text-white/50">END OF RULEBOOK</p>
              </div>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
