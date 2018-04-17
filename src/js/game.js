Game = {
	
	contracts: {},
	
	init: function() {
		return Game.initUI();
	},
	
	// 初始化动态UI
	initUI: function() {
		console.log("IN initUI...");
		
		// 获取控制面板容器元素
		var containerbox = document.getElementById("container-box");
		
		// 先清空无用的矩阵按钮
		for(var i = 0; i < 5; i ++){
			var elerow = "container-cell-" + i;
			var removeObj = document.getElementById(elerow);
			if(removeObj && removeObj.parentNode){
				removeObj.parentNode.removeChild(removeObj);
				//console.log("remove " + elerow);
			}
		}
		
		// 开始加载矩阵按钮
		var index_btn = 1;
		for(var i = 0; i < 5; i ++){
			var subelestr = '<div id="container-cell-' + i + '" class="container-cell">';
			for(var j = 1; j <= 5; j ++){
				subelestr += '<div class="container-block">';
				subelestr += '<div class="container-block-icon">';
				subelestr += '<img id="container-block-img-' + index_btn + '" src="images/bitcoin-number.png" width="60" height="60" onclick="App.onClickBlockImage(' + index_btn + ');">';
				subelestr += '<span class="container-block-number" onclick="App.onClickBlockImage(' + index_btn + ');">' + index_btn + '</span>';
				subelestr += '</div>';
				subelestr += '<div class="container-block-btn">';
				subelestr += '<button id="container-block-btn-' + index_btn + '" type="button" onclick="App.onClickBtnBlock(' + index_btn + ');">购买</button>';
				subelestr += '</div>';
				subelestr += '</div>';
				index_btn += 1;
			}
			subelestr += '</div>';
			
			
			var rowdiv = document.createElement('div');
			rowdiv.innerHTML = subelestr;
			
			containerbox.append(rowdiv);
			
			//console.log("add: " + subelestr);
		}
		
		App.showGameListPanel(false);
	},
};

window.onload=function(){
	Game.init();
};

