<div align="center">

# bcv-fx

**Consulta el tipo de cambio de referencia del Banco Central de Venezuela, mediante web scraping.**

[![NPM Version](https://img.shields.io/npm/v/bcv-fx?style=flat-square&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/bcv-fx)
[![Node Engine](https://img.shields.io/node/v/bcv-fx?style=flat-square&logo=node.js&logoColor=white&color=339933)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-types%20included-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.npmjs.com/package/bcv-fx)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square&logo=codecov&logoColor=white)](https://github.com/imalescript/bcv-fx)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](https://www.npmjs.com/package/bcv-fx)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square)](./LICENSE)

---

*USD, EUR, CNY, TRY y RUB, con fecha valor, directo desde la página oficial del BCV.*

</div>

## ✨ Características

- **Cero dependencias de runtime:** solo módulos nativos de Node.js.
- **ESM + TypeScript:** fuente en TypeScript estricto, tipos incluidos.
- **Tasas como texto:** conserva los decimales que publica el BCV, sin pérdida de precisión.
- **Timeout configurable:** 10 segundos por defecto.
- **TLS configurable:** validación activa por defecto, desactivable de forma explícita.
- **Errores tipados:** `NetworkError`, `ParseError` y `CurrencyNotFoundError`.

## 📦 Instalación

```bash
# Con npm
npm install bcv-fx

# Con pnpm
pnpm add bcv-fx

# Con yarn
yarn add bcv-fx

# Con bun
bun add bcv-fx
```

## 🚀 Inicio Rápido

```js
import { getRates, getRate } from 'bcv-fx';

// Todas las monedas
const { meta, rates } = await getRates();

console.log(meta);
// { valueDate: '2026-11-16' }

console.log(rates);
// {
//   USD: '914.02180000',
//   EUR: '1010.56078251',
//   CNY: '137.02448092',
//   TRY: '18.14739022',
//   RUB: '11.12760896'
// }

// Una sola moneda (el código va en mayúsculas)
const { meta: usdMeta, rate } = await getRate('USD');
// rate    -> '914.02180000'
// usdMeta -> { valueDate: '2026-11-16' }
```

En TypeScript, los códigos de moneda están restringidos en tiempo de compilación:

```ts
import { getRate, type CurrencyCode } from 'bcv-fx';

const code: CurrencyCode = 'USD';
const { rate } = await getRate(code);
```

En proyectos CommonJS también funciona con `require`:

```js
// Requiere Node ≥ 20.19 o ≥ 22.12.
const { getRates } = require('bcv-fx');
```

### `rates`

Las tasas se devuelven como **texto con punto decimal**, con los mismos decimales que publica el BCV, en bolívares por una unidad de la moneda. Si necesitas operar con ellas, se recomienda usar una librería de decimales (como `decimal.js`).

### `meta`

| Campo | Qué es | Formato | Tipo |
| --- | --- | --- | --- |
| `valueDate` | Fecha valor: el día para el que rige la tasa, según el BCV. Puede ser posterior a hoy. | `YYYY-MM-DD` | `string` |

## ⚙️ Opciones

`getRates(options)` y `getRate(code, options)` aceptan:

| Opción | Por defecto | Descripción | Tipo |
| --- | --- | --- | --- |
| `timeoutMs` | `10000` | Tiempo máximo de espera, en milisegundos. | `number` |
| `rejectUnauthorized` | `true` | Verifica el certificado TLS del sitio. | `boolean` |

En `getRate`, el código de la moneda es el primer argumento (`getRate('USD', options)`). Debe ser `USD`, `EUR`, `CNY`, `TRY` o `RUB`.

Si el certificado del BCV no se puede verificar, obtendrás un `NetworkError` que lo indica. Actualmente el BCV presenta una cadena de certificados que Node no puede validar con la configuración por defecto, así que `getRates()` sin opciones fallará. Si confías en el sitio, puedes desactivar la verificación bajo tu responsabilidad:

```js
const { rates } = await getRates({ rejectUnauthorized: false });
```

En entornos de producción se recomienda dejar el valor por defecto (`true`) y solucionar el problema del certificado en la infraestructura del proyecto, no desactivar la verificación.

- **Nota:** otras librerías (como `bcv-divisas`) desactivan esta verificación de manera permanente; `bcv-fx` te da la libertad de configurarlo según tu entorno.

## ⚠️ Jerarquía de errores

Todos heredan de `BcvRatesError`:

| Error | Cuándo ocurre |
| --- | --- |
| `NetworkError` | No se pudo descargar la página (sin conexión, tiempo agotado, certificado, estado HTTP distinto de 2xx). El error original, si existe, queda en `error.cause`. |
| `ParseError` | La página se descargó, pero no tiene la estructura o el formato esperados. Casi siempre significa que **el BCV cambió su HTML**. |
| `CurrencyNotFoundError` | Se pidió una moneda no soportada con `getRate`. No se hace ninguna consulta. |

```js
import { getRates, NetworkError, ParseError } from 'bcv-fx';

try {
  const { rates } = await getRates();
} catch (error) {
  if (error instanceof NetworkError) { /* reintentar más tarde */ }
  else if (error instanceof ParseError) { /* el BCV cambió la página: revisar la librería */ }
  else throw error;
}
```

La librería **prefiere fallar a devolver un dato dudoso**: valida que cada tasa tenga el formato numérico del BCV y sea mayor que 0, y que la fecha valor exista en el calendario.

## 🧪 Tests y cobertura

| Suite | Archivo | Tests | Aserciones |
| --- | --- | ---: | ---: |
| Unit · currencies | `test/currencies.unit.test.ts` | 4 | 8 |
| Unit · extract | `test/extract.unit.test.ts` | 6 | 7 |
| Unit · fetch | `test/fetch.unit.test.ts` | 5 | 13 |
| Unit · index | `test/index.unit.test.ts` | 3 | 8 |
| Unit · parse | `test/parse.unit.test.ts` | 5 | 10 |
| Live · API | `test/index.live.test.ts` | 2 | 6 |
| **Total** | | **25** | **52** |

Cobertura unitaria por módulo:

| Módulo | Líneas | Ramas | Funciones |
| --- | ---: | ---: | ---: |
| `currencies.ts` | 100% | 100% | 100% |
| `errors.ts` | 100% | 100% | 100% |
| `extract.ts` | 100% | 100% | 100% |
| `fetch.ts` | 100% | 100% | 100% |
| `index.ts` | 100% | 100% | 100% |
| `parse.ts` | 100% | 100% | 100% |
| **Total unitario** | **100%** | **100%** | **100%** |

## 🔄 Flujo

```text
┌──────────────────────┐
│        Tu app        │
│       (Node.js)      │
└──────────┬───────────┘
           │ getRates() / getRate('USD')
           ▼
┌──────────────────────┐
│       index.ts       │
│   orquesta la API    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐                         ┌──────────────────────┐
│       fetch.ts       │───────── HTTPS ────────▶│      BCV website     │
│   descarga el HTML   │◀──────── HTML ──────────│      (HTML page)     │
└──────────┬───────────┘                         └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│      extract.ts      │
│    tasas y fecha     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       parse.ts       │
│    tasas y fecha     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   { meta, rates }    │
└──────────────────────┘
```

`fetch.ts` obtiene el HTML del BCV; `extract.ts` y `parse.ts` lo transforman hasta `{ meta, rates }`.

## 🛠️ Si el BCV cambia su página

| Qué cambió | Dónde se arregla |
| --- | --- |
| Se agregó una moneda o cambió el `id` de un bloque | `CURRENCIES` en `src/currencies.ts` |
| Cambió dónde está la fecha o la tasa en el HTML | `src/extract.ts` |
| Cambió cómo se escribe la tasa o la fecha | `src/parse.ts` |

## 📄 Licencia

MIT. Ver [LICENSE](./LICENSE).
