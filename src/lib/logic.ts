import type { AnswerValue, Block, BlockType, Form } from '../types'

export function getQuestionLabel(block: Block): string {
  const t = block.text.trim()
  return t.length > 0 ? t : 'Untitled question'
}

const ANSWER_TYPES: BlockType[] = [
  'shortText',
  'longText',
  'number',
  'email',
  'phone',
  'link',
  'date',
  'time',
  'rating',
  'csat',
  'nps',
  'linear',
  'multipleChoice',
  'checkbox',
  'dropdown',
  'multiSelect',
  'ranking',
  'matrix',
  'fileUpload',
  'signature',
  'score',
]

export function isAnswerBlock(type: BlockType): boolean {
  return ANSWER_TYPES.includes(type)
}

export function canHaveLogic(block: Block): boolean {
  return isAnswerBlock(block.type) || block.type === 'image' || block.type === 'paragraph'
}

function toList(answer: AnswerValue): string[] {
  if (answer === null || answer === undefined) return []
  if (Array.isArray(answer)) {
    if (answer.length > 0 && typeof answer[0] !== 'string') return []
    return (answer as string[]).map((a) => String(a))
  }
  if (typeof answer === 'object' && 'name' in answer) return [String(answer.name)]
  if (typeof answer === 'object') return Object.values(answer).map((a) => String(a))
  return [String(answer)]
}

function answerMatches(
  answer: AnswerValue,
  value: string,
  op: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan',
): boolean {
  if (Array.isArray(answer) || (typeof answer === 'object' && answer !== null && !('name' in answer))) {
    const stringAnswers = toList(answer).map((a) => a.toLowerCase())
    const target = value.toLowerCase()

    if (op === 'equals') return stringAnswers.includes(target)
    if (op === 'notEquals') return !stringAnswers.includes(target)
    if (op === 'contains') return stringAnswers.some((a) => a.includes(target))
    if (op === 'notContains') return !stringAnswers.some((a) => a.includes(target))

    const numVal = Number(value)
    if (!isNaN(numVal)) {
      const numericAnswers = toList(answer)
        .map((a) => Number(a))
        .filter((n) => !isNaN(n))
      if (numericAnswers.length > 0) {
        if (op === 'greaterThan') return numericAnswers.some((n) => n > numVal)
        if (op === 'lessThan') return numericAnswers.some((n) => n < numVal)
      }
    }
    return false
  }

  const normalized = answer === undefined || answer === null ? '' : String(answer)
  const normLower = normalized.toLowerCase()
  const targetLower = value.toLowerCase()

  if (op === 'equals') return normLower === targetLower
  if (op === 'notEquals') return normLower !== targetLower
  if (op === 'contains') return normLower.includes(targetLower)
  if (op === 'notContains') return !normLower.includes(targetLower)

  const answerNum = Number(normalized)
  const targetNum = Number(value)
  if (!isNaN(answerNum) && !isNaN(targetNum)) {
    if (op === 'greaterThan') return answerNum > targetNum
    if (op === 'lessThan') return answerNum < targetNum
  }
  return false
}

export function blockVisible(block: Block, answers: Record<string, AnswerValue>): boolean {
  if (!block.showIf || block.showIf.length === 0) return true
  return block.showIf.every((c) => {
    const answer = answers[c.fieldId]
    if (c.op === 'equals' && (answer === undefined || answer === null || answer === '')) return false
    return answerMatches(answer, c.value, c.op)
  })
}

export function visibleBlocks(form: Form, answers: Record<string, AnswerValue>): Block[] {
  return form.blocks.filter((b) => blockVisible(b, answers))
}

export function splitIntoPages(blocks: Block[], answers: Record<string, AnswerValue>): Block[][] {
  const pages: Block[][] = []
  let current: Block[] = []
  for (const block of blocks) {
    if (!blockVisible(block, answers)) continue
    if (block.type === 'pageBreak') {
      pages.push(current)
      current = []
    } else {
      current.push(block)
    }
  }
  pages.push(current)
  return pages.filter((p) => p.length > 0)
}

