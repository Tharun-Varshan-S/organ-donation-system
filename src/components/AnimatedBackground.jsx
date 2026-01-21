import React from 'react';

const AnimatedBackground = () => {
  const bloodCells = Array.from({ length: 60 }, (_, i) => {
    const size = 10 + Math.random() * 30;
    const depth = Math.random();
    const random = Math.random();
    
    let type, aspectRatio;
    if (random > 0.85) {
      type = 'round';
      aspectRatio = 1;
    } else {
      type = 'oval';
      aspectRatio = 0.4 + (Math.random() * 0.35);
    }
    
    return {
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${-20 + Math.random() * 120}%`,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 12,
      size: size,
      rotation: Math.random() * 360,
      type: type,
      aspectRatio: aspectRatio,
      depth: depth,
      opacity: 0.4 + (depth * 0.5),
      blur: depth < 0.5 ? 0.5 : 0,
      scale: 0.85 + (Math.random() * 0.3),
      drift: (Math.random() - 0.5) * 30
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bloodCells.map((cell) => (
        <div
          key={cell.id}
          className="absolute animate-blood-flow-enhanced"
          style={{
            left: cell.left,
            top: cell.top,
            animationDelay: `${cell.delay}s`,
            animationDuration: `${cell.duration}s`,
            width: `${cell.size}px`,
            height: `${cell.size * cell.aspectRatio}px`,
            opacity: cell.opacity,
            filter: cell.blur > 0 ? `blur(${cell.blur}px)` : 'none',
            '--drift-x': `${cell.drift}px`,
            '--initial-rotation': `${cell.rotation}deg`,
            '--scale-factor': cell.scale
          }}
        >
          <div
            className="w-full h-full relative"
            style={{
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 35% 35%, 
                #ff6b6b 0%, 
                #ff6b6b 12%, 
                #dc2626 35%, 
                #b91c1c 60%, 
                #7f1d1d 100%)`,
              boxShadow: `
                inset -2px -2px 8px rgba(127, 29, 29, 0.6),
                inset 2px 2px 8px rgba(255, 107, 107, 0.3),
                0 4px 12px rgba(220, 38, 38, 0.4),
                0 2px 6px rgba(127, 29, 29, 0.3)
              `,
              transform: `rotate(var(--initial-rotation)) scale(var(--scale-factor))`
            }}
          >
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: cell.type === 'oval' 
                  ? 'radial-gradient(ellipse at center, rgba(127, 29, 29, 0.5) 0%, transparent 35%)'
                  : 'radial-gradient(circle at center, rgba(127, 29, 29, 0.4) 0%, transparent 40%)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;
