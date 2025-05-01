// 合約地址和ABI
const contractAddress = "0x149AE5AC3f137dA3B0E5C2dA45318511051C1518"; // 替換為您的合約地址

// 合約ABI（從Remix編譯後獲取）
const contractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ticketPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_totalTickets",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_endTime",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "prizeId",
        type: "uint256",
      },
    ],
    name: "DrawFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    name: "DrawRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "prizeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rank",
        type: "uint256",
      },
    ],
    name: "PrizeAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "prizeId",
        type: "uint256",
      },
    ],
    name: "PrizeDistributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TicketPurchased",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_rank",
        type: "uint256",
      },
    ],
    name: "addPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "closeLottery",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "drawRequests",
    outputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "fulfilled",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "resultPrizeId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPrizeCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "prizeId",
        type: "uint256",
      },
    ],
    name: "getPrizeInfo",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remaining",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rank",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRemainingTickets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getTicketCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hasPrizesRemaining",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "prizes",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "quantity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remaining",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rank",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "purchaseTickets",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "requestDraw",
    outputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "soldTickets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "startLottery",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "status",
    outputs: [
      {
        internalType: "enum IchibanKuji.Status",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ticketPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "ticketsPurchased",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalTickets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

// 獲取頁面元素
const connectButton = document.getElementById("connectButton");
const accountArea = document.getElementById("accountArea");
const lotteryStatus = document.getElementById("lotteryStatus");
const totalTickets = document.getElementById("totalTickets");
const soldTickets = document.getElementById("soldTickets");
const prizeCount = document.getElementById("prizeCount");
const ticketPrice = document.getElementById("ticketPrice");
const myTickets = document.getElementById("myTickets");
const ticketAmount = document.getElementById("ticketAmount");
const purchaseButton = document.getElementById("purchaseButton");
const purchaseStatus = document.getElementById("purchaseStatus");
const drawButton = document.getElementById("drawButton");
const drawStatus = document.getElementById("drawStatus");
const prizeList = document.getElementById("prizeList");
const refreshButton = document.getElementById("refreshButton");

// 設置合約地址顯示
document.getElementById("contractAddress").textContent = contractAddress;

let provider, signer, contract;
let userAddress;

// 連接到MetaMask
async function connectWallet() {
  try {
    // 檢查瀏覽器是否安裝了 MetaMask
    if (typeof window.ethereum !== "undefined") {
      // 請求用戶授權訪問他們的以太坊帳戶
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      userAddress = accounts[0];
      accountArea.textContent = `已連接: ${userAddress}`;

      // 使用 ethers.js 設置 provider（連接以太坊網絡）和 signer（處理交易簽名）
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      // 連接到合約
      contract = new ethers.Contract(contractAddress, contractABI, signer);
      // 載入合約訊息
      await refreshContractInfo();
      // 監聽帳戶變更
      window.ethereum.on("accountsChanged", (accounts) => {
        window.location.reload();
      });
    } else {
      accountArea.textContent = "請安裝MetaMask!";
    }
  } catch (error) {
    console.error(error);
    accountArea.textContent = `連接錯誤: ${error.message}`;
  }
}

// 重新整理合約資訊
async function refreshContractInfo() {
  try {
    // 獲取抽獎狀態
    const status = await contract.status();
    const statusText = ["待開始", "進行中", "已結束"][status];
    lotteryStatus.textContent = statusText;

    // 獲取票價
    const price = await contract.ticketPrice();
    ticketPrice.textContent = ethers.utils.formatEther(price);

    // 獲取總票數和已售票數
    const total = await contract.totalTickets();
    totalTickets.textContent = total.toString();

    const sold = await contract.soldTickets();
    soldTickets.textContent = sold.toString();

    // 獲取獎品數量
    const prizes = await contract.getPrizeCount();
    prizeCount.textContent = prizes.toString();

    // 獲取我的票數
    if (userAddress) {
      const tickets = await contract.getTicketCount(userAddress);
      myTickets.textContent = tickets.toString();
    }

    // 載入獎品列表
    await loadPrizes(prizes);
  } catch (error) {
    console.error(error);
  }
}

// 載入獎品列表
async function loadPrizes(count) {
  try {
    let html = '<table style="width:100%; border-collapse: collapse;">';
    html +=
      '<tr><th style="border: 1px solid #ddd; padding: 8px;">ID</th><th style="border: 1px solid #ddd; padding: 8px;">名稱</th><th style="border: 1px solid #ddd; padding: 8px;">金額(ETH)</th><th style="border: 1px solid #ddd; padding: 8px;">數量</th><th style="border: 1px solid #ddd; padding: 8px;">剩餘</th></tr>';

    for (let i = 0; i < count; i++) {
      const prize = await contract.getPrizeInfo(i);
      html += `<tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${i}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${
                  prize[0]
                }</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${ethers.utils.formatEther(
                  prize[1]
                )}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${prize[2].toString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${prize[3].toString()}</td>
            </tr>`;
    }

    html += "</table>";
    prizeList.innerHTML = html;
  } catch (error) {
    console.error(error);
    prizeList.innerHTML = `載入獎品失敗: ${error.message}`;
  }
}

// 購買票
async function purchaseTickets() {
  try {
    const amount = parseInt(ticketAmount.value);
    if (isNaN(amount) || amount <= 0) {
      purchaseStatus.textContent = "請輸入有效的票數";
      return;
    }

    const price = await contract.ticketPrice();
    const totalPrice = price.mul(amount);

    purchaseStatus.textContent = "交易處理中...";

    const tx = await contract.purchaseTickets(amount, { value: totalPrice });
    await tx.wait();

    purchaseStatus.textContent = "購買成功!";
    await refreshContractInfo();
  } catch (error) {
    console.error(error);
    purchaseStatus.textContent = `購買失敗: ${error.message}`;
  }
}

// 抽獎
async function requestDraw() {
  try {
    drawStatus.textContent = "交易處理中...";

    const tx = await contract.requestDraw();
    const receipt = await tx.wait();

    // 檢查事件以確定抽獎結果
    const drawEvent = receipt.events.find(
      (event) => event.event === "DrawFulfilled"
    );
    if (drawEvent) {
      const prizeId = drawEvent.args.prizeId.toString();
      const prize = await contract.getPrizeInfo(prizeId);

      drawStatus.textContent = `恭喜! 您抽中了 "${
        prize[0]
      }", 價值 ${ethers.utils.formatEther(prize[1])} ETH!`;
    } else {
      drawStatus.textContent = "抽獎完成，請檢查您的獎品!";
    }

    await refreshContractInfo();
  } catch (error) {
    console.error(error);
    drawStatus.textContent = `抽獎失敗: ${error.message}`;
  }
}

// 綁定事件
connectButton.addEventListener("click", connectWallet);
purchaseButton.addEventListener("click", purchaseTickets);
drawButton.addEventListener("click", requestDraw);
refreshButton.addEventListener("click", refreshContractInfo);

// 初始化嘗試連接錢包
if (typeof window.ethereum !== "undefined") {
  connectWallet();
}
