export const PALETTES = [
    // Plasma
    (v:number, t:number) => {
        const r = Math.sin(v * 6.28 + t) * 0.5 + 0.5;
        const g = Math.sin(v * 6.28 + t + 2.09) * 0.5 + 0.5;
        const b = Math.sin(v * 6.28 + t + 4.19) * 0.5 + 0.5;
        return `rgb(${Math.floor(r*255)}, ${Math.floor(g*255)}, ${Math.floor(b*255)})`;
    },
    // Fire
    (v:number, t:number) => {
        const r = Math.min(1, (v + Math.sin(t*0.5)*0.2) * 2);
        const g = Math.max(0, Math.min(1, (v - 0.5) * 2));
        const b = Math.max(0, Math.min(1, (v - 0.8) * 5));
        return `rgb(${Math.floor(r*255)}, ${Math.floor(g*255)}, ${Math.floor(b*255)})`;
    },
    // Ocean
    (v:number, t:number) => {
        const r = Math.max(0, 0.2 - v * 0.2);
        const g = (v + Math.sin(t*0.5)*0.1) * 0.8;
        const b = 0.5 + v * 0.5;
        return `rgb(${Math.floor(r*255)}, ${Math.floor(g*255)}, ${Math.floor(b*255)})`;
    },
    // Neon
    (v:number, t:number) => {
        const r = v > 0.5 ? 1 : v * 2;
        const g = Math.sin(v * 3.14 + t) * 0.8;
        const b = v < 0.5 ? 1 : (1 - v) * 2;
        return `rgb(${Math.floor(r*255)}, ${Math.floor(g*255)}, ${Math.floor(b*255)})`;
    }
];
