/*
    The scriptlets below are meant to be injected only into a web page context.

    https://github.com/gorhill/uBlock/blob/master/assets/resources/scriptlets.js
    https://raw.githubusercontent.com/gorhill/uBlock/master/assets/resources/scriptlets.js

    https://github.com/NanoAdblocker/NanoCore2/blob/master/src/snippets.js
    https://raw.githubusercontent.com/NanoAdblocker/NanoCore2/master/src/snippets.js

    https://github.com/uBlock-user/uBO-Scriptlets/blob/master/scriptlets.js
    https://raw.githubusercontent.com/uBlock-user/uBO-Scriptlets/master/scriptlets.js
    
    https://github.com/whileloopa/uBO-Resources/blob/master/resources_my.js
    https://raw.githubusercontent.com/whileloopa/uBO-Resources/master/resources_my.js

    https://www.dropbox.com/s/rqnyd24mgwpm31i/resources_my.js?dl=0
    https://dl.dropboxusercontent.com/s/rqnyd24mgwpm31i/resources_my.js?dl=0
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
/// my-event-passiveness-if
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
			return Reflect.apply(...arguments);
        }
    });
	self.EventTarget.prototype.addEventListener = proxy;
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
// +js(my-noappend-if, cAttr@@cNeedle;;..., pAttr@@pNeedle;;...)
/// my-noappend-if.js
(function () {
    let childAttributeList = '{{1}}';
    let parentAttributeList = '{{2}}';
    childAttributeList = childAttributeList ? childAttributeList.split(';;') : [];
    parentAttributeList = parentAttributeList ? parentAttributeList.split(';;') : [];
    
    for (let attr, needle, i=0; i<childAttributeList.length; i++) {
        [attr, needle] = childAttributeList[i].split('@@');
        if (needle.startsWith('/') && needle.endsWith('/')) {
            needle = new RegExp(needle.slice(1, -1));
        }
        childAttributeList[i] = [attr, needle];
    }
    for (let attr, needle, i=0; i<parentAttributeList.length; i++) {
        [attr, needle] = parentAttributeList[i].split('@@');
        if (needle.startsWith('/') && needle.endsWith('/')) {
            needle = new RegExp(needle.slice(1, -1));
        }
        parentAttributeList[i] = [attr, needle];
    }

    Node.prototype.appendChild = new Proxy(Node.prototype.appendChild, {
        apply: function (appendChild, thisArg, args) {
            const child = args[0], parent = thisArg;
            let block = true;
            for (const [attr, needle] of childAttributeList) {
                let prop = child.hasAttribute(attr) ? child.getAttribute(attr) : child[attr];
                if (prop === undefined) {
                    block = false;
                    break;
                }
                else {
                    prop = prop.toString();
                    if ((typeof needle === 'string' && prop.indexOf(needle)<0) || 
                      (needle && needle.constructor === RegExp && !needle.test(prop))) {
                        block = false;
                        break;
                    }
                }
            }
            for (const [attr, needle] of parentAttributeList) {
                let prop = parent.hasAttribute(attr) ? parent.getAttribute(attr) : parent[attr];
                if (prop === undefined) {
                    block = false;
                    break;
                }
                else {
                    prop = prop.toString();
                    if ((typeof needle === 'string' && prop.indexOf(needle)<0) || 
                      (needle && needle.constructor === RegExp && !needle.test(prop))) {
                        block = false;
                        break;
                    }
                }
            }
            if ( block === false ) {
                return appendChild.apply(thisArg, args);
            }
            else {
                return child;
            }
        }
    });
    console.log('>>> my-noappend-if:', childAttributeList);
})();



// Bypass insertBefore if property match.
// +js(my-noinsert-if, cAttr@@cNeedle;;..., pAttr@@pNeedle;;...)
/// my-noinsert-if.js
(function () {
    let childAttributeList = '{{1}}';
    let parentAttributeList = '{{2}}';
    childAttributeList = childAttributeList ? childAttributeList.split(';;') : [];
    parentAttributeList = parentAttributeList ? parentAttributeList.split(';;') : [];
    
    for (let attr, needle, i=0; i<childAttributeList.length; i++) {
        [attr, needle] = childAttributeList[i].split('@@');
        if (needle.startsWith('/') && needle.endsWith('/')) {
            needle = new RegExp(needle.slice(1, -1));
        }
        childAttributeList[i] = [attr, needle];
    }
    for (let attr, needle, i=0; i<parentAttributeList.length; i++) {
        [attr, needle] = parentAttributeList[i].split('@@');
        if (needle.startsWith('/') && needle.endsWith('/')) {
            needle = new RegExp(needle.slice(1, -1));
        }
        parentAttributeList[i] = [attr, needle];
    }

    Node.prototype.insertBefore = new Proxy(Node.prototype.insertBefore, {
        apply: function (insertBefore, thisArg, args) {
            const child = args[0], parent = thisArg;
            let block = true;
            for (const [attr, needle] of childAttributeList) {
                let prop = child.hasAttribute(attr) ? child.getAttribute(attr) : child[attr];
                if (prop === undefined) {
                    block = false;
                    break;
                }
                else {
                    prop = prop.toString();
                    if ((typeof needle === 'string' && prop.indexOf(needle)<0) || 
                      (needle && needle.constructor === RegExp && !needle.test(prop))) {
                        block = false;
                        break;
                    }
                }
            }
            for (const [attr, needle] of parentAttributeList) {
                let prop = parent.hasAttribute(attr) ? parent.getAttribute(attr) : parent[attr];
                if (prop === undefined) {
                    block = false;
                    break;
                }
                else {
                    prop = prop.toString();
                    if ((typeof needle === 'string' && prop.indexOf(needle)<0) || 
                      (needle && needle.constructor === RegExp && !needle.test(prop))) {
                        block = false;
                        break;
                    }
                }
            }
            if ( block === false ) {
                return insertBefore.apply(thisArg, args);
            }
            else {
                return child;
            }
        }
    });
    console.log('>>> my-noinsert-if:', childAttributeList);
})();





