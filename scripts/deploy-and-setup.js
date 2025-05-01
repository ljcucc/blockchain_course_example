const hre = require("hardhat");
const { ethers } = hre; // Destructure ethers from hre for convenience

async function main() {
  // --- 1. Get Deployer & Log ---
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(deployerBalance), "ETH");

  // --- 2. Define Constructor Arguments ---
  const ticketPriceWei = ethers.parseEther("0.01"); // Still returns BigInt in v6 utils
  const totalTickets = 100; // Regular number is fine here
  const blockNum = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNum);
  const currentTime = block.timestamp;
  const endTime = currentTime + 3600 * 24; // 24 hours
  const initialOwner = deployer.address;

  console.log("\nConstructor Arguments:");
  console.log(`  _ticketPrice (wei): ${ticketPriceWei.toString()}`);
  console.log(`  _totalTickets: ${totalTickets}`);
  console.log(`  _endTime (timestamp): ${endTime}`);
  console.log(`  initialOwner: ${initialOwner}`);
  console.log("---");

  // --- 3. Define Prizes to Add ---
  const prizesToAdd = [
    { name: "Grand Prize (A賞)", amountEth: "0.5", quantity: 1, rank: 1 },
    { name: "Second Prize (B賞)", amountEth: "0.1", quantity: 3, rank: 2 },
    { name: "Third Prize (C賞)", amountEth: "0.02", quantity: 10, rank: 3 },
  ];

  // --- 4. Calculate Total Prize Value Needed (using BigInt) ---
  let totalPrizeValueWei = 0n; // Initialize with BigInt zero (0n)
  for (const prize of prizesToAdd) {
    const prizeAmountWei = ethers.parseEther(prize.amountEth); // Returns BigInt
    // Use standard BigInt arithmetic: + and *
    totalPrizeValueWei =
      totalPrizeValueWei + prizeAmountWei * BigInt(prize.quantity); // Convert quantity to BigInt for multiplication
  }
  console.log("\nPrize Configuration:");
  console.log("  Prizes to add:", prizesToAdd.length);
  console.log(
    "  Total prize value needed:",
    ethers.formatEther(totalPrizeValueWei),
    "ETH"
  );
  console.log("---");

  // --- 5. Deploy the Contract ---
  const IchibanKujiFactory = await ethers.getContractFactory("IchibanKuji");
  console.log("\nDeploying IchibanKuji...");
  const ichibanKuji = await IchibanKujiFactory.deploy(
    ticketPriceWei,
    totalTickets, // Constructor likely expects uint256, ethers v6 handles BigInt/number conversion
    endTime, // Same as above
    initialOwner
  );

  // --- 6. Wait for Deployment Confirmation (Ethers v6) ---
  console.log("Deployment transaction sent. Waiting for mining...");
  const deployTxReceipt = await ichibanKuji.deploymentTransaction().wait(1);
  if (!deployTxReceipt) {
    throw new Error("Failed to get deployment transaction receipt.");
  }
  const contractAddress = ichibanKuji.target;
  console.log(`   Mined in block: ${deployTxReceipt.blockNumber}`);
  console.log("\n✅ IchibanKuji deployed successfully!");
  console.log("   Contract Address:", contractAddress);
  console.log("---");

  // --- 7. Fund the Contract with ETH for Prizes ---
  console.log(
    `\nFunding contract ${contractAddress} with ${ethers.formatEther(
      totalPrizeValueWei
    )} ETH...`
  );
  const fundTx = await deployer.sendTransaction({
    to: contractAddress,
    value: totalPrizeValueWei, // sendTransaction expects BigInt for value in v6
  });
  console.log("  Funding transaction sent:", fundTx.hash);
  await fundTx.wait(1);
  console.log("  Funding transaction confirmed.");
  const contractBalance = await ethers.provider.getBalance(contractAddress);
  console.log(
    "  Contract balance:",
    ethers.formatEther(contractBalance),
    "ETH"
  );
  console.log("---");

  // --- 8. Add Prizes to the Contract ---
  console.log("\nAdding prizes...");
  for (let i = 0; i < prizesToAdd.length; i++) {
    const prize = prizesToAdd[i];
    const prizeAmountWei = ethers.parseEther(prize.amountEth); // Returns BigInt
    console.log(`  Adding prize #${i + 1}: "${prize.name}"...`);
    // Pass BigInts and numbers directly, ethers handles conversion for uint256 args
    const addPrizeTx = await ichibanKuji
      .connect(deployer)
      .addPrize(prize.name, prizeAmountWei, prize.quantity, prize.rank);
    console.log(`    Tx sent: ${addPrizeTx.hash}`);
    await addPrizeTx.wait(1);
    console.log(`    Prize #${i + 1} added successfully.`);
  }
  console.log("✅ All prizes added.");
  console.log("---");

  // --- 9. Start the Lottery ---
  console.log("\nStarting the lottery...");
  const startTx = await ichibanKuji.connect(deployer).startLottery();
  console.log("  Start lottery transaction sent:", startTx.hash);
  await startTx.wait(1);
  console.log("  Start lottery transaction confirmed.");

  // --- 10. Verify Final Status ---
  const finalStatus = await ichibanKuji.status(); // Returns BigInt for enum index in v6
  const statusText = ["PENDING", "ACTIVE", "CLOSED"][Number(finalStatus)]; // Convert BigInt status to Number for array index
  console.log(
    `\n✅ Lottery status is now: ${statusText} (${finalStatus.toString()})`
  );
  console.log("---");
  console.log("Deployment and setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment or setup failed:", error);
    process.exit(1);
  });
