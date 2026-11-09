// DOM control builders. Each returns { el, get, set }.
import { i18n } from './i18n.js';

const doc = () => globalThis.document;

function wrap(labelKey, input) {
  const d = doc();
  const label = d.createElement('label');
  label.className = 'ctl';
  const span = d.createElement('span');
  if (labelKey) { span.dataset.i18n = labelKey; span.textContent = i18n.t(labelKey); }
  label.append(span, input);
  return label;
}

// Parses text to a number; NaN or out of range falls back to def / clamps.
export function parseNumber(text, { def, min = -Infinity, max = Infinity, integer = false }) {
  let v = Number(String(text).trim().replace(',', '.'));
  if (!Number.isFinite(v)) return def;
  if (integer) v = Math.round(v);
  return Math.min(max, Math.max(min, v));
}

export function numberField({ label, value, min, max, step = 'any', integer = false, width = 5, onChange }) {
  const d = doc();
  const input = d.createElement('input');
  input.type = 'number'; input.value = String(value); input.size = width;
  if (min != null) input.min = String(min);
  if (max != null) input.max = String(max);
  input.step = String(step);
  const get = () => {
    const v = parseNumber(input.value, { def: value, min, max, integer });
    input.value = String(v);
    return v;
  };
  if (onChange) input.addEventListener('change', () => onChange(get()));
  return { el: wrap(label, input), input, get, set: (v) => { input.value = String(v); } };
}

export function slider({ label, value, min, max, step = 1, onChange, format = (v) => String(v) }) {
  const d = doc();
  const input = d.createElement('input');
  input.type = 'range'; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value);
  const out = d.createElement('output'); out.textContent = format(value);
  const el = wrap(label, input); el.append(out);
  const get = () => Number(input.value);
  input.addEventListener('input', () => { out.textContent = format(get()); onChange?.(get()); });
  return { el, input, get, set: (v) => { input.value = String(v); out.textContent = format(v); } };
}

export function select({ label, options, value, onChange }) {
  const d = doc();
  const sel = d.createElement('select');
  for (const o of options) {
    const opt = d.createElement('option');
    opt.value = o.value; opt.dataset.i18n = o.label; opt.textContent = i18n.t(o.label);
    sel.append(opt);
  }
  if (value != null) sel.value = value;
  if (onChange) sel.addEventListener('change', () => onChange(sel.value));
  return { el: wrap(label, sel), input: sel, get: () => sel.value, set: (v) => { sel.value = v; } };
}

export function checkbox({ label, checked = false, onChange }) {
  const d = doc();
  const input = d.createElement('input');
  input.type = 'checkbox'; input.checked = checked;
  const el = wrap(label, input); el.classList.add('ctl-check');
  if (onChange) input.addEventListener('change', () => onChange(input.checked));
  return { el, input, get: () => input.checked, set: (v) => { input.checked = v; } };
}

export function button({ label, onClick, primary = false }) {
  const d = doc();
  const b = d.createElement('button');
  b.type = 'button'; b.dataset.i18n = label; b.textContent = i18n.t(label);
  if (primary) b.classList.add('primary');
  b.addEventListener('click', onClick);
  return { el: b, setLabel: (key) => { b.dataset.i18n = key; b.textContent = i18n.t(key); } };
}

// Standard Start/Restart + Pause/Resume + speed slider wired to a Loop.
export function loopControls(loop, { speedMin = 1, speedMax = 20, speed } = {}) {
  const d = doc();
  const bar = d.createElement('div'); bar.className = 'controls';
  const start = button({ label: 'ctl.start', primary: true, onClick: () => loop.restart() });
  const pause = button({ label: 'ctl.pause', onClick: () => { if (loop.started) loop.toggle(); } });
  const sp = slider({ label: 'ctl.speed', value: speed ?? loop.stepsPerFrame, min: speedMin, max: speedMax, step: 1, onChange: (v) => { loop.stepsPerFrame = v; } });
  loop.onChange = () => {
    start.setLabel(loop.started ? 'ctl.restart' : 'ctl.start');
    pause.setLabel(loop.started && !loop.running ? 'ctl.resume' : 'ctl.pause');
    pause.el.disabled = !loop.started;
  };
  loop.onChange();
  bar.append(start.el, pause.el, sp.el);
  return { el: bar, start, pause, speed: sp };
}
