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

  const { clock12hFormat, clockShowDate } = globalState.current;

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

function applyClockSettings() {
  const { clockEnabled, clockStyle } = globalState.current;
  const widget = document.getElementById('displayWidget');
  if (widget) {
    widget.style.display = clockEnabled ? '' : 'none';
    widget.classList.remove('style1', 'style2', 'style3');
    if (clockStyle) {
      widget.classList.add(clockStyle);
    }
  }
  tick();
}

export function initClock(): void {
  tick();
  setInterval(tick, 1000);

  applyClockSettings();
  globalState.subscribe(() => {
    applyClockSettings();
  });
}
