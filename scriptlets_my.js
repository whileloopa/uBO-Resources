/*
    The scriptlets below are meant to be injected only into a web page context.
    Don't left empty line inside scriptlet, it will be truncated at empty line.

    https://github.com/gorhill/uBlock/blob/master/assets/resources/scriptlets.js
    https://raw.githubusercontent.com/gorhill/uBlock/master/assets/resources/scriptlets.js

    https://github.com/NanoAdblocker/NanoCore2/blob/master/src/snippets.js
    https://raw.githubusercontent.com/NanoAdblocker/NanoCore2/master/src/snippets.js

    https://github.com/uBlock-user/uBO-Scriptlets/blob/master/scriptlets.js
    https://raw.githubusercontent.com/uBlock-user/uBO-Scriptlets/master/scriptlets.js
    
    https://github.com/whileloopa/uBO-Resources/blob/master/resources_my.js
    https://raw.githubusercontent.com/whileloopa/uBO-Resources/master/resources_my.js

    https://github.com/whileloopa/uBO-Resources/blob/master/scriptlets_my.js
    https://raw.githubusercontent.com/whileloopa/uBO-Resources/master/scriptlets_my.js

    https://www.dropbox.com/s/rqnyd24mgwpm31i/resources_my.js?dl=0
    https://dl.dropboxusercontent.com/s/rqnyd24mgwpm31i/resources_my.js?dl=0

	https://www.dropbox.com/s/nj09ffwjkd5hg4m/scriptlets_my.js?dl=0
	https://dl.dropboxusercontent.com/s/nj09ffwjkd5hg4m/scriptlets_my.js?dl=0

	Modified: 2022-04-10
*/

"use strict";

/// test.js
(function () {
    let needle = '{{1}}';
    console.log('>>> Scriptlets injected: ' + needle);
    console.log('>>> self === window ?', self === window);
    console.log(eval(needle));
})();


// Set lang attribute of <html> element if not exist
// +js(my-setlang-if-undefined, language)
/// my-setlang-if-undefined.js
(function () {
    let language = '{{1}}';
    console.log('>>> my-setlang-if-undefined.js: ' + language);
    document.documentElement.setAttribute('lang', language)
})();

// +js(my-no-google-translate)
/// my-no-google-translate.js
(function () {
    console.log('>>> my-no-google-translate.js');
    let meta = document.createElement('meta');
    meta.name = 'google';
    meta.content = 'notranslate';
    document.head.appendChild(meta);
})();


