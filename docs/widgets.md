# TradingView Widgets Documentation

This document outlines how TradingView widgets are integrated and managed in the AItrading application to prevent duplication and ensure proper functionality.

## Widget Injection Strategy

### Preventing Duplicate Tickers

The application uses a guard-based approach to prevent duplicate TradingView ticker injections:

1. **Data Attribute Marking**: All injected scripts are marked with `data-tv-injected="1"` attribute
2. **Injection Guards**: Before injecting any widget, check for existing `[data-tv-injected]` scripts or iframes
3. **Single Instance**: Only one ticker should be rendered per page (typically in the header)

### Widget Components

#### TradingViewTicker (`src/components/common/TradingViewTicker.tsx`)
- **Purpose**: Displays the main ticker tape across the top of the application
- **Guard Pattern**: Checks for existing `[data-tv-injected]` before injection
- **Cleanup**: Only clears on unmount when no other instances are present

#### TVWidgetsLoader (`src/components/MarketPulse/TVWidgetsLoader.tsx`)
- **Purpose**: Loads advanced chart and market overview widgets in Market Pulse section
- **Config**: Uses `width: "100%"`, `height: 600px`, `autosize: false`
- **Guard Pattern**: Prevents double injection with `data-tv-injected` check
- **Widgets**: Advanced Chart, Market Overview (ticker removed to prevent duplication)

#### MainChart (`src/components/CommandCenter/MainChart.tsx`)
- **Purpose**: Primary chart component using lightweight-charts library
- **Sizing**: Container uses `640px` height with responsive width
- **Resize Handling**: Automatically resizes chart on window resize events
- **Fallback**: Uses sample-timeseries data when API quota is exceeded

## Safe Cleanup Pattern

All widgets use the `safeClear` pattern to avoid DOM manipulation errors:

```typescript
function safeClear(node: HTMLElement) {
  try {
    while (node.firstChild) {
      // Check parent.contains(child) before removeChild to avoid NotFoundError
      if (node.contains(node.firstChild)) node.removeChild(node.firstChild);
      else break;
    }
  } catch {
    try {
      node.innerHTML = '';
    } catch {
      // ignore cleanup errors
    }
  }
}
```

## Best Practices

1. **Always check for existing injection** before creating new TradingView widgets
2. **Mark scripts with data attributes** for reliable detection and cleanup
3. **Use consistent sizing** (width: "100%", explicit heights) to prevent layout issues
4. **Handle cleanup gracefully** with parent.contains() checks before removeChild()
5. **Provide fallbacks** for when widgets fail to load or API quotas are exceeded

## Troubleshooting

- **Double tickers**: Check that only one component renders the ticker widget
- **Small charts**: Ensure explicit width/height settings with `autosize: false`
- **NotFoundError**: Verify safeClear pattern is used for all DOM manipulation
- **Widget loading failures**: Check for adblocker interference with s3.tradingview.com