import { Chains, fp, OpType } from '@mimicprotocol/sdk'
import { EvmCallQueryMock, runFunction, TransferOperation } from '@mimicprotocol/test-ts'
import { expect } from 'chai'

describe('Function', () => {
  const functionDir = './build'

  const chainId = Chains.Optimism

  const context = {
    user: '0x756f45e3fa69347a9a973a725e3c98bc4db0b5a0',
    settlers: [{ address: '0xdcf1d9d12a0488dfb70a8696f44d6d3bc303963d', chainId }],
    timestamp: Date.now(),
  }

  const inputs = {
    chainId,
    token: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // USDC
    amount: '1.5', // 1.5 USDC
    recipient: '0xbce3248ede29116e4bd18416dcc2dfca668eeb84',
    maxFee: '0.1', // 0.1 USDC
  }

  const calls: EvmCallQueryMock[] = [
    {
      request: { to: inputs.token, chainId, fnSelector: '0x313ce567' }, // decimals
      response: { value: '6', abiType: 'uint8' },
    },
  ]

  it('produces the expected intents', async () => {
    const result = await runFunction(functionDir, context, { inputs, calls })
    expect(result.success).to.be.true
    expect(result.timestamp).to.be.equal(context.timestamp)

    expect(result.intents).to.have.lengthOf(1)
    const intent = result.intents[0]

    expect(intent.feePayer).to.be.equal(context.user)
    expect(intent.settler).to.be.equal(context.settlers[0].address)
    expect(intent.maxFees).to.have.lengthOf(1)
    expect(intent.maxFees[0].token).to.be.equal(inputs.token)
    expect(intent.maxFees[0].amount).to.be.equal(fp(inputs.maxFee, 6).toString())
    
    expect(intent.operations).to.have.lengthOf(1)
    const operation = intent.operations[0] as TransferOperation

    expect(operation.opType).to.be.equal(OpType.Transfer)
    expect(operation.user).to.be.equal(context.user)
    expect(operation.chainId).to.be.equal(inputs.chainId)

    expect(operation.transfers).to.have.lengthOf(1)
    expect(operation.transfers[0].token).to.be.equal(inputs.token)
    expect(operation.transfers[0].amount).to.be.equal(fp(inputs.amount, 6).toString())
    expect(operation.transfers[0].recipient).to.be.equal(inputs.recipient)
  })
})
