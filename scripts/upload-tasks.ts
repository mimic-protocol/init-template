import { Chains, Client, EthersSigner, TriggerType } from '@mimicprotocol/sdk'
import { config } from 'dotenv'

// Load environment variables from .env file
config({ path: './scripts/.env' })

// TODO: Replace with your deployed task's CID
const TASK_CID = 'YOUR_TASK_CID_HERE'

// TODO: Customize configs array to match your task's input structure
// Each config will be used to create a task configuration
// This template uses the example task's inputs: chainId, token, amount, recipient, maxFee
const configs = [
  {
    chainId: Chains.Optimism,
    token: '0x7f5c764cb14f9669b88837ca1490cca17c31607', // Example: USDC on Optimism
    amount: '1000000', // Example: 1 USDC (6 decimals)
    recipient: '0xbce3248ede29116e4bd18416dcc2dfca668eeb84', // Example recipient address
    maxFee: '100000', // Example: 0.1 USDC
  },
  {
    chainId: Chains.Sonic,
    token: '0x...', // Example token address on Sonic
    amount: '1000000', // Example amount
    recipient: '0x...', // Example recipient address
    maxFee: '100000', // Example max fee
  },
  // Add more configs as needed
]

async function main(): Promise<void> {
  const client = new Client({
    signer: EthersSigner.fromPrivateKey(process.env.PRIVATE_KEY!),
  })

  // Get the manifest for the task
  const manifest = await client.tasks.getManifest(TASK_CID)

  // TODO: Adjust the scheduling logic based on your needs
  // This example schedules configs at 2-minute intervals starting at minute 0
  let minute = 0

  for (const config of configs) {
    // TODO: Customize the version, description, and other parameters
    // - version: Task version (e.g., '1.0.0')
    // - description: Human-readable description for this config
    // - trigger: When to execute the task (cron schedule, delta, endDate)
    // - executionFeeLimit: Maximum fee for execution (use '0' for no limit)
    // - minValidations: Minimum number of validations required
    // - signer: Address of the signer (from environment variable)

    await client.configs.signAndCreate({
      taskCid: TASK_CID,
      version: '1.0.0', // TODO: Update to match your task version
      description: `Transfer - ${config.chainId} - ${config.token.substring(0, 6)}...`,
      input: {
        chainId: config.chainId,
        token: config.token,
        amount: config.amount,
        recipient: config.recipient,
        maxFee: config.maxFee,
      },
      trigger: {
        type: TriggerType.Cron,
        // Schedule: runs at minute X of hour 3 (03:XX) every day
        // TODO: Adjust schedule based on your needs
        schedule: `${minute} 03 * * *`,
        delta: '10m', // Time window for execution
        endDate: 0, // 0 means no end date
      },
      manifest: manifest,
      signer: process.env.SIGNER!, // TODO: Ensure SIGNER is set in .env
      executionFeeLimit: '0', // TODO: Set fee limit if needed
      minValidations: 1, // TODO: Adjust validation requirements
    })

    // Increment minute for next config to avoid scheduling conflicts
    minute += 2
  }

  console.log(`Successfully created ${configs.length} config(s)`)
}

main().catch((error) => {
  console.error('Error creating configs:', error)
  process.exit(1)
})
