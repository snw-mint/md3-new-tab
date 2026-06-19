/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { globalState } from './state';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function tick(): void {
  const now = new Date();
  const hourEl = document.getElementById('hourDisplay');
  const minuteEl = document.getElementById('minuteDisplay');
  const dateEl = document.getElementById('dateDisplay');
  const greetingsDisplay = document.getElementById('greetingsDisplay');
  const clockContainer = document.getElementById('clockExpressiveContainer');

  const { clock12hFormat, clockShowDate, displayStyle, greetingName } = globalState.current;

  if (displayStyle === 'greetings') {
    if (clockContainer) clockContainer.style.display = 'none';
    if (dateEl) dateEl.style.display = 'none';
    if (greetingsDisplay) {
      greetingsDisplay.style.display = '';
      
      const hour = now.getHours();
      let period = 'Night';
      if (hour >= 6 && hour < 12) period = 'Morning';
      else if (hour >= 12 && hour < 18) period = 'Afternoon';
      else if (hour >= 18 && hour < 24) period = 'Evening';

      const index = (now.getDate() % 5) + 1;
      const dayOfWeek = now.toLocaleDateString(undefined, { weekday: 'long' });
      const formattedName = greetingName.trim() ? `, ${greetingName.trim()}` : '';

      const msgKey = `greet${period}${index}`;
      let text = '';
      if (typeof chrome !== 'undefined' && chrome.i18n) {
        text = chrome.i18n.getMessage(msgKey, [dayOfWeek, formattedName]);
      }
      
      if (!text) {
        text = `Good ${period.toLowerCase()}${formattedName}!`;
      }
      
      greetingsDisplay.textContent = text;
    }
  } else {
    if (greetingsDisplay) greetingsDisplay.style.display = 'none';
    if (clockContainer) clockContainer.style.display = '';

    const ampmEl = document.getElementById('ampmDisplay');
    const ampmTextEl = document.getElementById('ampmText');

    if (hourEl) {
      let hours = now.getHours();
      let isPm = hours >= 12;
      if (clock12hFormat) {
        hours = hours % 12 || 12;
        if (ampmEl && ampmTextEl) {
          ampmEl.style.display = '';
          ampmTextEl.textContent = isPm ? 'PM' : 'AM';
        }
      } else {
        if (ampmEl) ampmEl.style.display = 'none';
      }
      const hStr = pad(hours);
      hourEl.innerHTML = `<span class="digit d-h1">${hStr[0]}</span><span class="digit d-h2">${hStr[1]}</span>`;
    }

    if (minuteEl) {
      const mStr = pad(now.getMinutes());
      minuteEl.innerHTML = `<span class="digit d-m1">${mStr[0]}</span><span class="digit d-m2">${mStr[1]}</span>`;
    }

    if (dateEl) {
      if (clockShowDate) {
        dateEl.style.display = '';
        dateEl.textContent = now.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });
      } else {
        dateEl.style.display = 'none';
      }
    }
  }
}

function applyDisplaySettings() {
  const { displayEnabled, displayStyle } = globalState.current;
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
