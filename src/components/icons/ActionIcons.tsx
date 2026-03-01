import React from 'react';

// === Phase 1: Home Screen "Do Now" Icons ===
// Uses real 48x48 SVG assets from /public/icons/
// Accepts SVG-compatible props for drop-in compatibility with existing callsites.

type SvgCompatProps = React.SVGProps<SVGSVGElement> & { className?: string };

function makeIcon(src: string) {
    return function Icon({ className = 'w-6 h-6' }: SvgCompatProps) {
        return <img src={src} className={className} alt="" draggable={false} />;
    };
}

export const GoBagIcon         = makeIcon('/icons/go-bag.svg');
export const RadarMonitorIcon  = makeIcon('/icons/weather-radar.svg');
export const BatteryChargeIcon = makeIcon('/icons/battery.svg');
export const MoveUpstairsIcon  = makeIcon('/icons/high-ground.svg');
export const CleanWaterIcon    = makeIcon('/icons/clean-water.svg');
export const VehiclePrepIcon   = makeIcon('/icons/car.svg');
export const PowerCutIcon      = makeIcon('/icons/lightning-bolt.svg');
export const SafeHubIcon       = makeIcon('/icons/map-pin.svg');
export const EvacuateIcon      = makeIcon('/icons/siren.svg');
export const RescueCallIcon    = makeIcon('/icons/telephone.svg');
export const AvoidWaterIcon    = makeIcon('/icons/floodwater.svg');
export const MedKitIcon        = makeIcon('/icons/medical-kit.svg');
