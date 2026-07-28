// src/lib/spinner.ts
/** Spinner utility – creates a lightweight SVG spinner */
export interface SpinnerOptions {
  /** Diameter in pixels (default 24) */
  size?: number;
  /** CSS colour (default var(--acid)) */
  color?: string;
  /** Element that will host the spinner */
  container: HTMLElement;
}

export interface SpinnerInstance {
  /** Insert the spinner into the container */
  mount(): void;
  /** Remove the spinner from the container */
  unmount(): void;
}

export function createSpinner(opts: SpinnerOptions): SpinnerInstance {
  const { size = 24, color = 'var(--acid)', container } = opts;
  const svgNS = 'http://www.w3.org/2000/svg';
  const spinner = document.createElementNS(svgNS, 'svg');
  spinner.setAttribute('viewBox', '0 0 50 50');
  spinner.setAttribute('width', `${size}`);
  spinner.setAttribute('height', `${size}`);
  spinner.setAttribute('aria-hidden', 'true');
  spinner.classList.add('spinner');
  spinner.style.color = color;

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '25');
  circle.setAttribute('cy', '25');
  circle.setAttribute('r', '20');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '4');
  circle.setAttribute('stroke-linecap', 'round');
  circle.setAttribute('stroke-dasharray', '92 150');
  circle.setAttribute('stroke-dashoffset', '0');

  spinner.appendChild(circle);

  return {
    mount() {
      if (!spinner.parentNode) container.appendChild(spinner);
    },
    unmount() {
      if (spinner.parentNode === container) container.removeChild(spinner);
    },
  };
}
