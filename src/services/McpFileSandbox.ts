import * as FileSystem from 'expo-file-system'

import { loggerService } from '@/services/LoggerService'

const logger = loggerService.withContext('McpFileSandbox')

const SANDBOX_ROOT = `${FileSystem.documentDirectory ?? ''}mcp-sandbox`

async function ensureSandboxRoot() {
  const info = await FileSystem.getInfoAsync(SANDBOX_ROOT)
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(SANDBOX_ROOT, { intermediates: true })
  }
}

function sanitizeRelativePath(relativePath?: string) {
  if (!relativePath) {
    return ''
  }

  const normalized = relativePath.replace(/\\/g, '/')
  const segments = normalized
    .split('/')
    .map(segment => segment.trim())
    .filter(segment => segment.length > 0 && segment !== '.' && segment !== '..')

  return segments.join('/')
}

async function resolveAbsolutePath(relativePath?: string) {
  await ensureSandboxRoot()
  const sanitized = sanitizeRelativePath(relativePath)
  return sanitized ? `${SANDBOX_ROOT}/${sanitized}` : SANDBOX_ROOT
}

export async function listSandboxEntries(relativePath?: string) {
  const targetPath = await resolveAbsolutePath(relativePath)
  const info = await FileSystem.getInfoAsync(targetPath)

  if (!info.exists) {
    throw new Error('目录不存在')
  }
  if (!info.isDirectory) {
    throw new Error('目标不是目录')
  }

  const entries = await FileSystem.readDirectoryAsync(targetPath)

  const detailed = await Promise.all(
    entries.map(async entryName => {
      const entryPath = `${targetPath}/${entryName}`
      const entryInfo = await FileSystem.getInfoAsync(entryPath)

      return {
        name: entryName,
        type: entryInfo.isDirectory ? 'directory' : 'file',
        size: entryInfo.size ?? 0,
        modified: entryInfo.modificationTime
          ? new Date(entryInfo.modificationTime * 1000).toISOString()
          : undefined
      }
    })
  )

  return detailed
}

export async function readSandboxFile(relativePath: string) {
  const targetPath = await resolveAbsolutePath(relativePath)
  const info = await FileSystem.getInfoAsync(targetPath)

  if (!info.exists || info.isDirectory) {
    throw new Error('文件不存在或路径指向目录')
  }

  return await FileSystem.readAsStringAsync(targetPath, {
    encoding: FileSystem.EncodingType.UTF8
  })
}

export async function writeSandboxFile(relativePath: string, content: string) {
  const targetPath = await resolveAbsolutePath(relativePath)
  const parentSegments = sanitizeRelativePath(relativePath).split('/')
  parentSegments.pop()
  const parentPath = parentSegments.length > 0 ? `${SANDBOX_ROOT}/${parentSegments.join('/')}` : SANDBOX_ROOT

  await ensureSandboxRoot()
  if (parentPath !== SANDBOX_ROOT) {
    await FileSystem.makeDirectoryAsync(parentPath, { intermediates: true })
  }

  await FileSystem.writeAsStringAsync(targetPath, content, {
    encoding: FileSystem.EncodingType.UTF8
  })

  logger.debug(`Sandbox file saved: ${targetPath}`)
}

export async function deleteSandboxEntry(relativePath: string) {
  const targetPath = await resolveAbsolutePath(relativePath)
  const info = await FileSystem.getInfoAsync(targetPath)

  if (!info.exists) {
    throw new Error('目标不存在')
  }

  await FileSystem.deleteAsync(targetPath, { idempotent: true })
  logger.debug(`Sandbox entry deleted: ${targetPath}`)
}
