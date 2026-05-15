/**
 * @file modules/work/work.service.ts
 * @description Handles 0G Compute job submission and TEE verification.
 *
 * SDK: @0gfoundation/0g-compute-ts-sdk
 * Verified method: createZGComputeNetworkBroker
 * processResponse returns: boolean | null
 *   true  = TEE signature valid
 *   false = invalid
 *   null  = verification skipped
 */

import { ethers }                       from 'ethers'
import { createZGComputeNetworkBroker } from '@0gfoundation/0g-compute-ts-sdk'
import { getSignedWorkRegistry }        from '../../config/contracts'
import { StorageService }               from '../../services/storage.service'
import { logger }                       from '../../utils/logger'
import { env }                          from '../../config/env'
import {
  type SubmitWorkRequest,
  type SubmitWorkResponse,
} from '../../types/agent.types'
import { ValidationError } from '../../utils/errors'

const MIN_COMPUTE_COST_WEI = BigInt('100000000000000')
const ADDRESS_REGEX        = /^0x[0-9a-fA-F]{40}$/
const BYTES32_REGEX        = /^0x[0-9a-fA-F]{64}$/

export class WorkService {
  private readonly storageService: StorageService

  constructor() {
    this.storageService = new StorageService()
  }

  async submitWork(
    req: SubmitWorkRequest,
    privateKey: string
  ): Promise<SubmitWorkResponse> {

    // ── Validate inputs ───────────────────────────────────────────────────────
    if (!ADDRESS_REGEX.test(req.provider)) {
      throw new ValidationError('provider must be a valid 0x address')
    }
    if (!req.chatID || req.chatID.trim().length === 0) {
      throw new ValidationError('chatID is required')
    }
    if (!BYTES32_REGEX.test(req.responseHash)) {
      throw new ValidationError('responseHash must be a valid bytes32 hex string')
    }
    const costWei = BigInt(req.computeCostWei)
    if (costWei <= BigInt(0)) {
      throw new ValidationError('computeCostWei must be positive')
    }

    // ── TEE verification via 0G Compute SDK ──────────────────────────────────
    // processResponse returns boolean | null
    // null means verification was skipped — treat as false
    let teeVerified = false

    try {
      const provider = new ethers.JsonRpcProvider(env.ZERO_G_RPC)
      const wallet   = new ethers.Wallet(privateKey, provider)
      const broker   = await createZGComputeNetworkBroker(wallet)

      const result = await broker.inference.processResponse(
        req.provider,
        req.chatID
      )

      // processResponse returns boolean | null
      // null means no chatID provided — treat as false
      teeVerified = result === true

      logger.info('WorkService — TEE verification complete', {
        provider: req.provider,
        teeVerified,
      })

    } catch (err: unknown) {
      logger.warn('WorkService — TEE verification failed (non-fatal)', {
        error: (err as Error).message,
      })
      teeVerified = false
    }

    // ── Hash chatID for on-chain storage ──────────────────────────────────────
    const chatIDHash   = ethers.keccak256(ethers.toUtf8Bytes(req.chatID))
    const agentAddress = new ethers.Wallet(privateKey).address

    // ── Check duplicate ───────────────────────────────────────────────────────
    const registry         = getSignedWorkRegistry(privateKey)
    const alreadySubmitted = await registry.isSubmitted(agentAddress, chatIDHash)

    if (alreadySubmitted) {
      throw new ValidationError(
        `Job already submitted. chatIDHash: ${chatIDHash}`
      )
    }

    // ── Submit to WorkRegistry on 0G Chain ────────────────────────────────────
    const tx      = await registry.submitWork(
      req.provider,
      chatIDHash,
      req.responseHash,
      req.computeCostWei,
      teeVerified
    )
    const receipt = await tx.wait()

    logger.info('WorkService — submitted to WorkRegistry', {
      txHash: receipt.hash,
      teeVerified,
    })

    // ── Archive to 0G Storage KV (non-blocking) ───────────────────────────────
    this.storageService.writeWorkRecord(agentAddress, {
      chatIDHash,
      provider:       req.provider,
      responseHash:   req.responseHash,
      computeCostWei: req.computeCostWei,
      teeVerified,
      txHash:         receipt.hash,
      timestamp:      Date.now(),
    }).catch((err: unknown) => {
      logger.warn('WorkService — KV write failed (non-fatal)', {
        error: (err as Error).message,
      })
    })

    return {
      chatIDHash,
      teeVerified,
      countsTowardScore: teeVerified && costWei >= MIN_COMPUTE_COST_WEI,
      txHash: receipt.hash,
    }
  }
}