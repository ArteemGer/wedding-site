import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const script = readFileSync(
  new URL('../integrations/google-sheets/Code.gs', import.meta.url),
  'utf8',
)
const client = ts.transpileModule(
  readFileSync(new URL('../src/services/rsvp.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText
const ID = '12345678-1234-4234-8234-123456789abc'
const ENDPOINT = 'https://script.google.com/macros/s/test-deployment/exec'
const answer = (changes = {}) => ({
  submissionId: ID,
  name: 'Тестовый гость',
  drinks: ['Шампанское', 'Белое вино'],
  other: '',
  ...changes,
})

function server({ busy = false, failWrite = false } = {}) {
  let held = false
  let flushes = 0
  const rows = [
    [
      'ID ответа',
      'Дата ответа',
      'Имя гостя',
      'Шампанское',
      'Красное вино',
      'Белое вино',
      'Коньяк',
      'Водка',
      'Свой вариант',
      'Не пьёт',
    ],
  ]
  const sheet = {
    getLastRow: () => rows.length,
    getMaxRows: () => 1000,
    getRange(row, col, height = 1, width = 1) {
      return {
        getValues: () =>
          rows
            .slice(row - 1, row - 1 + height)
            .map((r) => r.slice(col - 1, col - 1 + width)),
        setValues(values) {
          assert.equal(
            held,
            true,
            'Writes must be protected by the script lock',
          )
          if (failWrite) throw new Error('Sheets write failed')
          values.forEach((value, i) => {
            rows[row - 1 + i] = [...value]
          })
          return this
        },
        setNumberFormat() {
          return this
        },
        createTextFinder(value) {
          return {
            matchEntireCell() {
              return this
            },
            useRegularExpression() {
              return this
            },
            findNext() {
              return (
                rows.slice(row - 1).find((r) => r[col - 1] === value) || null
              )
            },
          }
        },
      }
    },
  }
  const context = vm.createContext({
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: () => 'sheet-id' }),
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => {
          held = !busy
          return held
        },
        hasLock: () => held,
        releaseLock: () => {
          held = false
        },
      }),
    },
    SpreadsheetApp: {
      openById: () => ({ getSheetByName: () => sheet }),
      flush: () => {
        flushes++
      },
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (body) => ({
        body,
        setMimeType() {
          return this
        },
      }),
    },
  })
  vm.runInContext(script, context)
  return {
    rows,
    context,
    get held() {
      return held
    },
    get flushes() {
      return flushes
    },
    send(payload) {
      return JSON.parse(
        context.doPost({ postData: { contents: JSON.stringify(payload) } })
          .body,
      )
    },
  }
}

function browser(fetchImpl, storage = new Map()) {
  const exports = {}
  const context = vm.createContext({
    exports,
    fetch: fetchImpl,
    AbortController,
    setTimeout,
    clearTimeout,
    crypto: { randomUUID },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  })
  vm.runInContext(client, context)
  return exports
}

test('POST writes correct drink columns and returns a matching receipt after flush', () => {
  const app = server()
  assert.deepEqual(app.send(answer()), { ok: true, submissionId: ID })
  assert.deepEqual(app.rows[1].slice(2), [
    'Тестовый гость',
    'Да',
    '',
    'Да',
    '',
    '',
    '',
    '',
  ])
  assert.equal(app.flushes, 1)
  assert.equal(app.held, false)
})

test('Retrying the same ID never appends a second row', () => {
  const app = server()
  app.send(answer())
  assert.equal(app.send(answer()).duplicate, true)
  assert.equal(app.rows.length, 2)
})

test('Reject invalid, contradictory, oversized and malformed answers without writing', () => {
  for (const changes of [
    { name: '   ' },
    { name: 'x'.repeat(121) },
    { other: 'x'.repeat(201) },
    { drinks: [] },
    { drinks: ['Не буду пить', 'Водка'] },
    { drinks: ['Свой вариант'], other: '' },
    { drinks: ['Шампанское', 'Шампанское'] },
    { drinks: ['Неизвестный напиток'] },
    { drinks: [null] },
    { submissionId: '=1+1' },
  ]) {
    const app = server()
    assert.equal(app.send(answer(changes)).ok, false)
    assert.equal(app.rows.length, 1)
  }
  const app = server()
  assert.equal(
    JSON.parse(app.context.doPost({ postData: { contents: '{bad json' } }).body)
      .ok,
    false,
  )
  assert.equal(
    JSON.parse(
      app.context.doPost({ postData: { contents: 'x'.repeat(6001) } }).body,
    ).ok,
    false,
  )
})

test('Spreadsheet formulas are escaped; own drink and abstention use correct columns', () => {
  const app = server()
  app.send(
    answer({
      name: '=IMPORTXML("url")',
      drinks: ['Свой вариант'],
      other: '+1+1',
    }),
  )
  assert.equal(app.rows[1][2], '\'=IMPORTXML("url")')
  assert.equal(app.rows[1][8], "'+1+1")
  const sober = server()
  sober.send(answer({ drinks: ['Не буду пить'] }))
  assert.deepEqual(sober.rows[1].slice(3), ['', '', '', '', '', '', 'Да'])
})

