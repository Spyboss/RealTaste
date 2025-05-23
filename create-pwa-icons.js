// Simple script to create basic PWA icons
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon that we can convert to PNG
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#f97316"/>
  <circle cx="256" cy="200" r="80" fill="white"/>
  <rect x="176" y="280" width="160" height="120" rx="20" fill="white"/>
  <text x="256" y="450" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">RT</text>
</svg>`;

// Write SVG file
fs.writeFileSync('icon.svg', svgIcon);

console.log('Created icon.svg - you can convert this to PNG using online tools or ImageMagick');
console.log('Commands to convert:');
console.log('convert icon.svg -resize 192x192 pwa-192x192.png');
console.log('convert icon.svg -resize 512x512 pwa-512x512.png');
