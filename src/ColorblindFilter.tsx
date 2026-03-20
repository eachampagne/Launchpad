import { useEffect, useState } from 'react';
import { Box, Text, HStack, Button } from '@chakra-ui/react';
 
type FilterMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
 
const STORAGE_KEY = 'launchpad_colorblind_filter';
 
const MODES: { value: FilterMode; label: string; description: string }[] = [
  { value: 'protanopia',   label: 'Protanopia',   description: 'Red-blind' },
  { value: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind' },
  { value: 'tritanopia',   label: 'Tritanopia',   description: 'Blue-blind' },
];
 
// Inject SVG filters into the DOM once
function injectSVGFilters() {
  if (document.getElementById('colorblind-svg-filters')) return;
 
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'colorblind-svg-filters');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  svg.innerHTML = `
    <defs>
      <!-- Protanopia: red-blind -->
      <filter id="filter-protanopia" x="0%" y="0%" width="100%" height="100%">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0,     0, 0
          0.558, 0.442, 0,     0, 0
          0,     0.242, 0.758, 0, 0
          0,     0,     0,     1, 0
        "/>
      </filter>
      <!-- Deuteranopia: green-blind -->
      <filter id="filter-deuteranopia" x="0%" y="0%" width="100%" height="100%">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0,   0, 0
          0.7,   0.3,   0,   0, 0
          0,     0.3,   0.7, 0, 0
          0,     0,     0,   1, 0
        "/>
      </filter>
      <!-- Tritanopia: blue-blind -->
      <filter id="filter-tritanopia" x="0%" y="0%" width="100%" height="100%">
        <feColorMatrix type="matrix" values="
          0.95, 0.05,  0,     0, 0
          0,    0.433, 0.567, 0, 0
          0,    0.475, 0.525, 0, 0
          0,    0,     0,     1, 0
        "/>
      </filter>
    </defs>
  `;
  document.body.appendChild(svg);
}
 
function applyFilter(mode: FilterMode) {
  // Remove any existing overlay
  const existing = document.getElementById('colorblind-overlay');
  if (existing) existing.remove();
 
  if (mode === 'none') return;
 
  const overlay = document.createElement('div');
  overlay.id = 'colorblind-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 99999;
    filter: url(#filter-${mode});
    backdrop-filter: none;
  `;
 
  // The overlay itself needs to capture the screen content visually.
  // We use a mix-blend-mode trick: render the filter over a transparent
  // overlay that uses the SVG filter on its backdrop.
  // Actually the correct approach for full-page is to wrap the root element.
  // We apply the filter to #root directly instead.
  document.getElementById('root')!.style.filter = `url(#filter-${mode})`;
  return;
}
 
function removeFilter() {
  const root = document.getElementById('root');
  if (root) root.style.filter = '';
}
 
// Hook that can be used anywhere to get/set the current filter mode
export function useColorblindFilter() {
  const [mode, setModeState] = useState<FilterMode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as FilterMode) || 'none';
  });
 
  useEffect(() => {
    injectSVGFilters();
    const saved = (localStorage.getItem(STORAGE_KEY) as FilterMode) || 'none';
    setModeState(saved);
    if (saved !== 'none') {
      applyFilter(saved);
    }
  }, []);
 
  const setMode = (newMode: FilterMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    if (newMode === 'none') {
      removeFilter();
    } else {
      injectSVGFilters();
      applyFilter(newMode);
    }
  };
 
  return { mode, setMode };
}
 
// The hub box UI component
function ColorblindFilterBox() {
  const { mode, setMode } = useColorblindFilter();
 
  return (
    <Box className="glass-hub-box" p={4} flex="1">
      <Text fontWeight="bold" mb={3}>
        Accessibility — Color Vision
      </Text>
      <Text fontSize="sm" color="rgba(255,255,255,0.55)" mb={4}>
        Applies a colorblind simulation filter over the entire app.
      </Text>
 
      <HStack gap={3} flexWrap="wrap">
        {MODES.map((m) => (
          <Button
            key={m.value}
            size="sm"
            variant={mode === m.value ? 'solid' : 'outline'}
            onClick={() => setMode(mode === m.value ? 'none' : m.value)}
            borderColor="rgba(255,255,255,0.2)"
            title={m.description}
          >
            {m.label}
          </Button>
        ))}
 
        {mode !== 'none' && (
          <Button
            size="sm"
            variant="ghost"
            color="rgba(255,100,80,0.9)"
            onClick={() => setMode('none')}
          >
            Clear filter
          </Button>
        )}
      </HStack>
 
      {mode !== 'none' && (
        <Text fontSize="xs" color="rgba(255,255,255,0.4)" mt={3}>
          Active: {MODES.find(m => m.value === mode)?.label} ({MODES.find(m => m.value === mode)?.description})
        </Text>
      )}
    </Box>
  );
}
 
export default ColorblindFilterBox;