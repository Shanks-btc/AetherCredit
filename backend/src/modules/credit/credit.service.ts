/**
 * @file modules/credit/credit.service.ts
 * @description Handles credit requests and repayments via CreditVault on 0G Chain.
 */

import { ethers }               from 'ethers'
import { ChainService }         from '../../services/chain.service'
import { StorageService }       from '../../services/storage.service'
import { getSignedCreditVault } from '../../config/contracts'
import { logger }               from '../../utils/logger'
import {
  type CreditRequestResponse,
  type Loan,
  LoanStatus,
} from '../../types/loan.types'
import { ValidationError } from '../../utils/errors'

const REPAYMENT_FEE_BPS = 500n
const BPS_DENOMINATOR   = 10000n

export class CreditService {
  private readonly chainService:   ChainService
  private readonly storageService: StorageService

  constructor() {
    this.chainService   = new ChainService()
    this.storageService = new StorageService()
  }

  async requestCredit(
    agentAddress: string,
    amountWei:    string,
    privateKey:   string
  ): Promise<CreditRequestResponse> {

    const { eligible, score, limitWei } =
      await this.chainService.checkEligibility(agentAddress, amountWei)

    if (!eligible) {
      return {
        approved: false,
        reason:   `Score ${score}/1000 | Limit ${ethers.formatEther(limitWei)} OG | Requested ${ethers.formatEther(amountWei)} OG`,
        loan:     null,
        txHash:   null,
      }
    }

    const storageRootHash = await this.storageService.archiveCreditDecision(
      {
        agent:     agentAddress,
        amountWei,
        score,
        limitWei,
        timestamp: Date.now(),
        approved:  true,
      },
      privateKey
    )

    const vault   = getSignedCreditVault(privateKey)
    const tx      = await vault.requestCredit(BigInt(amountWei), storageRootHash)
    const receipt = await tx.wait()

    logger.info('CreditService.requestCredit — approved', {
      agentAddress,
      amountWei,
      txHash: receipt.hash,
    })

    const dueBy = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)

    const loan: Loan = {
      agentAddress,
      principalWei:    amountWei,
      principalOG:     ethers.formatEther(amountWei),
      issuedAt:        Math.floor(Date.now() / 1000),
      dueBy,
      storageRootHash,
      status:          LoanStatus.ACTIVE,
      txHash:          receipt.hash,
    }

    return {
      approved: true,
      reason:   null,
      loan,
      txHash:   receipt.hash,
    }
  }

  async repay(
    agentAddress: string,
    privateKey:   string
  ): Promise<{ txHash: string; repaidWei: string; feeWei: string }> {

    const loan = await this.chainService.getActiveLoan(agentAddress)

    if (!loan) {
      throw new ValidationError('No active loan found for this agent')
    }

    const principal = BigInt(loan.principalWei)
    const fee       = (principal * REPAYMENT_FEE_BPS) / BPS_DENOMINATOR
    const totalOwed = principal + fee

    const vault   = getSignedCreditVault(privateKey)
    const tx      = await vault.repay({ value: totalOwed })
    const receipt = await tx.wait()

    logger.info('CreditService.repay — success', {
      agentAddress,
      txHash: receipt.hash,
    })

    return {
      txHash:    receipt.hash,
      repaidWei: principal.toString(),
      feeWei:    fee.toString(),
    }
  }
}