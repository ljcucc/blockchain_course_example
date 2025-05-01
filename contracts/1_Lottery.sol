// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17; //指定了使用的Solidity語言版本

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IchibanKuji
 * @dev 一個完全在區塊鏈上運行的一番賞抽獎系統，獎品為ETH 也可換成NFT
 */
contract IchibanKuji is Ownable {  //繼承Ownable合約
    // 抽獎ID
    uint256 private s_requestId = 0;

    // 一番賞活動狀態
    enum Status { PENDING, ACTIVE, CLOSED } //定義抽獎活動的三種可能狀態 準備 活動 關閉
    Status public status;

    // 獎品結構
    struct Prize {
        string name;
        uint256 amount;    // 獎品金額 (ETH的wei數量)
        uint256 quantity;  // 獎品數量
        uint256 remaining; // 剩餘數量
        uint256 rank;      // 獎品等級（1為最好的獎品，如最後一賞）
    }

    // 抽獎請求結構
    struct DrawRequest {
        address user;  //發起請求的用戶地址
        uint256 timestamp; //請求時間戳
        bool fulfilled; //是否已完成抽獎
        uint256 resultPrizeId; //抽獎結果(獲得的獎品ID)
    }

    // 將請求ID映射到抽獎請求，方便查詢特定抽獎結果
    mapping(uint256 => DrawRequest) public drawRequests;

    // 存儲所有可能的獎品
    Prize[] public prizes;

    // 記錄每個參與者購買的抽獎券數量
    mapping(address => uint256) public ticketsPurchased;

    // 活動參數
    uint256 public ticketPrice;  //每張抽獎券的價格(以wei為單位)
    uint256 public totalTickets; //抽獎活動總票數
    uint256 public soldTickets; // 已售出的票數
    uint256 public endTime;  //活動結束時間戳

    // 事件
    event PrizeAdded(uint256 prizeId, string name, uint256 amount, uint256 quantity, uint256 rank);  //當添加新獎品時觸發
    event TicketPurchased(address indexed buyer, uint256 amount);  //當用戶購買抽獎券時觸發
    event DrawRequested(address indexed user, uint256 requestId);  //當用戶請求抽獎時觸發
    event DrawFulfilled(address indexed user, uint256 requestId, uint256 prizeId);  //當抽獎請求完成時觸發
    event PrizeDistributed(address indexed winner, uint256 amount, uint256 prizeId);  //當獎品分發給獲獎者時觸發

    // [新增的代碼]
    uint256[] private availablePrizeIds;


     //構造函數在合約部署時執行
    constructor(
        uint256 _ticketPrice,  //每張抽獎券價格(wei)
        uint256 _totalTickets,  //總抽獎券數量
        uint256 _endTime,  //活動結束時間戳
        address initialOwner  //初始合約擁有者
    )payable  Ownable(initialOwner) {
        ticketPrice = _ticketPrice;
        totalTickets = _totalTickets;
        endTime = _endTime;
        status = Status.PENDING;
        _transferOwnership(initialOwner);
    }

    /**
     * @dev 添加獎品
     * @param _name 獎品名稱
     * @param _amount 獎品金額(wei)
     * @param _quantity 獎品數量
     * @param _rank 獎品等級
     */
    function addPrize(string memory _name, uint256 _amount, uint256 _quantity, uint256 _rank) external onlyOwner {
        require(status == Status.PENDING, "Cannot add prizes after lottery starts");
        prizes.push(Prize({
            name: _name,
            amount: _amount,
            quantity: _quantity,
            remaining: _quantity,
            rank: _rank
        }));

        emit PrizeAdded(prizes.length - 1, _name, _amount, _quantity, _rank);

        // [新增的代碼]
        if (_quantity > 0) {
            availablePrizeIds.push(prizes.length - 1);
        }
    }

    /**
     * @dev 啟動一番賞活動
     */
    function startLottery() external onlyOwner {  // onlyOwner 只有擁有者可以調用
        require(status == Status.PENDING, "Lottery is not in pending state"); //確認活動狀態
        require(prizes.length > 0, "No prizes added"); //確保已添加至少一個獎品
        uint256 totalPrizes = 0;
        uint256 totalPrizeValue = 0;
        for (uint256 i = 0; i < prizes.length; i++) {  //計算所有獎品的總數和總價值
            totalPrizes += prizes[i].quantity;
            totalPrizeValue += (prizes[i].amount * prizes[i].quantity);
        }
        //檢查是否有足夠的票數覆蓋所有獎品
        require(totalPrizes <= totalTickets, "Total prizes exceeds total tickets");
        //檢查合約是否有足夠的ETH覆蓋所有獎品的總價值
        require(address(this).balance >= totalPrizeValue, "Insufficient ETH to cover all prizes");

        status = Status.ACTIVE;  //狀態更改為ACTIVE
    }

    /**
     * @dev 購買抽獎券
     * @param _amount 購買數量
     */
    function purchaseTickets(uint256 _amount) external payable {  //payable 允許接收ETH
        require(status == Status.ACTIVE, "Lottery is not active"); //檢查活動是否處於活動狀態
        require(block.timestamp < endTime, "Lottery has ended"); //檢查活動是否在有效時間內
        require(soldTickets + _amount <= totalTickets, "Not enough tickets available"); //檢查是否有足夠的票數可供購買
        require(msg.value >= ticketPrice * _amount, "Insufficient payment"); //檢查用戶的ETH是否足夠

        ticketsPurchased[msg.sender] += _amount;
        soldTickets += _amount;

        emit TicketPurchased(msg.sender, _amount); //發出TicketPurchased事件

        // 如果用戶發送了過多的ETH，退還多餘部分
        if (msg.value > ticketPrice * _amount) {
            payable(msg.sender).transfer(msg.value - ticketPrice * _amount);
        }
    }

    /**
     * @dev 請求抽獎
     */
    function requestDraw() external returns (uint256 requestId) {
        require(status == Status.ACTIVE, "Lottery is not active"); //檢查活動是否處於啟動狀態
        require(ticketsPurchased[msg.sender] > 0, "No tickets purchased");  //檢查用戶是否擁有抽獎券
        require(hasPrizesRemaining(), "No prizes remaining"); //檢查是否還有獎品可供抽取

        ticketsPurchased[msg.sender]--;  //減少用戶的抽獎券數量

        // 生成新的的请求ID
        s_requestId++;
        // 創建新的抽獎請求並記錄
        drawRequests[s_requestId] = DrawRequest({
            user: msg.sender,
            timestamp: block.timestamp,
            fulfilled: false,
            resultPrizeId: 0
        });

        emit DrawRequested(msg.sender, s_requestId);  //發出DrawRequested事件

        // 調用fulfillRandomDraw處理抽獎結果
        fulfillRandomDraw(s_requestId);

        return s_requestId;
    }

    /**
     * @dev 模擬隨機抽獎過程
     */
    function fulfillRandomDraw(uint256 requestId) internal {
        DrawRequest storage request = drawRequests[requestId];
        require(request.user != address(0), "Request not found"); //檢索使用者抽獎請求
        require(!request.fulfilled, "Request already fulfilled"); //確保請求存在且尚未完成

        // 產生一個基於定時器、發送者地址和區塊資訊的偽隨機數
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            request.user,
            block.difficulty,
            block.number
        )));

        uint256 prizeId = selectPrize(randomNumber);  //使用隨機數選擇獎品
        request.resultPrizeId = prizeId;
        request.fulfilled = true;

        // 減少獎品的剩餘數量
        prizes[prizeId].remaining--;

        // [新增的代碼] 如果獎品用完，從可用獎品列表中移除
        if (prizes[prizeId].remaining == 0) {
            for (uint256 i = 0; i < availablePrizeIds.length; i++) {
                if (availablePrizeIds[i] == prizeId) {
                    availablePrizeIds[i] = availablePrizeIds[availablePrizeIds.length - 1];
                    availablePrizeIds.pop();
                    break;
                }
            }
        }

        // 將ETH獎品轉給獲獎者
        uint256 prizeAmount = prizes[prizeId].amount;
        payable(request.user).transfer(prizeAmount);

        //發出事件記錄抽獎完成和獎品分發
        emit DrawFulfilled(request.user, requestId, prizeId);
        emit PrizeDistributed(request.user, prizeAmount, prizeId);

        // 如果沒有獎品剩餘，關閉活動
        if (!hasPrizesRemaining()) {
            status = Status.CLOSED;
        }
    }

    /**
     * @dev 檢查是否還有獎品剩餘
     */
    function hasPrizesRemaining() public view returns (bool) {
        return availablePrizeIds.length > 0;
    }

    /**
     * @dev 根據隨機數選擇獎品
     * @param randomness 隨機數
     */

    // function selectPrize(uint256 randomness) internal view returns (uint256) {
    //     // 創建一個獎品池，只包含剩餘數量大於0的獎品
    //     uint256[] memory availablePrizes = new uint256[](prizes.length);
    //     uint256 availableCount = 0;

    //     for (uint256 i = 0; i < prizes.length; i++) {
    //         if (prizes[i].remaining > 0) {
    //             availablePrizes[availableCount] = i;
    //             availableCount++;
    //         }
    //     }

    //     // 選擇一個隨機獎品
    //     uint256 selectedIndex = randomness % availableCount;
    //     return availablePrizes[selectedIndex];
    // }

     // [新增的代碼]
    function selectPrize(uint256 randomness) internal view returns (uint256) {
        require(availablePrizeIds.length > 0, "No prizes available");
        uint256 selectedIndex = randomness % availablePrizeIds.length;
        return availablePrizeIds[selectedIndex];
    }



    /**
     * @dev 獲取獎品資訊
     * @param prizeId 獎品ID
     */
    function getPrizeInfo(uint256 prizeId) public view returns (
        string memory name,
        uint256 amount,
        uint256 quantity,
        uint256 remaining,
        uint256 rank
    ) {
        require(prizeId < prizes.length, "Prize does not exist");
        Prize storage prize = prizes[prizeId];
        return (
            prize.name,
            prize.amount,
            prize.quantity,
            prize.remaining,
            prize.rank
        );
    }

    /**
     * @dev 取款 - 只能在活動結束後提取剩餘資金
     */
    function withdraw() external onlyOwner {
        require(status == Status.CLOSED, "Lottery is not closed yet");
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev 接收ETH的回調函數
     */
    receive() external payable {
        // 允許合約接收ETH
    }

    /**
     * @dev 手動關閉活動
     */
    function closeLottery() external onlyOwner {
        require(status == Status.ACTIVE, "Lottery is not active");
        status = Status.CLOSED;
    }

    /**
     * @dev 獲取獎品總數
     */
    function getPrizeCount() external view returns (uint256) {
        return prizes.length;
    }

    /**
     * @dev 獲取用戶抽獎券數量
     */
    function getTicketCount(address user) external view returns (uint256) {
        return ticketsPurchased[user];
    }

    /**
     * @dev 獲取剩餘抽獎券數量
     */
    function getRemainingTickets() external view returns (uint256) {
        return totalTickets - soldTickets;
    }
}
