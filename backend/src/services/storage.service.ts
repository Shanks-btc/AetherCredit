/**
 * @file services/storage.service.ts
 * @description Reads and writes to 0G Storage (KV and Log layers).
 *
 * SDK: @0gfoundation/0g-storage-ts-sdk v1.2.9
 * KV Layer  — agent work history (mutable, queryable)
 * Log Layer — credit decisions (immutable, permanent)
 */

import { Indexer, KvClient, MemData, Batcher } from '@0gfoundation/0g-storage-ts-sdk'
import { ethers }                               from 'ethers'
import { env }                                  from '../config/env'
import { logger }                               from '../utils/logger'

const STREAM_ID =
  '0x000000000000000000000000000000000000000000000000000000000000ac01'

export class StorageService {
  private readonly indexer:  Indexer
  private readonly kvClient: KvClient

  constructor() {
    this.indexer  = new Indexer(env.STORAGE_INDEXER)
    this.kvClient = new KvClient(env.KV_ENDPOINT)
  }

  // ── KV Layer — work history ─────────────────────────────────────────────────

  async getWorkHistory(agentAddress: string): Promise<unknown[]> {
    const key = `agentcredit:workhistory:${agentAddress.toLowerCase()}`
    try {
      const keyBytes = Buffer.from(new TextEncoder().encode(key))
      const value    = await this.kvClient.getValue(
        STREAM_ID,
        keyBytes.toString('base64')
      )
      // getValue returns Value type — convert to string safely
      if (!value) return []
      const str = value.toString()
      if (!str) return []
      return JSON.parse(str) as unknown[]
    } catch {
      // Key does not exist yet — normal for new agents
      return []
    }
  }

  async writeWorkRecord(
    agentAddress: string,
    record: Record<string, unknown>
  ): Promise<void> {
    const key = `agentcredit:workhistory:${agentAddress.toLowerCase()}`
    try {
      const existing = await this.getWorkHistory(agentAddress)
      existing.push(record)

      const [nodes, err] = await this.indexer.selectNodes(1)
      if (err) {
        logger.warn('StorageService.writeWorkRecord — node selection failed', { error: String(err) })
        return
      }

      // Batcher constructor: (expectedReplicas, nodes, flow, rpc)
      // flow is optional — pass undefined instead of null
      const batcher    = new Batcher(1, nodes, undefined as never, env.ZERO_G_RPC)
      const keyBytes   = new TextEncoder().encode(key)
      const valueBytes = new TextEncoder().encode(JSON.stringify(existing))

      batcher.streamDataBuilder.set(STREAM_ID, keyBytes, valueBytes)

      const [, batchErr] = await batcher.exec()
      if (batchErr) {
        logger.warn('StorageService.writeWorkRecord — batch failed', { error: String(batchErr) })
      }
    } catch (err: unknown) {
      logger.warn('StorageService.writeWorkRecord failed (non-fatal)', {
        error: (err as Error).message,
      })
    }
  }

  // ── Log Layer — credit decisions ────────────────────────────────────────────

  async archiveCreditDecision(
    decision: Record<string, unknown>,
    privateKey: string
  ): Promise<string> {
    try {
      const provider = new ethers.JsonRpcProvider(env.ZERO_G_RPC)
      const signer   = new ethers.Wallet(privateKey, provider)
      const data     = new TextEncoder().encode(JSON.stringify(decision))
      const memData  = new MemData(data)

      const [tree, treeErr] = await memData.merkleTree()
      if (treeErr) {
        logger.warn('StorageService.archiveCreditDecision — merkle tree failed', { error: String(treeErr) })
        return ethers.ZeroHash
      }

      const [, uploadErr] = await this.indexer.upload(memData, env.ZERO_G_RPC, signer)
      if (uploadErr) {
        logger.warn('StorageService.archiveCreditDecision — upload failed', { error: String(uploadErr) })
        return ethers.ZeroHash
      }

      const rootHash = tree?.rootHash() ?? ethers.ZeroHash
      logger.info('StorageService.archiveCreditDecision — success', { rootHash })
      return rootHash

    } catch (err: unknown) {
      logger.warn('StorageService.archiveCreditDecision failed (non-fatal)', {
        error: (err as Error).message,
      })
      return ethers.ZeroHash
    }
  }
}