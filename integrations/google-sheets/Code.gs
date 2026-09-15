/**
 * Скопируйте весь файл в Code.gs в Apps Script, открытом из вашей Google Таблицы.
 * Один раз запустите setup(), затем разверните веб-приложение.
 * Полная инструкция: SETUP.md рядом с этим файлом.
 */
const ANSWERS_SHEET = 'Ответы'
const SUMMARY_SHEET = 'Итого'
const DRINKS = [
  'Шампанское',
  'Красное вино',
  'Белое вино',
  'Коньяк',
  'Водка',
  'Свой вариант',
  'Не буду пить',
]
const HEADERS = [
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
]

/** Выполнять вручную из редактора, а не из браузера. Не удаляет существующие ответы. */
function setup() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  if (!spreadsheet)
    throw new Error(
      'Откройте Apps Script через Расширения → Apps Script в нужной таблице.',
    )
  const lock = LockService.getScriptLock()
  lock.waitLock(20000)
  try {
    const answers =
      spreadsheet.getSheetByName(ANSWERS_SHEET) ||
      spreadsheet.insertSheet(ANSWERS_SHEET)
    if (answers.getLastRow() === 0)
      answers.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    checkHeaders_(answers)
    const summary =
      spreadsheet.getSheetByName(SUMMARY_SHEET) ||
      spreadsheet.insertSheet(SUMMARY_SHEET)
    // Do not overwrite an unrelated sheet with the same name.
    if (
      summary.getLastRow() > 0 &&
      summary.getRange(1, 1).getValue() !== 'Напиток / показатель'
    ) {
      throw new Error(
        'Лист «Итого» уже содержит другие данные. Переименуйте его и снова запустите setup.',
      )
    }
    answers.setFrozenRows(1)
    answers
      .getRange(1, 1, 1, HEADERS.length)
      .setBackground('#1e2e4f')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
    answers.getRange('B:B').setNumberFormat('dd.MM.yyyy HH:mm:ss')
    answers.setColumnWidth(2, 170)
    answers.setColumnWidth(3, 220)
    answers.setColumnWidths(4, 5, 140)
    answers.setColumnWidth(9, 250)
    answers.setColumnWidth(10, 110)
    answers.hideColumns(1)
    summary.getRange(1, 1, 9, 2).setValues([
      ['Напиток / показатель', 'Количество ответов'],
      ['Всего ответов', ''],
      ['Шампанское', ''],
      ['Красное вино', ''],
      ['Белое вино', ''],
      ['Коньяк', ''],
      ['Водка', ''],
      ['Свой вариант', ''],
      ['Не пьёт', ''],
    ])
    summary.getRange('B2:B9').setFormulas(summaryFormulas_())
    summary
      .getRange('A11')
      .setValue(
        'Один гость может выбрать несколько напитков. Сумма предпочтений не равна количеству анкет.',
      )
    summary.getRange('A11:B12').setWrap(true)
    summary
      .getRange('A1:B1')
      .setBackground('#1e2e4f')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
    summary.setColumnWidths(1, 2, 250)
    summary.setFrozenRows(1)
    spreadsheet.setSpreadsheetTimeZone('Europe/Moscow')
    PropertiesService.getScriptProperties().setProperty(
      'SPREADSHEET_ID',
      spreadsheet.getId(),
    )
    SpreadsheetApp.flush()
  } finally {
    lock.releaseLock()
  }
}

/** One-argument formulas work with both comma and semicolon spreadsheet locales. */
function summaryFormulas_() {
  return [
    ["=COUNTA('Ответы'!C2:C)"],
    ...['D', 'E', 'F', 'G', 'H'].map(function (column) {
      return ["=SUMPRODUCT(--('Ответы'!" + column + '2:' + column + '="Да"))']
    }),
    ["=COUNTA('Ответы'!I2:I)"],
    ['=SUMPRODUCT(--(\'Ответы\'!J2:J="Да"))'],
  ]
}

/** Run manually to repair only summary formulas, preserving all guest answers. */
function repairSummary() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  if (!spreadsheet) throw new Error('Откройте скрипт из Google Таблицы.')
  const summary = spreadsheet.getSheetByName(SUMMARY_SHEET)
  if (
    !summary ||
    summary.getRange('A1').getValue() !== 'Напиток / показатель'
  ) {
    throw new Error('Не найден лист «Итого» с ожидаемыми заголовками.')
  }
  checkHeaders_(spreadsheet.getSheetByName(ANSWERS_SHEET))
  summary.getRange('B2:B9').setFormulas(summaryFormulas_())
  SpreadsheetApp.flush()
}

