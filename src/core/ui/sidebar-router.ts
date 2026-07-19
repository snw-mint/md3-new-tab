/*
 * MD3: Expressive New Tab
 * Copyright (c) 2026 SnowMint
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

export interface SidebarPageModule {
  template: string;
  init: (container: HTMLElement) => void;
}

export interface SidebarPageConfig {
  id: string;
  keepAlive?: boolean;
  load: () => Promise<SidebarPageModule>;
}

interface CachedPage {
  el: HTMLElement;
  scrollTop: number;
}

const ANIM_MS = 300;

function afterAnim(el: HTMLElement, fn: () => void): void {
  const done = () => fn();
  el.addEventListener('animationend', done, { once: true });
  setTimeout(() => {
    if (el.isConnected) fn();
  }, ANIM_MS + 60);
}

export class SidebarRouter {
  private stack: string[] = [];
  private registry = new Map<string, SidebarPageConfig>();
  private cache = new Map<string, CachedPage>();
  private viewport: HTMLElement;
  private rootPage: HTMLElement;
  private busy = false;

  constructor(opts: { viewport: HTMLElement; rootPage: HTMLElement }) {
    this.viewport = opts.viewport;
    this.rootPage = opts.rootPage;
  }

  register(config: SidebarPageConfig): void {
    this.registry.set(config.id, config);
  }

  async push(id: string): Promise<void> {
    if (this.busy) return;
    const config = this.registry.get(id);
    if (!config) {
      console.warn(`[SidebarRouter] Unknown page: "${id}"`);
      return;
    }

    this.busy = true;

    const prevEl = this.currentEl();

    let cached = this.cache.get(id);
    if (!cached) {
      try {
        const mod = await config.load();
        const el = document.createElement('div');
        el.className = 'sidebar-page';
        el.dataset.pageId = id;
        el.innerHTML = mod.template;
        this.viewport.appendChild(el);
        mod.init(el);
        el.querySelectorAll('[data-sidebar-back]').forEach((btn) => {
          btn.addEventListener('click', () => this.pop());
        });
        cached = { el, scrollTop: 0 };
        this.cache.set(id, cached);
      } catch (err) {
        console.error('[SidebarRouter] Failed to load page:', err);
        this.busy = false;
        return;
      }
    }

    cached.el.scrollTop = cached.scrollTop;
    cached.el.classList.add('is-entering');
    this.stack.push(id);

    afterAnim(cached.el, () => {
      cached!.el.classList.remove('is-entering');
      cached!.el.classList.add('is-active');
      prevEl.classList.remove('is-active');
      this.busy = false;
    });
  }

  pop(): void {
    if (this.busy || this.stack.length === 0) return;
    this.busy = true;

    const id = this.stack.pop()!;
    const cached = this.cache.get(id)!;
    cached.scrollTop = cached.el.scrollTop;

    cached.el.classList.add('is-exiting');
    afterAnim(cached.el, () => {
      cached.el.classList.remove('is-active', 'is-exiting');
      const keepAlive = this.registry.get(id)?.keepAlive ?? true;
      if (!keepAlive) {
        cached.el.remove();
        this.cache.delete(id);
      }
      this.busy = false;
    });

    const prevEl = this.currentEl();
    if (this.stack.length === 0) prevEl.scrollTop = 0;
    prevEl.classList.add('is-returning');
    afterAnim(prevEl, () => {
      prevEl.classList.remove('is-returning');
      prevEl.classList.add('is-active');
    });
  }

  reset(): void {
    if (this.stack.length === 0) return;
    for (const [, c] of this.cache) {
      c.el.classList.remove('is-active', 'is-entering', 'is-exiting', 'is-returning');
    }
    this.stack = [];
    this.rootPage.scrollTop = 0;
    this.rootPage.classList.add('is-active');
    this.busy = false;
  }

  private currentEl(): HTMLElement {
    if (this.stack.length === 0) return this.rootPage;
    return this.cache.get(this.stack[this.stack.length - 1])?.el ?? this.rootPage;
  }
}
