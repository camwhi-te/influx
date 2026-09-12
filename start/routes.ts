/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

/*
|--------------------------------------------------------------------------
| Agent API
|--------------------------------------------------------------------------
|
| Ingest endpoint for monitoring daemons. Authenticated by a per-server
| bearer token + HMAC signature (see AGENT.md), not a user session. The
| "/api/agent/report" path is excluded from CSRF in config/shield.ts.
|
*/
router
  .group(() => {
    router.post('report', [controllers.AgentReports, 'store']).as('agent.report')
  })
  .prefix('api/agent')
  .use(middleware.agentAuth())

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

/*
|--------------------------------------------------------------------------
| Authenticated area
|--------------------------------------------------------------------------
|
| Everything under "/app" requires an authenticated session. Add new
| authenticated pages here and register them in "inertia/lib/nav.ts".
|
*/
router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    router
      .group(() => {
        router.get('/', [controllers.Dashboard, 'index']).as('dashboard')

        router
          .group(() => {
            router.get('/', [controllers.Servers, 'index']).as('servers.index')
            router.post('/', [controllers.Servers, 'store']).as('servers.store')
            router.put(':id', [controllers.Servers, 'update']).as('servers.update')
            router.delete(':id', [controllers.Servers, 'destroy']).as('servers.destroy')

            /*
            |------------------------------------------------------------
            | Per-server monitoring tabs
            |------------------------------------------------------------
            */
            router
              .group(() => {
                router.get('/', [controllers.Servers, 'show']).as('servers.show')
                router.get('console', [controllers.Servers, 'console']).as('servers.console')
                router.get('charts', [controllers.Servers, 'charts']).as('servers.charts')
                router.get('analytics', [controllers.Servers, 'analytics']).as('servers.analytics')
                router.get('alerts', [controllers.Servers, 'alerts']).as('servers.alerts')
                router.get('events', [controllers.Servers, 'events']).as('servers.events')
                router.get('actions', [controllers.Servers, 'actions']).as('servers.actions')
                router.get('settings', [controllers.Servers, 'settings']).as('servers.settings')

                // Realtime metric stream (SSE bridge to the daemon WebSocket)
                router.get('stream', [controllers.ServerAgent, 'stream']).as('servers.stream')

                // Agent pairing (from the Settings tab)
                router
                  .post('agent/key', [controllers.ServerAgent, 'generateKey'])
                  .as('servers.agent.key')
                router
                  .delete('agent/key', [controllers.ServerAgent, 'unpair'])
                  .as('servers.agent.unpair')
                router.put('agent', [controllers.ServerAgent, 'update']).as('servers.agent.update')
              })
              .prefix(':id')
          })
          .prefix('servers')

        router.get('account', [controllers.Dashboard, 'account']).as('dashboard.account')
        router.get('settings', [controllers.Dashboard, 'settings']).as('dashboard.settings')
      })
      .prefix('app')
  })
  .use(middleware.auth())
