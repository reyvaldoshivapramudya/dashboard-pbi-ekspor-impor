/**
 * Membuat file Excel .xlsx langsung di browser tanpa dependensi tambahan.
 * Arsip ZIP ditulis dengan metode STORE (tanpa kompresi) agar dapat dibaca
 * oleh Microsoft Excel, LibreOffice, dan aplikasi spreadsheet lain.
 */
export interface XlsxExportOptions {
  fileName: string
  sheetName: string
  headers: string[]
  rows: Array<Array<string | number>>
  columnWidths?: number[]
}

interface ZipEntry {
  name: string
  data: Uint8Array
  crc32: number
  localOffset: number
}

const encoder = new TextEncoder()

function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnName(index: number): string {
  let value = index + 1
  let result = ''

  while (value > 0) {
    const remainder = (value - 1) % 26
    result = String.fromCharCode(65 + remainder) + result
    value = Math.floor((value - 1) / 26)
  }

  return result
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff

  for (const byte of data) {
    crc ^= byte

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

function writeUint16(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
}

function writeUint32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff
  target[offset + 1] = (value >>> 8) & 0xff
  target[offset + 2] = (value >>> 16) & 0xff
  target[offset + 3] = (value >>> 24) & 0xff
}

function buildZip(files: Array<{ name: string; content: string }>): Uint8Array {
  const entries: ZipEntry[] = files.map((file) => {
    const data = encoder.encode(file.content)

    return {
      name: file.name,
      data,
      crc32: crc32(data),
      localOffset: 0,
    }
  })

  const encodedNames = entries.map((entry) => encoder.encode(entry.name))
  const localSize = entries.reduce(
    (total, entry, index) => total + 30 + encodedNames[index]!.length + entry.data.length,
    0,
  )
  const centralSize = entries.reduce(
    (total, entry, index) => total + 46 + encodedNames[index]!.length,
    0,
  )
  const endSize = 22
  const output = new Uint8Array(localSize + centralSize + endSize)
  let offset = 0

  // Local file headers and uncompressed file contents.
  entries.forEach((entry, index) => {
    const nameBytes = encodedNames[index]!
    entry.localOffset = offset

    writeUint32(output, offset, 0x04034b50)
    writeUint16(output, offset + 4, 20)
    writeUint16(output, offset + 6, 0x0800) // UTF-8 filenames
    writeUint16(output, offset + 8, 0) // STORE: no compression
    writeUint16(output, offset + 10, 0)
    writeUint16(output, offset + 12, 0x0021) // DOS date: 1980-01-01
    writeUint32(output, offset + 14, entry.crc32)
    writeUint32(output, offset + 18, entry.data.length)
    writeUint32(output, offset + 22, entry.data.length)
    writeUint16(output, offset + 26, nameBytes.length)
    writeUint16(output, offset + 28, 0)
    output.set(nameBytes, offset + 30)
    output.set(entry.data, offset + 30 + nameBytes.length)

    offset += 30 + nameBytes.length + entry.data.length
  })

  const centralOffset = offset

  // Central directory.
  entries.forEach((entry, index) => {
    const nameBytes = encodedNames[index]!

    writeUint32(output, offset, 0x02014b50)
    writeUint16(output, offset + 4, 20)
    writeUint16(output, offset + 6, 20)
    writeUint16(output, offset + 8, 0x0800)
    writeUint16(output, offset + 10, 0)
    writeUint16(output, offset + 12, 0)
    writeUint16(output, offset + 14, 0x0021)
    writeUint32(output, offset + 16, entry.crc32)
    writeUint32(output, offset + 20, entry.data.length)
    writeUint32(output, offset + 24, entry.data.length)
    writeUint16(output, offset + 28, nameBytes.length)
    writeUint16(output, offset + 30, 0)
    writeUint16(output, offset + 32, 0)
    writeUint16(output, offset + 34, 0)
    writeUint16(output, offset + 36, 0)
    writeUint32(output, offset + 38, 0)
    writeUint32(output, offset + 42, entry.localOffset)
    output.set(nameBytes, offset + 46)

    offset += 46 + nameBytes.length
  })

  // End of central directory record.
  writeUint32(output, offset, 0x06054b50)
  writeUint16(output, offset + 4, 0)
  writeUint16(output, offset + 6, 0)
  writeUint16(output, offset + 8, entries.length)
  writeUint16(output, offset + 10, entries.length)
  writeUint32(output, offset + 12, centralSize)
  writeUint32(output, offset + 16, centralOffset)
  writeUint16(output, offset + 20, 0)

  return output
}

function createWorksheetXml(headers: string[], rows: Array<Array<string | number>>, widths: number[]): string {
  const allRows: Array<Array<string | number>> = [headers, ...rows]
  const lastColumn = columnName(Math.max(headers.length - 1, 0))
  const lastRow = Math.max(allRows.length, 1)

  const columnXml = widths.length
    ? `<cols>${widths
        .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
        .join('')}</cols>`
    : ''

  const rowXml = allRows
    .map((row, rowIndex) => {
      const cells = headers
        .map((_, columnIndex) => {
          const value = row[columnIndex] ?? ''
          const cellReference = `${columnName(columnIndex)}${rowIndex + 1}`
          const style = rowIndex === 0 ? ' s="1"' : ''
          return `<c r="${cellReference}" t="inlineStr"${style}><is><t xml:space="preserve">${escapeXml(String(value))}</t></is></c>`
        })
        .join('')

      return `<row r="${rowIndex + 1}"${rowIndex === 0 ? ' ht="30" customHeight="1"' : ''}>${cells}</row>`
    })
    .join('')

  const filter = rows.length > 0 ? `<autoFilter ref="A1:${lastColumn}${lastRow}"/>` : ''

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><dimension ref="A1:${lastColumn}${lastRow}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/>${columnXml}<sheetData>${rowXml}</sheetData>${filter}<pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>`
}

function createStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Aptos"/><family val="2"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Aptos"/><family val="2"/></font></fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1769AA"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[\\/?*:[\]]/g, ' ').slice(0, 31) || 'Data'
}

export function downloadXlsx(options: XlsxExportOptions): void {
  const sheetName = sanitizeSheetName(options.sheetName)
  const rows = options.rows.map((row) => [...row])
  const widths = options.columnWidths ?? options.headers.map((header) => Math.min(Math.max(header.length + 4, 14), 36))

  const files = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    { name: 'xl/styles.xml', content: createStylesXml() },
    {
      name: 'xl/worksheets/sheet1.xml',
      content: createWorksheetXml(options.headers, rows, widths),
    },
  ]

  const zipContent = buildZip(files)
  const blob = new Blob([zipContent.buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = options.fileName.toLowerCase().endsWith('.xlsx')
    ? options.fileName
    : `${options.fileName}.xlsx`
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
