import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [],
})
