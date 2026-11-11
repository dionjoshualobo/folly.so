import type { Block, FormSettings } from '../types'

export interface FormTemplate {
  id: string
  title: string
  description: string
  icon: string
  category: 'Business' | 'Feedback' | 'Events' | 'HR' | 'Sales'
  blocks: Array<Partial<Block> & { type: Block['type']; text: string }>
  settings?: Partial<FormSettings>
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: 'contact',
    title: 'Contact Us',
    description: 'A clean contact form to collect inquiries, emails, and messages.',
    icon: 'mail',
    category: 'Business',
    blocks: [
      { type: 'heading', text: 'Get in touch' },
      { type: 'paragraph', text: 'We’d love to hear from you. Fill out the details below and we will get back to you shortly.' },
      { type: 'shortText', text: 'Full Name', required: true, placeholder: 'Jane Doe' },
      { type: 'email', text: 'Email Address', required: true, placeholder: 'jane@example.com' },
      { type: 'phone', text: 'Phone Number', placeholder: '+1 (555) 000-0000' },
      {
        type: 'dropdown',
        text: 'What can we help you with?',
        options: [
          { id: 'opt1', label: 'General Inquiry' },
          { id: 'opt2', label: 'Sales & Pricing' },
          { id: 'opt3', label: 'Customer Support' },
          { id: 'opt4', label: 'Partnership' },
        ],
      },
      { type: 'longText', text: 'Your Message', required: true, placeholder: 'Tell us more about what you need…' },
    ],
  },
  {
    id: 'feedback',
    title: 'Customer Satisfaction & Feedback',
    description: 'Measure customer happiness with NPS, CSAT, ratings, and feedback.',
    icon: 'star',
    category: 'Feedback',
    blocks: [
      { type: 'heading', text: 'We value your feedback' },
      { type: 'paragraph', text: 'Help us improve by sharing your experience with our product.' },
      { type: 'rating', text: 'How would you rate your overall experience?', required: true, ratingMax: 5 },
      { type: 'csat', text: 'How satisfied are you with our customer support?', csatMinLabel: 'Very unsatisfied', csatMaxLabel: 'Very satisfied' },
      { type: 'nps', text: 'How likely are you to recommend us to a friend or colleague?', required: true },
      { type: 'longText', text: 'What is one thing we could do better?' },
    ],
  },
  {
    id: 'event',
    title: 'Event RSVP & Registration',
    description: 'Collect registrations, guest counts, and dietary preferences.',
    icon: 'calendar',
    category: 'Events',
    blocks: [
      { type: 'heading', text: 'Annual Community Gathering' },
      { type: 'paragraph', text: 'Join us on Saturday, Dec 12. Reserve your spot by confirming below.' },
      { type: 'shortText', text: 'Your Name', required: true },
      { type: 'email', text: 'Email Address', required: true },
      {
        type: 'multipleChoice',
        text: 'Will you attend?',
        required: true,
        options: [
          { id: 'att1', label: 'Yes, absolutely!' },
          { id: 'att2', label: 'No, unfortunately I can’t make it' },
          { id: 'att3', label: 'Maybe / Not sure yet' },
        ],
      },
      { type: 'number', text: 'Number of additional guests', placeholder: '0' },
      {
        type: 'checkbox',
        text: 'Dietary preferences',
        options: [
          { id: 'd1', label: 'Vegetarian' },
          { id: 'd2', label: 'Vegan' },
          { id: 'd3', label: 'Gluten-free' },
          { id: 'd4', label: 'Nut allergy' },
        ],
        allowOther: true,
      },
    ],
  },
  {
    id: 'job-application',
    title: 'Job Application',
    description: 'Screen candidates with personal info, resume upload, and portfolio links.',
    icon: 'briefcase',
    category: 'HR',
    blocks: [
      { type: 'heading', text: 'Join our team' },
      { type: 'paragraph', text: 'We are looking for passionate people to help build the future.' },
      { type: 'shortText', text: 'Full Name', required: true },
      { type: 'email', text: 'Email Address', required: true },
      { type: 'phone', text: 'Phone Number', required: true },
      { type: 'link', text: 'LinkedIn or Portfolio URL', required: true, placeholder: 'https://linkedin.com/in/…' },
      { type: 'fileUpload', text: 'Upload Resume / CV (PDF)', required: true },
      { type: 'longText', text: 'Why are you interested in this position?' },
    ],
  },
  {
    id: 'order',
    title: 'Product Order Form',
    description: 'Collect orders with product options, shipping address, and payment.',
    icon: 'shopping-bag',
    category: 'Sales',
    blocks: [
      { type: 'heading', text: 'Order Request' },
      { type: 'paragraph', text: 'Select your item and enter your shipping details.' },
      {
        type: 'multipleChoice',
        text: 'Choose your package',
        required: true,
        options: [
          { id: 'p1', label: 'Starter Kit — $29' },
          { id: 'p2', label: 'Pro Bundle — $59' },
          { id: 'p3', label: 'Ultimate Pack — $99' },
        ],
      },
      { type: 'number', text: 'Quantity', required: true, placeholder: '1' },
      { type: 'address', text: 'Shipping Address', required: true },
      { type: 'payment', text: 'Complete Payment' },
    ],
    settings: {
      paymentAmount: 29,
      paymentCurrency: 'usd',
      paymentDescription: 'Folly Order',
    },
  },
]