test('A busy lock or failed write never produces success and releases locks', () => {
  for (const options of [{ busy: true }, { failWrite: true }]) {
    const app = server(options)
    assert.equal(app.send(answer()).ok, false)
    assert.equal(app.rows.length, 1)
    assert.equal(app.held, false)
  }
})

test('Public GET contains no guest data', () => {
  const app = server()
  app.send(answer())
  assert.deepEqual(JSON.parse(app.context.doGet().body), {
    ok: true,
    service: 'wedding-rsvp',
    configured: true,
  })
})

test('Browser sends a simple POST and accepts a real server receipt', async () => {
  const app = server()
  const api = browser(async (url, options) => {
    assert.equal(url, ENDPOINT)
    assert.equal(options.method, 'POST')
    assert.equal(options.headers['Content-Type'], 'text/plain;charset=utf-8')
    assert.equal(options.credentials, 'omit')
    assert.notEqual(options.mode, 'no-cors')
    return { ok: true, json: async () => app.send(JSON.parse(options.body)) }
  })
  await api.sendRsvp(ENDPOINT, answer())
  await api.sendRsvp(ENDPOINT, answer())
  assert.equal(app.rows.length, 2)
})

test('Browser rejects HTTP errors, failed saves, mismatched IDs, HTML and network errors', async () => {
  for (const response of [
    { ok: false },
    { ok: true, json: async () => ({ ok: false }) },
    {
      ok: true,
      json: async () => ({ ok: true, submissionId: 'different-id' }),
    },
    { ok: true, json: async () => ({ ok: true }) },
    {
      ok: true,
      json: async () => {
        throw new Error('HTML login page')
      },
    },
  ]) {
    await assert.rejects(
      browser(async () => response).sendRsvp(ENDPOINT, answer()),
      /Не удалось подтвердить/,
    )
  }
  await assert.rejects(
    browser(async () => {
      throw new Error('Offline')
    }).sendRsvp(ENDPOINT, answer()),
    /Не удалось подтвердить/,
  )
})

test('Timeout aborts the request without claiming success', async () => {
  const api = browser(
    (url, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () =>
          reject(new Error('aborted')),
        )
      }),
  )
  await assert.rejects(
    api.sendRsvp(ENDPOINT, answer(), 5),
    /Не удалось подтвердить/,
  )
})

test('Browser preserves retry IDs across reload; edited answers get new IDs', () => {
  const storage = new Map()
  const first = browser(undefined, storage).prepareSubmission(answer())
  const api = browser(undefined, storage)
  const retry = api.prepareSubmission(
    answer({ drinks: ['Белое вино', 'Шампанское'] }),
  )
  assert.equal(first.submissionId, retry.submissionId)
  assert.notEqual(
    api.prepareSubmission(answer({ name: 'Другой гость' })).submissionId,
    first.submissionId,
  )
})

test('Missing or non-Google endpoint is rejected before sending', async () => {
  const api = browser(() => {
    assert.fail('fetch must not run')
  })
  await assert.rejects(api.sendRsvp('', answer()), /Некорректный адрес/)
  await assert.rejects(
    api.sendRsvp('https://example.com/exec', answer()),
    /Некорректный адрес/,
  )
})

test('Summary repair only writes B2:B9 and preserves existing guest answers', () => {
  const app = server()
  app.send(answer())
  const before = JSON.stringify(app.rows)
  const writes = []
  const spreadsheet = app.context.SpreadsheetApp.openById('sheet-id')
  app.context.SpreadsheetApp.getActiveSpreadsheet = () => ({
    getSheetByName(name) {
      if (name === 'Ответы') return spreadsheet.getSheetByName(name)
      if (name === 'Итого')
        return {
          getRange(range) {
            return {
              getValue: () => 'Напиток / показатель',
              setFormulas: (formulas) =>
                writes.push({
                  range,
                  formulas: JSON.parse(JSON.stringify(formulas)),
                }),
            }
          },
        }
      return null
    },
  })
  app.context.repairSummary()
  assert.equal(JSON.stringify(app.rows), before)
  assert.equal(writes.length, 1)
  assert.equal(writes[0].range, 'B2:B9')
  const formulas = writes[0].formulas.flat()
  assert.equal(formulas.length, 8)
  // No argument separators: the regression cannot depend on Russian vs US locale.
  assert.ok(formulas.every((formula) => !/[,;]/.test(formula)))
  assert.deepEqual(formulas, [
    "=COUNTA('Ответы'!C2:C)",
    `=SUMPRODUCT(--('Ответы'!D2:D="Да"))`,
    `=SUMPRODUCT(--('Ответы'!E2:E="Да"))`,
    `=SUMPRODUCT(--('Ответы'!F2:F="Да"))`,
    `=SUMPRODUCT(--('Ответы'!G2:G="Да"))`,
    `=SUMPRODUCT(--('Ответы'!H2:H="Да"))`,
    "=COUNTA('Ответы'!I2:I)",
    `=SUMPRODUCT(--('Ответы'!J2:J="Да"))`,
  ])
})
