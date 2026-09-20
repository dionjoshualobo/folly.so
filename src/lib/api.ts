import type { Form, Submission } from '../types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Request to ${url} failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export function listForms(): Promise<{ forms: Form[] }> {
  return request('/api/forms')
}

export function getForm(id: string): Promise<{ form: Form }> {
  return request(`/api/forms/${encodeURIComponent(id)}`)
}

export function createForm(form: Form): Promise<{ form: Form }> {
  return request('/api/forms', { method: 'POST', body: JSON.stringify({ form }) })
}

export function saveForm(form: Form): Promise<{ form: Form }> {
  return request(`/api/forms/${encodeURIComponent(form.id)}`, { method: 'PATCH', body: JSON.stringify({ form }) })
}

export function deleteForm(id: string): Promise<{ ok: boolean }> {
  return request(`/api/forms/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function listSubmissions(formId: string): Promise<{ submissions: Submission[] }> {
  return request(`/api/forms/${encodeURIComponent(formId)}/submissions`)
}

export function addSubmission(formId: string, submission: Submission): Promise<{ submission: Submission }> {
  return request(`/api/forms/${encodeURIComponent(formId)}/submissions`, {
    method: 'POST',
    body: JSON.stringify({ submission }),
  })
}