import es from '../messages/es-AR.json' with { type: 'json' }
import en from '../messages/en.json' with { type: 'json' }

const keys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`])

const a = new Set(keys(es)), b = new Set(keys(en))
const missing = [...a].filter(k => !b.has(k)).map(k => `en is missing ${k}`)
  .concat([...b].filter(k => !a.has(k)).map(k => `es-AR is missing ${k}`))

if (missing.length) { console.error(missing.join('\n')); process.exit(1) }
console.log(`i18n OK — ${a.size} keys`)
