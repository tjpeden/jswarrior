jQuery.LangExt = {version: '0.1'};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = function() {};

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
/**
 * class Object
 */

(function($) {
  Object.identity = function(x) { return x; }

  var _toString = Object.prototype.toString,
        NULL_TYPE = 'Null',
        UNDEFINED_TYPE = 'Undefined',
        BOOLEAN_TYPE = 'Boolean',
        NUMBER_TYPE = 'Number',
        STRING_TYPE = 'String',
        OBJECT_TYPE = 'Object',
        FUNCTION_CLASS = '[object Function]',
        BOOLEAN_CLASS = '[object Boolean]',
        NUMBER_CLASS = '[object Number]',
        STRING_CLASS = '[object String]',
        ARRAY_CLASS = '[object Array]',
        DATE_CLASS = '[object Date]',
        NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON &&
          typeof JSON.stringify === 'function' &&
          JSON.stringify(0) === '0' &&
          typeof JSON.stringify(Object.identity) === 'undefined';

  function Type(o) {
    switch(o) {
      case null: return NULL_TYPE;
      case (void 0): return UNDEFINED_TYPE;
    }
    var type = typeof o;
    switch(type) {
      case 'boolean': return BOOLEAN_TYPE;
      case 'number':  return NUMBER_TYPE;
      case 'string':  return STRING_TYPE;
    }
    return OBJECT_TYPE;
  }

  var toJSON = (function() {
    function to_json(value) {
      return Str('', { '': value }, []);
    }

    function stringify(object) {
      return JSON.stringify(object);
    }

    return NATIVE_JSON_STRINGIFY_SUPPORT ? stringify : to_json;
  })();

  function Str(key, holder, stack) {
      var value = holder[key],
          type = typeof value;

      if (Type(value) === OBJECT_TYPE && typeof value.toJSON === 'function') {
        value = value.toJSON(key);
      }

      var _class = _toString.call(value);

      switch (_class) {
        case NUMBER_CLASS:
        case BOOLEAN_CLASS:
        case STRING_CLASS:
          value = value.valueOf();
      }

      switch (value) {
        case null: return 'null';
        case true: return 'true';
        case false: return 'false';
      }

      type = typeof value;
      switch (type) {
        case 'string':
          return value.inspect(true);
        case 'number':
          return isFinite(value) ? String(value) : 'null';
        case 'object':

          for (var i = 0, length = stack.length; i < length; i++) {
            if (stack[i] === value) { throw new TypeError(); }
          }
          stack.push(value);

          var partial = [];
          if (_class === ARRAY_CLASS) {
            for (var i = 0, length = value.length; i < length; i++) {
              var str = Str(i, value, stack);
              partial.push(typeof str === 'undefined' ? 'null' : str);
            }
            partial = '[' + partial.join(',') + ']';
          } else {
            var keys = Object.keys(value);
            for (var i = 0, length = keys.length; i < length; i++) {
              var key = keys[i], str = Str(key, value, stack);
              if (typeof str !== "undefined") {
                 partial.push(key.inspect(true)+ ':' + str);
               }
            }
            partial = '{' + partial.join(',') + '}';
          }
          stack.pop();
          return partial;
      }
    }

  Object.extend = $.extend;

  var methods = {
    inspect: function(object) {
      try {
        if(Object.isUndefined(object)) return 'undefined';
        if(object === null) return 'null';

        return object.inspect ? object.inspect() : String(object);
      } catch(e) {
        if( e instanceof RangeError ) return '...';
        throw e;
      }
    },

    toJSON: toJSON,

    stringify: function(object) {
      return JSON.stringify(object);
    },

    keys: function(object) {
      if( Type(object) !== OBJECT_TYPE ) throw new TypeError();

      var results = [];
      for( var property in object ) {
        if( object.hasOwnProperty(property) )
          results.push(property);
      }
      return results;
    },

    values: function(object) {
      var results = [];
      for( var property in object )
        results.push(object[property]);
      return results;
    },

    clone: function(object) {
      return $.extend({}, object);
    },

    isElement: function(object) {
      return !!(object && object.nodeType == 1);
    },

    isArray: function(object) {
      return _toString.call(object) === ARRAY_CLASS;
    },

    isHash: function(object) {
      return object instanceof Hash;
    },

    isFunction: function(object) {
      return _toString.call(object) === FUNCTION_CLASS;
    },

    isString: function(object) {
      return _toString.call(object) === STRING_CLASS;
    },

    isNumber: function(object) {
      return _toString.call(object) === NUMBER_CLASS;
    },

    isDate: function(object) {
      return _toString.call(object) === DATE_CLASS;
    },

    isUndefined: function(object) {
      return typeof object === "undefined";
    }
  };

  var hasNativeIsArray = (typeof Array.isArray == 'function')
    && Array.isArray([]) && !Array.isArray({});

  if( hasNativeIsArray ) methods.isArray = Array.isArray;

  $.extend(Object, methods);
})(jQuery);
/**
 * class Function
 */

