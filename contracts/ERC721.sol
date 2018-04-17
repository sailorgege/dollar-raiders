pragma solidity ^0.4.18;

/// 自己实现的ERC721协议合约代码
/// 使用open-zeppelin的ERC721协议时，使用truffle部署会有报错
contract ERC721 {

	// Required methods
    function totalSupply() public view returns (uint256 total);	// 返回目前所有代币总数
    function balanceOf(address _owner) public view returns (uint256 balance);	// 返回拥有者的代币余额
    function ownerOf(uint256 _tokenId) public view returns (address owner);		// 返回代币拥有者的地址
    function approve(address _to, uint256 _tokenId) public;		// 允许某人对自己的代币进行转让操作（transferFrom）
    function transfer(address _to, uint256 _tokenId) external;	// 将代币转让给指定的人
    function transferFrom(address _from, address _to, uint256 _tokenId) public;	// 进行两个人之间的代币转让操作
    
    // Events
    event Transfer(address from, address to, uint256 tokenId);
    event Approval(address owner, address approved, uint256 tokenId);

    // Optional
    // function name() public view returns (string name);
    // function symbol() public view returns (string symbol);
    // function tokensOfOwner(address _owner) external view returns (uint256[] tokenIds);
    // function tokenMetadata(uint256 _tokenId, string _preferredTransport) public view returns (string infoUrl);

    // ERC-165 Compatibility (https://github.com/ethereum/EIPs/issues/165)
    // function supportsInterface(bytes4 _interfaceID) external view returns (bool);

}
