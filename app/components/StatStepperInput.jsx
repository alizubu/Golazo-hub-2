import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function StatStepperInput({ label, statKey, values, onChange }) {
  const handleA = (delta) => {
    onChange(statKey, 'a', Math.max(0, (values.a || 0) + delta));
  };

  const handleB = (delta) => {
    onChange(statKey, 'b', Math.max(0, (values.b || 0) + delta));
  };

  const isPossession = statKey === 'possession';
  const total = (values.a || 0) + (values.b || 0);
  const showError = isPossession && total !== 100 && total !== 0;

  return (
    <div className="flex flex-col gap-2 p-3 bg-secondary/30 rounded-xl border border-border/50">
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {showError && (
          <span className="text-[9px] font-bold uppercase text-red-500 tracking-wider">Must equal 100</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Player A (Home) */}
        <div className="flex items-center gap-1.5 bg-background rounded-lg border border-pitch/30 p-1">
          <button 
            type="button"
            onClick={() => handleA(-1)}
            className="p-1.5 md:p-2 rounded hover:bg-pitch/20 text-pitch transition-colors"
          >
            <Minus size={16} />
          </button>
          <div className="w-8 md:w-12 text-center font-mono font-bold text-base md:text-lg text-white">
            {values.a || 0}
          </div>
          <button 
            type="button"
            onClick={() => handleA(1)}
            className="p-1.5 md:p-2 rounded hover:bg-pitch/20 text-pitch transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="text-muted-foreground/30 font-bold">—</div>

        {/* Player B (Away) */}
        <div className="flex items-center gap-1.5 bg-background rounded-lg border border-claret/30 p-1">
          <button 
            type="button"
            onClick={() => handleB(-1)}
            className="p-1.5 md:p-2 rounded hover:bg-claret/20 text-claret transition-colors"
          >
            <Minus size={16} />
          </button>
          <div className="w-8 md:w-12 text-center font-mono font-bold text-base md:text-lg text-white">
            {values.b || 0}
          </div>
          <button 
            type="button"
            onClick={() => handleB(1)}
            className="p-1.5 md:p-2 rounded hover:bg-claret/20 text-claret transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
