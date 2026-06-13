/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { LauncherProviderData } from './types';
import { initVanillaDragAndDrop } from './drag-drop';

interface LauncherRenderRefs {
  launcherGrid: HTMLElement | null;
  launcherAllAppsLink: HTMLAnchorElement | null;
}

export function renderLauncherApps(
  data: LauncherProviderData | undefined,
  renderRefs: LauncherRenderRefs,
): void {
  if (!data || !renderRefs.launcherGrid) return;

  const orderString = localStorage.getItem('launcherOrder');
  let orderedApps = [...data.apps];

  if (orderString) {
    try {
      const orderIds = JSON.parse(orderString) as string[];
      if (Array.isArray(orderIds)) {
        const ordered = [];
        const remaining = [...orderedApps];
        for (const id of orderIds) {
          const index = remaining.findIndex((a) => a.name === id);
          if (index !== -1) {
            ordered.push(remaining.splice(index, 1)[0]);
          }
        }
        orderedApps = [...ordered, ...remaining];
      }
    } catch {}
  }

  renderRefs.launcherGrid.textContent = '';
  orderedApps.forEach((app, index) => {
    const link = document.createElement('a');
    link.href = app.url;
    link.className = 'launcher-item';
    link.title = app.name;
    link.setAttribute('aria-label', app.name);
    link.setAttribute('data-id', app.name);
    link.setAttribute('data-index', index.toString());
    link.draggable = true;

    const img = document.createElement('img');
    img.src = app.icon;
    img.className = 'launcher-icon';
    img.alt = app.name;
    img.draggable = false;

    const span = document.createElement('span');
    span.className = 'launcher-name';
    span.textContent = app.name;

    link.appendChild(img);
    link.appendChild(span);
    renderRefs.launcherGrid?.appendChild(link);
  });

  const moreLink = document.createElement('a');
  moreLink.href = data.allAppsLink;
  moreLink.className = 'launcher-more-item';
  moreLink.target = '_blank';
  moreLink.title = 'More apps';

  const moreImg = document.createElement('div');
  moreImg.className = 'launcher-icon';
  moreImg.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>`;

  const moreSpan = document.createElement('span');
  moreSpan.className = 'launcher-name';
  moreSpan.textContent = 'More';

  moreLink.appendChild(moreImg);
  moreLink.appendChild(moreSpan);
  renderRefs.launcherGrid?.appendChild(moreLink);
}

export function initLauncherDrag(launcherGrid: HTMLElement): void {
  initVanillaDragAndDrop({
    gridContainer: launcherGrid,
    itemClass: 'launcher-item',
    onReorder: (oldIndex, newIndex) => {
      const newItems = Array.from(launcherGrid.children).filter(
        (el) =>
          el.classList.contains('launcher-item') &&
          !el.classList.contains('sortable-placeholder') &&
          !el.classList.contains('md3-drag-ghost'),
      ) as HTMLElement[];
      const newOrder = newItems
        .map((item) => item.getAttribute('data-id'))
        .filter(Boolean) as string[];
      localStorage.setItem('launcherOrder', JSON.stringify(newOrder));
      newItems.forEach((item, idx) =>
        item.setAttribute('data-index', idx.toString()),
      );
    },
  });
}
