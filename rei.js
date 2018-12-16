/*
 * Morilib Rei
 *
 * Copyright (c) 2018 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
(function(root) {
    var undef = void 0,
        Rei;
    function isArray(anObject) {
        return Object.prototype.toString.call(anObject) === '[object Array]';
    }
    function isObject(anObject) {
        return typeof anObject === "object" && anObject !== null;
    }
    function isCharacter(anObject) {
        return typeof anObject === "string" && anObject.length === 1;
    }
    function getOneAndOnlyField(obj) {
        var res = undef;
        for(i in obj) {
            if(obj.hasOwnProperty(i)) {
                if(res === undef) {
                    res = i;
                } else {
                    throw new Error("There are two fields in object");
                }
            }
        }
        if(res === undef) {
            throw new Error("No fields in object");
        }
        return res;
    }
    function createModule() {
        var characterSetNotation,
            regexNotation;
        function escapeCharacterSetFunnyCharacter(aString) {
            return aString.replace(/([\/\.\\\[\]\|\^\$\(\)\*\+\?\{\}\-])/g, "\\$1");
        }
        function createCharacterSetNotation() {
            var notation,
                definedSet;
            notation = [
                {
                    pattern: /^all$/i,
                    action: function(json) {
                        return "[\\S\\s]";
                    }
                },
                {
                    pattern: /^(?:all)?Except(?:NewLine|NL|BR)$/i,
                    action: function(json) {
                        return ".";
                    }
                },
                {
                    pattern: /^range$/i,
                    action: function(json) {
                        var beginChar,
                            endChar;
                        beginChar = isCharacter(json["from"]) ? json["from"] : isCharacter(json["begin"]) ? json["begin"] : null;
                        endChar = isCharacter(json["to"]) ? json["to"] : isCharacter(json["end"]) ? json["end"] : null;
                        if(!beginChar || !endChar) {
                            throw new Error("invalid character set");
                        }
                        return escapeCharacterSetFunnyCharacter(beginChar) + "-" + escapeCharacterSetFunnyCharacter(endChar);
                    }
                }
            ];
            definedSet = [
                {
                    pattern: /^digit$/i,
                    regex: "\\d"
                },
                {
                    pattern: /^notDigit$/i,
                    regex: "\\D"
                },
                {
                    pattern: /^word$/i,
                    regex: "\\w"
                },
                {
                    pattern: /^notWord$/i,
                    regex: "\\W"
                },
                {
                    pattern: /^(?:white)?space$/i,
                    regex: "\\s"
                },
                {
                    pattern: /^not(?:white)?space$/i,
                    regex: "\\S"
                },
                {
                    pattern: /^tab$/i,
                    regex: "\\t"
                },
                {
                    pattern: /^(?:cr|carrigeReturn)$/i,
                    regex: "\\r"
                },
                {
                    pattern: /^(?:lf|lineFeed)$/i,
                    regex: "\\n"
                },
                {
                    pattern: /^(?:vt|verticalTab)$/i,
                    regex: "\\v"
                },
                {
                    pattern: /^(?:ff|formFeed)$/i,
                    regex: "\\f"
                },
                {
                    pattern: /^(?:bs|backspace)$/i,
                    regex: "\\b"
                }
            ];
            function driveNotation(json) {
                var element = getOneAndOnlyField(json),
                    i;
                for(i = 0; i < notation.length; i++) {
                    if(notation[i].pattern.test(element)) {
                        return notation[i].action(json[element]);
                    }
                }
                throw new Error("invalid character set element: " + element);
            }
            function driveDefinedSet(name) {
                var i;
                for(i = 0; i < definedSet.length; i++) {
                    if(definedSet[i].pattern.test(name)) {
                        return definedSet[i].regex;
                    }
                }
                throw new Error("invalid character set name: " + name);
            }
            function build(json) {
                var i, result;
                if(isCharacter(json)) {
                    return escapeCharacterSetFunnyCharacter(json);
                } else if(typeof json === "string") {
                    return driveDefinedSet(json);
                } else if(isArray(json)) {
                    result = "";
                    for(i = 0; i < json.length; i++) {
                        result += build(json[i]);
                    }
                    return result;
                } else if(isObject(json)) {
                    return driveNotation(json);
                } else {
                    throw new Error("invalid character set JSON");
                }
            }
            return build;
        }
        characterSetNotation = createCharacterSetNotation();
        function escapeFunnyCharacter(aString) {
            return aString.replace(/([\/\.\\\[\]\|\^\$\(\)\*\+\?\{\}])/g, "\\$1");
        }
        function createRegexNotation() {
            var notation;
            function generateFromTo(suffix) {
                return function(json, captureObject) {
                    var fromTimes, toTimes;
                    fromTimes = typeof json["from"] === "number" ? json["from"] : 0;
                    toTimes = typeof json["to"] === "number" ? json["to"] : "";
                    return "(?:" + build(json["pattern"], captureObject) + "){" + fromTimes + "," + toTimes + "}" + suffix;
                };
            }
            notation = [
                {
                    pattern: /^(?:repeat)?ZeroOrMore$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")*";
                    }
                },
                {
                    pattern: /^(?:repeat)?OneOrMore$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")+";
                    }
                },
                {
                    pattern: /^(?:option(?:al)?|maybe)$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")?";
                    }
                },
                {
                    pattern: /^repeat$/i,
                    action: generateFromTo("")
                },
                {
                    pattern: /^(?:repeat)?ZeroOrMoreNotGreedy$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")*?";
                    }
                },
                {
                    pattern: /^(?:repeat)?OneOrMoreNotGreedy$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")+?";
                    }
                },
                {
                    pattern: /^(?:option(?:al)?|maybe)NotGreedy$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")??";
                    }
                },
                {
                    pattern: /^repeatNotGreedy$/i,
                    action: generateFromTo("?")
                },
                {
                    pattern: /^(?:or|alter(?:nate|nation)?)$/i,
                    action: function(json, captureObject) {
                        var i, result = "";
                        for(i = 0; i < json.length; i++) {
                            if(i > 0) {
                                result += "|";
                            }
                            result += "(?:" + build(json[i], captureObject) + ")";
                        }
                        return result;
                    }
                },
                {
                    pattern: /^capture?$/i,
                    action: function(json, captureObject) {
                        var captureNo = captureObject.captures++;
                        if(json.name) {
                            captureObject.names["@" + json.name] = captureNo;
                            captureObject.inverted[captureNo] = json.name;
                            return "(" + build(json.pattern, captureObject) + ")";
                        } else {
                            return "(" + build(json, captureObject) + ")";
                        }
                    }
                },
                {
                    pattern: /^(?:back)?refer(?:ence)?$/i,
                    action: function(json, captureObject) {
                        if(typeof json === "number") {
                            return "(?:\\" + json + ")";
                        } else if(captureObject.names["@" + json]) {
                            return "(?:\\" + captureObject.names["@" + json] + ")";
                        } else {
                            throw new Error("invalid reference: " + json);
                        }
                    }
                },
                {
                    pattern: /^(?:raw|regexp?)$/i,
                    action: function(json, captureObject) {
    	                var matcher;
    	                if(typeof json !== "string") {
    	                    throw new Error("raw regex must be string");
    	                }
    	                matcher = expandRegExp(/$/g).matcher(json);
    	                while(!matcher.usePattern(/$/g).lookingAt()) {
    		                if(matcher.usePattern(/\((?!\?[:=!])/g).lookingAt()) {
    			                captureObject.captures++;
    		                } else if(matcher.usePattern(/\[[^\]]\]/g).lookingAt()) {
    		                } else if(matcher.usePattern(/\\[\s\S]|[\s\S]/g).lookingAt()) {
    		                }
    	                }
    	                return json;
                    }
                },
                {
                    pattern: /^char(?:acter)?Set$/i,
                    action: function(json, captureObject) {
                        return "[" + characterSetNotation(json) + "]";
                    }
                },
                {
                    pattern: /^complement(?:ary)?(?:char(?:acter)?)?Set$/i,
                    action: function(json, captureObject) {
                        return "[^" + characterSetNotation(json) + "]";
                    }
                },
                {
                    pattern: /^(?:anchor|bound)$/i,
                    action: function(json, captureObject) {
                        if(typeof json !== "string") {
                            throw new Error("invalid anchor");
                        } else if(/^(?:begin|start)(?:OfLine)?$/i.test(json)) {
                            return "^";
                        } else if(/^end(?:OfLine)?$/i.test(json)) {
                            return "$";
                        } else if(/^word(?:Boundary)?$/i.test(json)) {
                            return "\\b";
                        } else if(/^notWord(?:Boundary)?$/i.test(json)) {
                            return "\\B";
                        }
                    }
                },
                {
                    pattern: /^char(?:acter)?Code$/i,
                    action: function(json, captureObject) {
                        var code;
                        if(!(typeof json === "number" && json >= 0 && json <= 0xfffff)) {
                            throw new Error("invalid character code: json");
                        } else if(json < 65536) {
                            code = "0000" + json.toString(16);
                            return "\\u" + code.substring(code.length - 4, code.length);
                        } else {
                            code = "00000" + json.toString(16);
                            return "\\u{" + code.substring(code.length - 5, code.length) + "}";
                        }
                    }
                },
                {
                    pattern: /^(?:positive)?Lookahead(?:Assertion)?$/i,
                    action: function(json, captureObject) {
                        return "(?=" + build(json, captureObject) + ")";
                    }
                },
                {
                    pattern: /^neg(?:ative)?Lookahead(?:Assertion)?$/i,
                    action: function(json, captureObject) {
                        return "(?!" + build(json, captureObject) + ")";
                    }
                }
            ];
            function driveNotation(json, captureObject) {
                var element = getOneAndOnlyField(json),
                    i;
                for(i = 0; i < notation.length; i++) {
                    if(notation[i].pattern.test(element)) {
                        return notation[i].action(json[element], captureObject);
                    }
                }
                throw new Error("invalid element: " + element);
            }
            function build(json, captureObject) {
                var i, result;
                if(typeof json === "string") {
                    return escapeFunnyCharacter(json);
                } else if(isArray(json)) {
                    result = "";
                    for(i = 0; i < json.length; i++) {
                        result += build(json[i], captureObject);
                    }
                    return result;
                } else if(isObject(json)) {
                    return driveNotation(json, captureObject);
                } else {
                    throw new Error("invalid JSON");
                }
            }
            return build;
        }
        regexNotation = createRegexNotation();
        function buildRegex(json) {
            var captureObject,
                builtRegex;
            captureObject = {
                captures: 1,
                names: {},
                inverted: {}
            };
            builtRegex = regexNotation(json, captureObject);
            return {
                regex: new RegExp(builtRegex),
                capture: captureObject
            };
        }
        function expandRegExp(regexOrJson) {
            var regex;
            function convert(regexOrJson) {
                if(regexOrJson instanceof RegExp) {
                    return {
                        regex: regexOrJson,
                        capture: {
                            names: {},
                            inverted: {}
                        }
                    };
                } else {
                    return buildRegex(regexOrJson);
                }
            }
            function copyToGroup(me, pattern, execResult) {
                var i;
                if(execResult) {
                    me.group = {};
                    for(i = 0; i < execResult.length; i++) {
                        me.group[i] = execResult[i];
                        if(pattern.capture.inverted[i]) {
                            me.group[pattern.capture.inverted[i]] = execResult[i];
                        }
                    }
                    me.group.length = execResult.length;
                } else {
                    me.group = null;
                }
                return execResult;
            }
            regex = convert(regexOrJson);
            if(regex.capture.captures !== undef) {
                regex.regex.execWithName = function(aString) {
                    var groupResult = {};
                    copyToGroup(groupResult, regex, regex.regex.exec(aString));
                    return groupResult.group;
                };
            }
            regex.regex.matcher = function(aString, option) {
                var pattern = regex,
                    opt = option ? option : {},
                    me;
                me = {
                    find: function() {
                        var previousIndex = pattern.regex.lastIndex,
                            result = pattern.regex.exec(aString);
                        if(!result && opt.preserve) {
                            pattern.regex.lastIndex = previousIndex;
                        }
                        return copyToGroup(me, pattern, result);
                    },
                    lookingAt: function() {
                        var previousIndex = pattern.regex.lastIndex,
                            result = me.find();
                        if(result && result.index === previousIndex) {
                            return copyToGroup(me, pattern, result);
                        } else {
                            pattern.regex.lastIndex = previousIndex;
                            me.group = null;
                            return null;
                        }
                    },
                    matches: function() {
                        var previousIndex = pattern.regex.lastIndex,
                            result = me.find();
                        if(result && result.index === previousIndex && pattern.regex.lastIndex === aString.length) {
                            return copyToGroup(me, pattern, result);
                        } else {
                            pattern.regex.lastIndex = previousIndex;
                            me.group = null;
                            return null;
                        }
                    },
                    usePattern: function(regexOrJson) {
                        var previousIndex = pattern.regex.lastIndex;
                        pattern = convert(regexOrJson);
                        if(!pattern.regex.global) {
                            throw new Error("global flag required");
                        }
                        pattern.regex.lastIndex = previousIndex;
                        return me;
                    }
                };
                return me;
            };
            return regex.regex;
        }
        return expandRegExp;
    }
    Re = {
        i: createModule()
    };
    if(typeof module !== "undefined" && module.exports) {
        module.exports = Re;
    } else {
        root["Re"] = Re;
    }
})(this);
