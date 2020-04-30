/*
    The scriptlets below are meant to be injected only into a web page context.

    https://github.com/gorhill/uBlock/blob/master/assets/resources/scriptlets.js
    https://raw.githubusercontent.com/gorhill/uBlock/master/assets/resources/scriptlets.js

    https://github.com/NanoAdblocker/NanoCore2/blob/master/src/snippets.js
    https://raw.githubusercontent.com/NanoAdblocker/NanoCore2/master/src/snippets.js

    https://github.com/uBlock-user/uBO-Scriptlets/blob/master/scriptlets.js
    https://raw.githubusercontent.com/uBlock-user/uBO-Scriptlets/master/scriptlets.js

    https://www.dropbox.com/s/rqnyd24mgwpm31i/resources_my.js?dl=0
    https://dl.dropboxusercontent.com/s/rqnyd24mgwpm31i/resources_my.js
*/

"use strict";

/// test.js
(function () {
    let needle = '{{1}}';
    console.log('>>> Scriptlets injected: ' + needle);
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





