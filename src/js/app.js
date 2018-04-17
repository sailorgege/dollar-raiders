App = {
	coinTotal: 25,
	coinList: [],
	winTotal: 25,
	isGamePlaying: false,
	isGameFinish: false,
	web3Provider: null,
	contracts: {},
	
	init: function() {
		if(0){
			App.winTotal = 4;
		}
		if(0){
			// 测试
			App.showGameListPanel(false);
			App.showGameDetailPanel(true);
		}else{
			App.showGameDetailPanel(false);
		}
		return App.initWeb3();
	},
	
	initWeb3: function() {
		// Is there an injected web3 instance?
		if (typeof web3 !== 'undefined') {
			console.log('web3 已经注入！');
			App.web3Provider = web3.currentProvider;
		} else {
			console.log('web3 被重新实例化！');
			// If no injected web3 instance is detected, fall back to Ganache
			App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
		}
		web3 = new Web3(App.web3Provider);
		
		return App.initContract();
	},
	
	initContract: function() {
		// 加载DollarRaiders.json，保存了DollarRaiders的ABI（接口说明）信息及部署后的网络(地址)信息，它在编译合约的时候生成ABI，在部署的时候追加网络信息
		$.getJSON('DollarRaiders.json', function(data) {
			// 用DollarRaiders.json数据创建一个可交互的TruffleContract合约实例。
			var DollarRaidersArtifact = data;
			App.contracts.DollarRaiders = TruffleContract(DollarRaidersArtifact);
			
			// Set the provider for our contract
			App.contracts.DollarRaiders.setProvider(App.web3Provider);
			
			// Use our contract
			return App.markDollarRaiders();
		});
		return App.bindEvents();
	},
	
	bindEvents: function() {
		//$(document).on('click', '.btn-test1', App.handleTest1);
	},
	
	markDollarRaiders: function(data, account) {
		console.log('markDollarRaiders::call');
		var contractInstance;
		
		App.contracts.DollarRaiders.deployed().then(function(instance) {
			console.log('markDollarRaiders::call...');
			contractInstance = instance;
			
			// 调用合约的SayHi(), 用call读取信息不用消耗gas
			return contractInstance.SayHi.call();
			
		}).then(function(data) {
			console.log(data);
			
			// 获取用户账号
			web3.eth.getAccounts(function(error, accounts) {
				if (error) {
					console.log('获取eth账户错误！err:' + error);
				}
				
				if(accounts.length == 0){
					console.log('eth账户列表为空！');
				}else{
					var total = accounts.length;
					var account = accounts[0];
					console.log('eth账号总数：' + total + '，默认eth账户：' + account);
				}
			});
			
			
		}).catch(function(err) {
			console.log(err.message);
		});
	},
	
	updateListData: function() {
		console.log('updateListData::更新列表数据...');
		
		App.coinList = [];
		for(var i = 0; i < App.coinTotal; i ++){
			App.getTokenDetail(i);
		}
	},
	
	// 获取代币详情
	getTokenDetail: function(i) {
		//console.log('getTokenDetail::获取代币详情...i=' + i);
		var contractInstance;
		
		App.contracts.DollarRaiders.deployed().then(function(instance) {
			contractInstance = instance;
			
			return contractInstance.getTokenInfo(i);
		
		}).then(function(result) {
			//console.log('getTokenDetail::' + result);
			
			var coinObj = {};
			coinObj.coinNumber = result[0];
			coinObj.isBuy = result[1];
			coinObj.buyTime = App.timetransToString(result[2]);
			coinObj.address = result[3];
			App.coinList.push(coinObj);
			
			//console.log('coinNumber:' + coinObj.coinNumber + ', isBuy:' + coinObj.isBuy + ', buyTime:' + coinObj.buyTime + ', address:' + coinObj.address);
			
			App.updateCoinDetail(coinObj.coinNumber);
			
		}).catch(function(err) {
			console.log('合约调用异常！' + err.message);
		});
	},
	
	updateCoinDetail: function(num) {
		var coinObj = App.coinList[num - 1];
		console.log('updateCoinDetail::num:' + num + ', coinNumber:' + coinObj.coinNumber + ', isBuy:' + coinObj.isBuy + ', buyTime:' + coinObj.buyTime + ', address:' + coinObj.address);
		
		
		var buyBtnID = 'container-block-btn-' + num.toString();
		var buyBtn = document.getElementById(buyBtnID);
		
		document.getElementById('token-detail-number-text').innerText = num.toString();
		document.getElementById('token-detail-name').innerText = num.toString() + '号代币';
		if(coinObj.isBuy == 0){
			document.getElementById('token-detail-status').innerText = '状态：未购';
			
			buyBtn.innerText = '购买';
			buyBtn.style.opacity = '1.0';
			buyBtn.style.color = '#ffffff';
			buyBtn.style.backgroundColor = '#ff3300';
		}else{
			document.getElementById('token-detail-status').innerText = '状态：已购';
			
			buyBtn.innerText = '售完';
			buyBtn.style.opacity = '0.6';
			buyBtn.style.color = '#ff3300';
			buyBtn.style.backgroundColor = '#e3e3e3';
		}
		
		document.getElementById('token-detail-time').innerText = coinObj.buyTime;
		document.getElementById('token-detail-address').innerText = coinObj.address;
		
		
		App.checkGameResult();
	},
	
	checkGameResult: function() {
		//console.log('checkGameResult::...');
		if(App.coinList.length < App.coinTotal){
			//console.log('checkGameResult::购买数量不够！');
			return;
		}
		
		App.isGameFinish = false;
		var buyTotal = 0;
		for(var i = 0; i < App.coinList.length; i ++){
			var coinObj = App.coinList[i];
			if(coinObj.isBuy != 0){
				buyTotal ++;
			}
		}
		
		//console.log('checkGameResult::buyTotal=' + buyTotal + ', winTotal=' + App.winTotal);
		
		if(buyTotal >= App.winTotal){
			console.log('checkGameResult::游戏结束！buyTotal=' + buyTotal + ', winTotal=' + App.winTotal);
			App.isGameFinish = true;
		}
		if(App.isGameFinish){
			var winNumber = Math.floor(Math.random()*(25-1+1)+1);
			App.showGameResult(winNumber);
		}
	},
	
	// 显示/隐藏
	showGameListPanel: function(show) {
		var playpanel = document.getElementById("control-game-play-panel");
		var containerbox = document.getElementById("container-box");
		if(show){
			playpanel.style.display = 'none';
			containerbox.style.display = 'block';
		}else{
			playpanel.style.display = 'block';
			containerbox.style.display = 'none';
		}
	},
	
	// 显示/隐藏
	showGameDetailPanel: function(show) {
		var playpanel = document.getElementById("control-game-play-panel");
		var detailpanel = document.getElementById("modal-detail-panel");
		if(show){
			playpanel.style.display = 'none';
			detailpanel.style.display = 'block';
		}else{
			playpanel.style.display = 'block';
			detailpanel.style.display = 'none';
		}
	},
	
	showGameResult: function(num) {
		console.log('showGameResult::游戏结束！');
		
		document.getElementById("game_result_panel").style.display = 'block';
		
		//var result = '游戏结束！<br>本期胜出号码：' + num.toString();
		document.getElementById('game_result_text_number').innerText = num.toString();
	},
	
	onClickBtnStartGame: function(){
		console.log('onClickBtnStartGame::开始游戏...');
		var contractInstance;
		
		App.showGameListPanel(true);
		
		// 获取用户账号
		web3.eth.getAccounts(function(error, accounts) {
			if (error) {
				console.log('获取eth账户错误！err:' + error);
			}
			
			if(accounts.length == 0){
				console.log('eth账户列表为空！');
			}else{
				var account = accounts[0];
				console.log('默认eth账户：' + account);
			}
			
			App.contracts.DollarRaiders.deployed().then(function(instance) {
				contractInstance = instance;
				
				
				return contractInstance.createCoins(App.coinTotal);
			
			}).then(function(result) {
				console.log(result);
				
				App.isGamePlaying = true;
				App.updateListData();
			
			}).catch(function(err) {
				console.log(err.message);
			});
		});
	},
	
	onClickBtnResetGame: function(){
		console.log('onClickBtnResetGame::重新开始游戏...');
		var contractInstance;
		
		document.getElementById("game_result_panel").style.display = 'none';
		App.showGameListPanel(true);
		
		App.contracts.DollarRaiders.deployed().then(function(instance) {
			contractInstance = instance;
			
			
			return contractInstance.resetCoins();
		
		}).then(function(result) {
			console.log(result);
			
			App.isGamePlaying = true;
			App.updateListData();
		
		}).catch(function(err) {
			console.log(err.message);
		});
	},
	
	onClickBlockImage: function(num){
		console.log("onClickBlockImage...num=" + num);
		
		var coinObj = App.coinList[num - 1];
		console.log('onClickBlockImage::coinNumber:' + coinObj.coinNumber + ', isBuy:' + coinObj.isBuy + ', buyTime:' + coinObj.buyTime + ', address:' + coinObj.address);
		
		App.showGameListPanel(false);
		App.showGameDetailPanel(true);
		App.updateCoinDetail(num);
	},
		
	onClickBtnBlock: function(num){
		console.log("onClickBtnBlock::购买代币...num=" + num);
		var coinObj = App.coinList[num - 1];
		if(coinObj.isBuy != 0){
			console.log("onClickBtnBlock::代币已经被购买...num=" + num);
			alert('代币' + num.toString() + '已经被购买！');
			return;
		}
		
		
		var contractInstance;
		
		App.contracts.DollarRaiders.deployed().then(function(instance) {
			contractInstance = instance;
			
			
			return contractInstance.buyToken(num);
		
		}).then(function(result) {
			console.log(result);
			
			App.isGamePlaying = true;
			App.updateListData();
		
		}).catch(function(err) {
			console.log(err.message);
		});
	},
	
	onClickBtnCloseModal: function(){
		console.log("onClickBtnCloseModal...");
		
		App.showGameDetailPanel(false);
		App.showGameListPanel(true);
	},
	
	timetransToString: function(date){
	    var date = new Date(date*1000);//如果date为13位不需要乘1000
	    var Y = date.getFullYear() + '-';
	    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
	    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
	    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
	    var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
	    var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
	    return Y+M+D+h+m+s;
	}

};

$(function() {
	$(window).load(function() {
		App.init();
	});
});
