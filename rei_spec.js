/**
 * Morilib Rei
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
/*
 * This test case describe by Jasmine.
 */
describe("Rei", function () {
    function match(aString, json) {
        expect(Re.i(json).test(aString)).toBe(true);
    }

    function nomatch(aString, json) {
        expect(Re.i(json).test(aString)).toBe(false);
    }

    function matchPart(aString, part, json) {
        expect(Re.i(json).exec(aString)[0]).toBe(part);
    }

    function toThrow(json) {
        expect(function() { Re.i(json); }).toThrow();
    }

    beforeEach(function () {
    });

    describe("testing match", function () {
        it("simple string match", function () {
            match("http", "http");
            match("*+?\\/{}.()[]^$", "*+?\\/{}.()[]^$");
            nomatch("ftp", "http");
        });

        it("concatenate", function () {
            match("www.morilib.net", [ "www.", "morilib.", "net" ]);
            nomatch("www.morilib.", [ "www.", "morilib.", "net" ]);
        });

        it("repeat zero or more", function () {
            match("ab", { "zeroOrMore": "ab" });
            match("", { "zeroOrMore": "ab" });
            match("abababab", { "zeroOrMore": "ab" });
            match("a", { "repeatZeroOrMore": "ab" });
        });

        it("repeat one or more", function () {
            match("ab", { "oneOrMore": "ab" });
            match("abababab", { "oneOrMore": "ab" });
            match("ab", { "repeatOneOrMore": "ab" });
            nomatch("", { "oneOrMore": "ab" });
        });

        it("optional", function () {
            match("ab", { "optional": "ab" });
            match("", { "optional": "ab" });
            matchPart("abababab", "ab", { "optional": "ab" });
            match("ab", { "option": "ab" });
            match("ab", { "maybe": "ab" });
        });

        it("repeat", function () {
            var json1 = {
                "repeat": {
                    "from": 2,
                    "to": 4,
                    "pattern": "ab"
                }
            };
            match("abab", json1);
            match("abababab", json1);
            nomatch("ab", json1);
            matchPart("ababababab", "abababab", json1);
            var json2 = {
                "repeat": {
                    "pattern": "ab"
                }
            };
            match("ab", json2);
            match("", json2);
            matchPart("abababab", "abababab", json2);
        });

        it("repeat zero or more non-greedy", function () {
            var json1 = [
                "<",
                { "zeroOrMoreNonGreedy": { "seq": "exceptNewLine" } },
                ">"
            ];
            matchPart("<aaa><bbb>", "<aaa>", json1);
            matchPart("<><bbb>", "<>", json1);
            match("aaa", { "zeroOrMoreNotGreedy": "a" });
            match("aaa", { "repeatZeroOrMoreNonGreedy": "a" });
            match("aaa", { "repeatZeroOrMoreNotGreedy": "a" });
            nomatch("aaa>", json1);
        });

        it("repeat one or more non-greedy", function () {
            var json1 = [
                "<",
                { "oneOrMoreNonGreedy": { "seq": "exceptNewLine" } },
                ">"
            ];
            matchPart("<aaa><bbb>", "<aaa>", json1);
            matchPart("<a><bbb>", "<a>", json1);
            match("aaa", { "oneOrMoreNotGreedy": "a" });
            match("aaa", { "repeatOneOrMoreNonGreedy": "a" });
            match("aaa", { "repeatOneOrMoreNotGreedy": "a" });
            nomatch("<>", json1);
        });

        it("optional non-greedy", function () {
            var json1 = [
                "<",
                { "optionalNonGreedy": { "seq": "exceptNewLine" } },
                ">"
            ];
            matchPart("<a><bbb>", "<a>", json1);
            matchPart("<><bbb>", "<>", json1);
            match("a", { "optionalNotGreedy": "a" });
            match("a", { "optionNonGreedy": "a" });
            match("a", { "optionNotGreedy": "a" });
            match("a", { "maybeNonGreedy": "a" });
            match("a", { "maybeNotGreedy": "a" });
            nomatch("<aa>", json1);
        });

        it("repeat non-greedy", function () {
            var json1 = [
                "<",
                {
                    "repeatNonGreedy": {
                        "from": 2,
                        "to": 10,
                        "pattern": { "seq": "exceptNewLine" }
                    }
                },
                ">"
            ];
            matchPart("<aa><bbb>", "<aa>", json1);
            matchPart("<aaaaaaaaaa><bbb>", "<aaaaaaaaaa>", json1);
            match("aa", { "repeatNotGreedy": { "from": 2, "pattern": "a" } });
            nomatch("<a>", json1);
            nomatch("<aaaaaaaaaaa>", json1);
        });

        it("alternation", function () {
            var json1 = { "or": [ "765", "346", "283" ] };
            match("765", json1);
            match("346", json1);
            match("283", json1);
            match("765", { "alter": [ "765", "346", "283" ] });
            match("765", { "alternate": [ "765", "346", "283" ] });
            match("765", { "alternation": [ "765", "346", "283" ] });
            match("765", { "alternative": [ "765", "346", "283" ] });
            nomatch("961", json1);
        });

        it("capture", function () {
            var json1 = [
                "<",
                {
                    "capture": {
                        "oneOrMoreNonGreedy": { "seq": "exceptNewLine" }
                    }
                },
                ">"
            ];
            expect(Re.i(json1).exec("<aaaaa><bbb>")[1]).toBe("aaaaa");
        });

        it("capture with name", function () {
            var json1 = [
                "<",
                {
                    "capture": {
                        "name": "tagname",
                        "pattern": {
                            "oneOrMoreNonGreedy": { "seq": "exceptNewLine" }
                        }
                    }
                },
                ">"
            ];
            expect(Re.i(json1).execWithName("<aaaaa><bbb>")[1]).toBe("aaaaa");
            expect(Re.i(json1).execWithName("<aaaaa><bbb>").tagname).toBe("aaaaa");
        });

        it("back reference", function () {
            var json1 = [
                "<",
                {
                    "capture": {
                        "oneOrMoreNonGreedy": { "seq": "exceptNewLine" }
                    }
                },
                ">",
                "</",
                { "refer": 1 },
                ">"
            ];
            match("<aaaaa></aaaaa>", json1);
            nomatch("<aaaaa></aaaab>", json1);
            var json2 = [
                "<",
                {
                    "capture": {
                        "name": "tagname",
                        "pattern": {
                            "oneOrMoreNonGreedy": { "seq": "exceptNewLine" }
                        }
                    }
                },
                ">",
                "</",
                { "reference": "tagname" },
                ">"
            ];
            match("<aaaaa></aaaaa>", json2);
            nomatch("<aaaaa></aaaab>", json2);
            var json3 = [
                "<",
                {
                    "capture": {
                        "name": "tagname",
                        "pattern": {
                            "oneOrMoreNonGreedy": { "seq": "exceptNewLine" }
                        }
                    }
                },
                ">",
                "</",
                { "backReference": "tagname" },
                ">"
            ];
            match("<aaaaa></aaaaa>", json3);
            nomatch("<aaaaa></aaaab>", json3);
        });

        it("raw regex", function () {
            var json1 = [
                { "raw": "(.)(?:.)\\(\\)[()][\(\)](?=[0-9]{3,3})(?!961)" },
                { "capture": { "oneOrMore": { "regex": "[0-9]" } } }
            ];
            expect(Re.i(json1).exec("ab()()765")[2]).toBe("765");
            nomatch("ab()()00", json1);
            nomatch("ab()()961", json1);
            match("a", { "regexp": "a" });
        });

        it("raw regex (object)", function () {
            var json1 = [
                /(.)(?:.)\(\)[()][\(\)](?=[0-9]{3,3})(?!961)/,
                { "capture": { "oneOrMore": { "regex": "[0-9]" } } }
            ];
            expect(Re.i(json1).exec("ab()()765")[2]).toBe("765");
            nomatch("ab()()00", json1);
            nomatch("ab()()961", json1);
        });

        it("character set", function () {
            match("0", { "charset": "digit" });
            match("0", { "characterSet": "digit" });
        });

        it("complementary character set", function () {
            match("a", { "complementaryCharset": "digit" });
            match("a", { "complementCharset": "digit" });
            match("a", { "complementaryCharacterSet": "digit" });
            match("a", { "complementCharacterSet": "digit" });
            match("a", { "complementSet": "digit" });
        });

        it("anchor", function () {
            nomatch("baa", [ { "anchor": "begin" }, "aa" ]);
            nomatch("baa", [ { "anchor": "start" }, "aa" ]);
            nomatch("baa", [ { "anchor": "beginOfLine" }, "aa" ]);
            nomatch("baa", [ { "anchor": "startOfLine" }, "aa" ]);
            nomatch("aab", [ { "anchor": "end" }, "aa" ]);
            nomatch("aab", [ { "anchor": "endOfLine" }, "aa" ]);
            nomatch("baa", [ { "anchor": "word" }, "aa" ]);
            nomatch("baa", [ { "anchor": "wordBound" }, "aa" ]);
            nomatch("baa", [ { "anchor": "wordBoundary" }, "aa" ]);
            nomatch("aab", [ { "anchor": "notWord" }, "aa" ]);
            nomatch("aab", [ { "anchor": "nonWord" }, "aa" ]);
            nomatch("aab", [ { "anchor": "notWordBound" }, "aa" ]);
            nomatch("aab", [ { "anchor": "notWordBoundary" }, "aa" ]);
        });

        it("character code", function () {
            match("A", { "charCode": 0x41 });
            match("A", { "characterCode": 0x41 });
        });

        it("positive lookahead assertion", function () {
            match("pro765", [ "pro", { "lookahead": "765" } ]);
            match("pro765", [ "pro", { "positiveLookahead": "765" } ]);
            match("pro765", [ "pro", { "lookaheadAssertion": "765" } ]);
            match("pro765", [ "pro", { "positiveLookaheadAssertion": "765" } ]);
            nomatch("pro961", [ "pro", { "lookahead": "765" } ]);
        });

        it("negative lookahead assertion", function () {
            match("pro765", [ "pro", { "negativeLookahead": "961" } ]);
            match("pro765", [ "pro", { "negativeLookaheadAssertion": "961" } ]);
            nomatch("pro961", [ "pro", { "negativeLookahead": "961" } ]);
        });

        it("unicode property", function () {
            match("a", { "unicode": "Letter" });
            match("a", { "unicodeProperty": "Letter" });
            nomatch("!", { "unicode": "Letter" });
        });

        it("complementary unicode property", function () {
            match("!", { "complementaryUnicode": "Letter" });
            match("!", { "complementaryUnicodeProperty": "Letter" });
            match("!", { "complementUnicode": "Letter" });
            match("!", { "complementUnicodeProperty": "Letter" });
            nomatch("a", { "complementaryUnicode": "Letter" });
        });
    });

    describe("testing sequence", function () {
        it("all", function () {
            match("a", { "seq": "all" });
            match("\n", { "sequence": "all" });
        });

        it("all except newline", function () {
            match("a", { "seq": "allExceptNewLine" });
            match("a", { "seq": "exceptNewLine" });
            nomatch("\n", { "seq": "allExceptNewLine" });
        });

        it("newline", function () {
            match("\ra", [ { "seq": "newline" }, "a" ]);
            match("\na", [ { "seq": "br" }, "a" ]);
            match("\r\na", [ { "seq": "nl" }, "a" ]);
            nomatch("a", { "seq": "newline" });
        });

        it("float number", function () {
            var json1 = [
                { "anchor": "begin" },
                { "seq": "float" },
                { "anchor": "end" }
            ];
            match("0", json1);
            match("765", json1);
            match("76.5", json1);
            match("0.765", json1);
            match(".765", json1);
            match("765e2", json1);
            match("765E2", json1);
            match("765e+2", json1);
            match("765e-2", json1);
            match("765e+346", json1);
            match("765e-346", json1);
            nomatch("96a1", json1);
            nomatch("96+1", json1);
            nomatch("96-1", json1);
            nomatch("a961", json1);
            nomatch("765e+", json1);
            nomatch("765e-", json1);
            match("+765", json1);
            match("+76.5", json1);
            match("+0.765", json1);
            match("+.765", json1);
            match("+765e2", json1);
            match("+765E2", json1);
            match("+765e+2", json1);
            match("+765e-2", json1);
            match("+765e+346", json1);
            match("+765e-346", json1);
            nomatch("+96a1", json1);
            nomatch("+96+1", json1);
            nomatch("+96-1", json1);
            nomatch("+a961", json1);
            nomatch("+765e+", json1);
            nomatch("+765e-", json1);
            match("-765", json1);
            match("-76.5", json1);
            match("-0.765", json1);
            match("-.765", json1);
            match("-765e2", json1);
            match("-765E2", json1);
            match("-765e+2", json1);
            match("-765e-2", json1);
            match("-765e+346", json1);
            match("-765e-346", json1);
            nomatch("-96a1", json1);
            nomatch("-96+1", json1);
            nomatch("-96-1", json1);
            nomatch("-a961", json1);
            nomatch("-765e+", json1);
            nomatch("-765e-", json1);
            match("0.765", { "seq": "real" });
            match("0.765", { "seq": "floatNumber" });
            match("0.765", { "seq": "realNumber" });
            match("0.765", { "seq": "floatWithSign" });
            match("0.765", { "seq": "realWithSign" });
            match("0.765", { "seq": "floatNumberWithSign" });
            match("0.765", { "seq": "realNumberWithSign" });
        });

        it("float number without sign", function () {
            var json1 = [
                { "anchor": "begin" },
                { "seq": "floatWithoutSign" },
                { "anchor": "end" }
            ];
            match("0", json1);
            match("765", json1);
            match("76.5", json1);
            match("0.765", json1);
            match(".765", json1);
            match("765e2", json1);
            match("765E2", json1);
            match("765e+2", json1);
            match("765e-2", json1);
            match("765e+346", json1);
            match("765e-346", json1);
            nomatch("96a1", json1);
            nomatch("96+1", json1);
            nomatch("96-1", json1);
            nomatch("a961", json1);
            nomatch("765e+", json1);
            nomatch("765e-", json1);
            nomatch("+765", json1);
            nomatch("+76.5", json1);
            nomatch("+0.765", json1);
            nomatch("+.765", json1);
            nomatch("+765e2", json1);
            nomatch("+765E2", json1);
            nomatch("+765e+2", json1);
            nomatch("+765e-2", json1);
            nomatch("+765e+346", json1);
            nomatch("+765e-346", json1);
            nomatch("+96a1", json1);
            nomatch("+96+1", json1);
            nomatch("+96-1", json1);
            nomatch("+a961", json1);
            nomatch("+765e+", json1);
            nomatch("+765e-", json1);
            nomatch("-765", json1);
            nomatch("-76.5", json1);
            nomatch("-0.765", json1);
            nomatch("-.765", json1);
            nomatch("-765e2", json1);
            nomatch("-765E2", json1);
            nomatch("-765e+2", json1);
            nomatch("-765e-2", json1);
            nomatch("-765e+346", json1);
            nomatch("-765e-346", json1);
            nomatch("-96a1", json1);
            nomatch("-96+1", json1);
            nomatch("-96-1", json1);
            nomatch("-a961", json1);
            nomatch("-765e+", json1);
            nomatch("-765e-", json1);
            match("0.765", { "seq": "realWithoutSign" });
            match("0.765", { "seq": "floatNumberWithoutSign" });
            match("0.765", { "seq": "realNumberWithoutSign" });
        });
    });

    describe("testing character set", function () {
        it("basic support", function () {
            match("0", { "charset": "digit" });
            match("0", { "charset": [ "digit", "word" ] });
            match("a", { "charset": [ "digit", "word" ] });
            match("a", { "charset": "a" });
            match("a", { "charset": [ "digit", "a" ] });
            match("/", { "charset": "/" });
            match("\\", { "charset": "\\" });
            match(".", { "charset": "." });
            match("[", { "charset": "[" });
            match("]", { "charset": "]" });
            match("|", { "charset": "|" });
            match("^", { "charset": "^" });
            match("$", { "charset": "$" });
            match("(", { "charset": "(" });
            match(")", { "charset": ")" });
            match("*", { "charset": "*" });
            match("+", { "charset": "+" });
            match("?", { "charset": "?" });
            match("{", { "charset": "{" });
            match("}", { "charset": "}" });
            match("-", { "charset": "-" });
            nomatch("a", { "charset": "digit" });
        });

        it("range", function () {
            var json1 = {
                "charset": {
                    "range": {
                        "from": "b",
                        "to": "x"
                    }
                }
            };
            match("b", json1);
            match("x", json1);
            nomatch("a", json1);
            nomatch("z", json1);
            var json2 = {
                "charset": {
                    "range": {
                        "begin": "b",
                        "end": "x"
                    }
                }
            };
            match("b", json2);
            match("x", json2);
            nomatch("a", json2);
            nomatch("z", json2);
            toThrow({
                "charset": {
                    "range": {
                        "from": "a"
                    }
                }
            });
            toThrow({
                "charset": {
                    "range": {
                        "to": "a"
                    }
                }
            });
        });

        it("unicode property", function () {
            match("a", { "charset": { "unicode": "Letter" } });
            match("a", { "charset": { "unicode": "Letter" } });
            nomatch("!", { "charset": { "unicode": "Letter" } });
            match("a", { "charset": [ { "unicode": "Letter" }, { "unicodeProperty": "Number" } ] });
            match("0", { "charset": [ { "unicode": "Letter" }, { "unicodeProperty": "Number" } ] });
        });

        it("complementary unicode property", function () {
            match("!", { "charset": { "complementaryUnicode": "Letter" } });
            match("!", { "charset": { "complementaryUnicodeProperty": "Letter" } });
            match("!", { "charset": { "complementUnicode": "Letter" } });
            match("!", { "charset": { "complementUnicodeProperty": "Letter" } });
            nomatch("a", { "charset": { "complementaryUnicode": "Letter" } });
        });

        it("all", function () {
            match("a", { "charset": "all" });
            match("\n", { "charset": "all" });
        });

        it("digit", function () {
            match("0", { "charset": "digit" });
            nomatch("a", { "charset": "digit" });
        });

        it("non-digit", function () {
            match("a", { "charset": "nonDigit" });
            match("a", { "charset": "notDigit" });
            nomatch("0", { "charset": "nonDigit" });
        });

        it("word", function () {
            match("a", { "charset": "word" });
            match("A", { "charset": "word" });
            nomatch("!", { "charset": "word" });
        });

        it("non-word", function () {
            match("!", { "charset": "nonWord" });
            match("!", { "charset": "notWord" });
            nomatch("a", { "charset": "nonWord" });
        });

        it("whitespace", function () {
            match(" ", { "charset": "space" });
            match(" ", { "charset": "whitespace" });
            nomatch("A", { "charset": "space" });
        });

        it("non-whitespace", function () {
            match("A", { "charset": "nonspace" });
            match("A", { "charset": "nonwhitespace" });
            match("A", { "charset": "notSpace" });
            match("A", { "charset": "notWhitespace" });
            nomatch(" ", { "charset": "nonspace" });
        });

        it("tab", function () {
            match("\t", { "charset": "tab" });
            match("\t", { "charset": "tab" });
            nomatch(" ", { "charset": "tab" });
        });

        it("carriageReturn", function () {
            match("\r", { "charset": "carriageReturn" });
            match("\r", { "charset": "cr" });
            nomatch(" ", { "charset": "carriageReturn" });
        });

        it("lineFeed", function () {
            match("\n", { "charset": "lineFeed" });
            match("\n", { "charset": "lf" });
            nomatch(" ", { "charset": "lineFeed" });
        });

        it("verticalTab", function () {
            match("\v", { "charset": "verticalTab" });
            match("\v", { "charset": "vt" });
            nomatch(" ", { "charset": "verticalTab" });
        });

        it("formFeed", function () {
            match("\f", { "charset": "formFeed" });
            match("\f", { "charset": "ff" });
            nomatch(" ", { "charset": "formFeed" });
        });

        it("backspace", function () {
            match("\b", { "charset": "backspace" });
            match("\b", { "charset": "bs" });
            nomatch(" ", { "charset": "backspace" });
        });
    });

    describe("testing matching methods", function () {
        it("execWithName", function () {
            var json1 = [
                "<",
                {
                    "capture": {
                        "name": "tagname",
                        "pattern": {
                            "oneOrMoreNonGreedy": { "seq": "exceptNewLine" }
                        }
                    }
                },
                ">"
            ];
            expect(Re.i(json1).execWithName("<aaaaa><bbb>")[1]).toBe("aaaaa");
            expect(Re.i(json1).execWithName("<aaaaa><bbb>").tagname).toBe("aaaaa");
            expect(Re.i(/<(.+?)>/).execWithName("<aaaaa><bbb>")[1]).toBe("aaaaa");
        });

        it("find", function () {
            var matcher1 = Re.i(/<.+?>/g).matcher("<aaaaa><bbbb>text<cccc>");
            expect(matcher1.find()[0]).toBe("<aaaaa>");
            matcher1.find();
            expect(matcher1.group[0]).toBe("<bbbb>");
            expect(matcher1.find()[0]).toBe("<cccc>");
            expect(matcher1.find()).toBeNull();
        });

        it("lookingAt", function () {
            var matcher1 = Re.i(/<.+?>/g).matcher("<aaaaa><bbbb>text<cccc>");
            expect(matcher1.lookingAt()[0]).toBe("<aaaaa>");
            matcher1.lookingAt();
            expect(matcher1.group[0]).toBe("<bbbb>");
            expect(matcher1.lookingAt()).toBeNull();
        });

        it("matches", function () {
            var matcher1 = Re.i(/<.+>/g).matcher("<aaaaa><bbbb>text<cccc>");
            expect(matcher1.matches()[0]).toBe("<aaaaa><bbbb>text<cccc>");
            var matcher2 = Re.i(/<.+>/g).matcher("<aaaaa><bbbb>text<cccc>");
            matcher2.matches();
            expect(matcher2.group[0]).toBe("<aaaaa><bbbb>text<cccc>");
            var matcher3 = Re.i(/<.+?>/g).matcher("<aaaaa><bbbb>text<cccc>");
            expect(matcher3.matches()).toBeNull();
        });

        it("usePattern", function () {
            function match(matcher) {
                var count = 0;
                while(!matcher.usePattern(/$/g).lookingAt()) {
                    if(matcher.usePattern(/\((?!\?[:=!])/g).lookingAt()) {
                        count++;
                    } else if(matcher.usePattern(/\[([^\]\\]|\\[\s\S])*\]/g).lookingAt()) {
                    } else if(matcher.usePattern(/\\[\s\S]|[\s\S]/g).lookingAt()) {
                    }
                }
                return count;
            }
            expect(match(Re.i(/$/g).matcher("(.)(?:.)\\(\\)[()][\(\)](?=[0-9]{3,3})(?!961)"))).toBe(1);
        });
    });

    describe("testing plug-in", function () {
        it("notation", function () {
            var plugin1 = Re.plugin({
                userNotation: [
                    {
                        pattern: /^(?:test1)$/i,
                        action: function(json) {
                            return "(?:" + this.build(json) + ")+";
                        }
                    }
                ]
            });
            var json1 = {
                "test1": {
                    "capture": {
                        "name": "name",
                        "pattern": {
                            "seq": "all"
                        }
                    }
                }
            };
            expect(plugin1(json1).exec("abc")[0]).toBe("abc");
            expect(plugin1(json1).exec("abc")[1]).toBe("c");
        });

        it("sequence", function () {
            var plugin1 = Re.plugin({
                userSequence: [
                    {
                        pattern: /^(?:test1)$/i,
                        regex: "[\\w]"
                    }
                ]
            });
            expect(plugin1({ "seq": "test1" }).test("a")).toBeTruthy();
            expect(plugin1({ "seq": "test1" }).test("!")).toBeFalsy();
        });

        it("set", function () {
            var plugin1 = Re.plugin({
                userSet: [
                    {
                        pattern: /^(?:test1)$/i,
                        charset: "a-z"
                    }
                ]
            });
            expect(plugin1({ "charset": "test1" }).test("a")).toBeTruthy();
            expect(plugin1({ "charset": "test1" }).test("!")).toBeFalsy();
        });

        it("Unicode property", function () {
            var plugin1 = Re.plugin({
                userProperties: [
                    {
                        pattern: /^(?:test1)$/i,
                        charset: "a-z"
                    }
                ]
            });
            expect(plugin1({ "Unicode": "test1" }).test("a")).toBeTruthy();
            expect(plugin1({ "Unicode": "test1" }).test("!")).toBeFalsy();
        });
    });
});
