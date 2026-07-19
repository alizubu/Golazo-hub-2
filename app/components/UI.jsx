import React from 'react';
import { UserCircle2 } from 'lucide-react';

export const Card = ({ children, style, className = "", ...rest }) => (
  <div className={`card ${className}`} style={style} {...rest}>
    {children}
  </div>
);

export const Btn = ({ children, variant = "primary", className = "", style, disabled, ...rest }) => {
  const baseClass = `btn-hover px-4 py-2 rounded-lg text-sm font-semibold transition-all-fast flex items-center justify-center gap-2 ${disabled ? "opacity-40" : ""} ${className}`;
  
  const getVariantStyle = () => {
    switch(variant) {
      case 'primary': return { background: 'var(--pitch)', color: '#fff', border: '1px solid var(--pitch)' };
      case 'gold': return { background: 'var(--gold)', color: '#171207', border: '1px solid var(--gold)' };
      case 'claret': return { background: 'var(--claret)', color: '#fff', border: '1px solid var(--claret)' };
      case 'ghost': return { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' };
      case 'danger': return { background: 'transparent', color: 'var(--claret)', border: '1px solid var(--claretDim)' };
      default: return {};
    }
  };

  return (
    <button disabled={disabled} className={baseClass} style={{ ...getVariantStyle(), ...style }} {...rest}>
      {children}
    </button>
  );
};

export const Input = ({ className = "", style, ...props }) => (
  <input {...props} className={`input-field ${className}`} style={style} />
);

export const Select = ({ className = "", style, ...props }) => (
  <select {...props} className={`input-field ${className}`} style={{ paddingRight: '2rem', ...style }} />
);

export const Label = ({ children }) => (
  <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: 'var(--textFaint)', fontWeight: 600 }}>{children}</div>
);

export const Badge = ({ children, color = 'var(--pitch)', bg, pulse }) => (
  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide inline-flex items-center gap-1" 
        style={{ color, background: bg || `${color}22` }}>
    {pulse && <span className="live-dot" style={{ background: color }} />}
    {children}
  </span>
);

export const Avatar = ({ p, size = 40, ring, glow }) => {
  const common = { width: size, height: size, borderRadius: "9999px", flexShrink: 0 };
  const cls = `avatar-pop ${glow ? "avatar-glow" : ""}`;
  
  if (p?.avatarImage) {
    return <img src={p.avatarImage} alt={p.name} className={cls} style={{ ...common, objectFit: "cover", border: ring ? `2px solid ${ring}` : `1px solid var(--border)` }} />;
  }
  if (p?.avatar) {
    return (
      <div className={cls} style={{ ...common, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, background: 'var(--surface2)', border: ring ? `2px solid ${ring}` : `1px solid var(--border)` }}>
        {p.avatar}
      </div>
    );
  }
  return (
    <div className={cls} style={{ ...common, display: "flex", alignItems: "center", justifyContent: "center", background: 'var(--surface2)', border: ring ? `2px solid ${ring}` : `1px solid var(--border)` }}>
      <UserCircle2 size={size * 0.6} color="var(--textFaint)" />
    </div>
  );
};

export const PlayerChip = ({ p, size = 8 }) => (
  <div className="flex items-center gap-2 min-w-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
    <Avatar p={p} size={Math.max(18, size)} />
    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p?.name || "TBD"}</span>
    <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{p?.teamLogo}</span>
  </div>
);

export const SectionTitle = ({ icon: Icon, children, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Icon size={18} color="var(--pitchBright)" />
      <h2 style={{ fontSize: '1.25rem' }}>{children}</h2>
    </div>
    {right}
  </div>
);

export const EmptyState = ({ text }) => (
  <div style={{ fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0', color: 'var(--textFaint)' }}>
    {text}
  </div>
);
