const { ethers } = require("hardhat");
const fs         = require("fs");
const path       = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network    = await ethers.provider.getNetwork();

  console.log("═══════════════════════════════════════════════");
  console.log("  AetherCredit — Deployment");
  console.log("═══════════════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  console.log("Network: ", network.name, "| ChainID:", network.chainId.toString());

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance: ", ethers.formatEther(balance), "OG");
  console.log("───────────────────────────────────────────────");

  // 1. Deploy WorkRegistry
  console.log("\n1. Deploying WorkRegistry...");
  const WorkRegistry = await ethers.getContractFactory("WorkRegistry");
  const workRegistry = await WorkRegistry.deploy();
  await workRegistry.waitForDeployment();
  const workRegistryAddress = await workRegistry.getAddress();
  console.log("   ✅ WorkRegistry:", workRegistryAddress);

  // 2. Deploy CreditScorer
  console.log("\n2. Deploying CreditScorer...");
  const CreditScorer = await ethers.getContractFactory("CreditScorer");
  const creditScorer = await CreditScorer.deploy(workRegistryAddress);
  await creditScorer.waitForDeployment();
  const creditScorerAddress = await creditScorer.getAddress();
  console.log("   ✅ CreditScorer:", creditScorerAddress);

  // 3. Deploy CreditVault
  console.log("\n3. Deploying CreditVault...");
  const CreditVault = await ethers.getContractFactory("CreditVault");
  const creditVault = await CreditVault.deploy(
    creditScorerAddress,
    workRegistryAddress
  );
  await creditVault.waitForDeployment();
  const creditVaultAddress = await creditVault.getAddress();
  console.log("   ✅ CreditVault:", creditVaultAddress);

  // 4. Save deployment addresses
  const deployment = {
    network:     network.name,
    chainId:     network.chainId.toString(),
    deployedAt:  new Date().toISOString(),
    deployer:    deployer.address,
    contracts: {
      WorkRegistry: workRegistryAddress,
      CreditScorer: creditScorerAddress,
      CreditVault:  creditVaultAddress,
    },
    explorer: "https://chainscan.0g.ai",
  };

  const outDir  = path.join(__dirname, "../deployments");
  const outFile = path.join(outDir, `${network.chainId}.json`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));

  console.log("\n───────────────────────────────────────────────");
  console.log("  Deployed Addresses");
  console.log("───────────────────────────────────────────────");
  console.log(JSON.stringify(deployment.contracts, null, 2));
  console.log("\nExplorer:", deployment.explorer);
  console.log(`\n✅ Saved to deployments/${network.chainId}.json`);

  console.log("\n───────────────────────────────────────────────");
  console.log("  Verification Commands");
  console.log("───────────────────────────────────────────────");
  console.log(`npx hardhat verify ${workRegistryAddress} --network mainnet`);
  console.log(`npx hardhat verify ${creditScorerAddress} ${workRegistryAddress} --network mainnet`);
  console.log(`npx hardhat verify ${creditVaultAddress} ${creditScorerAddress} ${workRegistryAddress} --network mainnet`);
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });