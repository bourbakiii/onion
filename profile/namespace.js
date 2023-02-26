/**
 *  @pkg Namespace.js
 *  @description Namespace utility
 *  @license MIT
 *  @version 1.3
 */

/* jslint evil : true */
/* globals XMLHttpRequest, ActiveXObject, window, document */
/* exported Namespace */
/**
 * @global
 * @const
 * @class
 * @variation 2
 * @type {(function(string): (*))|*}
 */
const Namespace = (function (lodash) {
    const _listeners = {};
    const _includedIdentifiers = [];
    let _lodash = null;

    if (typeof (lodash) === 'function') {
        _lodash = lodash;
    }


    /**
     * Returns an object in an array unless the object is an array
     *
     * @return  {Array}
     * @param obj
     */
    const _toArray = function (obj) {
        // checks if it's an array
        if ((typeof obj === 'object') && obj.sort) {
            return obj;
        }
        return Array(obj);
    };

    /**
     * Creates an XMLHttpRequest object
     *
     * @return XMLHttpRequest
     * @deprecated
     */
    const _createXmlHttpRequest = function () {
        let xhr = undefined;
        try {
            xhr = new XMLHttpRequest;
        } catch (e) {
            try {
                xhr = new ActiveXObject('Msxml2.XMLHTTP.6.0');
            } catch (e2) {
                try {
                    xhr = new ActiveXObject('Msxml2.XMLHTTP.3.0');
                } catch (e3) {
                    try {
                        xhr = new ActiveXObject('Msxml2.XMLHTTP');
                    } catch (e4) {
                        try {
                            xhr = new ActiveXObject('Microsoft.XMLHTTP');
                        } catch (e5) {
                            throw new Error('This browser does not support XMLHttpRequest.');
                        }
                    }
                }
            }
        }
        return xhr;
    };

    /**
     * Checks if a http request is successful based on its status code.
     * Borrowed from dojo (http://www.dojotoolkit.org).
     *
     * @param    status integer  Http status code
     * @return  boolean
     * @deprecated
     */
    const _isHttpRequestSuccessful = function (status/*: int */) {
        return ((status >= 200) && (status < 300)) ||
            (status === 304) ||
            (status === 1223) ||
            (!status && ((window.location.protocol === 'file:') || (window.location.protocol === 'chrome:')));
    }

    /**
     * Creates a script tag with the specified data as content
     * @todo Move out from Namespace module
     * @param {string}    data    Contents of the script
     */
    const _createScript = function (data) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.text = data;
        if (typeof window['execScript'] === 'object') {
            // According to IE
            window['execScript'](data);
        } else {
            try {
                // Attempt body insertion
                document.body.appendChild(script);
            } catch (e) {
                // Fall back on eval
                window['eval'](data);
            }
        }
    };

    /**
     * Dispatches an event
     *
     * @param {string} eventName   Event name to dispatch
     * @param {object} properties  Event props
     */
    const _dispatchEvent = function (eventName, properties) {
        if (!_listeners[eventName]) {
            return;
        }
        properties.event = eventName;
        let i = 0;
        while (i < _listeners[eventName].length) {
            _listeners[eventName][i](properties);
            i++;
        }
    };

    /**
     * Creates an Object following the specified namespace identifier.
     *
     * @param    {string}    identifier    The namespace string
     * @param    {object}    [classes]        (OPTIONAL) An object which properties will be added to the namespace
     * @return   {Window|Class.<string, function>}                The most inner object
     * @public
     */
    const _namespace = function (identifier) {
        const classes = arguments[1] || false;
        let ns = window;
        if (identifier !== '') {
            if (!_lodash.has(ns, identifier)) {
                _lodash.set(ns, identifier, {});
            } else {
                return _lodash.get(ns, identifier);
            }
        }

        if (classes) {
            if (typeof (classes) == 'function') {
                _lodash.set(ns, identifier, classes);
            } else {
                for (let klass in classes) {
                    if (classes.hasOwnProperty(klass)) {
                        _lodash.set(ns, `${identifier}.${klass}`, classes[klass]);
                    }
                }
            }
        }

        _dispatchEvent('create', {'identifier': identifier});
        return ns;
    };

    /**
     * Checks if the specified identifier is defined
     *
     * @public
     * @param    {string}    identifier    The namespace identifier
     * @return    {boolean}
     */
    _namespace.exist = function (identifier) {
        if (identifier === '') {
            return true;
        }
        let ns = window;
        let $  = _lodash;

        return $.has(ns, identifier);
    };

    /**
     * Maps an identifier to an uri. It is public, so it can be overridden by custom scripts.
     *
     * @public
     * @param {string}  identifier  The namespace identifier
     * @return    {string}    The uri
     * @deprecated
     */
    _namespace.mapIdentifierToUri = function (identifier) {
        const regexp = new RegExp('\\' + Namespace.separator, 'g');
        return Namespace.baseUri + identifier.replace(regexp, '/') + '.js';
    };

    /**
     * Loads a remote script after mapping the identifier to an uri
     *
     * @param    {string}        identifier            The namespace identifier
     * @param    {function}    [successCallback]        When set, the file will be loaded asynchronously. Will be called when the file is loaded
     * @param    {function}    [errorCallback]        Callback to be called when an error occurs
     * @return   {boolean}                        Success of failure when loading synchronously
     * @deprecated
     */
    const _loadScript = function (identifier) {
        const successCallback = arguments[1];
        const errorCallback = arguments[2];
        const async = typeof successCallback === 'function';
        const uri = _namespace.mapIdentifierToUri(identifier);
        const event = {
            'identifier': identifier,
            'uri': uri,
            'async': async,
            'callback': successCallback
        };
        const xhr = _createXmlHttpRequest();
        xhr.open('GET', uri, async);

        if (async) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (_isHttpRequestSuccessful(xhr.status || 0)) {
                        _createScript(xhr.responseText);
                        _dispatchEvent('include', event);
                        successCallback();
                        return;
                    }
                    event.status = xhr.status;
                    _dispatchEvent('includeError', event);
                    if (typeof errorCallback === 'function') {
                        errorCallback();
                    }
                }
            };
        }

        xhr.send(null);
        if (!async) {
            if (_isHttpRequestSuccessful(xhr.status || 0)) {
                _createScript(xhr.responseText);
                _dispatchEvent('include', event);
                return true;
            }
            event.status = xhr.status;
            _dispatchEvent('includeError', event);
            return false;
        }
    };

    /**
     * Includes a remote javascript file identified by the specified namespace string. The identifier
     * must point to a class. Separator in the string will be recursively converted to slash and the .js extension
     * will be appended.
     *
     * @public
     * @param    {string}        identifier    The namespace string
     * @param    {function}    [callback]    Optional: a function to invoke when the remote script has been included
     * @deprecated
     */
    _namespace.include = function (identifier) {
        const successCallback = arguments[1] || false;
        const errorCallback = arguments[2] || false;
        // checks if the identifier is not already included
        if (_includedIdentifiers[identifier]) {
            if (typeof successCallback === 'function') {
                successCallback();
            }
            return true;
        }
        if (successCallback) {
            _loadScript(identifier, (function () {
                _includedIdentifiers[identifier] = true;
                successCallback();
            }), errorCallback);
        } else {
            if (_loadScript(identifier)) {
                _includedIdentifiers[identifier] = true;
                return true;
            }
            return false;
        }
    };

    /**
     * Imports properties from the specified namespace to the global space (i.e. under window)
     *
     * The identifier string can contain the * wildcard character as its last segment (eg: com.test.*)
     * which will import all properties from the namespace.
     *
     * If not, the targeted namespace will be imported (i.e. if 'com.test' is imported, the test object
     * will now be global). If the targeted object is not found, it will be included using include().
     *
     * @public
     * @todo      Remove deprecated code
     * @param    {string}        identifier    The namespace string
     * @param    {function}    [callback]    (OPTIONAL) A function to call when the process is completed (including the include() if used)
     * @param    {boolean}    [autoInclude]    (OPTIONAL) Whether to automatically auto include the targeted object is not found. Default is Namespace.autoInclude
     */
    _namespace.use = function (identifier) {
        const identifiers = _toArray(identifier);
        const callback = arguments[1] || false;
        const autoInclude = arguments.length > 2 ? arguments[2] : Namespace.autoInclude;
        const event = {'identifier': identifier};
        let parts = undefined;
        let target = undefined;
        let ns = undefined;
        let i = 0;
        while (i < identifiers.length) {
            identifier = identifiers[i];
            parts = identifier.split(Namespace.separator);
            target = parts.pop();
            ns = _namespace(parts.join(Namespace.separator));
            if (target === '*') {
                // imports all objects from the identifier, can't use include() in that case
                for (let objectName in ns) {
                    if (ns.hasOwnProperty(objectName)) {
                        window[objectName] = ns[objectName];
                    }
                }
            } else {
                // imports only one object
                if (ns[target]) {
                    // the object exists, import it
                    window[target] = ns[target];
                } else {
                    // the object does not exist
                    if (autoInclude) {
                        // try to auto include it
                        if (callback) {
                            _namespace.include(identifier, function () {
                                window[target] = ns[target];
                                if ((i + 1) < identifiers.length) {
                                    // we continue to unpack the rest from here
                                    _namespace.use(identifiers.slice(i + 1), callback, autoInclude);
                                } else {
                                    // no more identifiers to unpack
                                    _dispatchEvent('use', event);
                                    if (typeof callback === 'function') {
                                        callback();
                                    }
                                }
                            });
                            return;
                        } else {
                            _namespace.include(identifier);
                            window[target] = ns[target];
                        }
                    }
                }
            }
            i++;
        }
        // all identifiers have been unpacked
        _dispatchEvent('use', event);
        if (typeof callback === 'function') {
            callback();
        }
    };

    /**
     * Binds the include() and use() methods to a specified identifier
     *
     * @public
     * @param    {string} identifier    The namespace identifier
     * @return   {object}
     */
    _namespace.from = function (identifier) {
        return {
            include() {
                const callback = arguments[0] || false;
                _namespace.include(identifier, callback);
            },
            use(_identifier) {
                const callback = arguments[1] || false;
                if (_identifier.charAt(0) === '.') {
                    _identifier = identifier + _identifier;
                }
                if (callback) {
                    _namespace.include(identifier, function () {
                        _namespace.use(_identifier, callback, false);
                    });
                } else {
                    _namespace.include(identifier);
                    _namespace.use(_identifier, callback, false);
                }
            }

        };
    };

    /**
     * Registers a namespace so it won't be included
     * @todo Modify to
     *
     * Idea and code submitted by Nathan Smith (http://github.com/smith)
     *
     * @param    {string|array}    identifier
     */

    _namespace.provide = function (identifier) {
        let $ = _lodash;

        if (!$.has(window, identifier) && !_includedIdentifiers[identifier]) {
            _dispatchEvent('provide', {'identifier': identifier});
            _includedIdentifiers[identifier] = true;
        }
    };

    /**
     * Registers a function to be called when the specified event is dispatched
     *
     * @param    {string}        eventName   Event name
     * @param    {function}    callback    Callback function
     */
    _namespace.addEventListener = function (eventName, callback) {
        if (!_listeners[eventName]) {
            _listeners[eventName] = [];
        }
        _listeners[eventName].push(callback);
    };

    /**
     * Unregisters an event listener
     *
     * @param   {string}      eventName  Event name
     * @param   {function}    callback   Callback function
     */
    _namespace.removeEventListener = function (eventName, callback) {
        if (!_listeners[eventName]) {
            return;
        }
        let i = 0;
        while (i < _listeners[eventName].length) {
            if (_listeners[eventName][i] === callback) {
                delete _listeners[eventName][i];
                return;
            }
            i++;
        }
    };

    /**
     * Adds methods to javascript native's object
     * Inspired by http://thinkweb2.com/projects/prototype/namespacing-made-easy/
     *
     * @public
     */
    _namespace.registerNativeExtensions = function () {

        /**
         * @see Namespace
         */

        String.prototype.namespace = function () {
            const classes = arguments[0] || {};
            return _namespace(this.valueOf(), classes);
        };

        /**
         * @see Namespace#include
         */

        String.prototype.include = function () {
            const callback = arguments[0] || false;
            return _namespace.include(this.valueOf(), callback);
        };

        /**
         * @see Namespace#use
         */

        String.prototype.use = function () {
            const callback = arguments[0] || false;
            return _namespace.use(this.valueOf(), callback);
        };

        /**
         * @see Namespace.from()
         */

        String.prototype.from = function () {
            return _namespace.from(this.valueOf());
        };

        /**
         * @see Namespace.provide()
         * Idea and code submitted by Nathan Smith (http://github.com/smith)
         */

        String.prototype.provide = function () {
            return _namespace.provide(this.valueOf());
        };

        /**
         * @see Namespace.use()
         */

        Array.prototype.use = function () {
            const callback = arguments[0] || false;
            return _namespace.use(this, callback);
        };

        /**
         * @see Namespace.provide()
         */

        Array.prototype.provide = function () {
            return _namespace.provide(this);
        };

    };

    return _namespace;
})(_);

/**
 * Namespace segment separator
 *
 * @var String
 */

Namespace.separator = '.';

/**
 * Base uri when using Namespace.include()
 * Must end with a slash
 *
 * @var String
 */

Namespace.baseUri = './';

/**
 * Whether to automatically call Namespace.include() when Namespace.import()
 * does not find the targeted object.
 *
 * @var Boolean
 */

Namespace.autoInclude = true;
