import React from 'react';

export const InteractiveBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 w-full h-full bg-bg-paper select-none pointer-events-none overflow-hidden">
      {/* Subtle Paper Grain Pattern Overlay */}
      <div className="absolute inset-0 paper-grain opacity-60" />

      {/* Subtle Layout Guides grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(200,169,106,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,169,106,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Decorative Stationary Corner Illustrations (3% - 5% Opacity) */}
      
      {/* Top Left Corner: Faded Notebook & Pen */}
      <div className="absolute top-0 left-0 w-80 h-80 opacity-[0.035] text-apple-gold pointer-events-none transform -translate-x-12 -translate-y-12">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full">
          {/* Notebook cover */}
          <rect x="15" y="10" width="60" height="80" rx="3" />
          {/* Binder spirals */}
          <circle cx="15" cy="20" r="1.5" />
          <path d="M12 20h6" />
          <circle cx="15" cy="30" r="1.5" />
          <path d="M12 30h6" />
          <circle cx="15" cy="40" r="1.5" />
          <path d="M12 40h6" />
          <circle cx="15" cy="50" r="1.5" />
          <path d="M12 50h6" />
          <circle cx="15" cy="60" r="1.5" />
          <path d="M12 60h6" />
          <circle cx="15" cy="70" r="1.5" />
          <path d="M12 70h6" />
          <circle cx="15" cy="80" r="1.5" />
          <path d="M12 80h6" />
          {/* Ruling lines */}
          <path d="M25 25h40M25 35h40M25 45h40M25 55h40M25 65h40M25 75h40" />
          {/* Pen lying on top */}
          <path d="M78 15 l8 65" />
          <path d="M76 15 l12 2" />
          <path d="M79 80 l6 -1" />
        </svg>
      </div>

      {/* Bottom Left Corner: Fountain Pen Tip & Stationery */}
      <div className="absolute bottom-0 left-0 w-72 h-72 opacity-[0.045] text-apple-gold pointer-events-none transform -translate-x-6 translate-y-6">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full">
          {/* Fountain pen nib */}
          <path d="M50 95 L50 40 L38 25 L43 10 L57 10 L62 25 L50 40" />
          {/* Breather hole */}
          <circle cx="50" cy="22" r="1" />
          {/* Tine split line */}
          <path d="M50 10 L50 21" />
          <path d="M50 23 L50 40" />
          {/* Left / Right tines */}
          <path d="M43 10 l3 8" />
          <path d="M57 10 l-3 8" />
          {/* Enclosing envelope edge */}
          <path d="M10 80h80v15H10z" />
          <path d="M10 80l40 10 40-10" />
        </svg>
      </div>

      {/* Top Right Corner: Bookmarks, Sticky Notes & Paper Clips */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.035] text-apple-gold pointer-events-none transform translate-x-10 -translate-y-10">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full">
          {/* Stacked Sticky notes */}
          <rect x="20" y="20" width="45" height="45" rx="1" />
          <rect x="25" y="25" width="45" height="45" rx="1" />
          {/* Paperclip */}
          <path d="M80 30 v30 a8 8 0 0 1-16 0 v-25 a5 5 0 0 1 10 0 v20 a2.5 2.5 0 0 1-5 0 v-15" />
          {/* Pencil */}
          <path d="M10 75 l60-60 5 5-60 60z" />
          <path d="M10 75 l-2 4 4-2z" />
        </svg>
      </div>

      {/* Bottom Right Corner: Coffee Mug, Glasses & Folded Papers */}
      <div className="absolute bottom-0 right-0 w-80 h-80 opacity-[0.04] text-apple-gold pointer-events-none transform translate-x-12 translate-y-12">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full">
          {/* Coffee mug */}
          <path d="M20 30 h35 v35 a17.5 17.5 0 0 1-35 0 z" />
          {/* Mug handle */}
          <path d="M55 35 a8 8 0 0 1 0 16" />
          {/* Saucer plate */}
          <ellipse cx="37.5" cy="67.5" rx="22.5" ry="3.5" />
          {/* Glasses */}
          <circle cx="65" cy="40" r="8" />
          <circle cx="85" cy="40" r="8" />
          <path d="M73 40 h4" />
          <path d="M57 40 c-2-5-8-5-10-3" />
          <path d="M93 40 c2-5 8-5 10-3" />
          {/* Folded paper sheets stack */}
          <path d="M60 70 h30 v20 h-30 z" />
          <path d="M63 73 h24 M63 78 h24 M63 83 h15" />
        </svg>
      </div>

      {/* Tiny scattered elegant elements across page center */}
      {/* Subtle sparkle indicators & quotations */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 opacity-[0.1] text-apple-gold">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 right-1/4 w-3.5 h-3.5 opacity-[0.08] text-apple-gold">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </svg>
      </div>
    </div>
  );
};
export default InteractiveBackground;
