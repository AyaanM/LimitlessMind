import type { VideoCategory, UserRole } from '@/types/database'

export const VIDEO_CATEGORIES: { id: VideoCategory | 'all'; label: string; color: string }[] = [
  { id: 'all',          label: 'All Videos',    color: 'accent' },
  { id: 'Housing',      label: 'Housing',        color: 'sage' },
  { id: 'Employment',   label: 'Employment',     color: 'accent' },
  { id: 'Mental Health',label: 'Mental Health',  color: 'sage' },
  { id: 'Relationships',label: 'Relationships',  color: 'accent' },
  { id: 'Identity',     label: 'Identity',       color: 'sage' },
]

export const USER_ROLES: {
  id: UserRole
  label: string
  description: string
  icon: string
}[] = [
  {
    id: 'autistic_adult',
    label: 'Autistic Adult',
    description: 'I am autistic and want to learn and grow.',
    icon: '🌟',
  },
  {
    id: 'caregiver',
    label: 'Caregiver / Parent / Guardian',
    description: 'I support someone who is autistic.',
    icon: '🤝',
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'I work in health, social services, or community support.',
    icon: '💼',
  },
  {
    id: 'educator',
    label: 'Educator',
    description: 'I teach or work in an educational setting.',
    icon: '📚',
  },
  {
    id: 'employer',
    label: 'Employer',
    description: 'I want to create an inclusive workplace.',
    icon: '🏢',
  },
]

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    priceLabel: 'Free forever',
    features: [
      'Access to all free videos',
      'Basic games (Emotion Match, Calm Breathing, Memory Cards)',
      'Video transcripts',
      'Save videos to your list',
      'Track your progress',
    ],
    limitations: [
      'No access to premium videos',
      'No AI chatbot',
      'No AI video summaries',
      'Limited games',
    ],
  },
  premium: {
    name: 'Premium',
    priceLabel: '$10 / month CAD',
    features: [
      'Everything in Free',
      'All premium videos',
      'AI learning assistant chatbot',
      'AI video summaries',
      'AI smart search',
      'All games including advanced practice',
      'Detailed progress reports',
      'Personalized recommendations',
    ],
    limitations: [],
  },
} as const

export const CATEGORY_COLORS: Record<string, string> = {
  Housing:        'bg-accent-light text-accent',
  Employment:     'bg-sage-light text-sage',
  'Mental Health':'bg-accent-light text-accent',
  Relationships:  'bg-sage-light text-sage',
  Identity:       'bg-premium-light text-premium',
}

export const CATEGORY_ICONS: Record<string, string> = {
  Housing:         '🏠',
  Employment:      '💼',
  'Mental Health': '🧠',
  Relationships:   '🤝',
  Identity:        '🌟',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  autistic_adult: 'Autistic Adult',
  caregiver:      'Caregiver / Parent / Guardian',
  professional:   'Professional',
  educator:       'Educator',
  employer:       'Employer',
  employee:       'Employee (Staff)',
}

export const AVATAR_IDS = [
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'avatar-4',
  'avatar-5',
  'avatar-6',
  'avatar-7',
  'avatar-8',
] as const

export type AvatarId = typeof AVATAR_IDS[number]
