import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'app/account': ExtractProps<(typeof import('../../inertia/pages/app/account.tsx'))['default']>
    'app/dashboard': ExtractProps<(typeof import('../../inertia/pages/app/dashboard.tsx'))['default']>
    'app/servers': ExtractProps<(typeof import('../../inertia/pages/app/servers.tsx'))['default']>
    'app/servers/actions': ExtractProps<(typeof import('../../inertia/pages/app/servers/actions.tsx'))['default']>
    'app/servers/alerts': ExtractProps<(typeof import('../../inertia/pages/app/servers/alerts.tsx'))['default']>
    'app/servers/analytics': ExtractProps<(typeof import('../../inertia/pages/app/servers/analytics.tsx'))['default']>
    'app/servers/charts': ExtractProps<(typeof import('../../inertia/pages/app/servers/charts.tsx'))['default']>
    'app/servers/console': ExtractProps<(typeof import('../../inertia/pages/app/servers/console.tsx'))['default']>
    'app/servers/events': ExtractProps<(typeof import('../../inertia/pages/app/servers/events.tsx'))['default']>
    'app/servers/overview': ExtractProps<(typeof import('../../inertia/pages/app/servers/overview.tsx'))['default']>
    'app/servers/settings': ExtractProps<(typeof import('../../inertia/pages/app/servers/settings.tsx'))['default']>
    'app/settings': ExtractProps<(typeof import('../../inertia/pages/app/settings.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
  }
}
