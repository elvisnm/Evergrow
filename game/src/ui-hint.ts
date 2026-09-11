import { escapeUI } from './ui-components.ts';

/** Short hint tooltips for [data-tooltip] anchors. One fixed-position surface for
    the whole document: the old [data-tooltip]::after was absolutely positioned and
    every scrolling panel column (.character-inventory and friends) clipped it away.
    Styling lives on .ui-hint in ui-kit.css; this module owns placement only. */
const GAP = 9, EDGE = 8;

const anchorOf = (node: EventTarget | null): HTMLElement | null => {
  const found = node instanceof Element ? node.closest<HTMLElement>('[data-tooltip]') : null;
  return found?.dataset.tooltip ? found : null;
};

let surface: HTMLDivElement | null = null;

function place(anchor: HTMLElement): void {
  const element = surface!, bounds = anchor.getBoundingClientRect();
  const placement = anchor.dataset.tooltipPlacement ?? 'above', align = anchor.dataset.tooltipAlign ?? '';
  const viewportWidth = document.documentElement.clientWidth, viewportHeight = document.documentElement.clientHeight;
  const width = element.offsetWidth, height = element.offsetHeight;
  let left: number, top: number;
  if (placement === 'left') {
    left = bounds.left - GAP - width;
    if (left < EDGE) left = bounds.right + GAP;
    top = (bounds.top + bounds.bottom - height) / 2;
  } else {
    const below = placement === 'below';
    top = below ? bounds.bottom + GAP : bounds.top - GAP - height;
    // Flip rather than clamp: a clamped hint would cover the control it explains.
    if (top < EDGE || top + height > viewportHeight - EDGE) top = below ? bounds.top - GAP - height : bounds.bottom + GAP;
    left = align === 'start' ? bounds.left : align === 'end' ? bounds.right - width : (bounds.left + bounds.right - width) / 2;
  }
  element.style.left = `${Math.max(EDGE, Math.min(viewportWidth - width - EDGE, left))}px`;
  element.style.top = `${Math.max(EDGE, Math.min(viewportHeight - height - EDGE, top))}px`;
}

/** Install once per document; every UI entry point reaches this through installUITheme(). */
export function installUIHints(): void {
  if (surface) return;
  const element = surface = document.createElement('div');
  element.className = 'ui-tooltip ui-hint'; element.setAttribute('role', 'tooltip'); element.hidden = true;
  document.body.append(element);
  const hide = () => { element.hidden = true; };
  const open = (event: Event) => {
    const anchor = anchorOf(event.target);
    if (!anchor || document.documentElement.classList.contains('touch-mode')) { hide(); return; }
    if (event.type === 'focusin' && !anchor.matches(':focus-visible')) return;
    element.innerHTML = escapeUI(anchor.dataset.tooltip!);
    element.hidden = false;
    place(anchor);
  };
  // Moving between an anchor's own children must not blink the surface off.
  const close = (event: Event) => {
    const from = anchorOf(event.target), to = anchorOf((event as PointerEvent | FocusEvent).relatedTarget);
    if (from && from !== to) hide();
  };
  document.addEventListener('pointerover', open);
  document.addEventListener('focusin', open);
  document.addEventListener('pointerout', close);
  document.addEventListener('focusout', close);
  document.addEventListener('pointerdown', hide, true);
  document.addEventListener('scroll', hide, true);
  document.addEventListener('keydown', event => { if ((event as KeyboardEvent).key === 'Escape') hide(); }, true);
}
