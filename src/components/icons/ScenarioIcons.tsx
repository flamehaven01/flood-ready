import React from 'react';

// === Phase 3: AI Quick Assist Scenario Icons ===
// Uses real 48x48 SVG assets from /public/icons/
// getActionIcon() maps AI response text → matching icon component.

type SvgCompatProps = React.SVGProps<SVGSVGElement> & { className?: string };

function makeIcon(src: string) {
    return function Icon({ className = 'w-6 h-6' }: SvgCompatProps) {
        return <img src={src} className={className} alt="" draggable={false} />;
    };
}

export const MedicalCrossIcon   = makeIcon('/icons/medical-kit.svg');
export const AnimalSnakeIcon    = makeIcon('/icons/snake.svg');
export const HighVoltageIcon    = makeIcon('/icons/lightning-bolt.svg');
export const RunningEscapeIcon  = makeIcon('/icons/siren.svg');
export const AlertSirenIcon     = makeIcon('/icons/siren.svg');
export const HighGroundIcon     = makeIcon('/icons/high-ground.svg');
export const SnowflakeColdIcon  = makeIcon('/icons/snowflake.svg');
export const TrappedCarIcon     = makeIcon('/icons/car.svg');
export const FireFlameIcon      = makeIcon('/icons/fire.svg');
export const PhoneCallIcon      = makeIcon('/icons/telephone.svg');
export const CheckDefaultIcon   = makeIcon('/icons/checkmark.svg');

// Helper to determine icon from AI text payload
export function getActionIcon(actionText: string) {
    const text = actionText.toLowerCase();

    // Medical / First Aid
    if (text.match(/medical|pill|medicine|bleed|wound|bandage|drug|doctor|hospital|ยา|บัตร|บาด/)) return MedicalCrossIcon;

    // Power / Electric
    if (text.match(/power|electric|shock|breaker|wire|plug|ไฟ/)) return HighVoltageIcon;

    // High Ground / Moving upstairs
    if (text.match(/highest|roof|upper|upstairs|climb|high ground|ชั้น/)) return HighGroundIcon;

    // Escape / Move / Evade
    if (text.match(/evacuate|run|escape|leave|move to|หนี|ออกจาก/)) return RunningEscapeIcon;

    // Animal Bite / Snake
    if (text.match(/snake|dog|bite|animal|venom|งู|หมา/)) return AnimalSnakeIcon;

    // Cold / Hypothermia
    if (text.match(/cold|freeze|warm|hypothermia|blanket|หนาว|อุ่น/)) return SnowflakeColdIcon;

    // Car / Vehicle
    if (text.match(/car|vehicle|drive|window|seatbelt|รถ/)) return TrappedCarIcon;

    // Fire / Burn
    if (text.match(/fire|burn|flame|smoke|extinguisher|ไฟไหม้/)) return FireFlameIcon;

    // Call Emergency
    if (text.match(/call|phone|1669|emergency number|contact|โทร/)) return PhoneCallIcon;

    // Generic Siren/Alert
    if (text.match(/warning|alert|beware|siren|เตือน/)) return AlertSirenIcon;

    return CheckDefaultIcon;
}
