/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from '../shared/state';
import { t } from '../shared/i18n';

let lastMessageBase = '';
let currentPeriod = '';
let currentGreetingIndex = 0;

function getRandomGreetingIndex(period: string, max: number = 5): number {
  const storageKey = `last_greet_index_${period}`;
  let lastIndex = 0;
  try {
    lastIndex = parseInt(localStorage.getItem(storageKey) || '0', 10);
  } catch {}

  const available: number[] = [];
  for (let i = 1; i <= max; i++) {
    if (i !== lastIndex) available.push(i);
  }

  const selected = available[Math.floor(Math.random() * available.length)] || 1;
  try {
    localStorage.setItem(storageKey, selected.toString());
  } catch {}

  return selected;
}

function tick(): void {
  const now = new Date();
  const dateEl = document.getElementById('dateDisplay');
  const greetingsDisplay = document.getElementById('greetingsDisplay');

  const { clockShowDate, displayStyle, greetingName, greetingHighlightName } = globalState.current;

  if (displayStyle === 'greetings') {
    if (greetingsDisplay) {
      greetingsDisplay.style.display = '';

      const hour = now.getHours();
      let period = 'Night';
      if (hour >= 6 && hour < 12) period = 'Morning';
      else if (hour >= 12 && hour < 18) period = 'Afternoon';
      else if (hour >= 18 && hour < 24) period = 'Evening';

      if (period !== currentPeriod || currentGreetingIndex === 0) {
        currentPeriod = period;
        currentGreetingIndex = getRandomGreetingIndex(period, 5);
      }

      const dayOfWeek = t(`weekday_${now.getDay()}`);
      const trimmedName = greetingName.trim();
      const msgKey = `greet${period}${currentGreetingIndex}`;
      let text = t(msgKey);

      if (text === msgKey || !text) {
        text = `Good ${period.toLowerCase()}$USER$!`;
      } else {
        text = text.replace('$WEEK$', dayOfWeek);
      }

      const cacheKey = `${msgKey}|${dayOfWeek}|${trimmedName}|${text}`;

      if (cacheKey !== lastMessageBase) {
        greetingsDisplay.textContent = '';
        const parts = text.split('$USER$');

        if (!trimmedName) {
          greetingsDisplay.textContent = parts.join('');
        } else {
          if (parts[0]) {
            greetingsDisplay.appendChild(document.createTextNode(parts[0]));
          }

          greetingsDisplay.appendChild(document.createTextNode(', '));

          const span = document.createElement('span');
          span.className = 'highlighted-name';
          span.textContent = trimmedName;

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = `<svg class="name-sparkle-svg" width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M338.584 189.998c25.843 48.166 6.318 91.773-43.518 105.063-13.295 49.841-56.902 69.361-105.068 43.523-48.167 25.843-91.773 6.318-105.064-43.518-49.836-13.295-69.361-56.902-43.518-105.068-25.843-48.167-6.318-91.773 43.518-105.064 13.29-49.836 56.897-69.361 105.064-43.518 48.166-25.843 91.773-6.318 105.063 43.518 49.841 13.29 69.361 56.897 43.523 105.064" fill="currentColor"/></svg>`;
          const svgEl = tempDiv.firstElementChild;
          if (svgEl) {
            span.appendChild(svgEl);
          }

          greetingsDisplay.appendChild(span);

          if (parts[1]) {
            greetingsDisplay.appendChild(document.createTextNode(parts[1]));
          }
        }
        lastMessageBase = cacheKey;
      }

      const highlightedNameEl = greetingsDisplay.querySelector('.highlighted-name');
      if (highlightedNameEl) {
        const hasActive = highlightedNameEl.classList.contains('active');
        if (greetingHighlightName && !hasActive) {
          requestAnimationFrame(() => {
            highlightedNameEl.classList.add('active');
          });
        } else if (!greetingHighlightName && hasActive) {
          highlightedNameEl.classList.remove('active');
        }
      }
    }
    const clockDisplay = document.getElementById('clockDisplay');
    if (clockDisplay) clockDisplay.style.display = 'none';
  } else if (displayStyle === 'clock') {
    if (greetingsDisplay) greetingsDisplay.style.display = 'none';

    const clockDisplay = document.getElementById('clockDisplay');
    if (clockDisplay) {
      clockDisplay.style.display = '';
      
      let h = now.getHours();
      if (globalState.current.clock12hFormat) {
        h = h % 12 || 12;
      }
      
      const hStr = h.toString().padStart(2, '0');
      const mStr = now.getMinutes().toString().padStart(2, '0');
      
      const clockStyle = globalState.current.clockStyle || 'Expressive Clock';
      
      const d1 = hStr[0];
      const d2 = hStr[1];
      const d3 = mStr[0];
      const d4 = mStr[1];
      
      clockDisplay.innerHTML = `<span class="clock-digit digit-1">${d1}</span><span class="clock-digit digit-2">${d2}</span><span class="clock-colon">:</span><span class="clock-digit digit-3">${d3}</span><span class="clock-digit digit-4">${d4}</span>`;
      clockDisplay.style.fontFamily = `"${clockStyle}", sans-serif`;
      clockDisplay.setAttribute('data-clock-style', clockStyle);

      if (globalState.current.clockExpressiveColor) {
        clockDisplay.classList.add('expressive-color-mode');
      } else {
        clockDisplay.classList.remove('expressive-color-mode');
      }
    }
  } else {
    if (greetingsDisplay) greetingsDisplay.style.display = 'none';
    const clockDisplay = document.getElementById('clockDisplay');
    if (clockDisplay) clockDisplay.style.display = 'none';
  }

  if (dateEl) {
    if (clockShowDate && displayStyle === 'clock') {
      dateEl.style.display = '';
      const userLang = (localStorage.getItem('userLanguage') || navigator.language || 'en-US').replace('_', '-');
      dateEl.textContent = now.toLocaleDateString(userLang, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    } else {
      dateEl.style.display = 'none';
    }
  }
}

function applyDisplaySettings() {
  const { displayEnabled, displayStyle, greetingScale, clockScale } = globalState.current;

  const root = document.documentElement;
  if (displayStyle) {
    root.setAttribute('data-display-style', displayStyle);
  }
  if (displayEnabled) {
    root.removeAttribute('data-display-enabled');
  } else {
    root.setAttribute('data-display-enabled', 'false');
  }

  const gScale = typeof greetingScale === 'number' ? greetingScale : 1.7;
  const cScale = typeof clockScale === 'number' ? clockScale : 6;
  const dateScale = +(cScale / 6).toFixed(3);

  root.style.setProperty('--greeting-font-size', `${gScale}rem`);
  root.style.setProperty('--clock-font-size', `${cScale}rem`);
  root.style.setProperty('--date-font-size', `${dateScale}rem`);

  const widget = document.getElementById('displayWidget');
  if (widget) {
    widget.style.display = displayEnabled ? '' : 'none';
    widget.classList.remove('simple_clock', 'expressive_clock', 'greetings', 'style1', 'style2');
    if (displayStyle) {
      widget.classList.add(displayStyle);
    }
  }
  tick();
}

export function initDisplay(): void {
  tick();
  setInterval(tick, 1000);

  applyDisplaySettings();
  globalState.subscribe(() => {
    applyDisplaySettings();
  });
}
