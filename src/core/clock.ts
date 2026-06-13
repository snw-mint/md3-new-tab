/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function tick(): void {
  const now = new Date();
  const hourEl = document.getElementById('hourDisplay');
  const minuteEl = document.getElementById('minuteDisplay');

  if (hourEl) hourEl.textContent = pad(now.getHours());
  if (minuteEl) minuteEl.textContent = pad(now.getMinutes());
}

export function initClock(): void {
  tick();
  setInterval(tick, 1000);
}
