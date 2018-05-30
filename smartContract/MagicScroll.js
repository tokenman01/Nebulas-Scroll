"use strict";

var Scroll = function(str) {
	if (str) {
		var obj = JSON.parse(str);
		this.content = obj.content;
		this.saltKey = obj.saltKey;
		this.price = obj.price;
		this.times = obj.times;
		this.master = obj.master;
		this.desc = obj.desc;
		this.vtimes = obj.vtimes;
		this.from = obj.from;
	} else {
		this.content = "";
		this.saltKey = ""
		this.price = 0;
		this.times = 999999999999;
		this.vtimes = 0;
		this.master = "";
		this.desc = "";
		this.from ="";
	}
};

Scroll.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var UserHistory = function(str){
	if(str){
		var obj = JSON.parse(str);
		this.salt = obj.salt;
		this.createKeys = obj.createKeys;// 自己的卷轴
		this.openKeys = obj.openKeys; //打开过的卷轴
	}else{
		this.salt ="";
		this.createKeys =[];
		this.openKeys =[];
	}
};

UserHistory.prototype ={
	toString: function () {
		return JSON.stringify(this);
	}
};

var Tools = function(key){
	if (key.length < 57) {
			throw new Error('the key is too short.');
	}
	this._hexCHS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	this._hexTBL = {
			'0':0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9,
			'A':10, 'B':11, 'C':12, 'D':13, 'E':14, 'F':15, 'G':16, 'H':17, 'I':18, 'J':19,
			'K':20, 'L':21, 'M':22, 'N':23, 'O':24, 'P':25, 'Q':26, 'R':27, 'S':28, 'T':29,
			'U':30, 'V':31, 'W':32, 'X':33, 'Y':34, 'Z':35, 'a':36, 'b':37, 'c':38, 'd':39,
			'e':40, 'f':41, 'g':42, 'h':43, 'i':44, 'j':45, 'k':46, 'l':47, 'm':48, 'n':49,
			'o':50, 'p':51, 'q':52, 'r':53, 's':54, 't':55, 'u':56, 'v':57, 'w':58, 'x':59,
			'y':60, 'z':61
	};
	// 平移密钥
	this._sz = this._hexCHS.charCodeAt(key[15]) % (key.length-20) + 10,
	this._ks = key.slice(-this._sz);
	for (var _i=0; _i<this._sz; ++_i) {
			this._ks[_i] = this._hexCHS.charCodeAt(this._ks[_i]%62);
	}

	this._k16 = [], this._k41 = [];
	this._t16 = {}, this._t41 = {};

	for (var _i=0; _i<16; ++_i) {
			this._k16[_i] = this._hexCHS.charAt(key[_i]);
			this._t16[this._k16[_i]] = _i;
	}
	for (var _i=0; _i<41; ++_i) {
			this._k41[_i] = this._hexCHS.charAt(key[_i+16]);
			this._t41[this._k41[_i]] = _i;
	}
};

Tools.prototype = {
	// 解密
	decrypt: function( s )
	{
		var _hexCHS = this._hexCHS;
		var _hexTBL = this._hexTBL;

			var _t16 = this._t16,
					_t41 = this._t41,
					_ks  = this._ks,
					_sz  = this._sz,
					_cnt = 0;
			var _s = s.replace(/[0-9A-Za-z]/g, function( ch ) {
					return  _hexCHS.charAt((_hexTBL[ch] - _ks[_cnt++%_sz]%62 + 62) % 62);
			});
			var _rs = '';
			for (var _i=0; _i<_s.length;) {
					var _ch = _s.charAt(_i);
					if (/[\s\n\r]/.test(_ch)) {
							_rs += _ch;
							++_i;
					} else if (_t16[_ch] !== undefined) {
							_rs += String.fromCharCode(_t16[_s.charAt(_i)]*16 + _t16[_s.charAt(_i+1)]);
							_i += 2;
					} else {
							_rs += String.fromCharCode(_t41[_s.charAt(_i)]*1681 + _t41[_s.charAt(_i+1)]*41 + _t41[_s.charAt(_i+2)]);
							_i += 3;
					}
			}
			return  _rs;
	},
};

