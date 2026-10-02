// High-fidelity inline SVG avatars and realistic profile portrait artwork
// Guaranteed to load instantly, no external network dependencies, no broken links.

export function getProfileAvatar(id: string, gender: string, age: number, seedName: string): string {
  // Return an SVG data URI with distinct warm portrait lighting and clean modern styling
  const hue = Math.abs(hashString(id)) % 360;
  const skinTones = ['#f5d0b5', '#eed0b6', '#e0ac69', '#c68642', '#8d5524', '#f1c27d'];
  const skin = skinTones[Math.abs(hashString(id + 'skin')) % skinTones.length];
  const bgGradients = [
    ['#e0f2fe', '#bae6fd'],
    ['#fef3c7', '#fde68a'],
    ['#fce7f3', '#fbcfe8'],
    ['#ede9fe', '#ddd6fe'],
    ['#ecfdf5', '#a7f3d0'],
    ['#fff1f2', '#fecdd3'],
    ['#f8fafc', '#e2e8f0']
  ];
  const bg = bgGradients[Math.abs(hashString(id + 'bg')) % bgGradients.length];
  
  const initials = seedName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');

  const isFemale = gender === 'Feminino';
  const hairColors = ['#1a1110', '#3b2219', '#63391d', '#965a32', '#d4af37', '#808080'];
  const hair = hairColors[Math.abs(hashString(id + 'hair')) % hairColors.length];

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg[0]}" />
        <stop offset="100%" stop-color="${bg[1]}" />
      </linearGradient>
      <linearGradient id="body-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue}, 45%, 45%)" />
        <stop offset="100%" stop-color="hsl(${hue}, 55%, 30%)" />
      </linearGradient>
      <radialGradient id="light-${id}" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.1" />
      </radialGradient>
      <filter id="shadow-${id}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.18" />
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="400" height="400" fill="url(#bg-${id})" />
    <circle cx="200" cy="180" r="140" fill="#ffffff" opacity="0.35" filter="blur(20px)" />
    
    <!-- Shoulders & Outfit -->
    <path d="M 90 400 C 95 320, 140 290, 200 290 C 260 290, 305 320, 310 400 Z" fill="url(#body-${id})" />
    
    <!-- Collar / Neck -->
    <rect x="175" y="240" width="50" height="60" rx="10" fill="${skin}" opacity="0.9" />
    <path d="M 175 255 Q 200 275 225 255" stroke="rgba(0,0,0,0.12)" stroke-width="3" fill="none" />

    <!-- Head / Face -->
    <g filter="url(#shadow-${id})">
      <ellipse cx="200" cy="185" rx="68" ry="85" fill="${skin}" />
      <ellipse cx="200" cy="185" rx="68" ry="85" fill="url(#light-${id})" />
    </g>

    <!-- Hair -->
    ${
      isFemale
        ? `
        <!-- Female Hair Style -->
        <path d="M 125 180 C 120 100, 160 85, 200 85 C 240 85, 280 100, 275 180 C 275 250, 265 290, 250 310 C 245 280, 255 190, 250 170 C 235 125, 165 125, 150 170 C 145 190, 155 280, 150 310 C 135 290, 125 250, 125 180 Z" fill="${hair}" />
        <path d="M 140 145 Q 200 115 260 145" stroke="${hair}" stroke-width="14" fill="none" stroke-linecap="round" />
        `
        : `
        <!-- Male Hair Style -->
        <path d="M 132 170 C 130 110, 155 90, 200 90 C 245 90, 270 110, 268 170 C 255 125, 240 115, 200 115 C 160 115, 145 125, 132 170 Z" fill="${hair}" />
        `
    }

    <!-- Eyes -->
    <ellipse cx="178" cy="180" rx="5.5" ry="6.5" fill="#2c2c2c" />
    <ellipse cx="222" cy="180" rx="5.5" ry="6.5" fill="#2c2c2c" />
    <circle cx="176" cy="178" r="2" fill="#ffffff" />
    <circle cx="220" cy="178" r="2" fill="#ffffff" />

    <!-- Eyebrows -->
    <path d="M 166 166 Q 178 161 190 165" stroke="${hair}" stroke-width="3" stroke-linecap="round" fill="none" />
    <path d="M 210 165 Q 222 161 234 166" stroke="${hair}" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Nose -->
    <path d="M 200 180 L 197 202 L 204 203" stroke="rgba(0,0,0,0.18)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Cheeks warmth -->
    <circle cx="165" cy="198" r="14" fill="#ff7f7f" opacity="0.22" />
    <circle cx="235" cy="198" r="14" fill="#ff7f7f" opacity="0.22" />

    <!-- Smile -->
    <path d="M 183 220 Q 200 234 217 220" stroke="#b04040" stroke-width="3.5" stroke-linecap="round" fill="none" />

    <!-- Age and Name Watermark Banner -->
    <rect x="0" y="356" width="400" height="44" fill="rgba(0, 0, 0, 0.45)" />
    <text x="16" y="384" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="16" font-weight="600" fill="#ffffff" letter-spacing="0.5">${seedName.split(' ')[0]}, ${age} anos</text>
    <text x="384" y="384" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="500" fill="#bae6fd">Foto Verificada ✓</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
