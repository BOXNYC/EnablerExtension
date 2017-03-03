(function(EE){
	
	if(typeof EE === 'undefined' || EE == null) return;
	
	function _enablerInitialized() {
		
		if(!EE.isServingInLiveEnvironment()) {
	    EE.invokeExternalJsFunction = function(code) {
	      if(typeof window.parent !== 'undefined' && window.parent != null) {
	        if(typeof window.parent.eval === 'function')
	          window.parent.eval(code);
	      } else {
		      eval(code);
	      };
	    };
	  };
		
		EE.wrapCode = function(code, delay) {
			if(typeof code.join === 'function') code = code.join(' ');
	    if (typeof delay === 'undefined') delay = 0;
	    return 'setTimeout(function(){ ' + code + ' }, ' + delay + ');';
	  };
	
	  EE.addJS = function(option) {
	    var method = (option.indexOf('http') == 0 ? 'src' : 'innerHTML'),
			    escaped = option.split('"').join('\\"'),
			    externalJs = [
				    'var script = document.createElement("script");',
				    'script.type = "text/javascript";',
				    'script.' + method + ' = "' + escaped + '";',
				    'document.getElementsByTagName("head")[0].appendChild(script);'
				  ];
	    EE.invokeExternalJsFunction(EE.wrapCode(externalJs));
	  };
	
	  EE.addCSS = function(option) {
	    var externalCSS = option.indexOf('http') == 0 ?
		    'var link = document.createElement("link"); link.rel = "stylesheet"; link.type = "text/css"; link.href = "' + option + '"; document.getElementsByTagName("head")[0].appendChild(link);' :
		    'var style = document.createElement("style"); style.type = "text/css"; style.innerHTML = "' + option + '"; document.getElementsByTagName("head")[0].appendChild(style);';
	    EE.invokeExternalJsFunction(EE.wrapCode(externalCSS));
	  };
	  
	  EE.onScrollTop = function(callback, externalCallbackName){
		  if(typeof externalCallbackName === 'undefined')
			  externalCallbackName = 'enablerOnScrollTopChanged';
		  function scrollTopMessageRecieved(event) {
		    if (typeof event.data != 'undefined' && typeof event.data.scrollTop !== 'undefined') {
		      var scrollTop = event.data.scrollTop;
		      callback(scrollTop);
		    };
		  };
		  if(window.addEventListener) {
	      addEventListener("message", scrollTopMessageRecieved, false);
	    } else {
	      attachEvent("onmessage", scrollTopMessageRecieved);
	    };
		  var externalJs = [
			  'var onScroll = function(e){',
				  'var frame = document.getElementById("' + EE.getDartAssetId() + '.if"),',
						  'scrollTop = window.scrollY || document.body.scrollTop;',
				  'if(typeof frame !== "undefined" && frame != null) {',
					  'frame.contentWindow.postMessage({',
						  'scrollTop: scrollTop',
						'}, "*");',
					'} else {',
					  'window.postMessage({',
						  'scrollTop: scrollTop',
						'}, "*");',
					'};',
					'if(typeof ' + externalCallbackName + ' === "function") {',
						'' + externalCallbackName + '(scrollTop);',
					'};',
				'};',
				'window.addEventListener("scroll", onScroll, true);',
				'onScroll();'
			];
	    EE.invokeExternalJsFunction(EE.wrapCode(externalJs));
	  };
	  
	  if(typeof EE.onInitialized === 'function') {
		  EE.onInitialized();
	  };
	  
	};
	
	if(!EE.isInitialized() && typeof studio !== 'undefined' && studio != null) {
	  EE.addEventListener(studio.events.StudioEvent.INIT, _enablerInitialized);
	} else {
	  _enablerInitialized();
	};
	
})(Enabler);