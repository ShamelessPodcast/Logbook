import Anthropic from '@anthropic-ai/sdk'
import { env } from './env'

/**
 * The crew's single door to the model.
 *
 * Two things matter here. First, every agent asks for structured JSON — a
 * free-text answer we then regex is how a pipeline like this rots. Second,
 * with no API key the whole thing still runs end to end in dry-run mode, so
 * you can wire up projects, watch a run execute, and read a brief before
 * spending anything.
 */

let client: Anthropic | null = null

function anthropic(): Anthropic {
  if (!client) {
    if (!env.anthropicKey) throw new Error('ANTHROPIC_API_KEY is not set')
    client = new Anthropic({ apiKey: env.anthropicKey })
  }
  return client
}

export function llmAvailable(): boolean {
  return Boolean(env.anthropicKey)
}

/** Opus 5, per 1M tokens, in pennies (GBP-ish; close enough for a budget). */
const PRICE_PER_MTOK = { input: 400, output: 2000 }

export interface Usage {
  inputTokens: number
  outputTokens: number
  costPennies: number
}

export const ZERO_USAGE: Usage = { inputTokens: 0, outputTokens: 0, costPennies: 0 }

export function addUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    costPennies: Number((a.costPennies + b.costPennies).toFixed(3)),
  }
}

function priceOf(inputTokens: number, outputTokens: number): number {
  const pennies =
    (inputTokens / 1_000_000) * PRICE_PER_MTOK.input +
    (outputTokens / 1_000_000) * PRICE_PER_MTOK.output
  return Number(pennies.toFixed(3))
}

export interface ThinkArgs<T> {
  /** Who is asking — used for logging and the dry-run stub. */
  agent: string
  /** The agent's standing instructions. Stable across the run, so it caches. */
  system: string
  /** This call's specific request. */
  prompt: string
  /**
   * JSON Schema the answer must satisfy. Objects need
   * `additionalProperties: false` and a complete `required` list.
   */
  schema: Record<string, unknown>
  /** What to return instead of calling the model when there's no API key. */
  dryRunValue: T
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  maxTokens?: number
}

export interface ThinkResult<T> {
  value: T
  usage: Usage
  dryRun: boolean
}

/**
 * Ask the model a question and get a typed object back.
 *
 * `max_tokens` stays at 16k: these run on Vercel without streaming, and a
 * larger ceiling risks an HTTP timeout before the response lands.
 */
export async function think<T>(args: ThinkArgs<T>): Promise<ThinkResult<T>> {
  if (!llmAvailable()) {
    return { value: args.dryRunValue, usage: ZERO_USAGE, dryRun: true }
  }

  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: env.model,
    max_tokens: args.maxTokens ?? 16_000,
    system: [
      {
        type: 'text',
        text: args.system,
        // The system prompt is identical across every call this agent makes,
        // so it caches and the rest of the night's calls read it back cheaply.
        cache_control: { type: 'ephemeral' },
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: args.schema },
    },
    messages: [{ role: 'user', content: args.prompt }],
  }

  // `output_config.effort` is GA on the API but isn't in this SDK version's
  // types yet. Attached here rather than cast over the whole request object,
  // so a genuine mistake elsewhere in `params` still fails to compile.
  const withEffort = {
    ...params,
    output_config: { ...params.output_config, effort: args.effort ?? 'medium' },
  } as Anthropic.MessageCreateParamsNonStreaming

  const response = await anthropic().messages.create(withEffort)

  if (response.stop_reason === 'refusal') {
    throw new Error(`[${args.agent}] the model declined this request`)
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  if (!text.trim()) {
    throw new Error(`[${args.agent}] the model returned no content`)
  }

  let value: T
  try {
    value = JSON.parse(text) as T
  } catch {
    throw new Error(`[${args.agent}] response was not valid JSON: ${text.slice(0, 400)}`)
  }

  const inputTokens = response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0)
  const outputTokens = response.usage.output_tokens

  return {
    value,
    usage: {
      inputTokens,
      outputTokens,
      costPennies: priceOf(response.usage.input_tokens, outputTokens),
    },
    dryRun: false,
  }
}

/** Small helper for building strict object schemas without the boilerplate. */
export function objectSchema(
  properties: Record<string, unknown>,
  required?: string[],
): Record<string, unknown> {
  return {
    type: 'object',
    properties,
    required: required ?? Object.keys(properties),
    additionalProperties: false,
  }
}

export function arraySchema(items: Record<string, unknown>): Record<string, unknown> {
  return { type: 'array', items }
}
