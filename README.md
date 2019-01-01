# Morilib Rei: Regular Expression Library For JavaScript

Morilib Rei is a regular expression library for JavaScript.  
Morilib Rei has features shown as follows.

* Building regular expression by JavaScript object
* Regular expression matcher like Java

## How to use

### Browser
```html
<script src="rei.js"></script>
```

## Examples

### Matching URLs of morilib.net
```js
// genreates /http(?:s)?:\\/\\/(?:[a-z])+\\.morilib\\.net/
var regex = Re.i([
  { "anchor": "begin" },
  "http",
  { "maybe": "s" },
  "://",
  {
    "oneOrMore": {
      "charset": {
        "range": {
          "begin": "a",
          "end": "z"
        }
      }
    }
  },
  ".morilib.net"
]);
console.log(regex.test("http://rei.morilib.net"));  // true
```

### Unicode Property
```js
// expands Unicode Property Letter to a character set
var regex = Re.i([
  { "anchor": "begin" },
  {
    "oneOrMore": {
      "unicode": "Letter"
    }
  },
  { "anchor": "end" }
]);
console.log(regex.test("Reiは正規表現のライブラリです"));  // true
```

### Predefined Sequence
```js
var regex = Re.i([
  { "anchor": "begin" },
  { "sequence": "real" },
  { "anchor": "end" }
]);
console.log(regex.test("3.46e+27"));  // true
```

### capturing
```js
var regex = Re.i([
  "<",
  {
    "capture": {
      "oneOrMoreNonGreedy": {
        "charset": "all"
      }
    }
  },
  ">"
]);
console.log(regex.exec("<tag>")[1]);  // "tag"
```

### Named capture
```js
var regex = Re.i([
  "<",
  {
    "capture": {
      "name": "tagname",
      "pattern": {
        "oneOrMoreNonGreedy": {
          "charset": "all"
        }
      }
    }
  },
  ">"
]);
console.log(regex.execWithName("<tag>").tagname);  // "tag"
```

### Using raw regular expression
```js
// capture of raw regex is considered
var regex = Re.i([
  { "raw": "<([^>]+)>" },
  {
    "capture": {
      "name": "body",
      "pattern": {
        "oneOrMoreNonGreedy": {
          "charset": "all"
        }
      }
    }
  },
  { "raw": "</[^>]+>" }
]);
// { 0: "<a>index.html</a>", 1: "a", 2: "index.html", body: "index.html" }
console.log(regex.execWithName("<a>index.html</a>"));
```

### Example of matcher: parsing S-Expression
```js
function parseS(aString) {
    var undef = void 0,
        isDot = false,
        stack = [],
        matching,
        matcher;
    function pushStack(anObject) {
        var stackTop = stack[stack.length - 1];
        if(isDot) {
            stackTop.now.cdr = anObject;
            isDot = false;
        } else {
            if(!stackTop.now) {
                stackTop.now = stackTop.start;
            } else {
                stackTop.now = stackTop.now.cdr;
            }
            stackTop.now.car = anObject;
            stackTop.now.cdr = {};
        }
    }

    matcher = Re.i(/$/g).matcher(aString);
    while(!matcher.usePattern(Re.i({ "anchor": "end" }, "global")).lookingAt()) {
        if(matcher.usePattern(Re.i("(", "global")).lookingAt()) {
            stack.push({
                start: {},
                now: null
            });
            matching = undef;
        } else if(matcher.usePattern(Re.i(")", "global")).lookingAt()) {
            matching = stack.pop().start;
        } else if(matcher.usePattern(Re.i([ ".", { "lookahead": { "charset": "space" } } ], "global")).lookingAt()) {
            if(isDot || !stack[stack.length - 1].now) {
                throw new Error("invalid dot");
            }
            matching = undef;
            isDot = true;
        } else if(matcher.usePattern(Re.i({ "sequence": "real" }, "global")).lookingAt()) {
            matching = parseFloat(matcher.group[0]);
        } else if(matcher.usePattern(Re.i({ "oneOrMore": { "charset": "nonspace" } }, "global")).lookingAt()) {
            matching = matcher.group[0];
        }

        if(matching === undef) {
            // do nothing
        } else if(stack.length === 0) {
            return matching;
        } else {
            pushStack(matching);
        }
        matcher.usePattern(Re.i({ "zeroOrMore": { "charset": "space" } }, "global")).lookingAt();
    }
    return undef;
}
```
