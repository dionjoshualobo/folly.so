import { create } from 'zustand'
import type { AnswerValue, Block, Form, FormSettings, FormTheme, Submission } from './types'
import { makeBlock, makeForm, uid } from './types'
import type { FormTemplate } from './lib/templates'
import * as api from './lib/api'

interface State {
  forms: Form[]
  submissions: Submission[]
  ready: boolean
  hydrating: boolean
  error: string | null
  hydrate: () => Promise<void>
  ensureForm: (id: string) => Promise<boolean>
  createForm: (name?: string) => Form
  createFormFromTemplate: (template: FormTemplate) => Form
  deleteForm: (id: string) => void
  duplicateForm: (id: string) => Form | null
  updateForm: (id: string, patch: Partial<Form>) => void
  updateSettings: (id: string, patch: Partial<FormSettings>) => void
  updateTheme: (id: string, patch: Partial<FormTheme>) => void
  updateBlock: (formId: string, blockId: string, patch: Partial<Block>) => void
  addBlock: (formId: string, block: Block, index?: number) => void
  removeBlock: (formId: string, blockId: string) => void
  moveBlock: (formId: string, fromIndex: number, toIndex: number) => void
  duplicateBlock: (formId: string, blockId: string) => void
  addSubmission: (formId: string, answers: Record<string, AnswerValue>, id?: string) => Promise<Submission>
  deleteSubmission: (id: string) => void
}

// Debounced full-form persistence. Form JSON is stored as a single document in
// Postgres, so every mutation re-sends the latest form after a short quiet period.
const saveTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleSave(form: Form) {
  const existing = saveTimers.get(form.id)
  if (existing) clearTimeout(existing)
  saveTimers.set(
    form.id,
    setTimeout(() => {
      saveTimers.delete(form.id)
      api.saveForm(form).catch((err) => {
        console.error('[folly] failed to save form', form.id, err)
      })
    }, 350),
  )
}

