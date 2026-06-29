'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Governorate {
  id: string;
  name: { ar: string; kurd: string; en: string };
  path: string;
  labelX: number;
  labelY: number;
}

// Simplified SVG paths for each governorate (approximate boundaries)
const governoratesData: Governorate[] = [
  { id: 'duhok', name: { ar: 'دهوك', kurd: 'Duhok', en: 'Duhok' }, path: 'M250,20 L340,20 L370,60 L380,120 L350,160 L300,180 L240,160 L200,120 L210,60 Z', labelX: 285, labelY: 90 },
  { id: 'erbil', name: { ar: 'أربيل', kurd: 'Hewlêr', en: 'Erbil' }, path: 'M240,160 L300,180 L350,220 L380,280 L340,340 L280,360 L220,340 L190,280 L190,220 Z', labelX: 280, labelY: 260 },
  { id: 'sulaymaniyah', name: { ar: 'السليمانية', kurd: 'Silêmanî', en: 'Sulaymaniyah' }, path: 'M280,360 L340,340 L380,280 L440,260 L500,280 L540,340 L520,400 L460,430 L380,440 L320,420 Z', labelX: 420, labelY: 360 },
  { id: 'nineveh', name: { ar: 'نينوى', kurd: 'Neynewa', en: 'Nineveh' }, path: 'M120,120 L200,120 L240,160 L190,220 L190,280 L140,300 L90,260 L70,200 L80,150 Z', labelX: 145, labelY: 200 },
  { id: 'kirkuk', name: { ar: 'كركوك', kurd: 'Kerkûk', en: 'Kirkuk' }, path: 'M220,340 L280,360 L320,420 L300,480 L240,500 L190,480 L170,430 L180,380 Z', labelX: 245, labelY: 420 },
  { id: 'salahuddin', name: { ar: 'صلاح الدين', kurd: 'Selahedîn', en: 'Salah al-Din' }, path: 'M170,430 L190,480 L240,500 L300,480 L320,520 L280,580 L200,600 L140,560 L120,500 L140,460 Z', labelX: 220, labelY: 520 },
  { id: 'diyala', name: { ar: 'ديالى', kurd: 'Diyale', en: 'Diyala' }, path: 'M320,420 L380,440 L420,460 L440,520 L420,580 L360,600 L300,580 L280,520 L300,480 Z', labelX: 360, labelY: 510 },
  { id: 'anbar', name: { ar: 'الأنبار', kurd: 'Enbar', en: 'Anbar' }, path: 'M20,220 L70,200 L90,260 L140,300 L140,380 L120,440 L80,500 L40,520 L15,480 L10,400 L10,320 Z', labelX: 70, labelY: 360 },
  { id: 'baghdad', name: { ar: 'بغداد', kurd: 'Bexda', en: 'Baghdad' }, path: 'M200,600 L280,580 L320,520 L360,540 L380,580 L420,580 L400,620 L340,640 L260,640 L200,620 Z', labelX: 310, labelY: 610 },
  { id: 'babylon', name: { ar: 'بابل', kurd: 'Babîl', en: 'Babylon' }, path: 'M260,640 L340,640 L360,660 L380,690 L340,720 L280,720 L240,690 L230,660 Z', labelX: 300, labelY: 680 },
  { id: 'karbala', name: { ar: 'كربلاء', kurd: 'Kerbelâ', en: 'Karbala' }, path: 'M200,620 L260,640 L230,660 L240,690 L200,720 L140,720 L120,690 L140,650 Z', labelX: 180, labelY: 670 },
  { id: 'wasit', name: { ar: 'واسط', kurd: 'Wasit', en: 'Wasit' }, path: 'M380,580 L420,580 L440,520 L460,550 L520,580 L540,620 L500,660 L440,680 L380,690 L360,660 Z', labelX: 460, labelY: 620 },
  { id: 'najaf', name: { ar: 'النجف', kurd: 'Necef', en: 'Najaf' }, path: 'M140,650 L200,720 L240,690 L280,720 L280,760 L240,800 L180,820 L130,780 L110,730 Z', labelX: 190, labelY: 750 },
  { id: 'qadisiyah', name: { ar: 'القادسية', kurd: 'Qadisiye', en: 'Al-Qadisiyah' }, path: 'M280,720 L340,720 L380,690 L400,720 L420,760 L380,800 L320,820 L260,800 L240,760 Z', labelX: 320, labelY: 760 },
  { id: 'maysan', name: { ar: 'ميسان', kurd: 'Mêysan', en: 'Maysan' }, path: 'M440,680 L500,660 L540,620 L580,650 L600,700 L580,750 L540,780 L480,780 L440,750 Z', labelX: 520, labelY: 710 },
  { id: 'dhiqar', name: { ar: 'ذي قار', kurd: 'Zîqar', en: 'Dhi Qar' }, path: 'M320,820 L380,800 L420,760 L460,780 L500,800 L480,860 L420,880 L340,880 L290,860 Z', labelX: 390, labelY: 840 },
  { id: 'mutanna', name: { ar: 'المثنى', kurd: 'Musenna', en: 'Al-Muthanna' }, path: 'M180,820 L240,800 L260,800 L290,860 L260,920 L200,940 L140,920 L110,880 L130,840 Z', labelX: 200, labelY: 870 },
  { id: 'basra', name: { ar: 'البصرة', kurd: 'Besre', en: 'Basra' }, path: 'M340,880 L420,880 L480,860 L500,800 L540,820 L580,860 L560,920 L480,940 L400,940 L340,920 Z', labelX: 450, labelY: 900 },
];

