function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)
}

function makeOption(label) {
  return { id: uid(), label }
}

function makeBlock(partial) {
  return {
    id: uid(),
    type: partial.type,
    text: partial.text ?? '',
    helpText: partial.helpText,
    placeholder: partial.placeholder ?? (partial.type === 'shortText' ? 'Your answer' : undefined),
    required: partial.required ?? false,
    options: partial.options,
    allowMultiple: partial.allowMultiple,
    allowOther: partial.allowOther,
    minChoices: partial.minChoices,
    maxChoices: partial.maxChoices,
    ratingMax: partial.ratingMax ?? 5,
    ratingIcon: partial.ratingIcon ?? 'star',
    linearMax: partial.linearMax ?? 5,
    linearMinLabel: partial.linearMinLabel,
    linearMaxLabel: partial.linearMaxLabel,
    npsMinLabel: partial.npsMinLabel ?? 'Not at all likely',
    npsMaxLabel: partial.npsMaxLabel ?? 'Extremely likely',
    csatMinLabel: partial.csatMinLabel ?? 'Very unsatisfied',
    csatMaxLabel: partial.csatMaxLabel ?? 'Very satisfied',
    matrixRows: partial.matrixRows ?? (partial.type === 'matrix' ? ['Row 1', 'Row 2'] : undefined),
    matrixColumns: partial.matrixColumns ?? (partial.type === 'matrix' ? ['Column 1', 'Column 2'] : undefined),
    scoreSourceIds: partial.scoreSourceIds ?? [],
    darkBackground: partial.darkBackground ?? false,
    imageUrl: partial.imageUrl,
    imageCaption: partial.imageCaption,
    embedUrl: partial.embedUrl,
    fileTypes: partial.fileTypes ?? ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.doc', '.docx', '.zip', '.mp4'],
    maxSizeMb: partial.maxSizeMb ?? 10,
    showIf: partial.showIf,
    colId: partial.colId,
  }
}

function makeForm(partial) {
  const settings = partial.settings ?? {
    title: 'Untitled form',
    description: '',
    thankYouMessage: 'Thanks! We’ve received your submission.',
    accent: '#ff5470',
    theme: {
      background: '#ffffff',
      button: '#0b0f19',
      buttonText: '#ffffff',
      font: 'system',
      darkMode: false,
    },
    showProgress: true,
    poweredBy: true,
  }
  return {
    id: partial.id ?? uid(),
    name: partial.name ?? settings.title,
    createdAt: partial.createdAt ?? Date.now(),
    updatedAt: partial.updatedAt ?? Date.now(),
    settings,
    blocks: partial.blocks ?? [makeBlock({ type: 'longText' })],
  }
}

