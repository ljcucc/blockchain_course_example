const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with the account:", deployer.address);

  // --- Define Constructor Arguments ---
  const ticketPriceWei = hre.ethers.parseEther("0.01"); // 1e16 wei
  const totalTickets = 100;
  const blockNum = await hre.ethers.provider.getBlockNumber();
  const block = await hre.ethers.provider.getBlock(blockNum);
  const currentTime = block.timestamp;
  const endTime = currentTime + 3600; // 1 hour
  const initialOwner = deployer.address;

  console.log("\nConstructor Arguments:");
  console.log(`  _ticketPrice (wei): ${ticketPriceWei.toString()}`);
  console.log(`  _totalTickets: ${totalTickets}`);
  console.log(`  _endTime (timestamp): ${endTime}`);
  console.log(`  initialOwner: ${initialOwner}`);
  console.log("---");

  const IchibanKujiFactory = await hre.ethers.getContractFactory("IchibanKuji");

  console.log("\nDeploying IchibanKuji...");
  const ichibanKuji = await IchibanKujiFactory.deploy(
    ticketPriceWei,
    totalTickets,
    endTime,
    initialOwner
  );

  // --- Wait for deployment confirmation (Ethers v6) ---
  console.log("Deployment transaction sent. Waiting for mining...");
  // Access the transaction response via deploymentTransaction() and wait for 1 confirmation
  const deployTxReceipt = await ichibanKuji.deploymentTransaction().wait(1);
  if (!deployTxReceipt) {
    throw new Error("Failed to get deployment transaction receipt.");
  }
  console.log(`   Mined in block: ${deployTxReceipt.blockNumber}`);
  // ------------------------------------------------------

  // --- Log the deployed contract address (Ethers v6 uses .target) ---
  console.log("\n✅ IchibanKuji deployed successfully!");
  console.log("   Contract Address:", ichibanKuji.target); // <<< Use .target in v6
  // ------------------------------------------------------------------

  console.log("\n---\nReminder: Lottery is PENDING.");
  console.log(
    "You need to add prizes (ensure contract has ETH balance) and call startLottery()."
  );
  console.log("---");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
