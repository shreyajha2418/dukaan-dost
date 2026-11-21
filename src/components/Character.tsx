import type { PersonId } from '../world/people'

interface Look {
  skin: string
  hair: string
  outfit: string
  accent: string
  style: 'long' | 'bun' | 'short' | 'ponytail' | 'bald'
  moustache?: boolean
  bindi?: boolean
}

const LOOKS: Record<PersonId, Look> = {
  riya: { skin: '#C98B62', hair: '#2B1B14', outfit: '#E85D9A', accent: '#FFD166', style: 'long', bindi: true },
  meena: { skin: '#B7774F', hair: '#3A2A22', outfit: '#2E9E6A', accent: '#F2C14E', style: 'bun', bindi: true },
  arjun: { skin: '#C68660', hair: '#1E1410', outfit: '#3B6FD8', accent: '#DCE8FF', style: 'short' },
  kavya: { skin: '#D19A70', hair: '#2A1A12', outfit: '#E8A21D', accent: '#FFF1C7', style: 'ponytail' },
  ramesh: { skin: '#B5764C', hair: '#2E2420', outfit: '#F4F1EA', accent: '#C9B98F', style: 'bald', moustache: true },
  custom: { skin: '#C68A5E', hair: '#2B1B14', outfit: '#7A5AC8', accent: '#E6DDFB', style: 'short' },
}

/** Flat cartoon person, viewBox 0 0 100 160 (head to waist/knees). */
export function Character({ id, className, title }: { id: PersonId; className?: string; title?: string }) {
  const l = LOOKS[id]
  return (
    <svg viewBox="0 0 100 160" className={className} role="img" aria-label={title ?? id}>
      {/* back hair */}
      {l.style === 'long' && <path d="M30 40 Q28 82 36 96 L64 96 Q72 82 70 40 Z" fill={l.hair} />}
      {l.style === 'ponytail' && <path d="M66 30 Q86 40 78 74 Q72 60 66 46 Z" fill={l.hair} />}
      {/* body */}
      <path d="M18 160 Q16 92 50 82 Q84 92 82 160 Z" fill={l.outfit} />
      {id === 'riya' && <path d="M30 92 Q50 120 74 90 L78 100 Q50 132 26 102 Z" fill={l.accent} opacity="0.9" />}
      {id === 'meena' && <path d="M24 150 Q40 100 80 92 L84 104 Q48 112 34 156 Z" fill={l.accent} />}
      {id === 'ramesh' && (
        <>
          <path d="M50 84 L50 130" stroke={l.accent} strokeWidth="2" />
          <circle cx="50" cy="98" r="1.8" fill={l.accent} />
          <circle cx="50" cy="110" r="1.8" fill={l.accent} />
        </>
      )}
      {id === 'arjun' && <path d="M40 84 L50 98 L60 84" fill="none" stroke={l.accent} strokeWidth="3" />}
      {/* neck */}
      <rect x="44" y="64" width="12" height="18" rx="5" fill={l.skin} />
      {/* head */}
      <ellipse cx="50" cy="44" rx="20" ry="23" fill={l.skin} />
      {/* ears */}
      <ellipse cx="30" cy="46" rx="3.5" ry="5" fill={l.skin} />
      <ellipse cx="70" cy="46" rx="3.5" ry="5" fill={l.skin} />
      {/* front hair */}
      {l.style === 'long' && <path d="M29 42 Q30 16 50 16 Q72 16 71 42 Q62 26 46 28 Q36 30 29 42 Z" fill={l.hair} />}
      {l.style === 'bun' && (
        <>
          <circle cx="50" cy="16" r="9" fill={l.hair} />
          <path d="M30 40 Q30 20 50 20 Q70 20 70 40 Q60 28 50 28 Q40 28 30 40 Z" fill={l.hair} />
          <path d="M44 22 Q50 20 56 22" stroke="#9A8E86" strokeWidth="2" fill="none" />
        </>
      )}
      {l.style === 'short' && <path d="M30 40 Q28 18 50 18 Q73 18 70 40 Q66 28 52 27 Q38 27 30 40 Z" fill={l.hair} />}
      {l.style === 'ponytail' && <path d="M30 42 Q29 18 50 18 Q71 18 70 40 Q58 26 44 30 Q35 33 30 42 Z" fill={l.hair} />}
      {l.style === 'bald' && (
        <>
          <path d="M30 44 Q29 30 34 26 Q36 36 34 46 Z" fill={l.hair} />
          <path d="M70 44 Q71 30 66 26 Q64 36 66 46 Z" fill={l.hair} />
        </>
      )}
      {/* eyes */}
      <ellipse cx="42" cy="46" rx="2.4" ry="2.8" fill="#1B1B1B" />
      <ellipse cx="58" cy="46" rx="2.4" ry="2.8" fill="#1B1B1B" />
      <path d="M37 39 Q42 37 46 39" stroke={l.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M54 39 Q58 37 63 39" stroke={l.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {l.bindi && <circle cx="50" cy="36" r="1.8" fill="#D7263D" />}
      {/* nose */}
      <path d="M50 48 Q48 54 51 55" stroke="#8A5A3C" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* moustache + mouth */}
      {l.moustache ? (
        <>
          <path d="M38 59 Q44 54 50 58 Q56 54 62 59 Q56 62 50 60 Q44 62 38 59 Z" fill={l.hair} />
          <path d="M45 64 Q50 66 55 64" stroke="#7A3B2A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <path d="M44 59 Q50 64 56 59" stroke="#7A3B2A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}
      {/* cheeks */}
      <circle cx="38" cy="54" r="3" fill="#E58B7A" opacity="0.35" />
      <circle cx="62" cy="54" r="3" fill="#E58B7A" opacity="0.35" />
    </svg>
  )
}