/** Health check only: never publish guests or their answers via GET. */
function doGet() {
  return json_({
    ok: true,
    service: 'wedding-rsvp',
    configured: Boolean(
      PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),
    ),
  })
}

function doPost(event) {
  let lock
  try {
    if (
      !event ||
      !event.postData ||
      typeof event.postData.contents !== 'string' ||
      event.postData.contents.length > 6000
    ) {
      return json_({ ok: false, code: 'INVALID_REQUEST' })
    }
    const answer = validate_(JSON.parse(event.postData.contents))
    const spreadsheetId =
      PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    if (!spreadsheetId) return json_({ ok: false, code: 'NOT_CONFIGURED' })
    lock = LockService.getScriptLock()
    if (!lock.tryLock(15000)) return json_({ ok: false, code: 'BUSY' })
    const sheet =
      SpreadsheetApp.openById(spreadsheetId).getSheetByName(ANSWERS_SHEET)
    checkHeaders_(sheet)
    const row = [
      answer.submissionId,
      new Date(),
      safeCell_(answer.name),
      ...DRINKS.slice(0, 5).map(function (drink) {
        return answer.drinks.indexOf(drink) !== -1 ? 'Да' : ''
      }),
      answer.drinks.indexOf('Свой вариант') !== -1
        ? safeCell_(answer.other)
        : '',
      answer.drinks.indexOf('Не буду пить') !== -1 ? 'Да' : '',
    ]
    // The lock covers both duplicate detection and write, including concurrent requests.
    if (sheet.getLastRow() > 1) {
      const existing = sheet
        .getRange(2, 1, sheet.getLastRow() - 1, 1)
        .createTextFinder(answer.submissionId)
        .matchEntireCell(true)
        .useRegularExpression(false)
        .findNext()
      if (existing)
        return json_({
          ok: true,
          submissionId: answer.submissionId,
          duplicate: true,
        })
    }
    const nextRow = sheet.getLastRow() + 1
    if (nextRow > sheet.getMaxRows())
      sheet.insertRowsAfter(sheet.getMaxRows(), 100)
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([row])
    sheet.getRange(nextRow, 2).setNumberFormat('dd.MM.yyyy HH:mm:ss')
    SpreadsheetApp.flush()
    return json_({ ok: true, submissionId: answer.submissionId })
  } catch (error) {
    // Do not echo personal data or internal exception details to a public endpoint.
    return json_({
      ok: false,
      code:
        error && error.message === 'INVALID_ANSWER'
          ? 'INVALID_ANSWER'
          : 'SAVE_FAILED',
    })
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock()
  }
}

function validate_(input) {
  if (
    !input ||
    typeof input !== 'object' ||
    typeof input.submissionId !== 'string' ||
    !/^[a-f0-9-]{36}$/.test(input.submissionId) ||
    typeof input.name !== 'string' ||
    typeof input.other !== 'string' ||
    !Array.isArray(input.drinks)
  ) {
    throw new Error('INVALID_ANSWER')
  }
  const name = input.name.trim()
  const other = input.other.trim()
  const drinks = input.drinks
  if (
    !name ||
    name.length > 120 ||
    other.length > 200 ||
    !drinks.length ||
    drinks.length > DRINKS.length ||
    new Set(drinks).size !== drinks.length ||
    drinks.some(function (drink) {
      return DRINKS.indexOf(drink) === -1
    }) ||
    (drinks.indexOf('Не буду пить') !== -1 && drinks.length !== 1) ||
    (drinks.indexOf('Свой вариант') !== -1 && !other)
  ) {
    throw new Error('INVALID_ANSWER')
  }
  return {
    submissionId: input.submissionId,
    name: name,
    drinks: drinks,
    other: other,
  }
}

function checkHeaders_(sheet) {
  if (
    !sheet ||
    JSON.stringify(sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0]) !==
      JSON.stringify(HEADERS)
  ) {
    throw new Error(
      'Не меняйте названия и порядок столбцов листа «Ответы». Запустите setup для новой таблицы.',
    )
  }
}

function safeCell_(value) {
  // Prevent formula execution in Sheets and in a later CSV/Excel export.
  const text = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim()
  return /^[=+@\-]/.test(text) ? "'" + text : text
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
