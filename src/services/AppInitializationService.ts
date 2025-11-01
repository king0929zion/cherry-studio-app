import * as Localization from 'expo-localization'

import { getSystemAssistants } from '@/config/assistants'
import { initBuiltinMcp } from '@/config/mcp'
import { SYSTEM_PROVIDERS } from '@/config/providers'
import { getWebSearchProviders } from '@/config/websearchProviders'
import { DefaultPreferences, PreferenceDescriptions } from '@/shared/data/preference/preferenceSchemas'
import { storage } from '@/utils'
import { assistantDatabase, mcpDatabase, providerDatabase, websearchProviderDatabase } from '@database'
import { db } from '@db'
import { seedDatabase } from '@db/seeding'
import { preferenceTable } from '@db/schema'
import { eq } from 'drizzle-orm'

import { loggerService } from './LoggerService'
import { preferenceService } from './PreferenceService'
import { providerService } from './ProviderService'

type AppDataMigration = {
  version: number
  description: string
  migrate: () => Promise<void>
}

const logger = loggerService.withContext('AppInitializationService')

const APP_DATA_MIGRATIONS: AppDataMigration[] = [
  {
    version: 1,
    description: 'Initial app data seeding',
    migrate: async () => {
      await seedDatabase(db)

      // Use direct database access for initial seeding (performance)
      // AssistantService cache will be built naturally as the app is used
      const systemAssistants = getSystemAssistants()
      await assistantDatabase.upsertAssistants(systemAssistants)

      await providerDatabase.upsertProviders(SYSTEM_PROVIDERS)

      const websearchProviders = getWebSearchProviders()
      await websearchProviderDatabase.upsertWebSearchProviders(websearchProviders)

      const locales = Localization.getLocales()
      if (locales.length > 0) {
        storage.set('language', locales[0]?.languageTag)
      }

      const builtinMcp = initBuiltinMcp()
      await mcpDatabase.upsertMcps(builtinMcp)
    }
  },
  {
    version: 2,
    description: 'Add MCP sandbox server and model display preference',
    migrate: async () => {
      const fileSandboxServer = initBuiltinMcp().find(server => server.id === '@cherry/files')

      if (fileSandboxServer) {
        const existing = await mcpDatabase.getMcpById(fileSandboxServer.id)
        if (!existing) {
          await mcpDatabase.upsertMcps([fileSandboxServer])
        }
      }

      const preferenceKey = 'ui.model_display_mode' as const
      const existingPreference = await db
        .select()
        .from(preferenceTable)
        .where(eq(preferenceTable.key, preferenceKey))
        .get()

      if (!existingPreference) {
        await db.insert(preferenceTable).values({
          key: preferenceKey,
          value: DefaultPreferences.default[preferenceKey],
          description: PreferenceDescriptions[preferenceKey]
        })
      }
    }
  }
]

const LATEST_APP_DATA_VERSION = APP_DATA_MIGRATIONS[APP_DATA_MIGRATIONS.length - 1]?.version ?? 0

export async function runAppDataMigrations(): Promise<void> {
  const currentVersion = await preferenceService.get('app.initialization_version')

  if (currentVersion >= LATEST_APP_DATA_VERSION) {
    logger.info(`App data already up to date at version ${currentVersion}`)

    // Initialize ProviderService cache (loads default provider)
    await providerService.initialize()

    return
  }

  const pendingMigrations = APP_DATA_MIGRATIONS.filter(migration => migration.version > currentVersion).sort(
    (a, b) => a.version - b.version
  )

  logger.info(
    `Preparing to run ${pendingMigrations.length} app data migration(s) from version ${currentVersion} to ${LATEST_APP_DATA_VERSION}`
  )

  for (const migration of pendingMigrations) {
    logger.info(`Running app data migration v${migration.version}: ${migration.description}`)

    try {
      await migration.migrate()
      await preferenceService.set('app.initialization_version', migration.version)
      logger.info(`Completed app data migration v${migration.version}`)
    } catch (error) {
      logger.error(`App data migration v${migration.version} failed`, error as Error)
      throw error
    }
  }

  logger.info(`App data migrations completed. Current version: ${LATEST_APP_DATA_VERSION}`)

  // Initialize ProviderService cache (loads default provider)
  await providerService.initialize()
}

export function getAppDataVersion(): number {
  return LATEST_APP_DATA_VERSION
}
