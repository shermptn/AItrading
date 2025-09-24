<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Trading Insights Dashboard</title>
  <!-- BEGIN EDIT: app-config placeholder (read-only, no secrets) -->
  <script id="app-config" type="application/json">{
    "API_BASE": "/.netlify/functions",
    "USE_PROXY": true,
    "AUTO_RUN_ANALYSIS": true
  }</script>
  <!-- END EDIT -->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f1419 0%, #1e3a8a 50%, #0f1419 100%); color: #fff; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 24px; }
    .header h1 { font-size: 2.4rem; background: linear-gradient(45deg, #3b82f6, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
    .header p { color: #94a3b8; font-size: 1.02rem; }
    .toolbar { display:flex; gap:10px; justify-content:center; margin: 14px 0 26px; flex-wrap: wrap; }
    .btn { background:#374151; color:#fff; border:1px solid #4b5563; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:.9rem; }
    .btn:hover { background:#4b5563; }
    .market-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .stock-card { background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; border-radius: 12px; padding: 20px; backdrop-filter: blur(10px); transition:.2s ease; }
    .stock-card.clickable{ cursor:pointer; }
    .stock-card.clickable:hover{ transform: translateY(-2px); border-color:#3b82f6; }
    .stock-symbol { font-weight: bold; font-size: 1.05rem; margin-bottom: 6px; display:flex; justify-content:space-between; align-items:center; }
    .stock-price { font-size: 1.55rem; font-weight: bold; margin-bottom: 6px; }
    .stock-change { font-size: 0.9rem; }
    .stock-details { font-size: .85rem; color: #94a3b8; margin-top: 8px; }
    .positive { color: #10b981; } .negative { color: #ef4444; }
    .analysis-section { background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .analysis-section h3 { margin-bottom: 14px; display:flex; align-items:center; gap:10px }
    .input-group { margin-bottom: 14px; }
    .input-group label { display: block; margin-bottom: 8px; font-weight: 500; }
    .input-group input { width: 100%; padding: 12px; background: #1e293b; border: 1px solid #475569; border-radius: 8px; color: white; font-size: 1rem; }
    .input-row { display:grid; grid-template-columns: 1fr auto; gap:10px; align-items:center; }
    .quick-symbols { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
    .symbol-btn { background: #374151; color: white; border: 1px solid #4b5563; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .symbol-btn:hover { background: #4b5563; transform: translateY(-1px); }
    .prompt-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .prompt-card { background: rgba(30, 41, 59, 0.8); border: 1px solid #334155; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.25s ease; }
    .prompt-card:hover { transform: translateY(-4px); border-color: #3b82f6; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.18); }
    .prompt-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; font-size: 1.2rem; }
    .blue { background-color: #3b82f6; } .green { background-color: #10b981; } .orange { background-color: #f59e0b; } .purple { background-color: #8b5cf6; } .red { background-color: #ef4444; } .indigo { background-color: #6366f1; } .teal { background-color: #14b8a6; } .yellow { background-color: #eab308; }
    .analysis-result { background: rgba(15, 23, 42, 0.9); border: 1px solid #475569; border-radius: 8px; padding: 20px; margin-top: 10px; white-space: pre-wrap; line-height: 1.6; }
    .loading { display: flex; align-items: center; gap: 10px; color: #94a3b8; }
    .spinner { width: 20px; height: 20px; border: 2px solid #334155; border-top: 2px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0%{ transform: rotate(0deg);} 100%{ transform: rotate(360deg);} }
    .live-indicator { display:inline-block; width:8px; height:8px; background:#10b981; border-radius:50%; animation:pulse 2s infinite }
    @keyframes pulse { 0%{opacity:1} 50%{opacity:.5} 100%{opacity:1} }
    .note { color:#94a3b8; font-size:.9rem }
    .footer { text-align: center; color: #64748b; margin-top: 24px; font-size: 0.9rem; }
    .code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .kv { display:flex; gap:10px; align-items:center; flex-wrap:wrap }
    .kv label { font-size:.9rem; color:#cbd5e1 }
    .switch { display:flex; gap:8px; align-items:center }
    .switch input { transform: scale(1.1); }
    @media (max-width: 768px) { .container{padding:15px} .header h1{font-size:2rem} .prompt-grid{grid-template-columns:1fr} .market-overview{grid-template-columns:1fr} }
    .tradingview-widget-copyright{display:none !important}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AI Trading Insights Dashboard</h1>
      <p>Stop guessing, start analyzing with AI-powered trading insights</p>
    </div>

    <div class="toolbar">
      <button class="btn" id="refreshBtn">🔄 Refresh Watchlist</button>
      <button class="btn" id="selfTestBtn">✅ Run Self Tests</button>
      <button class="btn" id="toggleSettingsBtn">⚙️ Settings</button>
    </div>

    <!-- Live Ticker Tape (single instance) -->
    <div id="tvTickerWrap" class="analysis-section" style="padding:10px 14px; margin-top:-8px">
      <div id="tvTicker" class="tradingview-widget-container" style="height:44px"></div>
    </div>
    </div>

    <!-- Market Overview -->
    <div class="market-overview" id="marketOverview"></div>

    <!-- Settings -->
    <div class="analysis-section" id="settings" style="display:none">
      <h3><span style="background:#3b82f6;width:20px;height:20px;border-radius:4px;display:inline-block"></span> Settings</h3>
      <div class="kv">
        <label class="code">Twelve Data API Key</label>
        <input id="tdKeyInput" placeholder="Paste your Twelve Data key" style="flex:1;max-width:460px" />
        <span class="note">(Only used if you toggle direct mode; otherwise we call your serverless proxy)</span>
      </div>
      <div class="kv" style="margin-top:10px">
        <label class="code">OpenAI Proxy Endpoint</label>
        <input id="openaiEndpointInput" placeholder="/.netlify/functions/openai" style="flex:1;max-width:460px" />
        <span class="note">(Server endpoint that forwards to OpenAI — do not put your secret in the browser)</span>
      </div>
      <div class="kv" style="margin-top:10px">
        <div class="switch"><input type="checkbox" id="tdDirectCheckbox" /><label>Use direct Twelve Data (no proxy)</label></div>
        <div class="switch"><input type="checkbox" id="autoRunCheckbox" /><label>Auto-run analysis on Quick select & card click</label></div>
      </div>
      <div style="margin-top:12px"><button class="btn" id="saveSettingsBtn">💾 Save Settings</button></div>
      <p class="note" style="margin-top:10px">Client will call <span class="code">/.netlify/functions/quote</span> / <span class="code">timeseries</span> / <span class="code">openai</span> when direct mode is OFF.</p>
      <pre id="settingsLog" class="analysis-result" style="max-height:160px; overflow:auto"></pre>
    </div>

    <!-- Asset Input Section -->
    <div class="analysis-section">
      <h3>
        <span style="background:#3b82f6;width:20px;height:20px;border-radius:4px;display:inline-block"></span>
        Asset Analysis
      </h3>
      <div class="input-group">
        <label for="assetInput">Asset Symbol or Market for Analysis</label>
        <div class="input-row">
          <input type="text" id="assetInput" placeholder="Enter asset symbol (e.g., AAPL, BTC-USD, SPY)" />
          <button class="btn" id="analyzeNowBtn">Run Analysis</button>
        </div>
        <div class="quick-symbols" id="quickSymbols">
          <span style="color:#94a3b8;font-size:.9rem;margin-right:10px">Quick select:</span>
          <!-- Magnificent 7 -->
          <button class="symbol-btn" data-sym="AAPL">AAPL</button>
          <button class="symbol-btn" data-sym="MSFT">MSFT</button>
          <button class="symbol-btn" data-sym="GOOGL">GOOGL</button>
          <button class="symbol-btn" data-sym="AMZN">AMZN</button>
          <button class="symbol-btn" data-sym="META">META</button>
          <button class="symbol-btn" data-sym="NVDA">NVDA</button>
          <button class="symbol-btn" data-sym="TSLA">TSLA</button>
          <!-- Extras -->
          <button class="symbol-btn" data-sym="NFLX">NFLX</button>
          <button class="symbol-btn" data-sym="QQQ">QQQ</button>
          <button class="symbol-btn" data-sym="SPY">SPY</button>
          <button class="symbol-btn" data-sym="NAS100">NAS100</button>
        </div>
      </div>
    </div>

    <!-- Analysis Prompts -->
    <div class="prompt-grid">
      <div class="prompt-card" data-analysis="market-conditions"><div class="prompt-icon blue">📈</div><h3>Market Conditions Analysis</h3><p>Get data-driven insights on current market conditions</p></div>
      <div class="prompt-card" data-analysis="position-logic"><div class="prompt-icon green">🧠</div><h3>Position Logic Check</h3><p>Remove bias with objective position analysis</p></div>
      <div class="prompt-card" data-analysis="news-impact"><div class="prompt-icon orange">⚠️</div><h3>News Impact Summary</h3><p>Automate news gathering and impact analysis</p></div>
      <div class="prompt-card" data-analysis="technical-indicators"><div class="prompt-icon purple">📊</div><h3>Technical Indicators</h3><p>Identify key technical signals quickly</p></div>
      <div class="prompt-card" data-analysis="decision-pros-cons"><div class="prompt-icon red">🎯</div><h3>Decision Pros & Cons</h3><p>Get balanced perspective on trading decisions</p></div>
      <div class="prompt-card" data-analysis="emerging-trends"><div class="prompt-icon indigo">🔍</div><h3>Emerging Trends</h3><p>Spot opportunities before they go mainstream</p></div>
      <div class="prompt-card" data-analysis="strategy-simplification"><div class="prompt-icon teal">📚</div><h3>Strategy Simplification</h3><p>Break down complex strategies into actionable steps</p></div>
      <div class="prompt-card" data-analysis="risk-assessment"><div class="prompt-icon yellow">💰</div><h3>Risk Assessment</h3><p>Evaluate risk factors for potential trades</p></div>
    </div>

    <!-- Analysis Results -->
    <div class="analysis-section" id="resultsSection" style="display:none;">
      <h3>
        <span style="background:#3b82f6;width:20px;height:20px;border-radius:4px;display:inline-block"></span>
        AI Analysis Results
      </h3>
      <div id="analysisResult" class="analysis-result"></div>
    </div>
    <!-- BEGIN EDIT: Options panel -->
    <div class="analysis-section" id="optionsSection">
      <h3><span style="background:#3b82f6;width:20px;height:20px;border-radius:4px;display:inline-block"></span> Options Contracts</h3>

      <div class="kv" style="gap:12px; flex-wrap:wrap">
        <label>Symbol</label>
        <input id="optSymbolInput" style="width:120px;padding:8px;background:#1e293b;border:1px solid #475569;border-radius:8px;color:#fff" placeholder="AAPL" />
        <button class="btn" id="optSyncSymbolBtn">Use Current</button>

        <label>Expiration</label>
        <select id="optExpSelect" style="padding:8px;background:#1e293b;border:1px solid #475569;border-radius:8px;color:#fff;min-width:170px"></select>

        <label>Type</label>
        <select id="optTypeSelect" style="padding:8px;background:#1e293b;border:1px solid #475569;border-radius:8px;color:#fff">
          <option value="all">All</option>
          <option value="call">Calls</option>
          <option value="put">Puts</option>
        </select>

        <label>Strike Filter (±%)</label>
        <input id="optMoneynessInput" type="number" value="15" style="width:80px;padding:8px;background:#1e293b;border:1px solid #475569;border-radius:8px;color:#fff" />

        <button class="btn" id="optLoadBtn">Load Chain</button>
      </div>

      <div id="optMeta" class="note" style="margin:10px 0 6px"></div>

      <div id="optTableWrap" style="overflow:auto; max-height:320px; border:1px solid #334155;border-radius:8px">
        <table id="optTable" style="width:100%; border-collapse:collapse; font-size:.9rem">
          <thead style="position:sticky;top:0;background:#0f172a">
            <tr>
              <th style="text-align:left;padding:10px;border-bottom:1px solid #334155">Strike</th>
              <th style="text-align:left;padding:10px;border-bottom:1px solid #334155">Type</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Bid</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Ask</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Last</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">IV</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Delta</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Gamma</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Theta</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Vega</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">Vol</th>
              <th style="text-align:right;padding:10px;border-bottom:1px solid #334155">OI</th>
              <th style="text-align:center;padding:10px;border-bottom:1px solid #334155">Add</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div class="analysis-section" style="margin-top:16px">
        <h3><span style="background:#3b82f6;width:20px;height:20px;border-radius:4px;display:inline-block"></span> Strategy Builder</h3>
        <div id="legsList" class="note" style="margin-bottom:8px">No legs added. Click “＋” in the chain to add.</div>
        <div class="kv" style="gap:12px;flex-wrap:wrap;margin-bottom:10px">
          <button class="btn" id="optClearLegsBtn">Clear</button>
          <button class="btn" id="optPresetVerticalBtn">Preset: Vertical (Debit)</button>
        </div>
        <div id="optPayoffMeta" class="note" style="margin-bottom:8px"></div>
        <div id="optPayoffChart" style="height:220px;background:#0b1220;border:1px solid #334155;border-radius:8px"></div>
      </div>
    </div>    <!-- END EDIT: Options panel -->

    <!-- BEGIN EDIT: TradingView Widgets Section -->
    <div class="analysis-section" id="tvWidgetsSection">
      <h3><span style="background:#3b82f6;width:20px;height:20px;border-radius:4px;display:inline-block"></span> Live Markets</h3>

      <div id="tvAdvancedWrap" style="height:520px; border:1px solid #334155; border-radius:8px; margin-bottom:16px; overflow:hidden">
        <div class="tradingview-widget-container" id="tvAdvanced"></div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap:16px">
        <div class="tradingview-widget-container" id="tvOverview" style="min-height:380px; border:1px solid #334155; border-radius:8px; overflow:hidden"></div>
        <div class="tradingview-widget-container" id="tvTimeline" style="min-height:380px; border:1px solid #334155; border-radius:8px; overflow:hidden"></div>
        <div class="tradingview-widget-container" id="tvEvents" style="min-height:380px; border:1px solid #334155; border-radius:8px; overflow:hidden"></div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap:16px; margin-top:16px">
        <div class="tradingview-widget-container" id="tvScreener" style="min-height:550px; border:1px solid #334155; border-radius:8px; overflow:hidden"></div>
        <div class="tradingview-widget-container" id="tvHeatmap" style="min-height:550px; border:1px solid #334155; border-radius:8px; overflow:hidden"></div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap:16px; margin-top:16px">
        <div class="tradingview-widget-container" id="tvQuotes" style="min-height:550px; border:1px solid #334155; border-radius:8px; overflow:hidden"></div>
        <div class="tradingview-widget-container" id="tvTechnicals" style="min-height:450px; border:1px solid #334155; border-radius:8px; overflow:hidden"></div>
      </div>
    </div>
    <!-- END EDIT: TradingView Widgets Section -->

    <div class="footer">
      <p>🚀 Built with AI-powered insights • Twelve Data (proxy or direct) + OpenAI</p>
    </div>
  </div>

  <script>
    // ===== CONFIG =====
    const APP_CFG = (() => {
      const el = document.getElementById('app-config');
      try { return Object.assign({ API_BASE: '/.netlify/functions', USE_PROXY:true, AUTO_RUN_ANALYSIS:true }, JSON.parse(el?.textContent||'{}')); } catch { return { API_BASE: '/.netlify/functions', USE_PROXY:true, AUTO_RUN_ANALYSIS:true }; }
    })();
    const API = APP_CFG.API_BASE;

    // ===== SETTINGS STATE =====
    const settings = {
      tdKey: localStorage.getItem('TD_KEY') || '',
      tdDirect: JSON.parse(localStorage.getItem('TD_DIRECT') || 'false'),
      openaiEndpoint: localStorage.getItem('OPENAI_ENDPOINT') || `${API}/openai`,
      autoRun: JSON.parse(localStorage.getItem('AUTO_RUN') || JSON.stringify(APP_CFG.AUTO_RUN_ANALYSIS))
    };

    // ===== HELPERS =====
    const settingsLog = (msg) => { const el = document.getElementById('settingsLog'); if(el){ el.textContent += `${new Date().toLocaleTimeString()}  ${msg}
`; el.scrollTop = el.scrollHeight; } };
    const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));
// NEW: robust response parser to avoid XML/HTML surfacing in UI
async function parseJsonOrThrow(res){
  const ct = res.headers.get('content-type') || '';
  if(ct.includes('application/json')) return res.json();
  const text = await res.text();
  // Trim noisy XML/HTML and surface a helpful error
  const msg = text.slice(0, 300);
  throw new Error(`Non‑JSON from backend. Is your proxy deployed? First 300 chars: ${msg}`);
}
    async function fetchWithBackoff(url, opts={}, attempts=4, base=350){
  let lastErr;
  for(let i=0;i<attempts;i++){
    try{
      const res = await fetch(url, opts);
      if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await parseJsonOrThrow(res);
    } catch(e){
      lastErr = e;
      const d = base * Math.pow(2,i);
      settingsLog(`Backoff ${i+1}/${attempts}: ${url} → ${e.message}; retry in ${d}ms`);
      if(i<attempts-1) await sleep(d);
    }
  }
  throw lastErr;
}

    // Wire settings UI
    document.getElementById('tdKeyInput').value = settings.tdKey;
    document.getElementById('openaiEndpointInput').value = settings.openaiEndpoint;
    document.getElementById('tdDirectCheckbox').checked = settings.tdDirect;
    document.getElementById('autoRunCheckbox').checked = settings.autoRun;
    document.getElementById('saveSettingsBtn').onclick = () => {
      settings.tdKey = document.getElementById('tdKeyInput').value.trim();
      settings.openaiEndpoint = document.getElementById('openaiEndpointInput').value.trim() || `${API}/openai`;
      settings.tdDirect = document.getElementById('tdDirectCheckbox').checked;
      settings.autoRun = document.getElementById('autoRunCheckbox').checked;
      localStorage.setItem('TD_KEY', settings.tdKey);
      localStorage.setItem('OPENAI_ENDPOINT', settings.openaiEndpoint);
      localStorage.setItem('TD_DIRECT', JSON.stringify(settings.tdDirect));
      localStorage.setItem('AUTO_RUN', JSON.stringify(settings.autoRun));
      settingsLog('✅ Settings saved');
    };
    document.getElementById('toggleSettingsBtn').onclick = () => {
      const s = document.getElementById('settings'); s.style.display = s.style.display === 'none' ? 'block' : 'none';
    };

    // ===== CACHES =====
    const CACHE_MS = 5 * 60 * 1000;
    const marketDataCache = new Map();
    const analysisCache = new Map();

    // ===== STATIC BASE (fallback so UI is never blank) =====
    const baseMap = { AAPL:{ price:192.53, high:194.15, low:191.27, volume:41250000, name:'Apple Inc.' }, TSLA:{ price:248.98, high:253.50, low:247.80, volume:67890000, name:'Tesla Inc.' }, NVDA:{ price:877.15, high:882.50, low:870.30, volume:35670000, name:'NVIDIA Corp.' }, SPY:{ price:474.82, high:475.45, low:473.20, volume:45230000, name:'SPDR S&P 500 ETF' }, QQQ:{ price:391.25, high:392.80, low:389.45, volume:28450000, name:'Invesco QQQ ETF' }, MSFT:{ price:431.20, high:433.10, low:428.50, volume:22180000, name:'Microsoft Corp.' }, GOOGL:{ price:175.32, high:177.20, low:174.80, volume:19850000, name:'Alphabet Inc.' }, AMZN:{ price:178.25, high:181.5, low:177.8, volume:28940000, name:'Amazon.com Inc.' }, META:{ price:515.75, high:518.9, low:512.3, volume:15670000, name:'Meta Platforms Inc.' }, NFLX:{ price:487.92, high:492.1, low:485.2, volume:12850000, name:'Netflix Inc.' }, NAS100:{ price:17750, high:17890, low:17680, volume:0, name:'NASDAQ-100 Index (NDX)'} };

    // ===== BACKENDS (proxy-first) =====
    function mapSymbol(sym){ return sym.toUpperCase()==='NAS100' ? 'NDX' : sym; }

    // BEGIN EDIT: normalize quote mapping (proxy/direct)
async function fetchQuote(symbol){
  const sym = symbol.toUpperCase();
  const key = `Q_${sym}`; const cached = JSON.parse(localStorage.getItem(key)||'null');
  if(cached && (Date.now()-new Date(cached.ts).getTime()) < CACHE_MS) return cached.data;

  try{
    let data;
    if(settings.tdDirect){
      if(!settings.tdKey) throw new Error('No Twelve Data key (Settings)');
      const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(mapSymbol(sym))}&apikey=${encodeURIComponent(settings.tdKey)}`;
      const j = await fetchWithBackoff(url);
      if(j.status==='error' || j.code) throw new Error(j.message||'Twelve Data error');
      const price = parseFloat(j.close ?? j.price);
      const prev = parseFloat(j.previous_close ?? j.open ?? price);
      data = {
        symbol:sym,
        name:j.name || sym,
        price,
        change: price - prev,
        changePercent: prev ? ((price - prev)/prev)*100 : 0,
        high: +(j.high ?? price),
        low: +(j.low ?? price),
        volume: +(j.volume || 0),
        lastUpdate: new Date().toISOString(),
        source:'Twelve Data (Direct)'
      };
    } else {
      const j = await fetchWithBackoff(`${API}/quote?symbol=${encodeURIComponent(mapSymbol(sym))}`);
      // Support multiple proxy shapes
      const price = +( j.price ?? j.close ?? j.last ?? 0 );
      const change = +( j.change ?? j.change_value ?? 0 );
      const changePct = +( j.changePercent ?? j.percent_change ?? j.change_percent ?? 0 );
      data = {
        symbol:sym,
        name: j.name || j.companyName || sym,
        price,
        change,
        changePercent: changePct,
        high: +(j.high ?? price),
        low: +(j.low ?? price),
        volume: +(j.volume ?? 0),
        lastUpdate: j.updated || j.lastUpdate || new Date().toISOString(),
        source: j.source || 'Proxy'
      };
    }
    localStorage.setItem(key, JSON.stringify({ ts:new Date().toISOString(), data }));
    return data;
  }catch(e){
    settingsLog(`⚠️ quote fallback for ${sym}: ${e.message}`);
    const base = baseMap[sym] || { price:100, high:101, low:99, volume:0, name:sym };
    return { symbol:sym, price:base.price, high:base.high, low:base.low, volume:base.volume, change:0, changePercent:0, name:base.name, lastUpdate:new Date().toISOString(), source:'⚠️ Local Fallback (stale)' };
  }
}
// END EDIT

    // ===== UI =====
    // BEGIN EDIT: sync options symbol on setAsset
function setAsset(symbol){
  const s = symbol.toUpperCase();
  document.getElementById('assetInput').value = s;
  localStorage.setItem('LAST_SYMBOL', s);
  location.hash = s;
  const optInput = document.getElementById('optSymbolInput');
  if (optInput) optInput.value = s;
  try{ renderTVAdvanced(s); }catch(_){ }
  if(settings.autoRun){ runAnalysis('market-conditions'); }
}
window.setAsset = setAsset;
// END EDIT

    async function initializeMarketOverview(){
      const container = document.getElementById('marketOverview');
      const watch = ['AAPL','MSFT','GOOGL','AMZN','META','NVDA','TSLA','NFLX','QQQ','SPY','NAS100'];
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#94a3b8"><div class="spinner" style="margin:0 auto 15px"></div><p>Loading real-time market data...</p></div>`;
      try{
        const results = await Promise.all(watch.map(async s => ({ s, d: await fetchQuote(s) })));
        container.innerHTML = '';
        for(const {s, d} of results){
          const el = document.createElement('div'); el.className = 'stock-card clickable';
          const cls = d.change >= 0 ? 'positive' : 'negative'; const sign = d.change >= 0 ? '+' : '';
          el.innerHTML = `
            <div class="stock-symbol">${s}<span class="live-indicator" title="${d.source}"></span></div>
            <div style="font-size:.78rem;color:#94a3b8;margin-bottom:6px">${d.name||s}</div>
            <div class="stock-price">${Number(d.price).toFixed(2)}</div>
            <div class="stock-change ${cls}">${sign}${Number(d.change).toFixed(2)} (${sign}${Number(d.changePercent).toFixed(2)}%)</div>
            <div class="stock-details">H: ${Number(d.high).toFixed(2)} L: ${Number(d.low).toFixed(2)} · Vol: ${(d.volume||0).toLocaleString()} · <span style="font-size:.75rem;color:#10b981">${d.source}</span></div>`;
          el.onclick = () => setAsset(s);
          container.appendChild(el);
        }
        const refresh = document.createElement('div');
        refresh.className = 'stock-card clickable'; refresh.style.display='flex'; refresh.style.flexDirection='column'; refresh.style.alignItems='center'; refresh.style.justifyContent='center';
        refresh.innerHTML = `<div style="font-size:1.6rem;margin-bottom:6px">🔄</div><div style="font-size:.95rem">Refresh</div>`;
        refresh.onclick = ()=>{ marketDataCache.clear(); initializeMarketOverview(); };
        container.appendChild(refresh);
      }catch(err){
        console.error('Overview error', err);
        container.innerHTML = `<div style=\"grid-column:1/-1;text-align:center;padding:40px;color:#ef4444\"><p>Error loading market data. Please check Settings and try again.</p><button onclick=\"initializeMarketOverview()\" class=\"btn\">Retry</button></div>`;
      }
    }

    // BEGIN EDIT: fix OpenAI call shape
async function callOpenAI(prompt, market){
  const cacheKey = `${prompt.substring(0,50)}_${market.symbol}_${market.price}`;
  const hit = analysisCache.get(cacheKey);
  if(hit && (Date.now()-hit.ts) < CACHE_MS) return hit.data;

  try{
    const r = await fetch(settings.openaiEndpoint, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        prompt,                       // <-- send a real prompt
        model: "gpt-5-thinking",
        max_tokens: 500
      })
    });
    if(!r.ok) throw new Error(`OpenAI endpoint ${r.status}`);
    const j = await r.json();
    // support both {text} and chat-based {choices}
    const content = j.text || j.content || j.choices?.[0]?.message?.content || '';
    analysisCache.set(cacheKey, { data: content, ts: Date.now() });
    return content || "**AI returned empty text**";
  }catch(e){
    settingsLog(`⚠️ OpenAI call failed: ${e.message}`);
    return `**AI unavailable** — snapshot for ${market.symbol}: Price $${market.price.toFixed(2)}, range ${market.low.toFixed(2)}–${market.high.toFixed(2)}, vol ${market.volume.toLocaleString()}.`;
  }
}
// END EDIT

async function runAnalysis(type){
  const sym = (document.getElementById('assetInput').value || localStorage.getItem('LAST_SYMBOL') || 'SPY').toUpperCase();
  const section = document.getElementById('resultsSection');
  const out = document.getElementById('analysisResult');
  section.style.display = 'block';
  out.innerHTML = `<div class=\"loading\"><div class=\"spinner\"></div><span>Fetching market data and generating AI analysis...</span></div>`;
  section.scrollIntoView({ behavior: 'smooth' });
  try{
    const mkt = await fetchQuote(sym);
    const prompts = {
      'market-conditions': `Analyze current market conditions for ${sym}. Focus on technical levels, momentum, and likely near-term scenarios.`,
      'position-logic': `Provide entry/exit logic and risk management guidance for ${sym}. Include stops and targets.`,
      'news-impact': `Summarize likely news/catalyst effects reflected in ${sym}'s recent price/volume; note sentiment.`,
      'technical-indicators': `Technical read of ${sym}: trend, momentum, and key support/resistance with numeric levels.`,
      'decision-pros-cons': `Pros & cons of initiating a position in ${sym} at current price; include risk/reward.`,
      'emerging-trends': `Emerging trends for ${sym} and its sector; what to watch next week.`,
      'strategy-simplification': `Simple, rules-based trading plan for ${sym}: entries, exits, sizing, review cadence.`,
      'risk-assessment': `Risk assessment for ${sym}: volatility, liquidity, correlation, and suggested position sizing.`
    };
    const prompt = prompts[type] || `Comprehensive, actionable trading insights for ${sym}.`;
    const ai = await callOpenAI(prompt, mkt);
    out.innerHTML = `
      <div style=\"color:#10b981;margin-bottom:10px;font-weight:700\">✅ Real-time AI Analysis</div>
      <div style=\"color:#64748b;margin-bottom:12px;font-size:.9rem\">Data Source: ${mkt.source} • Updated: ${new Date(mkt.lastUpdate).toLocaleString()}</div>
${ai}`;
  }catch(err){
    console.error('Analysis error', err);
    out.innerHTML = `<div style=\"color:#f59e0b;margin-bottom:10px\">⚠️ Analysis temporarily unavailable.</div><div>${err.message}</div>`;
  }
}
window.runAnalysis = runAnalysis;

// BEGIN EDIT: Options client helpers
function mapOptSymbol(sym){ return sym.toUpperCase()==='NAS100' ? 'NDX' : sym.toUpperCase(); }
async function apiGet(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${path}${qs ? "?" + qs : ""}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return parseJsonOrThrow(r);
}
function fmt(x, d=2){ return (x==null || isNaN(x)) ? '—' : Number(x).toFixed(d); }
async function fetchOptionExpirations(symbol){ return apiGet(`${API}/options-expirations`, { symbol: mapOptSymbol(symbol) }); }
async function fetchOptionChain(symbol, expiration){ return apiGet(`${API}/options-chain`, { symbol: mapOptSymbol(symbol), expiration }); }
function currentSymbol(){ return (document.getElementById('assetInput').value || 'AAPL').toUpperCase(); }
function renderOptTable(chain, filterType='all', moneynessPct=15, spot){
  const tbody = document.querySelector('#optTable tbody'); tbody.innerHTML = '';
  const rows = (chain.options || []); let filtered = rows; if (filterType !== 'all') filtered = filtered.filter(r => r.type === filterType);
  if (spot && moneynessPct>0){ const lo = spot * (1 - moneynessPct/100); const hi = spot * (1 + moneynessPct/100); filtered = filtered.filter(r => r.strike >= lo && r.strike <= hi); }
  filtered.sort((a,b)=> a.strike - b.strike || (a.type>b.type?1:-1));
  for(const r of filtered){ const tr = document.createElement('tr'); tr.innerHTML = `
      <td style="padding:8px;border-bottom:1px solid #334155">${fmt(r.strike,2)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-transform:capitalize">${r.type}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${fmt(r.bid,2)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${fmt(r.ask,2)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${fmt(r.last,2)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${r.iv!=null ? fmt(r.iv*100,2)+'%' : '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${fmt(r.delta,3)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${fmt(r.gamma,5)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${fmt(r.theta,3)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${fmt(r.vega,3)}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${(r.volume??0).toLocaleString()}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:right">${(r.oi??0).toLocaleString()}</td>
      <td style="padding:8px;border-bottom:1px solid #334155;text-align:center">
        <button class="btn" data-add="1">＋</button>
      </td>`;
    tr.querySelector('[data-add]').onclick = () => addLegFromRow(r); tbody.appendChild(tr); }
}
let optLegs = [];
function addLegFromRow(r){ const mid = (Number(r.bid||0)+Number(r.ask||0))/2 || Number(r.last||0) || 0; optLegs.push({ type:r.type, strike: Number(r.strike), qty:1, price: mid, isShort:false }); renderLegs(); drawPayoff(); }
function clearLegs(){ optLegs = []; renderLegs(); drawPayoff(); }
function renderLegs(){ const box = document.getElementById('legsList'); if(!optLegs.length){ box.textContent = 'No legs added. Click “＋” in the chain to add.'; return; } box.innerHTML = optLegs.map((l,i)=> `#${i+1} ${l.isShort?'Short':'Long'} ${l.type.toUpperCase()} ×${l.qty} @ ${fmt(l.price)} strike ${fmt(l.strike)}`).join(' • '); }
function legPayoffAtExp(underPx, leg){ const { type, strike, qty=1, price, isShort=false } = leg; const intrinsic = type==='call' ? Math.max(0, underPx - strike) : Math.max(0, strike - underPx); const perShare = intrinsic - price; const sign = isShort ? -1 : 1; return 100 * qty * sign * perShare; }
function strategyPayoffAtExp(underPx, legs){ return legs.reduce((s,l)=> s + legPayoffAtExp(underPx,l), 0); }
function drawPayoff(){ const div = document.getElementById('optPayoffChart'); div.innerHTML = ''; const w = div.clientWidth || 600, h = div.clientHeight || 200; const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('width', w); svg.setAttribute('height', h); svg.style.display='block'; div.appendChild(svg); if(!optLegs.length) return; const sym = currentSymbol(); fetchQuote(sym).then(q => { const spot = q.price || 100; const lo = Math.max(1, spot*0.6), hi = spot*1.4, steps = 180; const pts = []; let minPL=Infinity, maxPL=-Infinity; for(let i=0;i<=steps;i++){ const px = lo + (i/steps)*(hi-lo); const pl = strategyPayoffAtExp(px, optLegs); pts.push([px, pl]); if(pl<minPL) minPL = pl; if(pl>maxPL) maxPL = pl; } const pad=24; const x = (p)=> pad + ( (p-lo)/(hi-lo) ) * (w-2*pad); const y = (v)=> h - pad - ( (v-minPL)/(maxPL-minPL || 1) ) * (h-2*pad); const axis = document.createElementNS('http://www.w3.org/2000/svg','path'); axis.setAttribute('d', `M ${pad} ${y(0)} L ${w-pad} ${y(0)} M ${x(spot)} ${pad} L ${x(spot)} ${h-pad}`); axis.setAttribute('stroke', '#334155'); axis.setAttribute('stroke-width','1'); svg.appendChild(axis); const d = pts.map((p,i)=> `${i?'L':'M'} ${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(' '); const path = document.createElementNS('http://www.w3.org/2000/svg','path'); path.setAttribute('d', d); path.setAttribute('fill','none'); path.setAttribute('stroke','#10b981'); path.setAttribute('stroke-width','2'); svg.appendChild(path); document.getElementById('optPayoffMeta').textContent = `Spot ${sym}: ${fmt(spot)} • P/L at expiration (per 1 contract = 100 shares).`; }); }
// Wire options events
(function initOptionsPanel(){
  const syncBtn = document.getElementById('optSyncSymbolBtn');
  const clearBtn = document.getElementById('optClearLegsBtn');
  const presetBtn = document.getElementById('optPresetVerticalBtn');
  const loadBtn = document.getElementById('optLoadBtn');
  const optInput = document.getElementById('optSymbolInput');

  function safeLog(msg){ try{ settingsLog(msg); }catch(_){ console.log(msg); } }

  // Helpers already defined above: currentSymbol, fetchOptionExpirations, fetchOptionChain, renderOptTable, fetchQuote
  async function loadExpirations(){
    const sym = (optInput.value || currentSymbol()).toUpperCase();
    const sel = document.getElementById('optExpSelect');
    sel.innerHTML = `<option>Loading…</option>`;
    try{
      const j = await fetchOptionExpirations(sym);
      const exps = j.expirations || [];
      sel.innerHTML = exps.map(e=> `<option value="${e}">${e}</option>`).join('') || `<option>No expirations</option>`;
      document.getElementById('optMeta').textContent = `Vendor: ${j.vendor||'n/a'} • ${exps.length} expirations`;
    }catch(e){
      sel.innerHTML = `<option>Error loading</option>`;
      document.getElementById('optMeta').textContent = `⚠️ ${e.message}`;
    }
  }

  async function loadChain(){
    const sym = (optInput.value || currentSymbol()).toUpperCase();
    const exp = document.getElementById('optExpSelect').value;
    const t = document.getElementById('optTypeSelect').value;
    const pct = Number(document.getElementById('optMoneynessInput').value || 15);
    document.getElementById('optMeta').textContent = `Loading chain for ${sym} ${exp || ''}…`;
    const q = await fetchQuote(sym);
    try{
      const j = await fetchOptionChain(sym, exp);
      renderOptTable(j, t, pct, q.price);
      document.getElementById('optMeta').textContent = `Vendor: ${j.vendor||'demo'} • Options: ${(j.options||[]).length.toLocaleString()} • Updated: ${j.updated||''}`;
    }catch(e){
      document.getElementById('optMeta').textContent = `⚠️ ${e.message}`;
      document.querySelector('#optTable tbody').innerHTML = '';
    }
  }

  if(syncBtn) syncBtn.onclick = () => { optInput.value = currentSymbol(); };
  if(clearBtn) clearBtn.onclick = clearLegs;
  if(presetBtn) presetBtn.onclick = () => {
    if(optLegs.length>=2) return drawPayoff();
    safeLog('ℹ️ Add two call legs at different strikes (one long, one short) to form a vertical.');
  };
  if(loadBtn) loadBtn.onclick = loadChain;

  // Initial state
  if(optInput) optInput.value = currentSymbol();
  loadExpirations();
})();
// END EDIT

// BEGIN EDIT: TradingView widget helpers
function tvMapSymbol(sym){
  const s = (sym||'AAPL').toUpperCase();
  if(s==='NAS100' || s==='NDX') return 'NASDAQ:NDX';
  const map = { AAPL:'NASDAQ:AAPL', MSFT:'NASDAQ:MSFT', GOOGL:'NASDAQ:GOOGL', AMZN:'NASDAQ:AMZN', META:'NASDAQ:META', NVDA:'NASDAQ:NVDA', TSLA:'NASDAQ:TSLA', NFLX:'NASDAQ:NFLX', QQQ:'NASDAQ:QQQ', SPY:'AMEX:SPY' };
  return map[s] || s;
}

// Generic injector: clears container and mounts a TradingView widget script with JSON config
function injectTVWidget(containerId, src, config){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  script.async = true;
  script.innerHTML = JSON.stringify(config);
  container.appendChild(script);
}

function renderTVTicker(){
  const list = [
    'NASDAQ:AAPL','NASDAQ:MSFT','NASDAQ:GOOGL','NASDAQ:AMZN','NASDAQ:META','NASDAQ:NVDA','NASDAQ:TSLA','NA
