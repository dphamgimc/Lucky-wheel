export const themes = {
  tet: {
    colors: ['#aa2936','#397241','#9a621c','#a93d24','#6b4785','#24726d'],
    font: '"Noto Serif", serif', maxLabelSize: 48, effect: 'apricot', art: '✿ 🧧 ✿',
  },
  default: {
    colors: ['#f4b942','#8560d5','#ee6b92','#37b4c5','#62b88f','#ef8b54','#6577d5','#d467ba'],
    font: 'system-ui', effect: 'fireworks', art: '✦ 🏆 ✦',
  },
  christmas: {
    colors: ['#b83243','#24765a','#bf8b30','#375f70','#8c2941','#43896b'],
    font: '"Noto Serif", serif', effect: 'snow', art: '❄ 🎄 ❄',
  },
  'mid-autumn': {
    colors: ['#a8393c','#98601e','#315e7b','#754d88','#277268','#a34d26'],
    font: '"Noto Serif", serif', maxLabelSize: 48, effect: 'fireworks', art: '✦ 🏆 ✦',
  },
};

export function resolveTheme(value) {
  return Object.hasOwn(themes, value) ? value : 'default';
}

// Kim nằm tại góc 0; canvas quay theo chiều kim đồng hồ.
export function pointedIndex(rotation, count) {
  if (count <= 0) return -1;
  const angle = ((-rotation % 360) + 360) % 360;
  return Math.min(count - 1, Math.floor(angle / (360 / count)));
}

export function pointerColor(rotation, count, palette) {
  const index = pointedIndex(rotation, count);
  return index < 0 ? '#a79bac' : palette[index % palette.length];
}