// Force passiveness (default false) of event listener if pattern match
// +js(my-event-passiveness-if, [eventType], [handler], [passiveness])
/// my-event-passiveness-if.js
(function () {
    let needle1 = '{{1}}';
    if ( needle1 === '' || needle1 === '{{1}}' ) {
        needle1 = '.*';
    } else if ( needle1.startsWith('/') && needle1.endsWith('/') ) {
        needle1 = needle1.slice(1,-1);
    }
    needle1 = '^(' + needle1 + ')$';
    needle1 = new RegExp(needle1);
    let needle2 = '{{2}}';
    if ( needle2 === '' || needle2 === '{{2}}' ) {
        needle2 = '.?';
    } else if ( needle2.startsWith('/') && needle2.endsWith('/') ) {
        needle2 = needle2.slice(1,-1);
    } else {
        needle2 = needle2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    needle2 = new RegExp(needle2);
    let passiveness = '{{3}}';
    console.log('>>> my-event-passiveness:', needle1, needle2, passiveness);
    let proxy = new Proxy( self.EventTarget.prototype.addEventListener, {
        apply: function(target, thisArg, args) {
            const type = args[0].toString();
            const handler = String(args[1]);
            let options = args[2] ?? {};
            if (typeof options === 'boolean') {
                options = {capture: options};
            }
            if (typeof options !== 'object') {
                return Reflect.apply(...arguments);
            }
            if (needle1.test(type) && needle2.test(handler)) {
                options.passive = ({true:true, false:false})[passiveness] ?? false;
            }
            args[2] = options;
            if(args[2].passive === false) console.log('>>> my-event-passiveness: ', type);
            return Reflect.apply(...arguments);
        }
    });
    self.EventTarget.prototype.addEventListener = proxy;
})();

/// my-ac.qq.com-fix.js
(function () {
	let wheelScroll = window.onmousewheel;
	Object.defineProperty(window, "onmousewheel", {
	  get(){ return this._onmousewheel; },
	  set(func){ if(typeof this._onmousewheel === 'function') this.removeEventListener('mousewheel', this._onmousewheel);
		if(typeof func === 'function') this.addEventListener('mousewheel', func, {passive:false});
		this._onmousewheel = func;
	  },
	  enumerable: true,
	  configurable: true
	});
	Object.defineProperty(document, "onmousewheel", {
	  get(){ return this._onmousewheel; },
	  set(func){ if(typeof this._onmousewheel === 'function') this.removeEventListener('mousewheel', this._onmousewheel);
		if(typeof func === 'function') this.addEventListener('mousewheel', func, {passive:false});
		this._onmousewheel = func;
	  },
	  enumerable: true,
	  configurable: true
	});
	window.onmousewheel = document.onmousewheel = wheelScroll;
})();

// Bypass document.write and document.writeln if pattern match
// +js(my-nowrite-if, pattern)
/// my-nowrite-if.js
(function () {
    let needle = '{{1}}';
    console.log('>>> my-nowrite-if: ' + needle);
    if ( needle === '' || needle === '{{1}}' ) {
        return;
    } else if ( needle.startsWith('/') && needle.endsWith('/') ) {
        needle = new RegExp(needle.slice(1,-1));
    }
    document.write = new Proxy(document.write, {
        apply: function (write, thisArg, args) {
            const markup = args[0];
            if ((typeof needle === 'string' && markup.indexOf(needle)<0) ||
              (needle.constructor === RegExp && !needle.test(markup))) {
                return write.apply(thisArg, args);
            }
        }
    });
    document.writeln = new Proxy(document.writeln, {
        apply: function (writeln, thisArg, args) {
            const markup = args[0];
            if ((typeof needle === 'string' && markup.indexOf(needle)<0) ||
              (needle.constructor === RegExp && !needle.test(markup))) {
                return writeln.apply(thisArg, args);
            }
        }
    });
})();

// Replace string before document.write and document.writeln
// +js(my-replace-write, pattern, replace)
/// my-replace-write.js
(function () {
    let replace = '{{2}}';
    let needle = '{{1}}';
    console.log('>>> my-replace-write: ' + needle);
    if ( needle === '' || needle === '{{1}}' ) {
        return;
    } else if (needle.startsWith('/') && needle.endsWith('/')) {
        needle = needle.slice(1,-1);
    } else {
        needle = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    needle = new RegExp(needle);
    document.write = new Proxy(document.write, {
        apply: function (write, thisArg, args) {
            let newstring = args[0].replace(needle, replace);
            if (newstring !== args[0]) {
                args[0] = newstring;
                console.log('>>> my-replace-write: ' + args[0]);
            }
            return write.apply(thisArg, args);
        }
    });
    document.writeln = new Proxy(document.writeln, {
        apply: function (writeln, thisArg, args) {
            let newstring = args[0].replace(needle, replace);
            if (newstring !== args[0]) {
                args[0] = newstring;
                console.log('>>> my-replace-write: ' + args[0]);
            }
            return writeln.apply(thisArg, args);
        }
    });
})();


// Create wbr element instead of script element
// +js(my-create-wbr-script)
/// my-create-wbr-script.js
(function () {
    document.createElement = new Proxy(document.createElement, {
        apply: function (createElement, thisArg, args) {
            if (/script/i.test(args[0])) {
                args[0] = 'wbr';
            }
            return createElement.apply(thisArg, args);
        }
    });
    console.log('>>> my-create-wbr-script');
})();

// Create script elements are set to json type
// +js(my-create-json-script)
/// my-create-json-script.js
(function () {
    document.createElement = new Proxy(document.createElement, {
        apply: function (createElement, thisArg, args) {
            let element = createElement.apply(thisArg, args);
            if (element.nodeName === 'SCRIPT') {
                element.setAttribute('type', 'application/json');
                element.setAttribute = new Function;
                Object.defineProperty(element, 'type', {value: 'application/json'});
            }
            return element;
        }
    });
    console.log('>>> my-create-json-script');
})();


// Bypass appendChild if property match.
// +js(my-no-append-if, nSelector, pSelector, nNeedle, pNeedle)
/// my-no-append-if.js
/// alias my-noaif
(function () {
    let nSelector = '{{1}}';
    let pSelector = '{{2}}';
    let nNeedle = '{{3}}';
    let pNeedle = '{{4}}';
    const reNoArg = /^$|^{{\d}}$/;
    const reRegexEscape = /[.*+?^${}()|[\]\\]/g;
    
    if (reNoArg.test(nSelector)) {
        nSelector = '*';
    }
    if (reNoArg.test(pSelector)) {
        pSelector = '*';
    }

    if (reNoArg.test(nNeedle)) {
        nNeedle = '^';
    } else if (nNeedle.startsWith('/') && nNeedle.endsWith('/')) {
        nNeedle = nNeedle.slice(1,-1);
    } else {
        nNeedle = nNeedle.replace(reRegexEscape, '\\$&');
    }
    const rnNeedle = new RegExp(nNeedle, 'i');
    
    if (reNoArg.test(pNeedle)) {
        pNeedle = '^';
    } else if (pNeedle.startsWith('/') && pNeedle.endsWith('/')) {
        pNeedle = pNeedle.slice(1,-1);
    } else {
        pNeedle = pNeedle.replace(reRegexEscape, '\\$&');
    }
    const rpNeedle = new RegExp(pNeedle, 'i');

    Node.prototype.appendChild = new Proxy(Node.prototype.appendChild, {
        apply: function (appendChild, thisArg, args) {
            const newNode = args[0], parent = thisArg;
            
            if ( newNode.matches(nSelector) && parent.matches(pSelector) 
              && rnNeedle.test(newNode.innerHTML) && rpNeedle.test(parent.innerHTML)) {
                console.log('>>> +js(my-no-append-if,%s,%s,%s,%s)', nSelector, pSelector, nNeedle, pNeedle);
                return newNode;
            } else {
                return appendChild.apply(thisArg, args);
            }

        }
    });
})();


// Bypass insertBefore if property match.
// +js(my-no-insert-if, nSelector, pSelector, nNeedle, pNeedle)
/// my-no-insert-if.js
/// alias my-noiif
(function () {
    let nSelector = '{{1}}';
    let pSelector = '{{2}}';
    let nNeedle = '{{3}}';
    let pNeedle = '{{4}}';
    const reNoArg = /^$|^{{\d}}$/;
    const reRegexEscape = /[.*+?^${}()|[\]\\]/g;
    
    if (reNoArg.test(nSelector)) {
        nSelector = '*';
    }
    if (reNoArg.test(pSelector)) {
        pSelector = '*';
    }

    if (reNoArg.test(nNeedle)) {
        nNeedle = '^';
    } else if (nNeedle.startsWith('/') && nNeedle.endsWith('/')) {
        nNeedle = nNeedle.slice(1,-1);
    } else {
        nNeedle = nNeedle.replace(reRegexEscape, '\\$&');
    }
    const rnNeedle = new RegExp(nNeedle, 'i');
    
    if (reNoArg.test(pNeedle)) {
        pNeedle = '^';
    } else if (pNeedle.startsWith('/') && pNeedle.endsWith('/')) {
        pNeedle = pNeedle.slice(1,-1);
    } else {
        pNeedle = pNeedle.replace(reRegexEscape, '\\$&');
    }
    const rpNeedle = new RegExp(pNeedle, 'i');

    Node.prototype.insertBefore = new Proxy(Node.prototype.insertBefore, {
        apply: function (insertBefore, thisArg, args) {
            const newNode = args[0], parent = thisArg;
            
            if ( newNode.matches(nSelector) && parent.matches(pSelector) 
              && rnNeedle.test(newNode.innerHTML) && rpNeedle.test(parent.innerHTML)) {
                console.log('>>> +js(my-no-insert-if,%s,%s,%s,%s)', nSelector, pSelector, nNeedle, pNeedle);
                return newNode;
            } else {
                return insertBefore.apply(thisArg, args);
            }

        }
    });
})();


