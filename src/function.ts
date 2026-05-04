import { ERC20Token, TokenAmount, TransferBuilder } from '@mimicprotocol/lib-ts'

import { inputs } from './types'

export default function main(): void {
  const token = ERC20Token.fromAddress(inputs.token, inputs.chainId)
  const maxFee = TokenAmount.fromStringDecimal(token, inputs.maxFee)

  TransferBuilder.forChain(inputs.chainId)
    .addTransferFromStringDecimal(token, inputs.amount, inputs.recipient)
    .send(maxFee)
}