export function IraqMap({ locale, className }: { locale: string; className?: string }) {
  const t = useTranslations('map');
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseEnter = useCallback((gov: Governorate, e: React.MouseEvent) => {
    setHovered(gov.id);
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40,
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 40,
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, []);

  const handleClick = useCallback((gov: Governorate) => {
    setSelected(gov.id);
    setTimeout(() => {
      router.push(`/${locale}/projects?governorate=${gov.id}`);
    }, 300);
  }, [locale, router]);

  const getGovName = (gov: Governorate) => {
    return locale === 'ar' ? gov.name.ar : locale === 'kurd' ? gov.name.kurd : gov.name.en;
  };

  return (
    <div className={cn('relative', className)}>
      <div className="text-center mb-6">
        <p className="text-white/50 text-sm">{t('click_governorate')}</p>
      </div>

      <div className="relative w-full max-w-[640px] mx-auto">
        <svg
          ref={svgRef}
          viewBox="0 0 620 960"
          className="w-full h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Unselected governorate styling */}
          <defs>
            <filter id="gol-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#C8A84E" floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background outline */}
          <rect x="5" y="10" width="610" height="940" rx="8" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {governoratesData.map((gov) => {
            const isHovered = hovered === gov.id;
            const isSelected = selected === gov.id;

            return (
              <g key={gov.id}>
                <motion.path
                  d={gov.path}
                  fill={isHovered || isSelected ? 'rgba(200, 168, 78, 0.25)' : 'rgba(255,255,255,0.04)'}
                  stroke={isHovered || isSelected ? '#C8A84E' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isHovered || isSelected ? 2 : 1}
                  filter={isHovered || isSelected ? 'url(#gol-glow)' : undefined}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={(e: React.MouseEvent) => handleMouseEnter(gov, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(gov)}
                  animate={{
                    fill: isHovered || isSelected ? 'rgba(200, 168, 78, 0.25)' : 'rgba(255,255,255,0.04)',
                    stroke: isHovered || isSelected ? '#C8A84E' : 'rgba(255,255,255,0.12)',
                  }}
                  transition={{ duration: 0.3 }}
                />
                <text
                  x={gov.labelX}
                  y={gov.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isHovered || isSelected ? '#C8A84E' : 'rgba(255,255,255,0.3)'}
                  fontSize="11"
                  fontWeight={isHovered || isSelected ? '600' : '400'}
                  className="pointer-events-none select-none transition-colors duration-300"
                  fontFamily="system-ui, sans-serif"
                >
                  {getGovName(gov)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (() => {
            const gov = governoratesData.find(g => g.id === hovered);
            if (!gov) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="absolute pointer-events-none px-3 py-1.5 rounded-lg bg-gold text-primary text-sm font-semibold whitespace-nowrap shadow-lg"
                style={{
                  left: tooltipPos.x,
                  top: tooltipPos.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {getGovName(gov)}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