(function($) {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while(length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  $.extend(Function.prototype, {
    argumentNames: function() {
      var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
        .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
        .replace(/\s+/g, '').split(',');
      return names.length == 1 && !names[0] ? [] : names;
    },

    bind: function(context) {
      if(arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
      var __method = this, args = slice.call(arguments, 1)
      return function() {
        var a = merge(args, arguments);
        return __method.apply(context, a);
      }
    },

    wrap: function(wrapper) {
      var __method = this;
      return function() {
        var a = update([__method.bind(this)], arguments);
        return wrapper.apply(this, a);
      }
    }
  });
})(jQuery);
/**
 * class RegExp
 */

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
/**
 * class String
 */

(function($) {
  var _proto = String.prototype;

  var NATIVE_JSON_PARSE_SUPPORT = window.JSON &&
    typeof JSON.parse === 'function' &&
    JSON.parse('{"test": true}').test;

  var evalJSON = (function() {
    function evalJSON(sanitize) {
      var json = this.unfilterJSON(),
          cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
      if (cx.test(json)) {
        json = json.replace(cx, function (a) {
          return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }
      try {
        if (!sanitize || json.isJSON()) return eval('(' + json + ')');
      } catch (e) { }
      throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
    }

    function parseJSON() {
      var json = this.unfilterJSON();
      return JSON.parse(json);
    }

    return NATIVE_JSON_PARSE_SUPPORT ? parseJSON : evalJSON;
  })();

  function prepareReplacement(replacement) {
    if(Object.isFunction(replacement)) return replacement;

    var template = new Template(replacement);

    return function(match) { return template.evaluate(match); };
  }

  var methods = {
    gsub: function(pattern, replacement) {
      var result = '', source = this, match;
      replacement = prepareReplacement(replacement);

      if(Object.isString(pattern))
        pattern = RegExp.escape(pattern);

      if(!(pattern.length || pattern.source)) {
        replacement = replacement('');
        return replacement + source.split('').join(replacement) + replacement;
      }

      while(source.length > 0) {
        if(match = source.match(pattern)) {
          result += source.slice(0, match.index);
          result += String.interpret(replacement(match));
          source  = source.slice(match.index + match[0].length);
        } else {
          result += source, source = '';
        }
      }
      return result;
    },

    sub: function(pattern, replacement, count) {
      replacement = prepareReplacement(replacement);
      count = Object.isUndefined(count) ? 1 : count;

      return this.gsub(pattern, function(match) {
        if(--count < 0) return match[0];
        return replacement(match);
      });
    },

    scan: function(pattern) {
      var result = [], source = this, match;

      if(Object.isString(pattern)) pattern = RegExp.escape(pattern);

      while(source.length > 0) {
        if(match = source.match(pattern)) {
          result.push(match[0]);
          source = source.slice(match.index + match[0].length);
        } else {
          source = '';
        }
      }

      return result;
    },

    truncate: function(length, truncation) {
      length = length || 30;
      truncation = Object.isUndefined(truncation) ? '...' : truncation;

      return this.length > length ?
        this.slice(0, length - truncation.length) + truncation : String(this);
    },

    strip: _proto.trim || function() { return this.replace(/^\s+/, '').replace(/\s+$/, ''); },
    stripTags: function() { return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, ''); },
    stripScripts: function() { return this.replace(new RegExp(String.script, 'img'), ''); },
    extractStripts: function() {
      var matchAll = new RegExp(String.script, 'img'),
          matchOne = new RegExp(String.script, 'im');

      return (this.match(matchAll) || []).map(function(scriptTag) {
        return (scriptTag.match(matchOne) || ['', ''])[1];
      });
    },

    evalScripts: function() {
      return this.extractStripts().map(function(script) { return eval(script); });
    },

    escapeHTML: function() {
      return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    unescapeHTML: function() {
      return this.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    },

    toArray: function() { return this.split(''); },

    succ: function() {
      return this.slice(0, this.length - 1) +
        String.fromCharCode(this.charCodeAt(this.length -1) + 1);
    },

    time: function(count) { return count < 1 ? '' : new Array(count + 1).join(this); },

    camelize: function() {
      return this.replace(/-+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    },

    capitalize: function() {
      return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
    },

    underscore: function() {
      return this.replace(/::/g, '/')
                 .replace(/([A-Z]+)([A-Z[a-z])/g, '$1_$2')
                 .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                 .replace(/-/g, '_')
                 .toLowerCase();
    },

    dasherize: function() { return this.replace(/_/g, '-'); },

    inspect: function(useDoubleQuotes) {
      var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
        if(character in String.specialChar)
          return String.specialChar[character];
        return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
      });

      if(useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\\'') + '"';
      return "'" + escapedString.replace(/'/g, '\\\'') + "'";
    },

    unfilterJSON: function(filter) { return this.replace(filter || String.JSONFilter, '$1'); },

    isJOSN: function() {
      var str = this;
      if (str.blank()) return false;
      str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
      str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
      str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
      return (/^[\],:{}\s]*$/).test(str);
    },

    evalJSON: evalJSON,

    include: function(pattern) { return this.indexOf(pattern) > -1; },
    startsWith: function(pattern) { return this.lastIndexOf(pattern, 0) === 0; },
    endsWith: function(pattern) {
      var d = this.length - pattern.length;
      return d >= 0 && this.indexOf(pattern, d) === d;
    },

    empty: function() { return this == ''; },
    blank: function() { return /^\s*$/.test(this); },
    interpolate: function(object, pattern) { return new Template(this, pattern).evaluate(object); }
  };

  $.extend(String, {
    interpret: function(value) {
      return value == null ? '' : String(value);
    },

    specialChar: {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '\\': '\\\\'
    },

    script: '<script[^>]*>([\\S\\s]*?)<\/script>',
    JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/
  });

  $.extend(_proto, methods);
})(jQuery);
/**
 * class Template
 */

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if(object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if(object == null) return match[1] + '';

      var before = match[1] || '';
      if(before == '\\') return match[2];

      var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

      match = pattern.exec(expr);
      if(match == null) return before;

      while(match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];

        if(null == ctx || '' == match[3]) break;

        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});

Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
/**
 * module Enumerable
 */

var $break = {};

(function($) {
  function collect(iterator, context) {
    iterator = iterator || Object.identity;
    var results = [];

    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function findAll(iterator, context) {
    var results = [];

    this.each(function(value, index) {
      if(iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function detect(iterator, context) {
    var result;

    this.each(function(value, index) {
      if(iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function toArray() { return this.map(); }

  var methods = {
    each: function(iterator, context) {
      try {
        this._each(function(value, index) {
          iterator.call(context, value, index);
        } );
      } catch(e) {
        if(e != $break) throw e;
      }
      return this;
    },

    eachSlice: function(number, iterator, context) {
      var index = -number, slices = [], array = this.toArray();

      if(number < 1) return array;
      while((index += number) < array.length)
        slices.push(array.slice(index, index+number));
      return slices.collect(iterator, context);
    },

    all: function(iterator, context) {
      iterator = iterator || Object.identity;
      var result = true;

      this.each(function(value, index) {
        result = result && !!iterator.call(context, value, index);
        if(!result) throw $break;
      });
      return result;
    },

    any: function(iterator, context) {
      iterator = iterator || Object.identity;
      var result = false;

      this.each(function(value, index) {
        if(result = !!iterator.call(context, value, index))
          throw $break;
      });
      return result;
    },

    grep: function(filter, iterator, context) {
      iterator = iterator || Object.identity;
      var results = [];

      if(Object.isString(filter))
        filter = new RegExp(RegExp.escape(filter));

      this.each(function(value, index) {
        if(filter.match(value))
          results.push(iterator.call(context, value, index));
      });
      return results;
    },

    include: function(object) {
      if(Object.isFunction(this.indexOf))
        return (this.indexOf(object) != -1); // Why wouldn't you trust this result?

      var found = false;
      this.each(function(value) {
        if(value == object) {
          found = true;
          throw $break;
        }
      });
      return found;
    },

    inGroupsOf: function(number, fillWith) {
      fillWith = Object.isUndefined(fillWith) ? null : fillWith;

      return this.eachSlice(number, function(slice) {
        while(slice.length < number) slice.push(fillWith);
        return slice;
      });
    },

    inject: function(memo, iterator, context) {
      this.each(function(value, index) {
        memo = iterator.call(context, memo, value, index);
      });
      return memo;
    },

    invoke: function(method) {
      var args = $A(arguments).slice(1);

      return this.map(function(value) {
        return value[method].apply(value, args);
      });
    },

    max: function(iterator, context) {
      iterator = iterator || Object.identity;
      var result;

      this.each(function(value, index) {
        value = iterator.call(context, value, index);

        if(result == null || value >= result)
          result = value;
      });
      return result;
    },

    min: function(iterator, context) {
      iterator = iterator || Object.identity;
      var result;

      this.each(function(value, index) {
        value = iterator.call(context, value, index);

        if(result == null || value < result)
          result = value;
      });
      return result;
    },

    partition: function(iterator, context) {
      iterator = iterator || Object.identity;
      var trues = [], falses = [];

      this.each(function(value, index) {
        (iterator.call(context, value, index) ?
          trues : falses).push(value);
      });
      return [trues, falses];
    },

    pluck: function(property) {
      var results = [];

      this.each(function(value) {
        results.push(value[property]);
      });
      return results;
    },

    reject: function(iterator, context) {
      var results = [];

      this.each(function(value, index) {
        if(!iterator.call(context, value, index))
          results.push(value);
      });
      return results;
    },

    sortBy: function(iterator, context) {
      return this.map(function(value, index) {
        return {
          value: value,
          criteria: iterator.call(context, value, index)
        };
      }).sort(function(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
      }).pluck('value');
    },

    zip: function() {
      iterator = Object.identity, args = $A(arguments);

      if(Object.isFunction(args.last()))
        iterator = args.pop();

      var collections = [this].concat(args).map($A);

      return this.map(function(value, index) {
        return iterator(collections.pluck(index));
      });
    },

    size: function() { return this.toArray().length; },

    inspect: function() { return '#<Enumerable:' + this.toArray().inspect() + '>'; },
    collect: collect,
    map: collect,
    detect: detect,
    find: detect,
    findAll: findAll,
    select: findAll,
    toArray: toArray,
    entries: toArray
  };

  window.Enumerable = $.extend({}, methods);
})(jQuery);
/**
 * class Array
 */

function $A(iterable) {
  if(!iterable) return [];

  if('toArray' in Object(iterable)) return iterable.toArray();

  var length = iterable.length || 0, results = new Array(length);

  while(length--) results[length] = iterable[length];
  return results;
}

function $w(string) {
  if(!Object.isString(string)) return [];

  string = string.strip();

  return string ? string.split(/\s+/) : [];
}

Array.from = $A;

(function($) {
  var _proto = Array.prototype,
      slice = _proto.slice;

  var _each = (function() {
    function each(iterator, context) {
      for(var i = 0, length = this.length >>> 0; i < length; i++) {
        if(i in this) iterator.call(context, this[i], i, this);
      }
    }

    return _proto.forEach || each;
  })();

  var methods = {
    _each: _each,

    clear: function() {
      this.length = 0;
      return this;
    },

    first: function() { return this[0]; },
    last: function() { return this[this.length - 1]; },

    compact: function() {
      return this.select(function(value) {
        return value != null;
      });
    },

    flatten: function() {
      return this.inject([], function(array, value) {
        if(Object.isArray(value))
          return array.concat(value.flatten());
        array.push(value);
        return array;
      })
    },

    without: function() {
      var values = slice.call(arguments, 0);

      return this.select(function(value) {
        return !values.include(value);
      });
    },

    reverse: function(inline) {
      return (inline === false ? this.toArray() : this)._reverse();
    },

    uniq: function(sorted) {
      return this.inject([], function(array, value, index) {
        if(0 == index || (sorted ? array.last() != value : !array.include(value)))
          array.push(value);
        return array;
      });
    },

    intersect: function(array) {
      return this.uniq().findAll(function(item) {
        return array.detect(function(value) { return item === value });
      });
    },

    clone: function() { return slice.call(this, 0); },
    size: function() { return this.length; },
    inspect: function() { return '[' + this.map(Object.inspect).join(', ') + ']'; }
  };

  $.extend(_proto, Enumerable);

  _proto._reverse || (_proto._reverse = _proto.reverse);

  $.extend(_proto, methods);

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2);

  if(CONCAT_ARGUMENTS_BUGGY) _proto.concat = function() {
    var array = this.clone(), item;

    for(var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];

      if(Object.isArray(item) && !('callee' in item)) {
        for(var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  if(!_proto.indexOf) _proto.indexOf = function(item, i) {
    i || (i = 0);
    var length = this.length;

    if(i < 0) i = length + i;
    for(; i < length; i++)
      if(this[i] === item) return i;
    return -1;
  };

  if(!_proto.lastIndexOf) _proto.lastIndexOf = function(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);

    return (n < 0) ? n : i - n - 1;
  };
})(jQuery);
/**
 * class Hash
 */

function $H(object) {
  return new Hash(object);
}

var Hash = Class.create(Enumerable, {
  initialize: function(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  },

  _each: function(iterator) {
    var index = 0;

    for(var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair, index++);
    }
  },

  set: function(key, value) { return this._object[key] = value; },
  get: function(key) { if(this._object[key] !== Object.prototype[key]) return this._object[key]; },

  unset: function(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  },

  toObject: function() { return Object.clone(this._object); },
  keys: function() { return this.pluck('key'); },
  values: function() { return this.pluck('value'); },

  index: function(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  },

  key: function(key) { return this.keys().include(key); },
  merge: function(object) { return this.clone.update(object); },

  update: function(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  },

  inspect: function() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  },
  clone: function() { return new Hash(this); }
});

Hash.from = $H;
/**
 * class Number
 */

(function($) {
  $.extend(Number.prototype, {
    toColorPart: function() { return this.toPaddedString(2, 16); },
    succ: function() { return this + 1; },
    times: function(iterator, context) {
      $R(0, this, true).each(iterator, context);
      return this;
    },

    toPaddedString: function(length, radix) {
      var string = this.toString(radix || 10);
      return '0'.times(length - string.length) + string;
    },

    abs: function() { return Math.abs(this); },
    round: function() { return Math.round(this); },
    ceil: function() { return Math.ceil(this); },
    floor: function() { return Math.floor(this); },
    clamp: function(min, max) { return Math.min(Math.max(this, min), max); }
  });
})(jQuery);
/**
 * class Range
 */

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start, index = 0;
    while(this.include(value)) {
      iterator(value, index++);
      value = value.succ();
    }
  },

  include: function(value) {
    if(value < this.start)
      return false;
    if(this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});