var MagicScroll = function () {
	LocalContractStorage.defineProperty(this, "servAddr");
	LocalContractStorage.defineProperty(this, "servRate");
	LocalContractStorage.defineProperty(this, "charStr");
	LocalContractStorage.defineProperty(this, "arrKey");
  LocalContractStorage.defineProperty(this, "maxSaltKey");
	LocalContractStorage.defineMapProperty(this, "salt");
	LocalContractStorage.defineMapProperty(this, "userRepo",{
        parse: function (str) {
            return new UserHistory(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
  LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (str) {
            return new Scroll(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

MagicScroll.prototype = {
    init: function () {
				this.servAddr = "n1REg7nvceEDrhiHinp4DspDrkKtCf3Tg95";
				this.servRate = 0.01;
				this.charStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        this.maxSaltKey = 0;
				this.arrKey = [61,37,44,31,34,7,24,6,43,12,27,3,25,29,60,33,35,41,58,2,51,49,9,5,59,11,42,32,22,40,4,57,50,38,8,56,21,19,52,53,16,28,1,26,47,17,54,46,10,23,55,13,14,20,15,36,18];
        this.addRndSalt();
    },

    addRndSalt: function(){

      var min = parseInt(this.maxSaltKey);
			var k = min;
      var max = min + 10000;
      while(k >= min && k < max){
				var saltKey = k + "";
				if(k > min || k == 0){
					this.salt.set(saltKey, this._rndNumStr());
				}
        k++;
      }
      this.maxSaltKey = k -1;
    },

		getMaxSalt: function(){
			var salt ={};
			salt.key = this.maxSaltKey;
			salt.value = this.salt.get(salt.key);
			return salt;
		},


		_rndNumStr(){
			 var arr = this.arrKey;
			 arr.sort(function(){ return 0.5 - Math.random(); });
			 return arr;
		},

		_rndStr: function(len) {
			var charSet = this.charStr;
			var str = '';
			for (var i = 0; i < len; i++) {
			 var randomPoz = Math.floor(Math.random() * charSet.length);
			 str += charSet.substring(randomPoz,randomPoz+1);
			}
			return str;
		},

		getRndSalt: function(){
			var rndSalt= {};
			rndSalt.key = Math.floor(Math.random()*(parseInt(this.maxSaltKey)));
			rndSalt.value = this.salt.get(rndSalt.key);
			return rndSalt;
		},

       save: function (key,text,saltKey,price,times,desc,master) {

                key = key.trim();
				if(key.length !== 12 && key.length !== 10){
					throw new Error("key invalid!");
				}
				var scroll = this.repo.get(key);
				if(scroll){
					throw new Error("sorry, the key was occupied, please try again.");
				}

                scroll = new Scroll();

				scroll.price = Number(price);
				scroll.times = Number(times);
				if(isNaN(scroll.price)){
					throw new Error("price format invalid!");
				}
				if(isNaN(scroll.times)){
					throw new Error("times format invalid!");
				}

				if(scroll.price <= 0){ //免费不对次数作限制
					scroll.times = 9999999999;
				}

				scroll.saltKey = (String(saltKey)).trim();
                var salt = this.salt.get(scroll.saltKey);
				if(!salt){
					throw new Error("salt invalid!");
				}

				var tools = new Tools(salt);
				var content = text.trim();; //解密content todo
                 content = tools.decrypt(content);

                scroll.content = content;
		 		scroll.desc = desc;
				scroll.master = master;

				if(content === ""){
					throw new Error("empty content!");
				}else if(content.length > 2100){
					throw new Error("content exceed limit length");
				}
				var addr = Blockchain.transaction.from
				scroll.from = addr;

				this.repo.set(key, scroll);
				// update userHistory
				var userHistory = this.userRepo.get(addr);
				if(!userHistory){
					userHistory =new UserHistory();
				}
				userHistory.createKeys.push(key);
				this.userRepo.set(addr,userHistory);

				return true;
		},

		show: function(key){//展示卷轴
			   var scroll = this.repo.get(key);
			   if(scroll){
				   delete scroll.content;
				   delete scroll.from; //保密
				   return scroll;
			   }else{
				   throw new Error("scroll was not exist");
			   }
			},

		in_array: function(arr,v){
				for(var i in arr){
					if(arr[i] === v){
							return true;
						   }
					   }
		        return false;
			},

		open: function (key) {//打开卷轴
			key = key.trim();
			if ( key === "" ) {
				throw new Error("empty key")
			}
			var scroll = this.repo.get(key);
			if(!scroll){
			   throw new Error("scroll was not exist");
			}

			if(scroll.vtimes >= scroll.times){
			  throw new Error("visit times was exceeded!");
			}

			if(key.length === 12){
				return true;
			}else if(key.length === 10){
				//check history
				var openAddr = Blockchain.transaction.from;
				var userHistory = this.userRepo.get(openAddr);
				if(userHistory && userHistory.openKeys.length >= 1){
				  if(this.in_array(userHistory.openKeys,key)){
					return true;
				  }
				}

				//新支付处理
				//check value
				var value = Blockchain.transaction.value;
				if(value >= scroll.price){
					var actPay = value.mul(1 - this.servRate);
					var servFee = value.sub(actPay);
					var result1 = Blockchain.transfer(scroll.from, actPay);
					var result2 = Blockchain.transfer(this.servAddr, servFee);
					if(!result1 || !result2){
					  throw new Error("Transfer failed");
					}
				}else{
				  throw new Error("value is not enough!")
				}
				// update userHistory
				if(!userHistory){
				  userHistory =new UserHistory();
				}
				userHistory.openKeys.push(key);
				this.userRepo.set(openAddr,userHistory);
				//update scroll vtimes
				scroll.vtimes++;
				this.repo.set(key,scroll);
				return true;
			}
		},

		view: function(key, openAddr){
           //已付款的可以继续看
			key = key.trim();
			if ( key === "" ) {
					throw new Error("empty key");
			}

	        var scroll = this.repo.get(key);
			if(!scroll){
				throw new Error("the scroll was not exist!");
			}

			if(key.length === 12){
					return scroll;
			}else if(key.length === 10){
				//check history
				var userHistory = this.userRepo.get(openAddr);
				if(userHistory && userHistory.openKeys.length >= 1){
					if(this.in_array(userHistory.openKeys,key)){
						return scroll;
					}

				}
					throw new Error("please pay first");
			}

		},
       //获取创建和打开历史
		createKeys: function(addr){
			var userHistory = this.userRepo.get(addr);
			if(!userHistory){
				throw new Error("No record for this address");
			}
			var createKeys =	userHistory.createKeys;
			return createKeys;
		},

		openKeys: function(addr){
			var userHistory = this.userRepo.get(addr);
			if(!userHistory){
				throw new Error("No record for this address");
			}
			var openKeys =	userHistory.openKeys;
			return openKeys;
		},

};
module.exports = MagicScroll;
