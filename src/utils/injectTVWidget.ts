// Robust TradingView widget injector helpers.
// Usage: injectTVWidget(containerId, scriptSrc, config)
// Ensures script is injected once per container, polls for iframe, and provides fallback UI.

export function safeClear(node: HTMLElement) {
  try {
    while (node.firstChild) {
      try {
        if (node.contains(node.firstChild)) node.removeChild(node.firstChild);
        else break;
      } catch {
        break;
      }
    }
  } catch {
    try {
      node.innerHTML = '';
    } catch {}
  }
}

export function injectTVWidget(containerId: string, scriptSrc: string, config: Record<string, any>) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`injectTVWidget: container #${containerId} not found`);
    return;
  }

  // If this exact widget is already injected, skip re-injection
  const injectedSelector = `[data-tv-injected="${containerId}"]`;
  if (container.querySelector(injectedSelector)) {
    // Give the iframe some time to appear; otherwise the widget is already present.
    return;
  }

  // Clear only previous children (not other widgets outside this container)
  safeClear(container);

  // Create wrapper element expected by TradingView widget scripts
  const wrapper = document.createElement('div');
  wrapper.className = 'tradingview-widget-container__widget';
  container.appendChild(wrapper);

  // Create the script element which includes the JSON config as text content
  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = scriptSrc;
  s.setAttribute('data-tv-injected', containerId); // mark script specifically for this container
  s.setAttribute('data-tv-widget', scriptSrc);
  try {
    s.textContent = JSON.stringify(config);
  } catch (e) {
    s.textContent = '{}';
  }
  container.appendChild(s);

  // Poll for iframe presence (short) and show fallback if not present
  let attempts = 0;
  const maxAttempts = 8;
  const intervalMs = 500;
  const check = () => {
    attempts += 1;
    const iframe = container.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      // success - widget loaded
      return;
    }
    if (attempts >= maxAttempts) {
      // show fallback UI
      safeClear(container);
      const fallback = document.createElement('div');
      fallback.style.padding = '18px';
      fallback.style.color = '#fbbf24';
      fallback.style.textAlign = 'center';
      fallback.innerHTML = `
        <strong>Widget failed to load</strong>
        <div style="margin-top:8px;font-size:13px;color:#ddd">If you use an adblocker or privacy blocking, please allow scripts from <b>s3.tradingview.com</b> and refresh.</div>
        <button id="tv-retry-${containerId}" style="margin-top:10px;padding:6px 12px;background:#fde68a;border-radius:6px;border:none;cursor:pointer;">Retry</button>
      `;
      container.appendChild(fallback);
      const btn = document.getElementById(`tv-retry-${containerId}`);
      if (btn) {
        btn.addEventListener('click', () => injectTVWidget(containerId, scriptSrc, config), { once: true });
      }
      return;
    }
    setTimeout(check, intervalMs);
  };

  setTimeout(check, 400);
}

export function removeInjectedWidgetsFrom(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const injected = Array.from(container.querySelectorAll(`[data-tv-injected="${containerId}"]`));
    injected.forEach((el) => {
      if (container.contains(el)) container.removeChild(el);
    });
  } catch {
    safeClear(container);
  }
}
