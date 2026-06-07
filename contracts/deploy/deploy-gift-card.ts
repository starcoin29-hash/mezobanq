// contracts/deploy/deploy-gift-card.ts
// This script deploys MezoBanqGiftCard to a network.
// Run with: npx hardhat run contracts/deploy/deploy-gift-card.ts --network mezoTestnet
import hre from "hardhat";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

config({ path: ".env.local" });

async function main() {
  // In Hardhat 3, create a network connection to get ethers
  const { ethers } = await hre.network.create();

  console.log("=================================================");
  console.log("Deploying MezoBanqGiftCard");
  console.log("=================================================");

  // Get the deployer account (from DEPLOYER_PRIVATE_KEY in .env.local)
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Check deployer has enough balance to pay for deployment gas
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "BTC");

  if (balance === 0n) {
    throw new Error(
      "Deployer has no BTC! Get testnet BTC from https://faucet.mezo.org"
    );
  }

  // Get the MUSD token address for this network from env vars
  const musdAddress = process.env.NEXT_PUBLIC_MUSD_TOKEN_ADDRESS;
  if (!musdAddress || !musdAddress.startsWith("0x")) {
    throw new Error(
      "NEXT_PUBLIC_MUSD_TOKEN_ADDRESS not set in .env.local. "
      + "Get it from https://docs.mezo.org/contracts"
    );
  }
  console.log("MUSD Token address:", musdAddress);

  // Deploy the contract
  console.log("\nDeploying contract...");
  const GiftCard = await ethers.getContractFactory("MezoBanqGiftCard");

  // estimateGas: shows how much deployment will cost before sending
  const deployTx = await GiftCard.getDeployTransaction(musdAddress);
  const gasEstimate = await ethers.provider.estimateGas(deployTx);
  const gasPrice = (await ethers.provider.getFeeData()).gasPrice ?? 0n;
  const estCostWei = gasEstimate * BigInt(gasPrice);
  console.log("Estimated deploy cost:", ethers.formatEther(estCostWei), "BTC");

  const giftCard = await GiftCard.deploy(musdAddress);
  console.log("Transaction sent:", giftCard.deploymentTransaction()?.hash);
  console.log("Waiting for confirmation...");

  await giftCard.waitForDeployment();
  const contractAddress = await giftCard.getAddress();

  console.log("\n CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("Contract address:", contractAddress);
  console.log(
    "Explorer link: https://explorer.test.mezo.org/address/" + contractAddress
  );

  //  Save the address to .env.local automatically 
  console.log("\nUpdating .env.local with new contract address...");
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = fs.readFileSync(envPath, "utf-8");

  if (envContent.includes("NEXT_PUBLIC_GIFT_CARD_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_GIFT_CARD_ADDRESS=.*/,
      `NEXT_PUBLIC_GIFT_CARD_ADDRESS=${contractAddress}`
    );
  } else {
    envContent += `\nNEXT_PUBLIC_GIFT_CARD_ADDRESS=${contractAddress}`;
  }
  fs.writeFileSync(envPath, envContent);
  console.log(".env.local updated!");

  //  Save ABI to lib/mezo/GiftCardABI.json 
  const artifact = await ethers.getContractFactory("MezoBanqGiftCard");
  const abiPath = path.join(process.cwd(), "lib/mezo/GiftCardABI.json");
  fs.writeFileSync(abiPath, JSON.stringify(
    JSON.parse(JSON.stringify(artifact.interface.formatJson())), null, 2
  ));
  console.log("ABI saved to lib/mezo/GiftCardABI.json");

  console.log("\n=================================================");
  console.log("NEXT STEPS:");
  console.log("1. Copy the contract address above");
  console.log("2. Add to .env.local: NEXT_PUBLIC_GIFT_CARD_ADDRESS=", contractAddress);
  console.log("3. Restart your dev server: npm run dev");
  console.log("=================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});