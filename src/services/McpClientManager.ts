import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { CompatibilityCallToolResultSchema } from '@modelcontextprotocol/sdk/types.js'

import { loggerService } from '@/services/LoggerService'
import { MCPCallToolResponse, MCPServer, MCPToolResultContent } from '@/types/mcp'
import type { MCPTool } from '@/types/tool'

const logger = loggerService.withContext('McpClientManager')

type SupportedTransport = StreamableHTTPClientTransport | SSEClientTransport

interface ClientConnection {
  client: Client
  transport: SupportedTransport
}

function ensureUrl(rawUrl?: string) {
  if (!rawUrl || rawUrl.trim().length === 0) {
    throw new Error('MCP 服务器缺少 baseUrl 配置')
  }

  return new URL(rawUrl)
}

function buildHeaders(headers?: Record<string, string>) {
  if (!headers) {
    return undefined
  }

  const normalized = Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value
    }
    return acc
  }, {})

  return Object.keys(normalized).length > 0 ? normalized : undefined
}

function toMcpTool(server: MCPServer, tool: any): MCPTool {
  const displayName = tool?.annotations?.title || tool.name

  return {
    id: tool.name,
    name: displayName,
    description: tool.description,
    inputSchema: tool.inputSchema ?? {
      type: 'object',
      properties: {},
      required: []
    },
    outputSchema: tool.outputSchema,
    serverId: server.id,
    serverName: server.name,
    type: 'mcp'
  }
}

function normalizeContentBlock(block: any): MCPToolResultContent | undefined {
  if (!block || typeof block !== 'object') {
    return undefined
  }

  switch (block.type) {
    case 'text':
      return {
        type: 'text',
        text: block.text
      }
    case 'image':
    case 'audio':
      return {
        type: block.type,
        data: block.data,
        mimeType: block.mimeType
      }
    case 'resource':
      return {
        type: 'resource',
        resource: {
          uri: block.resource?.uri,
          text: block.resource?.text,
          mimeType: block.resource?.mimeType,
          blob: block.resource?.blob
        }
      }
    case 'resource_link':
      return {
        type: 'resource',
        resource: {
          uri: block.uri,
          text: block.text,
          mimeType: block.mimeType
        }
      }
    default:
      return undefined
  }
}

function normalizeStructuredContent(structuredContent: unknown): MCPToolResultContent | undefined {
  if (structuredContent === undefined) {
    return undefined
  }

  try {
    const text =
      typeof structuredContent === 'string'
        ? structuredContent
        : JSON.stringify(structuredContent, null, 2)
    return {
      type: 'text',
      text
    }
  } catch (error) {
    logger.warn('无法序列化 MCP 结构化输出', error as Error)
    return undefined
  }
}

export class McpClientManager {
  private connections = new Map<string, Promise<ClientConnection>>()

  private async createConnection(server: MCPServer): Promise<ClientConnection> {
    const targetUrl = ensureUrl(server.baseUrl || (server as any).url || server.registryUrl)
    const headers = buildHeaders(server.headers)
    const requestInit = headers ? { headers } : undefined
    const client = new Client(
      {
        name: 'Cherry Studio',
        version: '0.1.0'
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {}
        }
      }
    )

    let transport: SupportedTransport

    switch (server.type) {
      case 'sse':
        transport = new SSEClientTransport(targetUrl, {
          requestInit,
          eventSourceInit: headers ? { headers } : undefined,
          fetch
        })
        break
      case 'streamableHttp':
        transport = new StreamableHTTPClientTransport(targetUrl, {
          requestInit,
          fetch,
          sessionId: server.id
        })
        break
      default:
        throw new Error(`暂不支持的 MCP 服务类型: ${server.type}`)
    }

    transport.onclose = () => {
      logger.verbose(`MCP 连接关闭: ${server.id}`)
      this.connections.delete(server.id)
    }

    await client.connect(transport)
    logger.debug(`MCP 连接已建立: ${server.id}`)

    return { client, transport }
  }

  private async withClient<T>(server: MCPServer, fn: (connection: ClientConnection) => Promise<T>): Promise<T> {
    const key = server.id

    if (!this.connections.has(key)) {
      this.connections.set(
        key,
        this.createConnection(server).catch(error => {
          this.connections.delete(key)
          throw error
        })
      )
    }

    const connection = await this.connections.get(key)!

    try {
      return await fn(connection)
    } catch (error) {
      logger.error(`MCP 请求失败 (${server.id}):`, error as Error)
      await this.dispose(server.id)
      throw error
    }
  }

  public async listTools(server: MCPServer): Promise<MCPTool[]> {
    return this.withClient(server, async ({ client }) => {
      const result = await client.listTools()
      const tools = result.tools ?? []
      return tools.map(tool => toMcpTool(server, tool))
    })
  }

  public async callTool(
    server: MCPServer,
    toolName: string,
    args: Record<string, unknown> | undefined
  ): Promise<MCPCallToolResponse> {
    return this.withClient(server, async ({ client }) => {
      const result = await client.callTool(
        {
          name: toolName,
          arguments: args
        },
        CompatibilityCallToolResultSchema
      )

      const normalizedContent: MCPToolResultContent[] = []

      if (Array.isArray(result.content)) {
        for (const block of result.content) {
          const mapped = normalizeContentBlock(block)
          if (mapped) {
            normalizedContent.push(mapped)
          }
        }
      }

      const structured = normalizeStructuredContent(result.structuredContent)
      if (structured) {
        normalizedContent.push(structured)
      }

      if ('toolResult' in result && result.toolResult !== undefined) {
        normalizedContent.push(
          normalizeStructuredContent(result.toolResult) ?? {
            type: 'text',
            text: String(result.toolResult)
          }
        )
      }

      return {
        content: normalizedContent,
        isError: result.isError === true
      }
    })
  }

  public async dispose(serverId: string) {
    const connectionPromise = this.connections.get(serverId)
    if (!connectionPromise) return

    this.connections.delete(serverId)

    try {
      const connection = await connectionPromise
      await connection.transport.close()
    } catch (error) {
      logger.warn(`关闭 MCP 连接失败 (${serverId}):`, error as Error)
    }
  }
}

export const mcpClientManager = new McpClientManager()

