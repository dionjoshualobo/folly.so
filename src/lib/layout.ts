import type { Block, BlockType } from '../types'

export interface ColumnRow {
  key: string
  /** Empty string for a full-width block that is not in a column. */
  id: string
  blocks: Block[]
}

const FULL_WIDTH_TYPES: BlockType[] = ['pageBreak', 'thankYou']

/** Blocks that must always span the full width and can never join a column. */
export function isFullWidth(type: BlockType): boolean {
  return FULL_WIDTH_TYPES.includes(type)
}

/**
 * Groups blocks into rows, mirroring Tally's column model.
 *
 * A column is an explicit relationship (a shared `colId`), not an accident of
 * array position. Grouping by identity rather than adjacency means a column
 * survives conditional visibility — hiding one member must not silently
 * re-group or orphan the others — and survives a block being moved elsewhere in
 * the document. Members keep document order inside their column.
 *
 * Widths are per column and denormalised onto each member as `colWidth`
 * (a percentage), matching Tally where a column is a real box with its own
 * width that you resize by dragging the edge it shares with its neighbour.
 */
export function rowLayout(blocks: Block[]): ColumnRow[] {
  const rows: ColumnRow[] = []
  const byCol = new Map<string, ColumnRow>()

  for (const b of blocks) {
    const colId = isFullWidth(b.type) ? undefined : b.colId
    if (colId) {
      let row = byCol.get(colId)
      if (!row) {
        row = { key: `col-${colId}`, id: colId, blocks: [] }
        byCol.set(colId, row)
        rows.push(row)
      }
      row.blocks.push(b)
    } else {
      rows.push({ key: `blk-${b.id}`, id: '', blocks: [b] })
    }
  }

  return rows
}

/** True when this block may be dragged into (or out of) a column. */
export function canJoinColumn(type: BlockType): boolean {
  return !isFullWidth(type)
}

/** The number of columns in a row, always at least 1. */
export function columnCount(row: ColumnRow): number {
  return row.blocks.length
}

export interface ResolvedRow {
  row: ColumnRow
  columns: number
  /** Percentage width per column; sums to 100. Equal when nothing was resized. */
  widths: number[]
  /** CSS `grid-template-columns` value, or null when the row is full width. */
  template: string | null
}

const MIN_COLUMN_PCT = 15
/** Wider rows are allowed, but each column still needs a usable floor. */
const MIN_COLUMN_PCT_WIDE = 8

/**
 * Resolves a row into concrete column widths. Any member carrying a `colWidth`
 * wins; the rest share what is left over. Widths are clamped so a column can
 * never be dragged so narrow that its content collapses.
 */
export function resolveRow(row: ColumnRow): ResolvedRow {
  const columns = columnCount(row)
  if (!row.id || columns < 2) {
    return { row, columns, widths: [], template: null }
  }

  const min = columns <= 4 ? MIN_COLUMN_PCT : MIN_COLUMN_PCT_WIDE
  const requested = row.blocks.map((b) => (typeof b.colWidth === 'number' ? b.colWidth : null))
  const fixed = requested.reduce<number>((sum, w) => sum + (w ?? 0), 0)
  const unfixedCount = requested.filter((w) => w === null).length
  const remaining = Math.max(0, 100 - fixed)
  const share = unfixedCount > 0 ? remaining / unfixedCount : 0

  let widths = requested.map((w) => (w === null ? share : w))

  // Clamp, then redistribute any overflow across the columns that have room.
  for (let guard = 0; guard < 8; guard++) {
    const clamped = widths.map((w) => Math.max(min, w))
    const total = clamped.reduce((a, b) => a + b, 0)
    if (Math.abs(total - 100) < 0.01) {
      widths = clamped
      break
    }
    if (total < 100) {
      // A member was removed from this column, so the widths no longer sum to
      // 100. Share the slack out proportionally rather than dumping it all on
      // the widest column.
      const deficit = 100 - total
      widths = clamped.map((w) => w + (deficit * w) / total)
      break
    }
    // Too wide: shrink everything proportionally down to the minimum.
    const excess = total - 100
    const flexible = clamped.map((w) => w - min)
    const flexTotal = flexible.reduce((a, b) => a + b, 0) || 1
    widths = clamped.map((w, i) => Math.max(min, w - (excess * flexible[i]) / flexTotal))
  }

  // Snap to two decimals so the template string stays tidy.
  widths = widths.map((w) => Math.round(w * 100) / 100)
  return { row, columns, widths, template: widths.map((w) => `${w}%`).join(' ') }
}
