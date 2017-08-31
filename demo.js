/*var jsonData = {
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
			children :
			[{
					tagName : "li",
					props : {
						"data-mutex" : 0
					},
					children : ["人形检测"]
				}, {
					tagName : "li",
					props : {
						"data-mutex" : 0
					},
					children : ["遮挡报警"]
				}, {
					tagName : "li",
					props : {
						"data-mutex" : 1
					},
					children : ["徘徊检测"]
				}
			]
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
						id : "add",
					},
					children : [""]
				}, {
					tagName : "button",
					props : {
						class : "addAllBtn",
						id : "add_all",
					},
					children : [""]

				}, {
					tagName : "button",
					props : {
						class : "removeBtn",
						id : "remove",
					},
					children : [""]
				}, {
					tagName : "button",
					props : {
						class : "removeAllBtn",
						id : "remove_all",
					},
					children : [""]
				}
			]
		}, {
			tagName : "ul",
			props : {
				class : "selectBox selectRight",
			},
			children :
			[{
					tagName : "li",
					props : {
						"data-mutex" : 1
					},
					children : ["人脸检测"]
				}, {
					tagName : "li",
					children : ["越线"]
				}, {
					tagName : "li",
					children : ["区域入侵"]
				}
			]
		}
	]
}*/

$(function () {
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
							id : "add",
						},
						children : [""]
					}, {
						tagName : "button",
						props : {
							class : "addAllBtn",
							id : "add_all",
						},
						children : [""]

					}, {
						tagName : "button",
						props : {
							class : "removeBtn",
							id : "remove",
						},
						children : [""]
					}, {
						tagName : "button",
						props : {
							class : "removeAllBtn",
							id : "remove_all",
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

	var obj = {
		leftData : ["人形检测", "遮挡报警", "徘徊检测"],
		rightData : ["人脸检测", "越线", "区域入侵"],
		mutexData : ["人形检测-遮挡报警", "徘徊检测-人脸检测"],
		mountDomId : "circular"
	}

	var arryLeft = [];
	var arryRight = [];
	var alertMutex = [];
	obj.mutexData.map(function (item) {
		arryLeft.push(item.split("-")[0])
		arryRight.push(item.split("-")[1])
		alertMutex.push(item + "(不能同时存在)")
	})

	function createJsonData(arr, flag) {
		var ix = flag == "left" ? 0 : 2;
		for (var i = 0; i < arr.length; i++) {
			var childObj = {};
			childObj.tagName = "li";
			childObj.children = [arr[i]];
			var indexMutex1 = arryLeft.indexOf(arr[i]);
			var indexMutex2 = arryRight.indexOf(arr[i])
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
				jsonData.children[ix].children.push(childObj);
		}
	}

	/*设置按钮是否灰选,dest为添加数据的目的地*/
	function setBtnState(dest) {
		if (".selectLeft" == dest) {
			$(".addAllBtn").attr("disabled", false).css("opacity", 1)
			$(".addBtn").attr("disabled", false).css("opacity", 1)
		} else {
			$(".removeAllBtn").attr("disabled", false).css("opacity", 1)
			$(".removeBtn").attr("disabled", false).css("opacity", 1)
		}
		if (0 == $(".selectLeft li").length) {
			$(".addBtn").attr("disabled", "disabled").css("opacity", 0.5)
			$(".addAllBtn").attr("disabled", "disabled").css("opacity", 0.5)
		} else if (0 == $(".selectRight li").length) {
			$(".removeBtn").attr("disabled", "disabled").css("opacity", 0.5)
			$(".removeAllBtn").attr("disabled", "disabled").css("opacity", 0.5)

		}
	}

	createJsonData(obj.leftData, "left")
	createJsonData(obj.rightData, "right")

	var virtualDom = new Element(jsonData);
	var realDom = virtualDom.render();
	var mountDom = document.getElementById("circular");
	mountDom.appendChild(realDom);

	/*双击*/
	$(".selectBox").on("dblclick", "li", function () {
		var ix = $(this).parent()[0].className.indexOf("selectLeft");
		var dest = ix != -1 ? ".selectRight" : ".selectLeft";
		if (".selectRight" == dest) {
			var mutex = $(this).attr("data-mutex");
			var mutexFlag = false;
			if (mutex != undefined) {
				$(".selectRight li").map(function (item, index) {
					if (mutex == $(index).attr("data-mutex")) {
						alert(alertMutex[mutex]);
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
		setBtnState(dest);
	})

	$(".selectBox li").toggle(function () {
		var ix = $(this).parent()[0].className.indexOf("selectLeft");
		var dest = ix != -1 ? ".selectRight" : ".selectLeft";
		$(dest + " li").removeClass("active");
		$(this).addClass("active");
	}, function () {
		$(this).removeClass("active");
	})

	$(".buttonGroup").on("click", "button", function () {
		var id = this.id;
		if ("add_all" == id) {
			var mutexFlag = false;
			var mutexLeft = new Array();
			var mutexRight = new Array();
			$(".selectLeft").find("li").map(function (item, index) {
				if ($(index).attr("data-mutex")) {
					mutexLeft.push($(index).attr("data-mutex"))
				}
			});
			$(".selectRight").find("li").map(function (item, index) {
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
						alert(alertMutex[mutexLeft[i]]);
						// break;

					}
				}
				mutexLeft.map(function (item) {
					if (mutexRight.indexOf(item) != -1) {
						mutexFlag = true;
						alert(alertMutex[item]);
					}
				})
			}
			if (mutexFlag) {
				return
			}
			var $li = $(".selectLeft li").detach();
			$(".selectRight").append($li);
			$(this).attr("disabled", "disabled").css("opacity", 0.5)
			$(".addBtn").attr("disabled", "disabled").css("opacity", 0.5)
			$(".removeAllBtn").attr("disabled", false).css("opacity", 1)
			$(".removeBtn").attr("disabled", false).css("opacity", 1)
		} else if ("remove_all" == id) {
			var $li = $(".selectRight li").detach();
			$(".selectLeft").append($li);
			$(this).attr("disabled", "disabled").css("opacity", 0.5)
			$(".removeBtn").attr("disabled", "disabled").css("opacity", 0.5)
			$(".addAllBtn").attr("disabled", false).css("opacity", 1)
			$(".addBtn").attr("disabled", false).css("opacity", 1)
		} else {
			var $item = $(".active");
			if ($item.length == 0) {
				return;
			}
			if ("add" == id) {
				var mutexLeft = new Array();
				var mutexRight = new Array();

				var mutexFlag = false;
				$(".selectLeft ").find(".active").map(function (item, index) {
					if ($(index).attr("data-mutex")) {
						mutexLeft.push($(index).attr("data-mutex"))
					}
				});
				$(".selectRight").find("li").map(function (item, index) {
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
						alert(alertMutex[mutexLeft[i]]);
						// break;

					}
				}
				mutexLeft.map(function (item) {
					if (mutexRight.indexOf(item) != -1) {
						mutexFlag = true;
						alert(alertMutex[item]);
					}
				})
			}
			if (mutexFlag) {
				return
			}
			var parent = $item.parent();
			var ix = $(parent)[0].className.indexOf("selectLeft");
			var dest = ix != -1 ? ".selectRight" : ".selectLeft";
			$(dest).append($item);
			setBtnState(dest);
		}
		$(".active").removeClass("active")
	})
})
