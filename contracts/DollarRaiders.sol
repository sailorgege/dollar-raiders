pragma solidity ^0.4.18;

import "./Ownable.sol";
import "./ERC721.sol";

contract DollarRaiders is Ownable, ERC721 {

    /*** 数据 ***/
    address createAddress;		// 代币初始创建时的默认地址
    uint16 currentCoinTotal;	// 当前代币总数
    
    // 一个代币的数据结构
	struct CoinNumber {
		uint16 coinNumber;
		uint64 buyTime;
	}
		
	// 保存所有代币数据。索引基于0，也是每个代币的token ID
	CoinNumber[] coinNumbers;
	
	mapping (uint256 => address) public coinIndexToOwner;		// 代币与拥有者之间的映射
	mapping (address => uint256) ownershipTokenCount;			// 一个人所拥有的代币的总数映射
	mapping (uint256 => address) public coinIndexToApproved;	// 待转让的代币与其拥有者的映射
	
	/*** 事件 ***/
	
	// 每当有新的代币出现时，就会触发该事件
	event CoinCreate(uint16 coinNumber);
	
	// 代币被转让时触发该事件，包括新代币创建
	event Transfer(address from, address to, uint256 tokenId);
	
	/*** 公有方法 ***/
	
	// 定义项目名称
	function name() public pure returns (string _name){
		return "DollarRaiders";
	}
	
	// 定义代币符号
	function symbol() public pure returns (string _symbol){
		return "DRC";
	}
	
	// 构造函数，创建了DollarRaiders主合约实例
	function DollarRaiders() public{
		createAddress = address(0);
		currentCoinTotal = 0;
	}
	
	// 创建指定数量的代币，并设置地址为初始地址
	function createCoins(uint16 _total) public returns (uint) {
		return _createCoins(_total);
	}
	
	// 重置代币状态，重新开始游戏
	function resetCoins() public {
		uint256 tokenIndex;
		uint256 _tokenId;
        for (tokenIndex = 0; tokenIndex < currentCoinTotal; tokenIndex ++) {
	        _tokenId = tokenIndex + 1;
	        address _ower = coinIndexToOwner[_tokenId];
			ownershipTokenCount[_ower] = 0;
			coinIndexToOwner[_tokenId] = address(0);
            delete coinIndexToApproved[_tokenId];
        }
	}
	
	// 获取一个代币的详细信息
	function getTokenInfo(uint64 _i) external view returns (
													uint16 coinNumber, 
													uint16 isBuy, 
													uint64 buyTime,
													address owner) {
        CoinNumber storage coin = coinNumbers[_i];
        coinNumber = coin.coinNumber;
        buyTime = coin.buyTime;
        owner = coinIndexToOwner[_i];
        if(owner == address(0) || owner == createAddress){
	        isBuy = 0;
        }else{
	        isBuy = 1;
        }
    }
    
    // 购买代币
	function buyToken(uint16 num) public {
		require(num >= 0 && num <= currentCoinTotal);
		
        _transfer(createAddress, msg.sender, num-1);
	}
	
	/*** 实现ERC721方法 ***/
	
	// 返回目前所有代币总数
	function totalSupply() public view returns (uint256 total) {
        return coinNumbers.length;
    }
    
    // 返回拥有者的代币余额
	function balanceOf(address _owner) public view returns (uint256 balance) {
		return ownershipTokenCount[_owner];
	}
	
	// 返回代币拥有者的地址
	function ownerOf(uint256 _tokenId) public view returns (address owner) {
		owner = coinIndexToOwner[_tokenId];

        require(owner != address(0));
	}
	
	// 允许某人对自己的代币进行转让操作（transferFrom）
	function approve(address _to, uint256 _tokenId) public {
		// 只有代币的拥有者，才有权授权别人转让自己的代币
        require(_owns(msg.sender, _tokenId));
        
        // 注册一个转让授权（如果已经存在，则替换之前的）
        _approve(_tokenId, _to);

        // Emit approval event.
        Approval(msg.sender, _to, _tokenId);
	}
	
	// 将代币转让给指定的人
	function transfer(address _to, uint256 _tokenId) external {
		// 确保指定地址是有效的
        require(_to != address(0));
        
        // 不允许转让给本合约
        require(_to != address(this));

        // 只能转让自己的代币
        require(_owns(msg.sender, _tokenId));

        // 执行转让操作
        _transfer(msg.sender, _to, _tokenId);
	}
	
	// 进行两个人之间的代币转让操作
	function transferFrom(address _from, address _to, uint256 _tokenId) public{
		// 确保指定地址是有效的
        require(_to != address(0));
        
        // 不允许转让给本合约
        require(_to != address(this));
        
        // 检查转让授权和所有权都是有效的
        require(_approvedFor(msg.sender, _tokenId));
        require(_owns(_from, _tokenId));

        // 执行转让操作
        _transfer(_from, _to, _tokenId);
	}
	
	/*** 内部方法 ***/
	
	// 创建指定数量的代币，并设置地址为初始地址
	function _createCoins(uint16 _total) public returns (uint) {
        require(_total == 25);
        
		currentCoinTotal = _total;
		uint16 tokenIndex;
        for (tokenIndex = 0; tokenIndex < currentCoinTotal; tokenIndex ++) {
            CoinNumber memory _token = CoinNumber({
	            coinNumber: tokenIndex + 1,
	            buyTime: uint64(now)
            });
            
            uint256 newTokenId = coinNumbers.push(_token);

	        // 确保新id不过超过40多亿的上限（虽然可能性非常低）
	        require(newTokenId == uint256(uint32(newTokenId)));
	
	        // 触发代币创建事件
			CoinCreate(_token.coinNumber);
	
	        // 按照ERC721协议，将新代币转让给初始地址
			_transfer(0, createAddress, newTokenId);
        }

        return currentCoinTotal;
    }
    
	// 判断代币是否归指定用户所有
	function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return coinIndexToOwner[_tokenId] == _claimant;
    }
	
	// 允许指定用户可以转让自己的代币
	function _approve(uint256 _tokenId, address _approved) internal	{
        coinIndexToApproved[_tokenId] = _approved;
    }	
	
	// 判断代币是否可以被指定用户进行转让
	function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return coinIndexToApproved[_tokenId] == _claimant;
    }
	
	// 转让代币的所有权
	function _transfer(address _from, address _to, uint256 _tokenId) internal {
        // 上限是2^32（即：4294967296，40多亿）
        ownershipTokenCount[_to] ++;
        
        // 所有权转移
        coinIndexToOwner[_tokenId] = _to;
        
        // 原拥有者的地址必须有效
        //if (_from != address(0)) {
	        // 原拥有者token总数减量
            ownershipTokenCount[_from]--;
            
            // 清理掉之前对该代币的转让授权
            delete coinIndexToApproved[_tokenId];
        //}
        
        // 触发一个转让事件
        Transfer(_from, _to, _tokenId);
    }
    
    /// 测试函数
    function SayHi() pure public returns (string) {
		return "Hi~ DollarRaiders!";
	}
	
	function SayHi2() pure public returns (string) {
		return "Hi~2 My DollarRaiders!";
	}
}
