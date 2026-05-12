import * as Sentry from '@sentry/react'

const SENTRY_DSN_FALLBACK = 'https://1e7040787ea694e14df1d96dfd22dc7c@o4511364048027648.ingest.de.sentry.io/4511366968967248'

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN || SENTRY_DSN_FALLBACK,
  environment: import.meta.env.MODE,
  integrations: [],
})