export function questionOptions(form: Form): Array<{ id: string; label: string }> {
  return form.blocks
    .filter((b) => isAnswerBlock(b.type))
    .map((b) => ({ id: b.id, label: getQuestionLabel(b) }))
}

export function answerOptionsFor(block: Block): string[] {
  if (block.type === 'matrix') return (block.matrixColumns ?? []).filter((c) => c.trim())
  return (block.options ?? []).filter((o) => o.label.trim()).map((o) => o.label.trim())
}

export function formatAnswer(value: AnswerValue): string {
  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] !== 'string') {
      const sig = value as Array<{ points: unknown[] }>
      const n = sig.filter((s) => s.points.length > 1).length
      return `Signature (${n} stroke${n === 1 ? '' : 's'})`
    }
    return value.join(', ')
  }
  if (value && typeof value === 'object' && 'name' in value) {
    const f = value as { name: string; size: number }
    return `${f.name} (${(f.size / 1024).toFixed(1)} KB)`
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([row, col]) => `${row}: ${col}`)
      .join(', ')
  }
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function numericValue(answer: AnswerValue): number {
  if (typeof answer === 'number') return isNaN(answer) ? 0 : answer
  if (answer === null || answer === undefined || answer === '') return 0
  const n = Number(String(answer))
  return isNaN(n) ? 0 : n
}

function optionPoints(label: string, options: Array<{ label: string }>, direction: -1 | 1): number {
  const idx = options.findIndex((o) => o.label === label)
  if (idx === -1) return 0
  const position = idx + 1
  return direction === 1 ? position : options.length - idx
}

export function computeScore(
  block: Block,
  answers: Record<string, AnswerValue>,
  blocks: Block[],
): number {
  const ids = block.scoreSourceIds ?? []
  if (ids.length === 0) return 0
  let total = 0
  for (const id of ids) {
    const source = blocks.find((b) => b.id === id)
    if (!source) continue
    const value = answers[id]
    if (value === null || value === undefined) continue
    switch (source.type) {
      case 'shortText':
      case 'longText':
      case 'number':
      case 'rating':
      case 'csat':
      case 'nps':
      case 'linear':
        total += numericValue(value)
        break
      case 'multipleChoice':
      case 'checkbox':
      case 'dropdown':
      case 'multiSelect': {
        const options = source.options ?? []
        const selected = (Array.isArray(value) ? value : [String(value)]) as string[]
        for (const label of selected) {
          total += optionPoints(label, options, 1)
        }
        break
      }
      case 'ranking': {
        const options = (source.options ?? []).filter((o) => o.label.trim())
        if (Array.isArray(value)) {
          value.forEach((label, i) => {
            total += Math.max(0, options.length - i)
          })
        }
        break
      }
      case 'matrix': {
        if (value && typeof value === 'object') {
          const columns = source.matrixColumns ?? []
          for (const col of Object.values(value)) {
            const idx = columns.indexOf(String(col))
            if (idx !== -1) total += idx + 1
          }
        }
        break
      }
      default:
        break
    }
  }
  return total
}

export function formatWhen(ts: number): string {
  const d = new Date(ts)
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function pipeText(
  text: string,
  answers: Record<string, AnswerValue>,
  blocks: Block[],
  hiddenFields: string[] = []
): string {
  if (!text) return ''
  return text.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
    const expr = expression.trim()
    if (expr.startsWith('@')) {
      const labelToFind = expr.slice(1).trim()
      const block = blocks.find((b) => getQuestionLabel(b).toLowerCase() === labelToFind.toLowerCase())
      if (block) {
        const val = answers[block.id]
        if (val !== undefined && val !== null && val !== '') {
          return formatAnswer(val)
        }
        return '...'
      }
    }
    const blockById = blocks.find((b) => b.id === expr)
    if (blockById) {
      const val = answers[blockById.id]
      if (val !== undefined && val !== null && val !== '') {
        return formatAnswer(val)
      }
      return '...'
    }
    if (hiddenFields.includes(expr)) {
      const val = answers[expr]
      if (val !== undefined && val !== null && val !== '') {
        return formatAnswer(val)
      }
      return '...'
    }
    return match
  })
}