export function demoData() {
  const now = Date.now()

  const f1 = makeForm({
    id: 'demo-feedback',
    name: 'Client feedback survey',
    createdAt: now - 1000 * 60 * 60 * 48,
    settings: {
      title: 'Client feedback survey',
      description: 'Help us understand what’s working — and what isn’t.',
      thankYouMessage: 'Thanks so much! Your feedback helps us improve every single week.',
      theme: { background: '#ffffff', button: '#ff5470', buttonText: '#ffffff', font: 'system', darkMode: false },
      showProgress: true,
      poweredBy: true,
    },
    blocks: [
      makeBlock({ type: 'heading', text: 'How did we do?' }),
      makeBlock({
        type: 'paragraph',
        text: 'A couple of quick questions — this should take under a minute.',
      }),
      makeBlock({ type: 'shortText', text: 'What’s your name?', placeholder: 'Type your answer', required: true }),
      makeBlock({ type: 'email', text: 'What’s the best email to reach you at?', placeholder: 'name@company.com' }),
      makeBlock({
        type: 'multipleChoice',
        text: 'Overall, how satisfied are you with us?',
        required: true,
        options: [
          makeOption('Very satisfied'),
          makeOption('Satisfied'),
          makeOption('Neutral'),
          makeOption('Dissatisfied'),
          makeOption('Very dissatisfied'),
        ],
      }),
      makeBlock({
        type: 'longText',
        text: 'What could we have done better?',
        placeholder: 'Share anything on your mind…',
        showIf: [{ fieldId: '', op: 'equals', value: 'Dissatisfied' }],
      }),
      makeBlock({ type: 'rating', text: 'How likely are you to recommend us?', ratingMax: 5 }),
      makeBlock({ type: 'pageBreak', text: 'Wrap up' }),
      makeBlock({ type: 'multipleChoice', text: 'Would you like to hop on a short call?', options: [makeOption('Yes, book me in!'), makeOption('I’ll think about it'), makeOption('No thanks')] }),
      makeBlock({ type: 'fileUpload', text: 'Drop a screenshot or document if it helps explain.' }),
      makeBlock({ type: 'thankYou', text: "You're all set!" }),
    ],
  })

  const f2 = makeForm({
    id: 'demo-rsvp',
    name: 'Summer meetup RSVP',
    createdAt: now - 1000 * 60 * 60 * 24,
    settings: {
      title: 'Summer meetup RSVP',
      description: 'Friday, 7 PM · Riverside Gardens',
      thankYouMessage: 'See you there! 🌞',
      theme: { background: '#fdf6ef', button: '#0b0f19', buttonText: '#ffffff', font: 'serif', darkMode: false },
      showProgress: true,
      poweredBy: true,
    },
    blocks: [
      makeBlock({ type: 'heading', text: 'Summer meetup 🎉' }),
      makeBlock({ type: 'paragraph', text: 'Let us know if you’re coming. Bring friends!' }),
      makeBlock({ type: 'shortText', text: 'Full name', required: true }),
      makeBlock({ type: 'email', text: 'Email', required: true }),
      makeBlock({ type: 'checkbox', text: 'What are you bringing?', allowOther: true, options: [makeOption('Snacks'), makeOption('Drinks'), makeOption('A blanket'), makeOption('Music speaker')] }),
      makeBlock({ type: 'dropdown', text: 'When will you arrive?', options: [makeOption('4–5 PM'), makeOption('5–6 PM'), makeOption('6–7 PM'), makeOption('Later')] }),
      makeBlock({ type: 'rating', text: 'How excited are you?', ratingMax: 5, ratingIcon: 'heart' }),
    ],
  })

  const f3 = makeForm({
    id: 'demo-nps',
    name: 'NPS · Product pulse',
    createdAt: now - 1000 * 60 * 60 * 6,
    settings: {
      title: 'How likely are you to recommend us?',
      description: 'One tap is all it takes.',
      thankYouMessage: 'Pulse captured. Thank you!',
      theme: { background: '#0b0f19', button: '#ff5470', buttonText: '#ffffff', font: 'system', darkMode: true },
      showProgress: false,
      poweredBy: true,
    },
    blocks: [
      makeBlock({ type: 'nps', text: 'How likely are you to recommend Folly to a friend or colleague?', npsMinLabel: 'Not at all likely', npsMaxLabel: 'Extremely likely' }),
      makeBlock({ type: 'longText', text: 'What’s the main reason for your score?', placeholder: 'Optionally tell us more…' }),
    ],
  })

  const submissions = [
    { id: uid(), formId: 'demo-feedback', submittedAt: now - 1000 * 60 * 30, answers: { name: 'Priya Sharma', email: 'priya@acme.dev', 'q-4': 'Satisfied', 'q-5': 'The onboarding emails could be shorter.', 'q-6': 5 } },
    { id: uid(), formId: 'demo-feedback', submittedAt: now - 1000 * 60 * 90, answers: { name: 'Tom Becker', email: 'tom@kite.global', 'q-4': 'Very satisfied', 'q-6': 5 } },
    { id: uid(), formId: 'demo-feedback', submittedAt: now - 1000 * 60 * 60 * 5, answers: { name: 'Aisha Noor', email: 'aisha@paper.studio', 'q-4': 'Neutral', 'q-5': 'Pricing page could be clearer.', 'q-6': 4 } },
    { id: uid(), formId: 'demo-rsvp', submittedAt: now - 1000 * 60 * 45, answers: { name: 'Jonas Weber', email: 'jonas@ok.team', 'q-3': ['Snacks', 'Music speaker'], 'q-4': '5–6 PM', 'q-5': 5 } },
    { id: uid(), formId: 'demo-nps', submittedAt: now - 1000 * 45, answers: { 'q-0': 9, 'q-1': 'It is honestly just delightful to use.' } },
    { id: uid(), formId: 'demo-nps', submittedAt: now - 1000 * 1020, answers: { 'q-0': 7, 'q-1': '' } },
  ]

  return { forms: [f1, f2, f3], submissions }
}

export async function seedIfEmpty(pool) {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM forms')
  if (rows[0].n > 0) return false
  await pool.query('BEGIN')
  try {
    const { forms, submissions } = demoData()
    for (const form of forms) {
      await pool.query('INSERT INTO forms (id, data) VALUES ($1, $2::jsonb)', [form.id, JSON.stringify(form)])
    }
    for (const s of submissions) {
      await pool.query('INSERT INTO submissions (id, form_id, data) VALUES ($1, $2, $3::jsonb)', [s.id, s.formId, JSON.stringify(s)])
    }
    await pool.query('COMMIT')
  } catch (err) {
    await pool.query('ROLLBACK')
    throw err
  }
  return true
}