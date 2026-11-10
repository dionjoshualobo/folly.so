export type BlockType =
  | 'heading'
  | 'heading2'
  | 'heading3'
  | 'label'
  | 'paragraph'
  | 'divider'
  | 'shortText'
  | 'longText'
  | 'number'
  | 'email'
  | 'phone'
  | 'link'
  | 'time'
  | 'date'
  | 'rating'
  | 'csat'
  | 'nps'
  | 'linear'
  | 'multipleChoice'
  | 'checkbox'
  | 'dropdown'
  | 'multiSelect'
  | 'ranking'
  | 'matrix'
  | 'fileUpload'
  | 'signature'
  | 'score'
  | 'image'
  | 'embed'
  | 'address'
  | 'payment'
  | 'pageBreak'
  | 'thankYou'

export interface ChoiceOption {
  id: string
  label: string
}

export interface LogicCondition {
  fieldId: string
  op: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan'
  value: string
}

export interface Block {
  id: string
  type: BlockType
  text: string
  helpText?: string
  placeholder?: string
  required?: boolean
  options?: ChoiceOption[]
  allowMultiple?: boolean
  allowOther?: boolean
  minChoices?: number
  maxChoices?: number
  ratingMax?: number
  ratingIcon?: 'star' | 'heart' | 'thumbs'
  linearMax?: number
  linearMinLabel?: string
  linearMaxLabel?: string
  npsMinLabel?: string
  npsMaxLabel?: string
  csatMinLabel?: string
  csatMaxLabel?: string
  matrixRows?: string[]
  matrixColumns?: string[]
  scoreSourceIds?: string[]
  imageUrl?: string
  imageCaption?: string
  embedUrl?: string
  darkBackground?: boolean
  fileTypes?: string[]
  maxSizeMb?: number
  showIf?: LogicCondition[]
  colId?: string
  /** Column width as a percentage, denormalised onto each column member. */
  colWidth?: number
  /** address block: include apt/unit field */
  addressIncludeApt?: boolean
  /** address block: require country field */
  addressRequireCountry?: boolean
}

export interface FormTheme {
  background: string
  button: string
  buttonText: string
  font: 'system' | 'serif' | 'playful' | 'classic' | 'rounded' | 'geometric' | 'typewriter' | 'custom'
  customFontBase64?: string
  darkMode: boolean
}

export interface FormSettings {
  title: string
  description?: string
  thankYouMessage: string
  thankYouRedirectUrl?: string
  thankYouButtonText?: string
  thankYouButtonUrl?: string
  coverImageUrl?: string
  logoUrl?: string
  hiddenFields?: string[]
  accent?: string
  theme: FormTheme
  showProgress: boolean
  poweredBy: boolean
  customCss?: string
  /** Optional access code/password required to view the form */
  password?: string
  /** Webhook URL — POST payload sent on each new submission */
  webhookUrl?: string
  /** Close the form after this many responses (0 = unlimited) */
  maxResponses?: number
  /** Unix timestamp (ms) after which the form closes */
  closedAt?: number
  /** Email address to notify on new submission (requires server SMTP config) */
  emailNotifyTo?: string
  /** Stripe publishable key for payment block */
  stripePublishableKey?: string
  /** Payment amount in smallest currency unit (e.g. cents) */
  paymentAmount?: number
  /** Payment currency (ISO 4217, e.g. 'usd') */
  paymentCurrency?: string
  /** Payment description shown to payer */
  paymentDescription?: string
}

export interface Form {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  settings: FormSettings
  blocks: Block[]
  submissionCount?: number
}

export interface Submission {
  id: string
  formId: string
  submittedAt: number
  answers: Record<string, AnswerValue>
}

export interface FilePayload {
  name: string
  size: number
}

export interface SignatureStroke {
  points: Array<[number, number]>
}

export type SignatureData = SignatureStroke[]

export interface AddressValue {
  street: string
  apt?: string
  city: string
  state: string
  zip: string
  country: string
}

export interface PaymentValue {
  paid: boolean
  amount?: number
  currency?: string
  at?: number
}

export type AnswerValue = string | string[] | number | Record<string, string> | FilePayload | SignatureData | AddressValue | PaymentValue | null

export function uid(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)
}

export function makeOption(label = ''): ChoiceOption {
  return { id: uid(), label }
}

export function makeBlock(partial: Partial<Block> & { type: BlockType }): Block {
  const block: Block = {
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
    addressIncludeApt: partial.addressIncludeApt ?? true,
    addressRequireCountry: partial.addressRequireCountry ?? false,
  }
  return block
}

export function defaultTheme(): FormTheme {
  return {
    background: '#ffffff',
    button: '#0b0f19',
    buttonText: '#ffffff',
    font: 'system',
    darkMode: false,
  }
}

export function makeForm(partial: Partial<Form> = {}): Form {
  const settings = partial.settings ?? {
    title: 'Untitled form',
    description: '',
    thankYouMessage: 'Thanks! We’ve received your submission.',
    accent: '#ff5470',
    theme: defaultTheme(),
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