import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

const MentionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = index => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.name });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-[#0a0c14] border border-white/10 rounded-xl shadow-2xl p-2 min-w-[200px] flex flex-col gap-1 max-h-[300px] overflow-y-auto no-scrollbar backdrop-blur-xl z-[9999]">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all w-full outline-none cursor-pointer",
              index === selectedIndex ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" : "text-white hover:bg-white/5 hover:text-white"
            )}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/10">
              {item.avatarImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.avatarImage} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-[8px] font-black">{item.avatar}</div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight">{item.name}</span>
              <span className="text-[10px] text-slate-500 tracking-wider">@{item.username}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-3 text-xs text-slate-500 font-bold tracking-wider uppercase text-center">No players found</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList;
