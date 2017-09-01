(function () {
	/*渲染的html节点模板*/
	var jsonData = {
		tagName : "div",
		props : {
			class : "wrapSelect"
		},
		children :
		[{
				tagName : "ul",
				props : {
					class : "selectBox selectLeft"
				},
				children : []
			}, {
				tagName : "div",
				props : {
					class : "buttonGroup"
				},
				children :
				[{
						tagName : "button",
						props : {
							class : "addBtn",
						},
						children : [""]
					}, {
						tagName : "button",
						props : {
							class : "addAllBtn",
						},
						children : [""]

					}, {
						tagName : "button",
						props : {
							class : "removeBtn",
						},
						children : [""]
					}, {
						tagName : "button",
						props : {
							class : "removeAllBtn",
						},
						children : [""]
					}
				]
			}, {
				tagName : "ul",
				props : {
					class : "selectBox selectRight",
				},
				children : []
			}
		]
	}

	function deepCopy(p, c) {
		c = c || {};
		for (var i in p) {
			if (p.hasOwnProperty(i)) {
				if (typeof p[i] === 'object') {
					c[i] = Object.prototype.toString.call(p[i]) === '[object Array]' ? [] : {}
					deepCopy(p[i], c[i]);
				} else {
					c[i] = p[i];
				}
			}
		}
		return c;
	}

	//让bind函数支持IE8
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (oThis) {
			if (typeof this !== "function") {
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}
			var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};
			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();
			return fBound;
		};
	}

	function AddEventList(obj) {
		this.dataLeftArray = obj.leftData;
		this.dataRightArray = obj.rightData;
		this.mutexArry1 = [];
		this.mutexArry2 = [];
		this.alertMutex = [];
		this.mountDomId = obj.mountDomId;
		this.templateJson = deepCopy(jsonData);
		this.indexList = 0;
		obj.mutexData.map(function (item) {
			this.mutexArry1.push(item.split("-")[0]);
			this.mutexArry2.push(item.split("-")[1]);
			this.alertMutex.push(item + "(不能同时存在)");
		}.bind(this))
        this.init();
	}

	AddEventList.prototype.count = 0;

	/*将我们需要生成的HTML节点转换为JSON数据格式,用对象的结构去渲染*/
	AddEventList.prototype.createJsonData = function (arr, flag) {
		var ix = flag == "left" ? 0 : 2;
		for (var i = 0; i < arr.length; i++) {
			var childObj = {};
			childObj.tagName = "li";
			childObj.children = [arr[i]];
			var indexMutex1 = this.mutexArry1.indexOf(arr[i]);
			var indexMutex2 = this.mutexArry2.indexOf(arr[i])
				if (indexMutex1 != -1) {
					childObj.props = {
						'data-mutex' : indexMutex1
					}
				}
				if (indexMutex2 != -1) {
					childObj.props = {
						'data-mutex' : indexMutex2
					}
				}
				this.templateJson.children[ix].children.push(childObj);
		}
		if (ix == 0) {
			this.templateJson.props.id = 'wrapSelect' + this.count;
		}
	}

	AddEventList.prototype.init = function () {
		this.createJsonData(this.dataLeftArray, "left");
		this.createJsonData(this.dataRightArray, "right");
		var virtualDom = new Element(this.templateJson);
		var realDom = virtualDom.render();
		if (!this.mountDomId) {
			document.body.appendChild(realDom);
		} else {
			var mountDom = document.getElementById(this.mountDomId);
			mountDom.appendChild(realDom);
		}
		this.indexList = AddEventList.prototype.count;
		AddEventList.prototype.count++;

		this.resBtnState() //按钮状态初始化
		this.initEvent();
	}

	/*初始化触发事件*/
	AddEventList.prototype.initEvent = function () {
		var _this = this;
		var id = "#wrapSelect" + this.indexList + " ";
		/*双击*/
		$(id + ".selectBox").on("dblclick", "li", function () {
			var ix = $(this).parent()[0].className.indexOf("selectLeft");
			var dest = ix != -1 ? id + ".selectRight" : id + ".selectLeft";
			if (id + ".selectRight" == dest) {
				var mutex = $(this).attr("data-mutex");
				var mutexFlag = false;
				if (mutex != undefined) {
					$(id + ".selectRight li").map(function (item, index) {
						if (mutex == $(index).attr("data-mutex")) {
							alert(_this.alertMutex[mutex]);
							mutexFlag = true;
						}
					})
				}
				if (mutexFlag) {
					return;
				}
			}
			var $li = $(this).detach();
			$(dest).append($li);
			_this.setBtnState(dest);
		})

		/*单击*/
		$(id + ".selectBox li").click(function () {
			var ix = $(this).parent()[0].className.indexOf("selectLeft");
			var dest = ix != -1 ? id + ".selectRight" : id + ".selectLeft";
			$(dest + " li").removeClass("active");
			if ($(this).is(".active")) {
				$(this).removeClass("active");
			} else {
				$(this).addClass("active");
			}
		})

		/*按钮点击*/
		$(id + ".buttonGroup").on("click", "button", function () {
			var className = this.className;
			if ("addAllBtn" == className) {
				var mutexFlag = false;
				var mutexLeft = new Array();
				var mutexRight = new Array();
				$(id + ".selectLeft").find("li").map(function (item, index) {
					if ($(index).attr("data-mutex")) {
						mutexLeft.push($(index).attr("data-mutex"))
					}
				});
				$(id + ".selectRight").find("li").map(function (item, index) {
					if ($(index).attr("data-mutex")) {
						mutexRight.push($(index).attr("data-mutex"))
					}
				});

				if (mutexLeft.length > 0) {
					var mutexLeftLen = mutexLeft.length,
					res = [];
					for (var i = 0; i < mutexLeftLen; i++) {
						if (res.indexOf(mutexLeft[i]) == -1) {
							res.push(mutexLeft[i])
						} else {
							mutexFlag = true;
							alert(_this.alertMutex[mutexLeft[i]]);
							// break;

						}
					}
					mutexLeft.map(function (item) {
						if (mutexRight.indexOf(item) != -1) {
							mutexFlag = true;
							alert(_this.alertMutex[item]);
						}
					})
				}
				if (mutexFlag) {
					return
				}
				var $li = $(id + ".selectLeft li").detach();
				$(id + ".selectRight").append($li);
				$(this).attr("disabled", "disabled").css("opacity", 0.5)
				$(id + ".addBtn").attr("disabled", "disabled").css("opacity", 0.5)
				$(id + ".removeAllBtn").attr("disabled", false).css("opacity", 1)
				$(id + ".removeBtn").attr("disabled", false).css("opacity", 1)
			} else if ("removeAllBtn" == className) {
				var $li = $(id + ".selectRight li").detach();
				$(id + ".selectLeft").append($li);
				$(this).attr("disabled", "disabled").css("opacity", 0.5)
				$(id + ".removeBtn").attr("disabled", "disabled").css("opacity", 0.5)
				$(id + ".addAllBtn").attr("disabled", false).css("opacity", 1)
				$(id + ".addBtn").attr("disabled", false).css("opacity", 1)
			} else {
				var $item = $(id + ".active");
				if ($item.length == 0) {
					return;
				}
				if ("addBtn" == className) {
					var mutexLeft = new Array();
					var mutexRight = new Array();

					var mutexFlag = false;
					$(id + ".selectLeft ").find(".active").map(function (item, index) {
						if ($(index).attr("data-mutex")) {
							mutexLeft.push($(index).attr("data-mutex"))
						}
					});
					$(id + ".selectRight").find("li").map(function (item, index) {
						if ($(index).attr("data-mutex")) {
							mutexRight.push($(index).attr("data-mutex"))
						}
					});
					var mutexLeftLen = mutexLeft.length,
					res = [];
					for (var i = 0; i < mutexLeftLen; i++) {
						if (res.indexOf(mutexLeft[i]) == -1) {
							res.push(mutexLeft[i])
						} else {
							mutexFlag = true;
							alert(_this.alertMutex[mutexLeft[i]]);
							// break;

						}
					}
					mutexLeft.map(function (item) {
						if (mutexRight.indexOf(item) != -1) {
							mutexFlag = true;
							alert(_this.alertMutex[item]);
						}
					})
				}
				if (mutexFlag) {
					return
				}
				var parent = $item.parent();
				var ix = $(parent)[0].className.indexOf("selectLeft");
				var dest = ix != -1 ? id + ".selectRight" : id + ".selectLeft";
				$(dest).append($item);
				_this.setBtnState(dest);
			}
			$(id + ".active").removeClass("active")
		})
	}
	AddEventList.prototype.resBtnState = function () {
		var id = "#wrapSelect" + this.indexList + " ";
		if (0 == $(id + ".selectLeft li").length) {
			$(id + ".addBtn").attr("disabled", "disabled").css("opacity", 0.5)
			$(id + ".addAllBtn").attr("disabled", "disabled").css("opacity", 0.5)
		} else if (0 == $(id + ".selectRight li").length) {
			$(id + ".removeBtn").attr("disabled", "disabled").css("opacity", 0.5)
			$(id + ".removeAllBtn").attr("disabled", "disabled").css("opacity", 0.5)
		}
	}

	AddEventList.prototype.setBtnState = function (dest) {
		var id = "#wrapSelect" + this.indexList + " ";
		if (id + ".selectLeft" == dest) {
			$(id + ".addAllBtn").attr("disabled", false).css("opacity", 1)
			$(id + ".addBtn").attr("disabled", false).css("opacity", 1)
		} else {
			$(id + ".removeAllBtn").attr("disabled", false).css("opacity", 1)
			$(id + ".removeBtn").attr("disabled", false).css("opacity", 1)
		}
		this.resBtnState();
	}
	/*节点构造函数*/
	function Element(obj) {
		this.tagName = obj.tagName;
		this.props = obj.props;
		var children = obj.children.map(function (item) {
				if (typeof item == "object") //如果包裹的是一个对象的话，继续new Element
				{
					item = new Element(item)
				}
				return item
			})
			this.children = children;
	}

	Element.prototype.render = function () {
		var el = document.createElement(this.tagName) // 根据tagName构建
			var props = this.props

			for (var propName in props) { // 设置节点的DOM属性
				var propValue = props[propName]
					el.setAttribute(propName, propValue)
			}

			var children = this.children || []

			children.forEach(function (child) {
				var childEl = (child instanceof Element)
				 ? child.render() // 如果子节点也是虚拟DOM，递归构建DOM节点
				 : document.createTextNode(child) // 如果字符串，只构建文本节点
				el.appendChild(childEl)
			})

			return el
	}

	window.AddEventList = AddEventList;

}())
