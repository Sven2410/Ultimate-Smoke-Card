/**
 * Ultimate Smoke Card — v1.0.0
 * Compacte rookmelder-kaart met temperatuur, batterij en alarm-animatie.
 *
 * Configuratie:
 *   type: custom:ultimate-smoke-card
 *   name: Woonkamer
 *   smoke:       binary_sensor.rookmelder_woonkamer_smoke
 *   temperature: sensor.rookmelder_woonkamer_temperature
 *   battery:     sensor.rookmelder_woonkamer_battery
 */

const VERSION = '1.0.0';

class UltimateSmokeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass  = null;
    this._config = null;
  }

  static getConfigElement() {
    return document.createElement('ultimate-smoke-card-editor');
  }

  static getStubConfig() {
    return {
      name:        'Woonkamer',
      smoke:       'binary_sensor.rookmelder_woonkamer_smoke',
      temperature: 'sensor.rookmelder_woonkamer_temperature',
      battery:     'sensor.rookmelder_woonkamer_battery',
    };
  }

  getCardSize() { return 1; }

  setConfig(config) {
    if (!config.smoke) throw new Error('[ultimate-smoke-card] "smoke" entity is verplicht.');
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // ── Helpers ─────────────────────────────────────────────────

  _state(entityId) {
    if (!this._hass || !entityId) return null;
    return this._hass.states[entityId] ?? null;
  }

  _battIcon(pct) {
    if (pct <= 15) return 'mdi:battery-alert';
    if (pct <= 30) return 'mdi:battery-30';
    if (pct <= 60) return 'mdi:battery-60';
    return 'mdi:battery';
  }

  _battColor(pct) {
    if (pct <= 15) return '#EF5350';
    if (pct <= 30) return '#FF9800';
    if (pct <= 60) return '#FFC107';
    return '#4CAF50';
  }

  // ── Render ──────────────────────────────────────────────────

  _render() {
    if (!this._config || !this._hass) return;

    const cfg      = this._config;
    const smokeSt  = this._state(cfg.smoke);
    const tempSt   = this._state(cfg.temperature);
    const battSt   = this._state(cfg.battery);

    const isSmoke  = smokeSt?.state === 'on';
    const temp     = tempSt  ? parseFloat(tempSt.state).toFixed(1).replace('.', ',') : '—';
    const batt     = battSt  ? parseInt(battSt.state, 10) : null;
    const name     = cfg.name || smokeSt?.attributes?.friendly_name || cfg.smoke;

    const statusText  = isSmoke ? 'ROOK GEDETECTEERD' : 'Veilig';
    const statusColor = isSmoke ? '#EF5350' : '#4CAF50';
    const iconColor   = isSmoke ? '#EF5350' : 'rgba(255,255,255,0.7)';
    const iconBg      = isSmoke ? 'rgba(239,83,80,0.2)' : 'rgba(255,255,255,0.08)';
    const mainIcon    = isSmoke ? 'mdi:smoke-detector-alert' : 'mdi:smoke-detector-variant';

    const battIcon  = batt !== null ? this._battIcon(batt) : 'mdi:battery-unknown';
    const battColor = batt !== null ? this._battColor(batt) : 'rgba(255,255,255,0.4)';
    const battText  = batt !== null ? `${batt}%` : '—';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        ha-card {
          background: none !important;
          box-shadow: none !important;
          border: none !important;
        }

        .sc {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px 10px 10px;
          border-radius: 28px;
          cursor: pointer;
          transition: background .15s;
          backdrop-filter: blur(3px) saturate(120%);
          -webkit-backdrop-filter: blur(3px) saturate(120%);
          box-shadow:
            inset 0 1px 2px rgba(255,255,255,.35),
            inset 0 2px 4px rgba(0,0,0,.15),
            0 2px 6px rgba(0,0,0,.45);
        }
        .sc:hover { background: rgba(255,255,255,.08); }

        .sc.alarm {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow:
              inset 0 1px 2px rgba(255,255,255,.35),
              inset 0 2px 4px rgba(0,0,0,.15),
              0 2px 6px rgba(0,0,0,.45),
              0 0 0 2px rgba(239,83,80,0.6);
          }
          50% {
            box-shadow:
              inset 0 1px 2px rgba(255,255,255,.35),
              inset 0 2px 4px rgba(0,0,0,.15),
              0 2px 6px rgba(0,0,0,.45),
              0 0 0 5px rgba(239,83,80,0.8),
              0 0 20px rgba(239,83,80,0.3);
          }
        }

        .ic {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: ${iconBg};
        }
        .ic ha-icon { --mdc-icon-size: 22px; color: ${iconColor}; display: flex; }

        .rt {
          display: flex; flex-direction: column;
          min-width: 0; flex: 1; gap: 6px;
        }

        .nf { display: flex; flex-direction: column; }
        .nm {
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.92); line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .st {
          font-size: 11px; font-weight: 600;
          line-height: 1.2; margin-top: 1px;
          color: ${statusColor};
        }

        .divider { height: 1px; background: rgba(255,255,255,0.08); }

        .vals { display: flex; align-items: center; gap: 14px; }
        .vl   { display: flex; align-items: center; gap: 3px; }
        .vt   { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.65); white-space: nowrap; }
      </style>

      <ha-card>
        <div class="sc${isSmoke ? ' alarm' : ''}" id="card">
          <div class="ic">
            <ha-icon icon="${mainIcon}"></ha-icon>
          </div>
          <div class="rt">
            <div class="nf">
              <span class="nm">${name}</span>
              <span class="st">${statusText}</span>
            </div>
            <div class="divider"></div>
            <div class="vals">
              ${tempSt ? `
                <div class="vl">
                  <ha-icon icon="mdi:thermometer" style="--mdc-icon-size:14px;color:rgba(255,255,255,0.4);display:flex;"></ha-icon>
                  <span class="vt">${temp}°</span>
                </div>` : ''}
              ${battSt ? `
                <div class="vl">
                  <ha-icon icon="${battIcon}" style="--mdc-icon-size:14px;color:${battColor};display:flex;"></ha-icon>
                  <span class="vt" style="color:${battColor};">${battText}</span>
                </div>` : ''}
            </div>
          </div>
        </div>
      </ha-card>
    `;

    // Klik → more-info van de smoke entity
    this.shadowRoot.getElementById('card').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        detail: { entityId: cfg.smoke },
        bubbles: true, composed: true,
      }));
    });
  }
}

customElements.define('ultimate-smoke-card', UltimateSmokeCard);


/* ══════════════════════════════════════════════════
   ADMIN EDITOR
   ══════════════════════════════════════════════════ */

class UltimateSmokeCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass   = null;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._render();
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._hass) this._render();
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
      bubbles: true, composed: true,
    }));
  }

  _entities(domain) {
    if (!this._hass) return [];
    return Object.entries(this._hass.states)
      .filter(([id]) => id.startsWith(domain + '.'))
      .map(([id, st]) => ({ id, name: st.attributes?.friendly_name || id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  _selectHTML(field, domain, label) {
    const options = this._entities(domain);
    const val     = this._config[field] || '';
    return `
      <label class="label">${label}</label>
      <select class="sel" data-field="${field}">
        <option value="">-- Kies entity --</option>
        ${options.map(({ id, name }) =>
          `<option value="${id}" ${id === val ? 'selected' : ''}>${name}</option>`
        ).join('')}
      </select>`;
  }

  _render() {
    if (!this._hass) return;
    const cfg = this._config;

    this.innerHTML = `
      <style>
        *  { box-sizing: border-box; }
        .row { margin-bottom: 16px; }
        .label { display: block; font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--secondary-text-color); margin-bottom: 6px; }
        select, input[type=text] {
          width: 100%; padding: 8px 10px;
          border: 1px solid var(--divider-color, #ddd); border-radius: 8px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color); font-size: 14px;
          appearance: none; -webkit-appearance: none;
        }
        select:focus, input[type=text]:focus { outline: none; border-color: var(--primary-color); }
        .hint { font-size: 12px; color: var(--secondary-text-color); margin-top: 4px; }
      </style>

      <div class="row">
        <label class="label">Naam</label>
        <input type="text" data-field="name" placeholder="bijv. Woonkamer" value="${cfg.name || ''}">
      </div>

      <div class="row">
        ${this._selectHTML('smoke', 'binary_sensor', 'Rookmelder (binary_sensor)')}
        <p class="hint">Verplicht — de sensor die rook detecteert.</p>
      </div>

      <div class="row">
        ${this._selectHTML('temperature', 'sensor', 'Temperatuur sensor (optioneel)')}
      </div>

      <div class="row">
        ${this._selectHTML('battery', 'sensor', 'Batterij sensor (optioneel)')}
      </div>
    `;

    this.querySelectorAll('select.sel').forEach(sel => {
      sel.addEventListener('change', e => {
        this._config[e.target.dataset.field] = e.target.value || undefined;
        this._fire();
      });
    });

    this.querySelector('input[data-field=name]').addEventListener('input', e => {
      this._config.name = e.target.value;
      this._fire();
    });
  }
}

customElements.define('ultimate-smoke-card-editor', UltimateSmokeCardEditor);


/* ══════════════════════════════════════════════════
   REGISTRATIE
   ══════════════════════════════════════════════════ */

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'ultimate-smoke-card',
  name:        'Ultimate Smoke Card',
  description: 'Compacte rookmelder-kaart met temperatuur, batterij en alarm-animatie.',
  preview:     true,
});

console.info(
  `%c ULTIMATE-SMOKE-CARD %c v${VERSION} `,
  'background:#b71c1c;color:#fff;padding:2px 5px;border-radius:3px 0 0 3px;font-weight:700',
  'background:#ffebee;color:#b71c1c;padding:2px 5px;border-radius:0 3px 3px 0;font-weight:700'
);
