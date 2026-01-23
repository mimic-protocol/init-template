import { Chains, Client, EthersSigner, ConfigType } from '@mimicprotocol/sdk'
import { config } from 'dotenv'

// Load environment variables from .env file
config({ path: './scripts/.env' })

// TODO: Replace with your deployed function's CID
const FUNCTION_TEMPLATE_CID = 'YOUR_FUNCTION_TEMPLATE_CID_HERE'

// TODO: Customize triggers array to match your function's input structure
// Each trigger will be used to create a function
// This template uses the example function's inputs: chainId, token, amount, recipient, maxFee
const triggers = [
  {
    chainId: Chains.Optimism,
    token: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // USDC on Optimism
    amount: '1',
    recipient: '0x...', // TODO: Replace with your recipient address
    maxFee: '0.1',
  },
  {
    chainId: Chains.Base,
    token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    amount: '1',
    recipient: '0x...', // TODO: Replace with your recipient address
    maxFee: '0.1',
  },
  // Add more triggers as needed
]

async function main(): Promise<void> {
  const client = new Client({
    signer: EthersSigner.fromPrivateKey(process.env.PRIVATE_KEY!),
  })

  // Get the manifest for the function
  const manifest = await client.functions.getManifest(FUNCTION_TEMPLATE_CID)

  // TODO: Adjust the scheduling logic based on your needs
  // This example schedules triggers at 2-minute intervals starting at minute 0
  let minute = 0

  for (const trigger of triggers) {
    // TODO: Customize the version, description, and other parameters
    // - version: Function version (e.g., '1.0.0')
    // - description: Human-readable description for this trigger
    // - config: When to execute the function (cron schedule, delta, endDate)
    // - executionFeeLimit: Maximum fee for execution (use '0' for no limit)
    // - minValidations: Minimum number of validations required
    // - signer: Address of the signer (from environment variable)

    await client.triggers.signAndCreate({
      functionCid: FUNCTION_TEMPLATE_CID,
      version: '1.0.0', // TODO: Update to match your function version
      description: `Transfer - ${trigger.chainId} - ${trigger.token.substring(0, 6)}...`,
      input: {
        chainId: trigger.chainId,
        token: trigger.token,
        amount: trigger.amount,
        recipient: trigger.recipient,
        maxFee: trigger.maxFee,
      },
      config: {
        type: ConfigType.Cron,
        // Schedule: runs at minute X of hour 3 (03:XX) every day
        // TODO: Adjust schedule based on your needs
        schedule: `${minute} 03 * * *`,
        delta: '10m', // Time window for execution
        endDate: 0, // 0 means no end date
      },
      manifest: manifest,
      executionFeeLimit: '0',
      minValidations: 1,
    })

    // Increment minute for next trigger to avoid scheduling conflicts
    minute += 2
  }

  console.log(`Successfully created ${triggers.length} trigger(s)`)
}

main().catch((error) => {
  console.error('Error creating triggers:', error)
  process.exit(1)
})
