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
    function escapeFunnyCharacter(aString) {
        return aString.replace(/([\/\.\\\[\]\|\^\$\(\)\*\+\?\{\}])/g, "\\$1");
    }
    function buildRegex(json) {
        var notation;
        notation = [
            {
                pattern: /^(?:repeat)?ZeroOrMore$/i,
                action: function(json) {
                    return "(?:" + build(json) + ")*";
                }
            },
            {
                pattern: /^(?:repeat)?OneOrMore$/i,
                action: function(json) {
                    return "(?:" + build(json) + ")+";
                }
            },
            {
                pattern: /^option(?:al)?|maybe$/i,
                action: function(json) {
                    return "(?:" + build(json) + ")?";
                }
            },
            {
                pattern: /^or|alter(?:nate|nation)?$/i,
                action: function(json) {
                    var i, result = "";
                    for(i = 0; i < json.length; i++) {
                        if(i > 0) {
                            result += "|";
                        }
                        result += "(?:" + build(json[i]) + ")";
                    }
                    return result;
                }
            },
            {
                pattern: /^(?:positive)?Lookahead(?:Assertion)?$/i,
                action: function(json) {
                    return "(?=" + build(json) + ")";
                }
            },
            {
                pattern: /^neg(?ative)?Lookahead(?:Assertion)?$/i,
                action: function(json) {
                    return "(?!" + build(json) + ")";
                }
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
            throw new Error("invalid element: " + element);
        }
        function build(json) {
            var i, result;
            if(typeof json === "string") {
                return escapeFunnyCharacter(json);
            } else if(isArray(json)) {
                result = "";
                for(i = 0; i < json.length; i++) {
                    result += build(json[i]);
                }
                return result;
            } else if(isObject(json)) {
                return driveNotation(json);
            } else {
                throw new Error("invalid JSON");
            }
        }
        return new RegExp(build(json));
    }
    function expandRegExp(regexOrJson) {
        var regex;
        if(regexOrJson instanceof RegExp) {
            regex = regexOrJson;
        } else {
            regex = buildRegex(regexOrJson);
        }
        regex.matcher = function(aString, option) {
            var pattern = regex,
                opt = option ? option : {},
                me;
            me = {
                find: function() {
                    var previousIndex = pattern.lastIndex,
                        result = pattern.exec(aString);
                    if(!result && opt.preserve) {
                        pattern.lastIndex = previousIndex;
                    }
                    return result;
                },
                lookingAt: function() {
                    var previousIndex = pattern.lastIndex,
                        result = me.find();
                    if(result && result.index === previousIndex) {
                        return result;
                    } else {
                        pattern.lastIndex = previousIndex;
                        return null;
                    }
                },
                matches: function() {
                    var previousIndex = pattern.lastIndex,
                        result = me.find();
                    if(result && result.index === previousIndex && pattern.lastIndex === aString.length) {
                        return result;
                    } else {
                        pattern.lastIndex = previousIndex;
                        return null;
                    }
                },
                usePattern: function(regexOrJson) {
                    var previousIndex = pattern.lastIndex;
                    if(regexOrJson instanceof RegExp) {
                        pattern = regexOrJson;
                    } else {
                        pattern = buildRegex(regexOrJson);
                    }
                    if(!pattern.global) {
                        throw new Error("global flag required");
                    }
                    pattern.lastIndex = previousIndex;
                    return me;
                }
            };
            return me;
        };
        return regex;
    }
    Rei = {
        i: expandRegExp
    };
    if(typeof module !== "undefined" && module.exports) {
        module.exports = Rei;
    } else {
        root["Re"] = Rei;
    }
})(this);
