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

      const index = (now.getDate() % 5) + 1;
      const dayOfWeek = t(`weekday_${now.getDay()}`);
      const safeName = greetingName.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const highlightSvg = `<svg class="name-sparkle-svg" width="380" height="380" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M338.584 189.998c25.843 48.166 6.318 91.773-43.518 105.063-13.295 49.841-56.902 69.361-105.068 43.523-48.167 25.843-91.773 6.318-105.064-43.518-49.836-13.295-69.361-56.902-43.518-105.068-25.843-48.167-6.318-91.773 43.518-105.064 13.29-49.836 56.897-69.361 105.064-43.518 48.166-25.843 91.773-6.318 105.063 43.518 49.841 13.29 69.361 56.897 43.523 105.064" fill="currentColor"/></svg>`;
      const nameHtml = safeName ? `, <span class="highlighted-name">${safeName}${highlightSvg}</span>` : '';

      const msgKey = `greet${period}${index}`;
      let text = t(msgKey);

      if (text === msgKey || !text) {
        text = `Good ${period.toLowerCase()}${nameHtml}!`;
      } else {
        text = text.replace('$WEEK$', dayOfWeek).replace('$USER$', nameHtml);
      }

      if (text !== lastMessageBase) {
        greetingsDisplay.innerHTML = text;
        lastMessageBase = text;
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
  } else {
    if (greetingsDisplay) greetingsDisplay.style.display = 'none';
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

function applyDisplaySettings() {
  const { displayEnabled, displayStyle } = globalState.current;

  const root = document.documentElement;
  if (displayStyle) {
    root.setAttribute('data-display-style', displayStyle);
  }
  if (displayEnabled) {
    root.removeAttribute('data-display-enabled');
  } else {
    root.setAttribute('data-display-enabled', 'false');
  }

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
