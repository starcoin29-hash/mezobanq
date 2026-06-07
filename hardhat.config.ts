// hardhat.config.ts
// Hardhat 3 configuration -- uses defineConfig() and explicit plugin registration
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { config as dotenvConfig } from "dotenv";

// Load .env.local so we can use our private key and RPC URLs
dotenvConfig({ path: ".env.local" });

export default defineConfig({
  // Register plugins explicitly (Hardhat 3 requirement)
  plugins: [hardhatToolboxMochaEthers],

  // Solidity compiler version
  solidity: {
    version: "0.8.24",
    settings: {
      // optimizer: reduces gas cost of deployed contract
      // enabled: true is ALWAYS recommended for production
      optimizer: {
        enabled: true,
        runs: 200, // 200 = balanced between deploy cost and call cost
      },
    },
  },

  // Networks Hardhat can deploy to
  // Hardhat 3 requires explicit "type" for each network:
  //   "edr-simulated" = local in-memory chain (like old hardhat network)
  //   "http" = remote JSON-RPC node
  networks: {
    // Local development network (runs in-memory)
    hardhat: {
      type: "edr-simulated",
      chainId: 31337,
    },
    // Mezo Testnet -- use this for testing before mainnet
    mezoTestnet: {
      type: "http",
      url: process.env.NEXT_PUBLIC_MEZO_RPC_URL ?? "https://rpc.test.mezo.org",
      // DEPLOYER_PRIVATE_KEY: the private key of the wallet paying for deployment
      // NEVER commit this key to Git!
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 31611, // Mezo testnet chain ID
    },
    // Ethereum Sepolia testnet -- for testing MUSD integrations
    sepolia: {
      type: "http",
      url: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },
  },

  // Paths -- where Hardhat looks for files
  paths: {
    sources: "./contracts", // Solidity source files
    tests: "./contracts/test", // Test files
    cache: "./contracts/cache",
    artifacts: "./contracts/artifacts",
  },
});