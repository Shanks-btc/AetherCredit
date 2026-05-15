export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code:       string,
    message: string,
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly issues?: { path: string; message: string }[],
  ) {
    super(400, 'VALIDATION_ERROR', message)
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(requestedWei: string, availableWei: string) {
    super(400, 'INSUFFICIENT_BALANCE',
      `Pool balance insufficient. Requested: ${requestedWei} wei. Available: ${availableWei} wei.`)
  }
}

export class InvalidAmountError extends AppError {
  constructor(amountWei: string) {
    super(400, 'INVALID_AMOUNT',
      `Amount must be a positive integer wei string. Received: "${amountWei}"`)
  }
}

export class AgentNotFoundError extends AppError {
  constructor(agentAddress: string) {
    super(404, 'AGENT_NOT_FOUND',
      `No ledger history found for agent: ${agentAddress}`)
  }
}

export class DuplicateEntryError extends AppError {
  constructor(txHash: string) {
    super(409, 'DUPLICATE_ENTRY',
      `Ledger entry for tx_hash ${txHash} already exists.`)
  }
}

export class LedgerInvariantError extends AppError {
  constructor(invariant: string, context: Record<string, unknown>) {
    super(500, 'LEDGER_INVARIANT_VIOLATED',
      `Invariant violated: ${invariant}. Context: ${JSON.stringify(context)}`)
  }
}