export const useForms = create<State>()((set, get) => {
  const mutateForm = (id: string, fn: (f: Form) => Form) => {
    let next: Form | undefined
    set((s) => ({
      forms: s.forms.map((f) => {
        if (f.id !== id) return f
        next = { ...fn({ ...f, updatedAt: Date.now() }) }
        return next
      }),
    }))
    if (next) scheduleSave(next)
  }

  return {
    forms: [],
    submissions: [],
    ready: false,
    hydrating: false,
    error: null,

    hydrate: async () => {
      if (get().hydrating) return
      set({ hydrating: true, error: null })
      try {
        const { forms } = await api.listForms()
        const submissions = (
          await Promise.all(
            forms.map((f) =>
              api.listSubmissions(f.id).then(
                (r) => r.submissions,
                (err) => {
                  console.error('[folly] failed to load submissions for', f.id, err)
                  return []
                },
              ),
            ),
          )
        ).flat()
        set({ forms, submissions, ready: true, hydrating: false })
      } catch (err) {
        console.error('[folly] failed to load forms', err)
        set({ hydrating: false, ready: false, error: err instanceof Error ? err.message : String(err) })
      }
    },

    ensureForm: async (id) => {
      if (get().forms.some((f) => f.id === id)) return true
      try {
        const { form } = await api.getForm(id)
        set((s) => (s.forms.some((f) => f.id === form.id) ? s : { forms: [...s.forms, form] }))
        return true
      } catch {
        return false
      }
    },

    createForm: (name?: string) => {
      const form = makeForm({ name })
      if (name) form.settings.title = name
      set((s) => ({ forms: [form, ...s.forms] }))
      api.createForm(form).catch((err) => {
        console.error('[folly] failed to create form', err)
      })
      return form
    },

    createFormFromTemplate: (template) => {
      const form = makeForm({
        name: template.title,
        blocks: template.blocks.map((b) =>
          makeBlock({
            ...b,
            id: uid(),
            options: b.options?.map((o) => ({ ...o, id: uid() })),
          }),
        ),
      })
      form.settings.title = template.title
      if (template.settings) {
        form.settings = { ...form.settings, ...template.settings }
      }
      set((s) => ({ forms: [form, ...s.forms] }))
      api.createForm(form).catch((err) => {
        console.error('[folly] failed to create template form', err)
      })
      return form
    },

    deleteForm: (id) => {
      const prev = get()
      set((s) => ({
        forms: s.forms.filter((f) => f.id !== id),
        submissions: s.submissions.filter((x) => x.formId !== id),
      }))
      api.deleteForm(id).catch((err) => {
        console.error('[folly] failed to delete form', id, err)
        set(prev)
      })
    },

    duplicateForm: (id) => {
      const src = get().forms.find((f) => f.id === id)
      if (!src) return null
      const copy = makeForm({
        ...src,
        id: uid(),
        name: `${src.name} (copy)`,
        settings: { ...src.settings, title: `${src.settings.title} (copy)` },
        blocks: src.blocks.map((b) => ({ ...b, id: uid() })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      set((s) => ({ forms: [copy, ...s.forms] }))
      api.createForm(copy).catch((err) => {
        console.error('[folly] failed to create duplicated form', err)
      })
      return copy
    },

    updateForm: (id, patch) => mutateForm(id, (f) => ({ ...f, ...patch })),

    updateSettings: (id, patch) =>
      mutateForm(id, (f) => ({ ...f, settings: { ...f.settings, ...patch } })),

    updateTheme: (id, patch) =>
      mutateForm(id, (f) => ({ ...f, settings: { ...f.settings, theme: { ...f.settings.theme, ...patch } } })),

    updateBlock: (formId, blockId, patch) =>
      mutateForm(formId, (f) => ({
        ...f,
        blocks: f.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
      })),

    addBlock: (formId, block, index) =>
      mutateForm(formId, (f) => {
        const blocks = [...f.blocks]
        blocks.splice(index ?? blocks.length, 0, block)
        return { ...f, blocks }
      }),

    removeBlock: (formId, blockId) =>
      mutateForm(formId, (f) => ({ ...f, blocks: f.blocks.filter((b) => b.id !== blockId) })),

    moveBlock: (formId, fromIndex, toIndex) =>
      mutateForm(formId, (f) => {
        if (fromIndex === toIndex) return f
        const blocks = [...f.blocks]
        const [raw] = blocks.splice(fromIndex, 1)
        blocks.splice(toIndex, 0, raw)

        // Moving a block vertically out of its column breaks it out of that
        // column, matching Tally: drag a block up or down to split the column.
        let item = raw
        if (raw.colId) {
          const before = blocks[toIndex - 1]
          const after = blocks[toIndex + 1]
          const stillAdjoined = before?.colId === raw.colId || after?.colId === raw.colId
          if (!stillAdjoined) {
            const { colId, colWidth, ...rest } = raw
            item = rest as Block
          }
        }
        blocks[toIndex] = item
        return { ...f, blocks }
      }),

    duplicateBlock: (formId, blockId) =>
      mutateForm(formId, (f) => {
        const idx = f.blocks.findIndex((b) => b.id === blockId)
        if (idx === -1) return f
        const copy: Block = { ...f.blocks[idx], id: uid(), text: f.blocks[idx].text }
        if (copy.options) copy.options = f.blocks[idx].options?.map((o) => ({ ...o, id: uid() })) ?? copy.options
        const blocks = [...f.blocks]
        blocks.splice(idx + 1, 0, copy)
        return { ...f, blocks }
      }),

    // Resolves only once the server has stored the submission, so callers
    // can safely show a confirmation or navigate away.
    // Pass the same `id` when retrying the same response: the server treats a
    // repeat id as success instead of storing a duplicate.
    addSubmission: async (formId, answers, id = uid()) => {
      const submission: Submission = { id, formId, submittedAt: Date.now(), answers }
      const { submission: saved } = await api.addSubmission(formId, submission)
      set((s) => ({ submissions: [saved, ...s.submissions.filter((x) => x.id !== saved.id)] }))
      return saved
    },

    deleteSubmission: (id) => {
      const prev = get().submissions
      set((s) => ({ submissions: s.submissions.filter((x) => x.id !== id) }))
      api.deleteSubmission(id).catch((err) => {
        console.error('[folly] failed to delete submission', id, err)
        set({ submissions: prev })
      })
    },
  }
})

void useForms.getState().hydrate()