import React, { useRef, useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Person as PersonIcon, 
  Notifications as NotificationsIcon, 
  Mail as MailIcon, 
  Home as HomeIcon, 
  Search as SearchIcon, 
  Star as StarIcon, 
  Favorite as FavoriteIcon 
} from '@mui/icons-material';

// Hilfsfunktion: Winkel zwischen Zentrum und Punkt berechnen
function angleBetween(cx, cy, x, y) {
  return Math.atan2(y - cy, x - cx) * (180 / Math.PI);
}

// Normalisiert Winkel auf -180 bis 180
function normalizeAngle(angle) {
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
}

export default function RotaryWheel() {
  const [items] = useState([
    { icon: <HomeIcon />, label: 'Home', onClick: () => console.log('Home') },
    { icon: <SearchIcon />, label: 'Suche', onClick: () => console.log('Suche') },
    { icon: <StarIcon />, label: 'Favoriten', onClick: () => console.log('Favoriten') },
    { icon: <MailIcon />, label: 'Mail', onClick: () => console.log('Mail') },
    { icon: <NotificationsIcon />, label: 'Benachrichtigungen', onClick: () => console.log('Benachrichtigungen') },
    { icon: <PersonIcon />, label: 'Profil', onClick: () => console.log('Profil') },
    { icon: <SettingsIcon />, label: 'Einstellungen', onClick: () => console.log('Einstellungen') },
    { icon: <FavoriteIcon />, label: 'Likes', onClick: () => console.log('Likes') },
  ]);

  const size = 320;
  const anchor = 'center';
  const anchorOffset = 16;

  const containerRef = useRef(null);
  const rotationRef = useRef(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ angle: 0, rotation: 0 });
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastRotationRef = useRef(0);

  const getCenter = () => {
    if (!containerRef.current) return { cx: 0, cy: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    
    const { cx, cy } = getCenter();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const currentAngle = angleBetween(cx, cy, clientX, clientY);
    
    dragStartRef.current = {
      angle: currentAngle,
      rotation: rotationRef.current
    };
    
    velocityRef.current = 0;
    lastTimeRef.current = Date.now();
    lastRotationRef.current = rotationRef.current;
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const { cx, cy } = getCenter();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    const currentAngle = angleBetween(cx, cy, clientX, clientY);
    
    const angleDelta = normalizeAngle(currentAngle - dragStartRef.current.angle);
    const newRotation = dragStartRef.current.rotation + angleDelta;
    
    // Geschwindigkeit berechnen für Inertia
    const now = Date.now();
    const timeDelta = now - lastTimeRef.current;
    if (timeDelta > 0) {
      const rotationDelta = newRotation - lastRotationRef.current;
      velocityRef.current = rotationDelta / timeDelta;
    }
    
    lastTimeRef.current = now;
    lastRotationRef.current = newRotation;
    rotationRef.current = newRotation;
    setRotation(newRotation);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Inertia-Effekt basierend auf Geschwindigkeit
    const currentRotation = rotationRef.current;
    const inertiaRotation = velocityRef.current * 200; // Faktor für Schwung
    const targetRotation = currentRotation + inertiaRotation;
    
    // Auf 45-Grad-Schritte einrasten (360/8 items = 45°)
    const snapAngle = 360 / items.length;
    const snappedTarget = Math.round(targetRotation / snapAngle) * snapAngle;
    
    // Animiere zur eingerasteten Position
    const diff = snappedTarget - currentRotation;
    const duration = Math.min(Math.abs(diff) * 2, 800);
    
    // Manuelle Animation mit requestAnimationFrame
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const newValue = startRotation + diff * eased;
      
      rotationRef.current = newValue;
      setRotation(newValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    // Passive: false für preventDefault
    node.addEventListener('pointerdown', handlePointerDown, { passive: false });
    node.addEventListener('touchstart', handlePointerDown, { passive: false });
    
    return () => {
      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('touchstart', handlePointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const handleSelect = (item) => {
    if (item.onClick) item.onClick();
  };

  // Item-Positionen berechnen
  const radius = size * 0.38;
  const buttonSize = 56;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div
        ref={containerRef}
        className="relative rounded-full shadow-2xl"
        style={{
          width: size,
          height: size,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        role="dialog"
        aria-label="Rotary Menu"
      >
        {/* Hintergrund-Kreis */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700/50"
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Rotierender Container - WICHTIG: transformOrigin center center */}
        <div
          style={{
            transform: `rotate(${rotation}deg)`,
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'center center', // KRITISCH für Rotation um Mittelpunkt
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {items.map((item, idx) => {
            const angle = (360 / items.length) * idx - 90; // Start bei oben (-90°)
            const rad = (angle * Math.PI) / 180;
            
            // Position relativ zum Zentrum berechnen
            const x = size / 2 + Math.cos(rad) * radius - buttonSize / 2;
            const y = size / 2 + Math.sin(rad) * radius - buttonSize / 2;
            
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: `rotate(${-rotation}deg)`, // Gegenrotation für aufrechte Icons
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              >
                <button
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded-full shadow-lg border border-slate-600/50 transition-all hover:scale-110 active:scale-95"
                  style={{
                    width: buttonSize,
                    height: buttonSize
                  }}
                  aria-label={item.label}
                  title={item.label}
                >
                  {item.icon}
                </button>
              </div>
            );
          })}
        </div>

        {/* Zentral-Indikator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-slate-900/80 border-2 border-slate-600/50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Hilfstext */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
          <p className="text-slate-400 text-sm">
            Ziehen zum Drehen • Klicken zum Auswählen
          </p>
        </div>
      </div>
    </div>
  );
}