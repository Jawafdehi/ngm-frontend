import * as Sentry from '@sentry/react'

const SENTRY_DSN_FALLBACK = 'https://examplePublicKey@o0.ingest.sentry.io/0'

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN || SENTRY_DSN_FALLBACK,
  environment: import.meta.env.MODE,
  integrations: [],
})
