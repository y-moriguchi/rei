/*
 * Morilib Rei
 *
 * Copyright (c) 2019 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */
(function(root) {
    var undef = void 0,
        Re;

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

    function createModule(options) {
        var characterSetNotation,
            regexNotation,
            unicodeCategories,
            opts = options ? options : {};

        function negateCharacterSet(charSet) {
            var property = new RegExp("[" + charSet + "]"),
                beginCode = -1,
                endCode,
                aCharacter,
                resultSet = "",
                i;

            function toEscapeSequence(code) {
                var codeString = "0000" + code.toString(16);
                return "\\u" + codeString.substring(codeString.length - 4, codeString.length);
            }

            for(i = 0; i <= 0xFFFF; i++) {
                aCharacter = String.fromCharCode(i);
                if(!property.test(aCharacter)) {
                    if(beginCode < 0) {
                        beginCode = endCode = i;
                    } else {
                        endCode++;
                    }
                } else if(beginCode >= 0) {
                    resultSet += toEscapeSequence(beginCode);
                    if(beginCode !== endCode) {
                        resultSet += "-";
                        resultSet += toEscapeSequence(endCode);
                    }
                    beginCode = -1;
                }
            }
            return resultSet;
        }

        function escapeCharacterSetFunnyCharacter(aString) {
            return aString.replace(/([\/\.\\\[\]\|\^\$\(\)\*\+\?\{\}\-])/g, "\\$1");
        }

        function createUnicodeCategories(userProperties) {
            var categories;
            categories = [
                {
                    pattern: /^(?:Is_?)?(?:L|Letter)$/i,
                    charset:
                        "\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6" +
                        "\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC" +
                        "\\u02EE\\u0370-\\u0374\\u0376-\\u0377\\u037A-\\u037D\\u0386" +
                        "\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481" +
                        "\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA" +
                        "\\u05F0-\\u05F2\\u0620-\\u064A\\u066E-\\u066F\\u0671-\\u06D3\\u06D5" +
                        "\\u06E5-\\u06E6\\u06EE-\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710" +
                        "\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4-\\u07F5" +
                        "\\u07FA\\u0800-\\u0815\\u081A\\u0824\\u0828\\u0840-\\u0858\\u08A0" +
                        "\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961" +
                        "\\u0971-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F-\\u0990" +
                        "\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE" +
                        "\\u09DC-\\u09DD\\u09DF-\\u09E1\\u09F0-\\u09F1\\u0A05-\\u0A0A" +
                        "\\u0A0F-\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32-\\u0A33" +
                        "\\u0A35-\\u0A36\\u0A38-\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74" +
                        "\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0" +
                        "\\u0AB2-\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0-\\u0AE1" +
                        "\\u0B05-\\u0B0C\\u0B0F-\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30" +
                        "\\u0B32-\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C-\\u0B5D\\u0B5F-\\u0B61" +
                        "\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95" +
                        "\\u0B99-\\u0B9A\\u0B9C\\u0B9E-\\u0B9F\\u0BA3-\\u0BA4\\u0BA8-\\u0BAA" +
                        "\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28" +
                        "\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58-\\u0C59\\u0C60-\\u0C61" +
                        "\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3" +
                        "\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0-\\u0CE1\\u0CF1-\\u0CF2" +
                        "\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E" +
                        "\\u0D60-\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1" +
                        "\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32-\\u0E33" +
                        "\\u0E40-\\u0E46\\u0E81-\\u0E82\\u0E84\\u0E87-\\u0E88\\u0E8A\\u0E8D" +
                        "\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7" +
                        "\\u0EAA-\\u0EAB\\u0EAD-\\u0EB0\\u0EB2-\\u0EB3\\u0EBD\\u0EC0-\\u0EC4" +
                        "\\u0EC6\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C" +
                        "\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D" +
                        "\\u1061\\u1065-\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E" +
                        "\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248" +
                        "\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288" +
                        "\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0" +
                        "\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315" +
                        "\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C" +
                        "\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C" +
                        "\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C" +
                        "\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877" +
                        "\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D" +
                        "\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16" +
                        "\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0" +
                        "\\u1BAE-\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F" +
                        "\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5-\\u1CF6" +
                        "\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45" +
                        "\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D" +
                        "\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC" +
                        "\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4" +
                        "\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u209C\\u2102\\u2107" +
                        "\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128" +
                        "\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E" +
                        "\\u2183-\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4" +
                        "\\u2CEB-\\u2CEE\\u2CF2-\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D" +
                        "\\u2D30-\\u2D67\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE" +
                        "\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE" +
                        "\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005-\\u3006\\u3031-\\u3035" +
                        "\\u303B-\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA" +
                        "\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA" +
                        "\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C" +
                        "\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A-\\uA62B" +
                        "\\uA640-\\uA66E\\uA67F-\\uA697\\uA6A0-\\uA6E5\\uA717-\\uA71F" +
                        "\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA" +
                        "\\uA7F8-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822" +
                        "\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925" +
                        "\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28" +
                        "\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF" +
                        "\\uAAB1\\uAAB5-\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD" +
                        "\\uAAE0-\\uAAEA\\uAAF2-\\uAAF4\\uAB01-\\uAB06\\uAB09-\\uAB0E" +
                        "\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2" +
                        "\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D" +
                        "\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28" +
                        "\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40-\\uFB41\\uFB43-\\uFB44" +
                        "\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7" +
                        "\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A" +
                        "\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF" +
                        "\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC"
                },
                {
                    pattern: /^(?:Is_?)?(?:LC|Cased(?:[\-_]| *)Letter)$/i,
                    charset:
                        "\\u0041-\\u005A\\u0061-\\u007A\\u00B5\\u00C0-\\u00D6\\u00D8-\\u00F6" +
                        "\\u00F8-\\u01BA\\u01BC-\\u01BF\\u01C4-\\u0293\\u0295-\\u02AF" +
                        "\\u0370-\\u0373\\u0376-\\u0377\\u037B-\\u037D\\u0386\\u0388-\\u038A" +
                        "\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0527" +
                        "\\u0531-\\u0556\\u0561-\\u0587\\u10A0-\\u10C5\\u10C7\\u10CD" +
                        "\\u1D00-\\u1D2B\\u1D6B-\\u1D77\\u1D79-\\u1D9A\\u1E00-\\u1F15" +
                        "\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59" +
                        "\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE" +
                        "\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB" +
                        "\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2102\\u2107" +
                        "\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128" +
                        "\\u212A-\\u212D\\u212F-\\u2134\\u2139\\u213C-\\u213F\\u2145-\\u2149" +
                        "\\u214E\\u2183-\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2C7B" +
                        "\\u2C7E-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2-\\u2CF3\\u2D00-\\u2D25\\u2D27" +
                        "\\u2D2D\\uA640-\\uA66D\\uA680-\\uA697\\uA722-\\uA76F\\uA771-\\uA787" +
                        "\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7FA\\uFB00-\\uFB06" +
                        "\\uFB13-\\uFB17\\uFF21-\\uFF3A\\uFF41-\\uFF5A"
                },
                {
                    pattern: /^(?:Is_?)?(?:Lu|Uppercase(?:[\-_]| *)Letter)$/i,
                    charset:
                        "\\u0041-\\u005A\\u00C0-\\u00D6\\u00D8-\\u00DE\\u0100\\u0102\\u0104" +
                        "\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118" +
                        "\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C" +
                        "\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141" +
                        "\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156" +
                        "\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A" +
                        "\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178-\\u0179\\u017B\\u017D" +
                        "\\u0181-\\u0182\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191" +
                        "\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2" +
                        "\\u01A4\\u01A6-\\u01A7\\u01A9\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3" +
                        "\\u01B5\\u01B7-\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1" +
                        "\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6" +
                        "\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC" +
                        "\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210" +
                        "\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224" +
                        "\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A-\\u023B" +
                        "\\u023D-\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370" +
                        "\\u0372\\u0376\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u038F" +
                        "\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA" +
                        "\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE" +
                        "\\u03F4\\u03F7\\u03F9-\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466" +
                        "\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A" +
                        "\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496" +
                        "\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA" +
                        "\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE" +
                        "\\u04C0-\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2" +
                        "\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6" +
                        "\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA" +
                        "\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E" +
                        "\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522" +
                        "\\u0524\\u0526\\u0531-\\u0556\\u10A0-\\u10C5\\u10C7\\u10CD\\u1E00\\u1E02" +
                        "\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16" +
                        "\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A" +
                        "\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E" +
                        "\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52" +
                        "\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66" +
                        "\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A" +
                        "\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E" +
                        "\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA" +
                        "\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE" +
                        "\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2" +
                        "\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6" +
                        "\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA" +
                        "\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F" +
                        "\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F" +
                        "\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB" +
                        "\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D" +
                        "\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128" +
                        "\\u212A-\\u212D\\u2130-\\u2133\\u213E-\\u213F\\u2145\\u2183" +
                        "\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B" +
                        "\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88" +
                        "\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C" +
                        "\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0" +
                        "\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4" +
                        "\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8" +
                        "\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\u2CF2\\uA640\\uA642" +
                        "\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656" +
                        "\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A" +
                        "\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690" +
                        "\\uA692\\uA694\\uA696\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E" +
                        "\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744" +
                        "\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758" +
                        "\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C" +
                        "\\uA76E\\uA779\\uA77B\\uA77D-\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B" +
                        "\\uA78D\\uA790\\uA792\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uA7AA" +
                        "\\uFF21-\\uFF3A"
                },
                {
                    pattern: /^(?:Is_?)?(?:Ll|Lowercase(?:[\-_]| *)Letter)$/i,
                    charset:
                        "\\u0061-\\u007A\\u00B5\\u00DF-\\u00F6\\u00F8-\\u00FF\\u0101\\u0103" +
                        "\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117" +
                        "\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B" +
                        "\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137-\\u0138\\u013A\\u013C\\u013E" +
                        "\\u0140\\u0142\\u0144\\u0146\\u0148-\\u0149\\u014B\\u014D\\u014F\\u0151" +
                        "\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165" +
                        "\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A" +
                        "\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C-\\u018D\\u0192\\u0195" +
                        "\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA-\\u01AB\\u01AD" +
                        "\\u01B0\\u01B4\\u01B6\\u01B9-\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC" +
                        "\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC-\\u01DD\\u01DF" +
                        "\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF-\\u01F0\\u01F3" +
                        "\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209" +
                        "\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D" +
                        "\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231" +
                        "\\u0233-\\u0239\\u023C\\u023F-\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D" +
                        "\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D" +
                        "\\u0390\\u03AC-\\u03CE\\u03D0-\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB" +
                        "\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED" +
                        "\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB-\\u03FC\\u0430-\\u045F\\u0461" +
                        "\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475" +
                        "\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491" +
                        "\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5" +
                        "\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9" +
                        "\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC" +
                        "\\u04CE-\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF" +
                        "\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3" +
                        "\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507" +
                        "\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B" +
                        "\\u051D\\u051F\\u0521\\u0523\\u0525\\u0527\\u0561-\\u0587\\u1D00-\\u1D2B" +
                        "\\u1D6B-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B" +
                        "\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F" +
                        "\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33" +
                        "\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47" +
                        "\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B" +
                        "\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F" +
                        "\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83" +
                        "\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D" +
                        "\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1" +
                        "\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5" +
                        "\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9" +
                        "\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED" +
                        "\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07" +
                        "\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45" +
                        "\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87" +
                        "\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6-\\u1FB7\\u1FBE" +
                        "\\u1FC2-\\u1FC4\\u1FC6-\\u1FC7\\u1FD0-\\u1FD3\\u1FD6-\\u1FD7" +
                        "\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6-\\u1FF7\\u210A\\u210E-\\u210F" +
                        "\\u2113\\u212F\\u2134\\u2139\\u213C-\\u213D\\u2146-\\u2149\\u214E\\u2184" +
                        "\\u2C30-\\u2C5E\\u2C61\\u2C65-\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71" +
                        "\\u2C73-\\u2C74\\u2C76-\\u2C7B\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B" +
                        "\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F" +
                        "\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3" +
                        "\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7" +
                        "\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB" +
                        "\\u2CDD\\u2CDF\\u2CE1\\u2CE3-\\u2CE4\\u2CEC\\u2CEE\\u2CF3\\u2D00-\\u2D25" +
                        "\\u2D27\\u2D2D\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F" +
                        "\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA661\\uA663" +
                        "\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689" +
                        "\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA723\\uA725\\uA727" +
                        "\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B" +
                        "\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F" +
                        "\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763" +
                        "\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C" +
                        "\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uA78E\\uA791\\uA793\\uA7A1" +
                        "\\uA7A3\\uA7A5\\uA7A7\\uA7A9\\uA7FA\\uFB00-\\uFB06\\uFB13-\\uFB17" +
                        "\\uFF41-\\uFF5A"
                },
                {
                    pattern: /^(?:Is_?)?(?:Lt|Titlecase(?:[\-_]| *)Letter)$/i,
                    charset:
                        "\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F" +
                        "\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC"
                },
                {
                    pattern: /^(?:Is_?)?(?:Lm|Modifier(?:[\-_]| *)Letter)$/i,
                    charset:
                        "\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374" +
                        "\\u037A\\u0559\\u0640\\u06E5-\\u06E6\\u07F4-\\u07F5\\u07FA\\u081A\\u0824" +
                        "\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D" +
                        "\\u1D2C-\\u1D6A\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u209C" +
                        "\\u2C7C-\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B" +
                        "\\u309D-\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F" +
                        "\\uA717-\\uA71F\\uA770\\uA788\\uA7F8-\\uA7F9\\uA9CF\\uAA70\\uAADD" +
                        "\\uAAF3-\\uAAF4\\uFF70\\uFF9E-\\uFF9F"
                },
                {
                    pattern: /^(?:Is_?)?(?:Lo|Other(?:[\-_]| *)Letter)$/i,
                    charset:
                        "\\u00AA\\u00BA\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA" +
                        "\\u05F0-\\u05F2\\u0620-\\u063F\\u0641-\\u064A\\u066E-\\u066F" +
                        "\\u0671-\\u06D3\\u06D5\\u06EE-\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710" +
                        "\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815" +
                        "\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950" +
                        "\\u0958-\\u0961\\u0972-\\u0977\\u0979-\\u097F\\u0985-\\u098C" +
                        "\\u098F-\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9" +
                        "\\u09BD\\u09CE\\u09DC-\\u09DD\\u09DF-\\u09E1\\u09F0-\\u09F1" +
                        "\\u0A05-\\u0A0A\\u0A0F-\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30" +
                        "\\u0A32-\\u0A33\\u0A35-\\u0A36\\u0A38-\\u0A39\\u0A59-\\u0A5C\\u0A5E" +
                        "\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8" +
                        "\\u0AAA-\\u0AB0\\u0AB2-\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0" +
                        "\\u0AE0-\\u0AE1\\u0B05-\\u0B0C\\u0B0F-\\u0B10\\u0B13-\\u0B28" +
                        "\\u0B2A-\\u0B30\\u0B32-\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C-\\u0B5D" +
                        "\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90" +
                        "\\u0B92-\\u0B95\\u0B99-\\u0B9A\\u0B9C\\u0B9E-\\u0B9F\\u0BA3-\\u0BA4" +
                        "\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10" +
                        "\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58-\\u0C59" +
                        "\\u0C60-\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8" +
                        "\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0-\\u0CE1" +
                        "\\u0CF1-\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D" +
                        "\\u0D4E\\u0D60-\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1" +
                        "\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32-\\u0E33" +
                        "\\u0E40-\\u0E45\\u0E81-\\u0E82\\u0E84\\u0E87-\\u0E88\\u0E8A\\u0E8D" +
                        "\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7" +
                        "\\u0EAA-\\u0EAB\\u0EAD-\\u0EB0\\u0EB2-\\u0EB3\\u0EBD\\u0EC0-\\u0EC4" +
                        "\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C" +
                        "\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061" +
                        "\\u1065-\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA" +
                        "\\u10FD-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D" +
                        "\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5" +
                        "\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310" +
                        "\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4" +
                        "\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA" +
                        "\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751" +
                        "\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842" +
                        "\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C" +
                        "\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7" +
                        "\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B" +
                        "\\u1B83-\\u1BA0\\u1BAE-\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23" +
                        "\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1" +
                        "\\u1CF5-\\u1CF6\\u2135-\\u2138\\u2D30-\\u2D67\\u2D80-\\u2D96" +
                        "\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE" +
                        "\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006" +
                        "\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D" +
                        "\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5" +
                        "\\u4E00-\\u9FCC\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7" +
                        "\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A-\\uA62B\\uA66E\\uA6A0-\\uA6E5" +
                        "\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822" +
                        "\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925" +
                        "\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uAA00-\\uAA28" +
                        "\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A" +
                        "\\uAA80-\\uAAAF\\uAAB1\\uAAB5-\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2" +
                        "\\uAADB-\\uAADC\\uAAE0-\\uAAEA\\uAAF2\\uAB01-\\uAB06\\uAB09-\\uAB0E" +
                        "\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2" +
                        "\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D" +
                        "\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C" +
                        "\\uFB3E\\uFB40-\\uFB41\\uFB43-\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D" +
                        "\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74" +
                        "\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE" +
                        "\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC"
                },
                {
                    pattern: /^(?:Is_?)?(?:M|Mark)$/i,
                    charset:
                        "\\u0300-\\u036F\\u0483-\\u0489\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2" +
                        "\\u05C4-\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670" +
                        "\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7-\\u06E8\\u06EA-\\u06ED\\u0711" +
                        "\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819" +
                        "\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B" +
                        "\\u08E4-\\u08FE\\u0900-\\u0903\\u093A-\\u093C\\u093E-\\u094F" +
                        "\\u0951-\\u0957\\u0962-\\u0963\\u0981-\\u0983\\u09BC\\u09BE-\\u09C4" +
                        "\\u09C7-\\u09C8\\u09CB-\\u09CD\\u09D7\\u09E2-\\u09E3\\u0A01-\\u0A03" +
                        "\\u0A3C\\u0A3E-\\u0A42\\u0A47-\\u0A48\\u0A4B-\\u0A4D\\u0A51" +
                        "\\u0A70-\\u0A71\\u0A75\\u0A81-\\u0A83\\u0ABC\\u0ABE-\\u0AC5" +
                        "\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AE2-\\u0AE3\\u0B01-\\u0B03\\u0B3C" +
                        "\\u0B3E-\\u0B44\\u0B47-\\u0B48\\u0B4B-\\u0B4D\\u0B56-\\u0B57" +
                        "\\u0B62-\\u0B63\\u0B82\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD" +
                        "\\u0BD7\\u0C01-\\u0C03\\u0C3E-\\u0C44\\u0C46-\\u0C48\\u0C4A-\\u0C4D" +
                        "\\u0C55-\\u0C56\\u0C62-\\u0C63\\u0C82-\\u0C83\\u0CBC\\u0CBE-\\u0CC4" +
                        "\\u0CC6-\\u0CC8\\u0CCA-\\u0CCD\\u0CD5-\\u0CD6\\u0CE2-\\u0CE3" +
                        "\\u0D02-\\u0D03\\u0D3E-\\u0D44\\u0D46-\\u0D48\\u0D4A-\\u0D4D\\u0D57" +
                        "\\u0D62-\\u0D63\\u0D82-\\u0D83\\u0DCA\\u0DCF-\\u0DD4\\u0DD6" +
                        "\\u0DD8-\\u0DDF\\u0DF2-\\u0DF3\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E" +
                        "\\u0EB1\\u0EB4-\\u0EB9\\u0EBB-\\u0EBC\\u0EC8-\\u0ECD\\u0F18-\\u0F19" +
                        "\\u0F35\\u0F37\\u0F39\\u0F3E-\\u0F3F\\u0F71-\\u0F84\\u0F86-\\u0F87" +
                        "\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102B-\\u103E\\u1056-\\u1059" +
                        "\\u105E-\\u1060\\u1062-\\u1064\\u1067-\\u106D\\u1071-\\u1074" +
                        "\\u1082-\\u108D\\u108F\\u109A-\\u109D\\u135D-\\u135F\\u1712-\\u1714" +
                        "\\u1732-\\u1734\\u1752-\\u1753\\u1772-\\u1773\\u17B4-\\u17D3\\u17DD" +
                        "\\u180B-\\u180D\\u18A9\\u1920-\\u192B\\u1930-\\u193B\\u19B0-\\u19C0" +
                        "\\u19C8-\\u19C9\\u1A17-\\u1A1B\\u1A55-\\u1A5E\\u1A60-\\u1A7C\\u1A7F" +
                        "\\u1B00-\\u1B04\\u1B34-\\u1B44\\u1B6B-\\u1B73\\u1B80-\\u1B82" +
                        "\\u1BA1-\\u1BAD\\u1BE6-\\u1BF3\\u1C24-\\u1C37\\u1CD0-\\u1CD2" +
                        "\\u1CD4-\\u1CE8\\u1CED\\u1CF2-\\u1CF4\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF" +
                        "\\u20D0-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302F" +
                        "\\u3099-\\u309A\\uA66F-\\uA672\\uA674-\\uA67D\\uA69F\\uA6F0-\\uA6F1" +
                        "\\uA802\\uA806\\uA80B\\uA823-\\uA827\\uA880-\\uA881\\uA8B4-\\uA8C4" +
                        "\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA953\\uA980-\\uA983" +
                        "\\uA9B3-\\uA9C0\\uAA29-\\uAA36\\uAA43\\uAA4C-\\uAA4D\\uAA7B\\uAAB0" +
                        "\\uAAB2-\\uAAB4\\uAAB7-\\uAAB8\\uAABE-\\uAABF\\uAAC1\\uAAEB-\\uAAEF" +
                        "\\uAAF5-\\uAAF6\\uABE3-\\uABEA\\uABEC-\\uABED\\uFB1E\\uFE00-\\uFE0F" +
                        "\\uFE20-\\uFE26"
                },
                {
                    pattern: /^(?:Is_?)?(?:Mn|Nonspacing(?:[\-_]| *)Mark)$/i,
                    charset:
                        "\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2" +
                        "\\u05C4-\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670" +
                        "\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7-\\u06E8\\u06EA-\\u06ED\\u0711" +
                        "\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819" +
                        "\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B" +
                        "\\u08E4-\\u08FE\\u0900-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D" +
                        "\\u0951-\\u0957\\u0962-\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD" +
                        "\\u09E2-\\u09E3\\u0A01-\\u0A02\\u0A3C\\u0A41-\\u0A42\\u0A47-\\u0A48" +
                        "\\u0A4B-\\u0A4D\\u0A51\\u0A70-\\u0A71\\u0A75\\u0A81-\\u0A82\\u0ABC" +
                        "\\u0AC1-\\u0AC5\\u0AC7-\\u0AC8\\u0ACD\\u0AE2-\\u0AE3\\u0B01\\u0B3C" +
                        "\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62-\\u0B63\\u0B82\\u0BC0\\u0BCD" +
                        "\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55-\\u0C56" +
                        "\\u0C62-\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC-\\u0CCD\\u0CE2-\\u0CE3" +
                        "\\u0D41-\\u0D44\\u0D4D\\u0D62-\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6" +
                        "\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9" +
                        "\\u0EBB-\\u0EBC\\u0EC8-\\u0ECD\\u0F18-\\u0F19\\u0F35\\u0F37\\u0F39" +
                        "\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86-\\u0F87\\u0F8D-\\u0F97" +
                        "\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039-\\u103A" +
                        "\\u103D-\\u103E\\u1058-\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082" +
                        "\\u1085-\\u1086\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714" +
                        "\\u1732-\\u1734\\u1752-\\u1753\\u1772-\\u1773\\u17B4-\\u17B5" +
                        "\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9" +
                        "\\u1920-\\u1922\\u1927-\\u1928\\u1932\\u1939-\\u193B\\u1A17-\\u1A18" +
                        "\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C" +
                        "\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42" +
                        "\\u1B6B-\\u1B73\\u1B80-\\u1B81\\u1BA2-\\u1BA5\\u1BA8-\\u1BA9\\u1BAB" +
                        "\\u1BE6\\u1BE8-\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33" +
                        "\\u1C36-\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED" +
                        "\\u1CF4\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1" +
                        "\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302D" +
                        "\\u3099-\\u309A\\uA66F\\uA674-\\uA67D\\uA69F\\uA6F0-\\uA6F1\\uA802" +
                        "\\uA806\\uA80B\\uA825-\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D" +
                        "\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC" +
                        "\\uAA29-\\uAA2E\\uAA31-\\uAA32\\uAA35-\\uAA36\\uAA43\\uAA4C\\uAAB0" +
                        "\\uAAB2-\\uAAB4\\uAAB7-\\uAAB8\\uAABE-\\uAABF\\uAAC1\\uAAEC-\\uAAED" +
                        "\\uAAF6\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26"
                },
                {
                    pattern: /^(?:Is_?)?(?:Mc|Spacing(?:[\-_]| *)Mark)$/i,
                    charset:
                        "\\u0903\\u093B\\u093E-\\u0940\\u0949-\\u094C\\u094E-\\u094F" +
                        "\\u0982-\\u0983\\u09BE-\\u09C0\\u09C7-\\u09C8\\u09CB-\\u09CC\\u09D7" +
                        "\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB-\\u0ACC" +
                        "\\u0B02-\\u0B03\\u0B3E\\u0B40\\u0B47-\\u0B48\\u0B4B-\\u0B4C\\u0B57" +
                        "\\u0BBE-\\u0BBF\\u0BC1-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7" +
                        "\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82-\\u0C83\\u0CBE\\u0CC0-\\u0CC4" +
                        "\\u0CC7-\\u0CC8\\u0CCA-\\u0CCB\\u0CD5-\\u0CD6\\u0D02-\\u0D03" +
                        "\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82-\\u0D83" +
                        "\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2-\\u0DF3\\u0F3E-\\u0F3F\\u0F7F" +
                        "\\u102B-\\u102C\\u1031\\u1038\\u103B-\\u103C\\u1056-\\u1057" +
                        "\\u1062-\\u1064\\u1067-\\u106D\\u1083-\\u1084\\u1087-\\u108C\\u108F" +
                        "\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7-\\u17C8\\u1923-\\u1926" +
                        "\\u1929-\\u192B\\u1930-\\u1931\\u1933-\\u1938\\u19B0-\\u19C0" +
                        "\\u19C8-\\u19C9\\u1A19-\\u1A1B\\u1A55\\u1A57\\u1A61\\u1A63-\\u1A64" +
                        "\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43-\\u1B44" +
                        "\\u1B82\\u1BA1\\u1BA6-\\u1BA7\\u1BAA\\u1BAC-\\u1BAD\\u1BE7" +
                        "\\u1BEA-\\u1BEC\\u1BEE\\u1BF2-\\u1BF3\\u1C24-\\u1C2B\\u1C34-\\u1C35" +
                        "\\u1CE1\\u1CF2-\\u1CF3\\u302E-\\u302F\\uA823-\\uA824\\uA827" +
                        "\\uA880-\\uA881\\uA8B4-\\uA8C3\\uA952-\\uA953\\uA983\\uA9B4-\\uA9B5" +
                        "\\uA9BA-\\uA9BB\\uA9BD-\\uA9C0\\uAA2F-\\uAA30\\uAA33-\\uAA34\\uAA4D" +
                        "\\uAA7B\\uAAEB\\uAAEE-\\uAAEF\\uAAF5\\uABE3-\\uABE4\\uABE6-\\uABE7" +
                        "\\uABE9-\\uABEA\\uABEC"
                },
                {
                    pattern: /^(?:Is_?)?(?:Me|Enclosing(?:[\-_]| *)Mark)$/i,
                    charset:
                        "\\u0488-\\u0489\\u20DD-\\u20E0\\u20E2-\\u20E4\\uA670-\\uA672"
                },
                {
                    pattern: /^(?:Is_?)?(?:N|Number)$/i,
                    charset:
                        "\\u0030-\\u0039\\u00B2-\\u00B3\\u00B9\\u00BC-\\u00BE\\u0660-\\u0669" +
                        "\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF" +
                        "\\u09F4-\\u09F9\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F" +
                        "\\u0B72-\\u0B77\\u0BE6-\\u0BF2\\u0C66-\\u0C6F\\u0C78-\\u0C7E" +
                        "\\u0CE6-\\u0CEF\\u0D66-\\u0D75\\u0E50-\\u0E59\\u0ED0-\\u0ED9" +
                        "\\u0F20-\\u0F33\\u1040-\\u1049\\u1090-\\u1099\\u1369-\\u137C" +
                        "\\u16EE-\\u16F0\\u17E0-\\u17E9\\u17F0-\\u17F9\\u1810-\\u1819" +
                        "\\u1946-\\u194F\\u19D0-\\u19DA\\u1A80-\\u1A89\\u1A90-\\u1A99" +
                        "\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\u2070" +
                        "\\u2074-\\u2079\\u2080-\\u2089\\u2150-\\u2182\\u2185-\\u2189" +
                        "\\u2460-\\u249B\\u24EA-\\u24FF\\u2776-\\u2793\\u2CFD\\u3007" +
                        "\\u3021-\\u3029\\u3038-\\u303A\\u3192-\\u3195\\u3220-\\u3229" +
                        "\\u3248-\\u324F\\u3251-\\u325F\\u3280-\\u3289\\u32B1-\\u32BF" +
                        "\\uA620-\\uA629\\uA6E6-\\uA6EF\\uA830-\\uA835\\uA8D0-\\uA8D9" +
                        "\\uA900-\\uA909\\uA9D0-\\uA9D9\\uAA50-\\uAA59\\uABF0-\\uABF9" +
                        "\\uFF10-\\uFF19"
                },
                {
                    pattern: /^(?:Is_?)?(?:Nd|Decimal(?:[\-_]| *)Number)$/i,
                    charset:
                        "\\u0030-\\u0039\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9" +
                        "\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF" +
                        "\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF" +
                        "\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29" +
                        "\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819" +
                        "\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99" +
                        "\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59" +
                        "\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9" +
                        "\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19"
                },
                {
                    pattern: /^(?:Is_?)?(?:Nl|Letter(?:[\-_]| *)Number)$/i,
                    charset:
                        "\\u16EE-\\u16F0\\u2160-\\u2182\\u2185-\\u2188\\u3007\\u3021-\\u3029" +
                        "\\u3038-\\u303A\\uA6E6-\\uA6EF"
                },
                {
                    pattern: /^(?:Is_?)?(?:No|Other(?:[\-_]| *)Number)$/i,
                    charset:
                        "\\u00B2-\\u00B3\\u00B9\\u00BC-\\u00BE\\u09F4-\\u09F9\\u0B72-\\u0B77" +
                        "\\u0BF0-\\u0BF2\\u0C78-\\u0C7E\\u0D70-\\u0D75\\u0F2A-\\u0F33" +
                        "\\u1369-\\u137C\\u17F0-\\u17F9\\u19DA\\u2070\\u2074-\\u2079" +
                        "\\u2080-\\u2089\\u2150-\\u215F\\u2189\\u2460-\\u249B\\u24EA-\\u24FF" +
                        "\\u2776-\\u2793\\u2CFD\\u3192-\\u3195\\u3220-\\u3229\\u3248-\\u324F" +
                        "\\u3251-\\u325F\\u3280-\\u3289\\u32B1-\\u32BF\\uA830-\\uA835"
                },
                {
                    pattern: /^(?:Is_?)?(?:P|Punctuation)$/i,
                    charset:
                        "\\u0021-\\u0023\\u0025-\\u002A\\u002C-\\u002F\\u003A-\\u003B" +
                        "\\u003F-\\u0040\\u005B-\\u005D\\u005F\\u007B\\u007D\\u00A1\\u00A7\\u00AB" +
                        "\\u00B6-\\u00B7\\u00BB\\u00BF\\u037E\\u0387\\u055A-\\u055F" +
                        "\\u0589-\\u058A\\u05BE\\u05C0\\u05C3\\u05C6\\u05F3-\\u05F4" +
                        "\\u0609-\\u060A\\u060C-\\u060D\\u061B\\u061E-\\u061F\\u066A-\\u066D" +
                        "\\u06D4\\u0700-\\u070D\\u07F7-\\u07F9\\u0830-\\u083E\\u085E" +
                        "\\u0964-\\u0965\\u0970\\u0AF0\\u0DF4\\u0E4F\\u0E5A-\\u0E5B" +
                        "\\u0F04-\\u0F12\\u0F14\\u0F3A-\\u0F3D\\u0F85\\u0FD0-\\u0FD4" +
                        "\\u0FD9-\\u0FDA\\u104A-\\u104F\\u10FB\\u1360-\\u1368\\u1400" +
                        "\\u166D-\\u166E\\u169B-\\u169C\\u16EB-\\u16ED\\u1735-\\u1736" +
                        "\\u17D4-\\u17D6\\u17D8-\\u17DA\\u1800-\\u180A\\u1944-\\u1945" +
                        "\\u1A1E-\\u1A1F\\u1AA0-\\u1AA6\\u1AA8-\\u1AAD\\u1B5A-\\u1B60" +
                        "\\u1BFC-\\u1BFF\\u1C3B-\\u1C3F\\u1C7E-\\u1C7F\\u1CC0-\\u1CC7\\u1CD3" +
                        "\\u2010-\\u2027\\u2030-\\u2043\\u2045-\\u2051\\u2053-\\u205E" +
                        "\\u207D-\\u207E\\u208D-\\u208E\\u2329-\\u232A\\u2768-\\u2775" +
                        "\\u27C5-\\u27C6\\u27E6-\\u27EF\\u2983-\\u2998\\u29D8-\\u29DB" +
                        "\\u29FC-\\u29FD\\u2CF9-\\u2CFC\\u2CFE-\\u2CFF\\u2D70\\u2E00-\\u2E2E" +
                        "\\u2E30-\\u2E3B\\u3001-\\u3003\\u3008-\\u3011\\u3014-\\u301F\\u3030" +
                        "\\u303D\\u30A0\\u30FB\\uA4FE-\\uA4FF\\uA60D-\\uA60F\\uA673\\uA67E" +
                        "\\uA6F2-\\uA6F7\\uA874-\\uA877\\uA8CE-\\uA8CF\\uA8F8-\\uA8FA" +
                        "\\uA92E-\\uA92F\\uA95F\\uA9C1-\\uA9CD\\uA9DE-\\uA9DF\\uAA5C-\\uAA5F" +
                        "\\uAADE-\\uAADF\\uAAF0-\\uAAF1\\uABEB\\uFD3E-\\uFD3F\\uFE10-\\uFE19" +
                        "\\uFE30-\\uFE52\\uFE54-\\uFE61\\uFE63\\uFE68\\uFE6A-\\uFE6B" +
                        "\\uFF01-\\uFF03\\uFF05-\\uFF0A\\uFF0C-\\uFF0F\\uFF1A-\\uFF1B" +
                        "\\uFF1F-\\uFF20\\uFF3B-\\uFF3D\\uFF3F\\uFF5B\\uFF5D\\uFF5F-\\uFF65"
                },
                {
                    pattern: /^(?:Is_?)?(?:Pc|Connector(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u005F\\u203F-\\u2040\\u2054\\uFE33-\\uFE34\\uFE4D-\\uFE4F\\uFF3F"
                },
                {
                    pattern: /^(?:Is_?)?(?:Pd|Dash(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u002D\\u058A\\u05BE\\u1400\\u1806\\u2010-\\u2015\\u2E17\\u2E1A" +
                        "\\u2E3A-\\u2E3B\\u301C\\u3030\\u30A0\\uFE31-\\uFE32\\uFE58\\uFE63\\uFF0D"
                },
                {
                    pattern: /^(?:Is_?)?(?:Ps|Open(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u0028\\u005B\\u007B\\u0F3A\\u0F3C\\u169B\\u201A\\u201E\\u2045\\u207D" +
                        "\\u208D\\u2329\\u2768\\u276A\\u276C\\u276E\\u2770\\u2772\\u2774\\u27C5" +
                        "\\u27E6\\u27E8\\u27EA\\u27EC\\u27EE\\u2983\\u2985\\u2987\\u2989\\u298B" +
                        "\\u298D\\u298F\\u2991\\u2993\\u2995\\u2997\\u29D8\\u29DA\\u29FC\\u2E22" +
                        "\\u2E24\\u2E26\\u2E28\\u3008\\u300A\\u300C\\u300E\\u3010\\u3014\\u3016" +
                        "\\u3018\\u301A\\u301D\\uFD3E\\uFE17\\uFE35\\uFE37\\uFE39\\uFE3B\\uFE3D" +
                        "\\uFE3F\\uFE41\\uFE43\\uFE47\\uFE59\\uFE5B\\uFE5D\\uFF08\\uFF3B\\uFF5B" +
                        "\\uFF5F\\uFF62"
                },
                {
                    pattern: /^(?:Is_?)?(?:Pe|Close(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u0029\\u005D\\u007D\\u0F3B\\u0F3D\\u169C\\u2046\\u207E\\u208E\\u232A" +
                        "\\u2769\\u276B\\u276D\\u276F\\u2771\\u2773\\u2775\\u27C6\\u27E7\\u27E9" +
                        "\\u27EB\\u27ED\\u27EF\\u2984\\u2986\\u2988\\u298A\\u298C\\u298E\\u2990" +
                        "\\u2992\\u2994\\u2996\\u2998\\u29D9\\u29DB\\u29FD\\u2E23\\u2E25\\u2E27" +
                        "\\u2E29\\u3009\\u300B\\u300D\\u300F\\u3011\\u3015\\u3017\\u3019\\u301B" +
                        "\\u301E-\\u301F\\uFD3F\\uFE18\\uFE36\\uFE38\\uFE3A\\uFE3C\\uFE3E\\uFE40" +
                        "\\uFE42\\uFE44\\uFE48\\uFE5A\\uFE5C\\uFE5E\\uFF09\\uFF3D\\uFF5D\\uFF60" +
                        "\\uFF63"
                },
                {
                    pattern: /^(?:Is_?)?(?:Pi|Initial(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u00AB\\u2018\\u201B-\\u201C\\u201F\\u2039\\u2E02\\u2E04\\u2E09\\u2E0C" +
                        "\\u2E1C\\u2E20"
                },
                {
                    pattern: /^(?:Is_?)?(?:Pf|Final(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u00BB\\u2019\\u201D\\u203A\\u2E03\\u2E05\\u2E0A\\u2E0D\\u2E1D\\u2E21"
                },
                {
                    pattern: /^(?:Is_?)?(?:Po|Other(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u0021-\\u0023\\u0025-\\u0027\\u002A\\u002C\\u002E-\\u002F" +
                        "\\u003A-\\u003B\\u003F-\\u0040\\u005C\\u00A1\\u00A7\\u00B6-\\u00B7" +
                        "\\u00BF\\u037E\\u0387\\u055A-\\u055F\\u0589\\u05C0\\u05C3\\u05C6" +
                        "\\u05F3-\\u05F4\\u0609-\\u060A\\u060C-\\u060D\\u061B\\u061E-\\u061F" +
                        "\\u066A-\\u066D\\u06D4\\u0700-\\u070D\\u07F7-\\u07F9\\u0830-\\u083E" +
                        "\\u085E\\u0964-\\u0965\\u0970\\u0AF0\\u0DF4\\u0E4F\\u0E5A-\\u0E5B" +
                        "\\u0F04-\\u0F12\\u0F14\\u0F85\\u0FD0-\\u0FD4\\u0FD9-\\u0FDA" +
                        "\\u104A-\\u104F\\u10FB\\u1360-\\u1368\\u166D-\\u166E\\u16EB-\\u16ED" +
                        "\\u1735-\\u1736\\u17D4-\\u17D6\\u17D8-\\u17DA\\u1800-\\u1805" +
                        "\\u1807-\\u180A\\u1944-\\u1945\\u1A1E-\\u1A1F\\u1AA0-\\u1AA6" +
                        "\\u1AA8-\\u1AAD\\u1B5A-\\u1B60\\u1BFC-\\u1BFF\\u1C3B-\\u1C3F" +
                        "\\u1C7E-\\u1C7F\\u1CC0-\\u1CC7\\u1CD3\\u2016-\\u2017\\u2020-\\u2027" +
                        "\\u2030-\\u2038\\u203B-\\u203E\\u2041-\\u2043\\u2047-\\u2051\\u2053" +
                        "\\u2055-\\u205E\\u2CF9-\\u2CFC\\u2CFE-\\u2CFF\\u2D70\\u2E00-\\u2E01" +
                        "\\u2E06-\\u2E08\\u2E0B\\u2E0E-\\u2E16\\u2E18-\\u2E19\\u2E1B" +
                        "\\u2E1E-\\u2E1F\\u2E2A-\\u2E2E\\u2E30-\\u2E39\\u3001-\\u3003\\u303D" +
                        "\\u30FB\\uA4FE-\\uA4FF\\uA60D-\\uA60F\\uA673\\uA67E\\uA6F2-\\uA6F7" +
                        "\\uA874-\\uA877\\uA8CE-\\uA8CF\\uA8F8-\\uA8FA\\uA92E-\\uA92F\\uA95F" +
                        "\\uA9C1-\\uA9CD\\uA9DE-\\uA9DF\\uAA5C-\\uAA5F\\uAADE-\\uAADF" +
                        "\\uAAF0-\\uAAF1\\uABEB\\uFE10-\\uFE16\\uFE19\\uFE30\\uFE45-\\uFE46" +
                        "\\uFE49-\\uFE4C\\uFE50-\\uFE52\\uFE54-\\uFE57\\uFE5F-\\uFE61\\uFE68" +
                        "\\uFE6A-\\uFE6B\\uFF01-\\uFF03\\uFF05-\\uFF07\\uFF0A\\uFF0C" +
                        "\\uFF0E-\\uFF0F\\uFF1A-\\uFF1B\\uFF1F-\\uFF20\\uFF3C\\uFF61" +
                        "\\uFF64-\\uFF65"
                },
                {
                    pattern: /^(?:Is_?)?(?:S|Symbol)$/i,
                    charset:
                        "\\u0024\\u002B\\u003C-\\u003E\\u005E\\u0060\\u007C\\u007E\\u00A2-\\u00A6" +
                        "\\u00A8-\\u00A9\\u00AC\\u00AE-\\u00B1\\u00B4\\u00B8\\u00D7\\u00F7" +
                        "\\u02C2-\\u02C5\\u02D2-\\u02DF\\u02E5-\\u02EB\\u02ED\\u02EF-\\u02FF" +
                        "\\u0375\\u0384-\\u0385\\u03F6\\u0482\\u058F\\u0606-\\u0608\\u060B" +
                        "\\u060E-\\u060F\\u06DE\\u06E9\\u06FD-\\u06FE\\u07F6\\u09F2-\\u09F3" +
                        "\\u09FA-\\u09FB\\u0AF1\\u0B70\\u0BF3-\\u0BFA\\u0C7F\\u0D79\\u0E3F" +
                        "\\u0F01-\\u0F03\\u0F13\\u0F15-\\u0F17\\u0F1A-\\u0F1F\\u0F34\\u0F36" +
                        "\\u0F38\\u0FBE-\\u0FC5\\u0FC7-\\u0FCC\\u0FCE-\\u0FCF\\u0FD5-\\u0FD8" +
                        "\\u109E-\\u109F\\u1390-\\u1399\\u17DB\\u1940\\u19DE-\\u19FF" +
                        "\\u1B61-\\u1B6A\\u1B74-\\u1B7C\\u1FBD\\u1FBF-\\u1FC1\\u1FCD-\\u1FCF" +
                        "\\u1FDD-\\u1FDF\\u1FED-\\u1FEF\\u1FFD-\\u1FFE\\u2044\\u2052" +
                        "\\u207A-\\u207C\\u208A-\\u208C\\u20A0-\\u20BA\\u2100-\\u2101" +
                        "\\u2103-\\u2106\\u2108-\\u2109\\u2114\\u2116-\\u2118\\u211E-\\u2123" +
                        "\\u2125\\u2127\\u2129\\u212E\\u213A-\\u213B\\u2140-\\u2144" +
                        "\\u214A-\\u214D\\u214F\\u2190-\\u2328\\u232B-\\u23F3\\u2400-\\u2426" +
                        "\\u2440-\\u244A\\u249C-\\u24E9\\u2500-\\u26FF\\u2701-\\u2767" +
                        "\\u2794-\\u27C4\\u27C7-\\u27E5\\u27F0-\\u2982\\u2999-\\u29D7" +
                        "\\u29DC-\\u29FB\\u29FE-\\u2B4C\\u2B50-\\u2B59\\u2CE5-\\u2CEA" +
                        "\\u2E80-\\u2E99\\u2E9B-\\u2EF3\\u2F00-\\u2FD5\\u2FF0-\\u2FFB\\u3004" +
                        "\\u3012-\\u3013\\u3020\\u3036-\\u3037\\u303E-\\u303F\\u309B-\\u309C" +
                        "\\u3190-\\u3191\\u3196-\\u319F\\u31C0-\\u31E3\\u3200-\\u321E" +
                        "\\u322A-\\u3247\\u3250\\u3260-\\u327F\\u328A-\\u32B0\\u32C0-\\u32FE" +
                        "\\u3300-\\u33FF\\u4DC0-\\u4DFF\\uA490-\\uA4C6\\uA700-\\uA716" +
                        "\\uA720-\\uA721\\uA789-\\uA78A\\uA828-\\uA82B\\uA836-\\uA839" +
                        "\\uAA77-\\uAA79\\uFB29\\uFBB2-\\uFBC1\\uFDFC-\\uFDFD\\uFE62" +
                        "\\uFE64-\\uFE66\\uFE69\\uFF04\\uFF0B\\uFF1C-\\uFF1E\\uFF3E\\uFF40\\uFF5C" +
                        "\\uFF5E\\uFFE0-\\uFFE6\\uFFE8-\\uFFEE\\uFFFC-\\uFFFD"
                },
                {
                    pattern: /^(?:Is_?)?(?:Sm|Math(?:[\-_]| *)Symbol)$/i,
                    charset:
                        "\\u002B\\u003C-\\u003E\\u007C\\u007E\\u00AC\\u00B1\\u00D7\\u00F7\\u03F6" +
                        "\\u0606-\\u0608\\u2044\\u2052\\u207A-\\u207C\\u208A-\\u208C\\u2118" +
                        "\\u2140-\\u2144\\u214B\\u2190-\\u2194\\u219A-\\u219B\\u21A0\\u21A3" +
                        "\\u21A6\\u21AE\\u21CE-\\u21CF\\u21D2\\u21D4\\u21F4-\\u22FF" +
                        "\\u2308-\\u230B\\u2320-\\u2321\\u237C\\u239B-\\u23B3\\u23DC-\\u23E1" +
                        "\\u25B7\\u25C1\\u25F8-\\u25FF\\u266F\\u27C0-\\u27C4\\u27C7-\\u27E5" +
                        "\\u27F0-\\u27FF\\u2900-\\u2982\\u2999-\\u29D7\\u29DC-\\u29FB" +
                        "\\u29FE-\\u2AFF\\u2B30-\\u2B44\\u2B47-\\u2B4C\\uFB29\\uFE62" +
                        "\\uFE64-\\uFE66\\uFF0B\\uFF1C-\\uFF1E\\uFF5C\\uFF5E\\uFFE2" +
                        "\\uFFE9-\\uFFEC"
                },
                {
                    pattern: /^(?:Is_?)?(?:Sc|Currency(?:[\-_]| *)Symbol)$/i,
                    charset:
                        "\\u0024\\u00A2-\\u00A5\\u058F\\u060B\\u09F2-\\u09F3\\u09FB\\u0AF1\\u0BF9" +
                        "\\u0E3F\\u17DB\\u20A0-\\u20BA\\uA838\\uFDFC\\uFE69\\uFF04\\uFFE0-\\uFFE1" +
                        "\\uFFE5-\\uFFE6"
                },
                {
                    pattern: /^(?:Is_?)?(?:Sk|Modifier(?:[\-_]| *)Symbol)$/i,
                    charset:
                        "\\u005E\\u0060\\u00A8\\u00AF\\u00B4\\u00B8\\u02C2-\\u02C5\\u02D2-\\u02DF" +
                        "\\u02E5-\\u02EB\\u02ED\\u02EF-\\u02FF\\u0375\\u0384-\\u0385\\u1FBD" +
                        "\\u1FBF-\\u1FC1\\u1FCD-\\u1FCF\\u1FDD-\\u1FDF\\u1FED-\\u1FEF" +
                        "\\u1FFD-\\u1FFE\\u309B-\\u309C\\uA700-\\uA716\\uA720-\\uA721" +
                        "\\uA789-\\uA78A\\uFBB2-\\uFBC1\\uFF3E\\uFF40\\uFFE3"
                },
                {
                    pattern: /^(?:Is_?)?(?:So|Other(?:[\-_]| *)Symbol)$/i,
                    charset:
                        "\\u00A6\\u00A9\\u00AE\\u00B0\\u0482\\u060E-\\u060F\\u06DE\\u06E9" +
                        "\\u06FD-\\u06FE\\u07F6\\u09FA\\u0B70\\u0BF3-\\u0BF8\\u0BFA\\u0C7F\\u0D79" +
                        "\\u0F01-\\u0F03\\u0F13\\u0F15-\\u0F17\\u0F1A-\\u0F1F\\u0F34\\u0F36" +
                        "\\u0F38\\u0FBE-\\u0FC5\\u0FC7-\\u0FCC\\u0FCE-\\u0FCF\\u0FD5-\\u0FD8" +
                        "\\u109E-\\u109F\\u1390-\\u1399\\u1940\\u19DE-\\u19FF\\u1B61-\\u1B6A" +
                        "\\u1B74-\\u1B7C\\u2100-\\u2101\\u2103-\\u2106\\u2108-\\u2109\\u2114" +
                        "\\u2116-\\u2117\\u211E-\\u2123\\u2125\\u2127\\u2129\\u212E" +
                        "\\u213A-\\u213B\\u214A\\u214C-\\u214D\\u214F\\u2195-\\u2199" +
                        "\\u219C-\\u219F\\u21A1-\\u21A2\\u21A4-\\u21A5\\u21A7-\\u21AD" +
                        "\\u21AF-\\u21CD\\u21D0-\\u21D1\\u21D3\\u21D5-\\u21F3\\u2300-\\u2307" +
                        "\\u230C-\\u231F\\u2322-\\u2328\\u232B-\\u237B\\u237D-\\u239A" +
                        "\\u23B4-\\u23DB\\u23E2-\\u23F3\\u2400-\\u2426\\u2440-\\u244A" +
                        "\\u249C-\\u24E9\\u2500-\\u25B6\\u25B8-\\u25C0\\u25C2-\\u25F7" +
                        "\\u2600-\\u266E\\u2670-\\u26FF\\u2701-\\u2767\\u2794-\\u27BF" +
                        "\\u2800-\\u28FF\\u2B00-\\u2B2F\\u2B45-\\u2B46\\u2B50-\\u2B59" +
                        "\\u2CE5-\\u2CEA\\u2E80-\\u2E99\\u2E9B-\\u2EF3\\u2F00-\\u2FD5" +
                        "\\u2FF0-\\u2FFB\\u3004\\u3012-\\u3013\\u3020\\u3036-\\u3037" +
                        "\\u303E-\\u303F\\u3190-\\u3191\\u3196-\\u319F\\u31C0-\\u31E3" +
                        "\\u3200-\\u321E\\u322A-\\u3247\\u3250\\u3260-\\u327F\\u328A-\\u32B0" +
                        "\\u32C0-\\u32FE\\u3300-\\u33FF\\u4DC0-\\u4DFF\\uA490-\\uA4C6" +
                        "\\uA828-\\uA82B\\uA836-\\uA837\\uA839\\uAA77-\\uAA79\\uFDFD\\uFFE4" +
                        "\\uFFE8\\uFFED-\\uFFEE\\uFFFC-\\uFFFD"
                },
                {
                    pattern: /^(?:Is_?)?(?:Z|Separator)$/i,
                    charset:
                        "\\u0020\\u00A0\\u1680\\u180E\\u2000-\\u200A\\u2028-\\u2029\\u202F\\u205F" +
                        "\\u3000"
                },
                {
                    pattern: /^(?:Is_?)?(?:Zs|Space(?:[\-_]| *)Separator)$/i,
                    charset:
                        "\\u0020\\u00A0\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000"
                },
                {
                    pattern: /^(?:Is_?)?(?:Zl|Line(?:[\-_]| *)Separator)$/i,
                    charset:
                        "\\u2028"
                },
                {
                    pattern: /^(?:Is_?)?(?:Zp|Paragraph(?:[\-_]| *)Separator)$/i,
                    charset:
                        "\\u2029"
                },
                {
                    pattern: /^(?:Is_?)?(?:C|Other)$/i,
                    charset:
                        "\\u0000-\\u001F\\u007F-\\u009F\\u00AD\\u0378-\\u0379\\u037F-\\u0383" +
                        "\\u038B\\u038D\\u03A2\\u0528-\\u0530\\u0557-\\u0558\\u0560\\u0588" +
                        "\\u058B-\\u058E\\u0590\\u05C8-\\u05CF\\u05EB-\\u05EF\\u05F5-\\u0605" +
                        "\\u061C-\\u061D\\u06DD\\u070E-\\u070F\\u074B-\\u074C\\u07B2-\\u07BF" +
                        "\\u07FB-\\u07FF\\u082E-\\u082F\\u083F\\u085C-\\u085D\\u085F-\\u089F" +
                        "\\u08A1\\u08AD-\\u08E3\\u08FF\\u0978\\u0980\\u0984\\u098D-\\u098E" +
                        "\\u0991-\\u0992\\u09A9\\u09B1\\u09B3-\\u09B5\\u09BA-\\u09BB" +
                        "\\u09C5-\\u09C6\\u09C9-\\u09CA\\u09CF-\\u09D6\\u09D8-\\u09DB\\u09DE" +
                        "\\u09E4-\\u09E5\\u09FC-\\u0A00\\u0A04\\u0A0B-\\u0A0E\\u0A11-\\u0A12" +
                        "\\u0A29\\u0A31\\u0A34\\u0A37\\u0A3A-\\u0A3B\\u0A3D\\u0A43-\\u0A46" +
                        "\\u0A49-\\u0A4A\\u0A4E-\\u0A50\\u0A52-\\u0A58\\u0A5D\\u0A5F-\\u0A65" +
                        "\\u0A76-\\u0A80\\u0A84\\u0A8E\\u0A92\\u0AA9\\u0AB1\\u0AB4\\u0ABA-\\u0ABB" +
                        "\\u0AC6\\u0ACA\\u0ACE-\\u0ACF\\u0AD1-\\u0ADF\\u0AE4-\\u0AE5" +
                        "\\u0AF2-\\u0B00\\u0B04\\u0B0D-\\u0B0E\\u0B11-\\u0B12\\u0B29\\u0B31" +
                        "\\u0B34\\u0B3A-\\u0B3B\\u0B45-\\u0B46\\u0B49-\\u0B4A\\u0B4E-\\u0B55" +
                        "\\u0B58-\\u0B5B\\u0B5E\\u0B64-\\u0B65\\u0B78-\\u0B81\\u0B84" +
                        "\\u0B8B-\\u0B8D\\u0B91\\u0B96-\\u0B98\\u0B9B\\u0B9D\\u0BA0-\\u0BA2" +
                        "\\u0BA5-\\u0BA7\\u0BAB-\\u0BAD\\u0BBA-\\u0BBD\\u0BC3-\\u0BC5\\u0BC9" +
                        "\\u0BCE-\\u0BCF\\u0BD1-\\u0BD6\\u0BD8-\\u0BE5\\u0BFB-\\u0C00\\u0C04" +
                        "\\u0C0D\\u0C11\\u0C29\\u0C34\\u0C3A-\\u0C3C\\u0C45\\u0C49\\u0C4E-\\u0C54" +
                        "\\u0C57\\u0C5A-\\u0C5F\\u0C64-\\u0C65\\u0C70-\\u0C77\\u0C80-\\u0C81" +
                        "\\u0C84\\u0C8D\\u0C91\\u0CA9\\u0CB4\\u0CBA-\\u0CBB\\u0CC5\\u0CC9" +
                        "\\u0CCE-\\u0CD4\\u0CD7-\\u0CDD\\u0CDF\\u0CE4-\\u0CE5\\u0CF0" +
                        "\\u0CF3-\\u0D01\\u0D04\\u0D0D\\u0D11\\u0D3B-\\u0D3C\\u0D45\\u0D49" +
                        "\\u0D4F-\\u0D56\\u0D58-\\u0D5F\\u0D64-\\u0D65\\u0D76-\\u0D78" +
                        "\\u0D80-\\u0D81\\u0D84\\u0D97-\\u0D99\\u0DB2\\u0DBC\\u0DBE-\\u0DBF" +
                        "\\u0DC7-\\u0DC9\\u0DCB-\\u0DCE\\u0DD5\\u0DD7\\u0DE0-\\u0DF1" +
                        "\\u0DF5-\\u0E00\\u0E3B-\\u0E3E\\u0E5C-\\u0E80\\u0E83\\u0E85-\\u0E86" +
                        "\\u0E89\\u0E8B-\\u0E8C\\u0E8E-\\u0E93\\u0E98\\u0EA0\\u0EA4\\u0EA6" +
                        "\\u0EA8-\\u0EA9\\u0EAC\\u0EBA\\u0EBE-\\u0EBF\\u0EC5\\u0EC7" +
                        "\\u0ECE-\\u0ECF\\u0EDA-\\u0EDB\\u0EE0-\\u0EFF\\u0F48\\u0F6D-\\u0F70" +
                        "\\u0F98\\u0FBD\\u0FCD\\u0FDB-\\u0FFF\\u10C6\\u10C8-\\u10CC" +
                        "\\u10CE-\\u10CF\\u1249\\u124E-\\u124F\\u1257\\u1259\\u125E-\\u125F" +
                        "\\u1289\\u128E-\\u128F\\u12B1\\u12B6-\\u12B7\\u12BF\\u12C1" +
                        "\\u12C6-\\u12C7\\u12D7\\u1311\\u1316-\\u1317\\u135B-\\u135C" +
                        "\\u137D-\\u137F\\u139A-\\u139F\\u13F5-\\u13FF\\u169D-\\u169F" +
                        "\\u16F1-\\u16FF\\u170D\\u1715-\\u171F\\u1737-\\u173F\\u1754-\\u175F" +
                        "\\u176D\\u1771\\u1774-\\u177F\\u17DE-\\u17DF\\u17EA-\\u17EF" +
                        "\\u17FA-\\u17FF\\u180F\\u181A-\\u181F\\u1878-\\u187F\\u18AB-\\u18AF" +
                        "\\u18F6-\\u18FF\\u191D-\\u191F\\u192C-\\u192F\\u193C-\\u193F" +
                        "\\u1941-\\u1943\\u196E-\\u196F\\u1975-\\u197F\\u19AC-\\u19AF" +
                        "\\u19CA-\\u19CF\\u19DB-\\u19DD\\u1A1C-\\u1A1D\\u1A5F\\u1A7D-\\u1A7E" +
                        "\\u1A8A-\\u1A8F\\u1A9A-\\u1A9F\\u1AAE-\\u1AFF\\u1B4C-\\u1B4F" +
                        "\\u1B7D-\\u1B7F\\u1BF4-\\u1BFB\\u1C38-\\u1C3A\\u1C4A-\\u1C4C" +
                        "\\u1C80-\\u1CBF\\u1CC8-\\u1CCF\\u1CF7-\\u1CFF\\u1DE7-\\u1DFB" +
                        "\\u1F16-\\u1F17\\u1F1E-\\u1F1F\\u1F46-\\u1F47\\u1F4E-\\u1F4F\\u1F58" +
                        "\\u1F5A\\u1F5C\\u1F5E\\u1F7E-\\u1F7F\\u1FB5\\u1FC5\\u1FD4-\\u1FD5\\u1FDC" +
                        "\\u1FF0-\\u1FF1\\u1FF5\\u1FFF\\u200B-\\u200F\\u202A-\\u202E" +
                        "\\u2060-\\u206F\\u2072-\\u2073\\u208F\\u209D-\\u209F\\u20BB-\\u20CF" +
                        "\\u20F1-\\u20FF\\u218A-\\u218F\\u23F4-\\u23FF\\u2427-\\u243F" +
                        "\\u244B-\\u245F\\u2700\\u2B4D-\\u2B4F\\u2B5A-\\u2BFF\\u2C2F\\u2C5F" +
                        "\\u2CF4-\\u2CF8\\u2D26\\u2D28-\\u2D2C\\u2D2E-\\u2D2F\\u2D68-\\u2D6E" +
                        "\\u2D71-\\u2D7E\\u2D97-\\u2D9F\\u2DA7\\u2DAF\\u2DB7\\u2DBF\\u2DC7\\u2DCF" +
                        "\\u2DD7\\u2DDF\\u2E3C-\\u2E7F\\u2E9A\\u2EF4-\\u2EFF\\u2FD6-\\u2FEF" +
                        "\\u2FFC-\\u2FFF\\u3040\\u3097-\\u3098\\u3100-\\u3104\\u312E-\\u3130" +
                        "\\u318F\\u31BB-\\u31BF\\u31E4-\\u31EF\\u321F\\u32FF\\u4DB6-\\u4DBF" +
                        "\\u9FCD-\\u9FFF\\uA48D-\\uA48F\\uA4C7-\\uA4CF\\uA62C-\\uA63F" +
                        "\\uA698-\\uA69E\\uA6F8-\\uA6FF\\uA78F\\uA794-\\uA79F\\uA7AB-\\uA7F7" +
                        "\\uA82C-\\uA82F\\uA83A-\\uA83F\\uA878-\\uA87F\\uA8C5-\\uA8CD" +
                        "\\uA8DA-\\uA8DF\\uA8FC-\\uA8FF\\uA954-\\uA95E\\uA97D-\\uA97F\\uA9CE" +
                        "\\uA9DA-\\uA9DD\\uA9E0-\\uA9FF\\uAA37-\\uAA3F\\uAA4E-\\uAA4F" +
                        "\\uAA5A-\\uAA5B\\uAA7C-\\uAA7F\\uAAC3-\\uAADA\\uAAF7-\\uAB00" +
                        "\\uAB07-\\uAB08\\uAB0F-\\uAB10\\uAB17-\\uAB1F\\uAB27\\uAB2F-\\uABBF" +
                        "\\uABEE-\\uABEF\\uABFA-\\uABFF\\uD7A4-\\uD7AF\\uD7C7-\\uD7CA" +
                        "\\uD7FC-\\uF8FF\\uFA6E-\\uFA6F\\uFADA-\\uFAFF\\uFB07-\\uFB12" +
                        "\\uFB18-\\uFB1C\\uFB37\\uFB3D\\uFB3F\\uFB42\\uFB45\\uFBC2-\\uFBD2" +
                        "\\uFD40-\\uFD4F\\uFD90-\\uFD91\\uFDC8-\\uFDEF\\uFDFE-\\uFDFF" +
                        "\\uFE1A-\\uFE1F\\uFE27-\\uFE2F\\uFE53\\uFE67\\uFE6C-\\uFE6F\\uFE75" +
                        "\\uFEFD-\\uFF00\\uFFBF-\\uFFC1\\uFFC8-\\uFFC9\\uFFD0-\\uFFD1" +
                        "\\uFFD8-\\uFFD9\\uFFDD-\\uFFDF\\uFFE7\\uFFEF-\\uFFFB\\uFFFE-\\uFFFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:Cc|Control)$/i,
                    charset:
                        "\\u0000-\\u001F\\u007F-\\u009F"
                },
                {
                    pattern: /^(?:Is_?)?(?:Cf|Format)$/i,
                    charset:
                        "\\u00AD\\u0600-\\u0604\\u06DD\\u070F\\u200B-\\u200F\\u202A-\\u202E" +
                        "\\u2060-\\u2064\\u206A-\\u206F\\uFEFF\\uFFF9-\\uFFFB"
                },
                {
                    pattern: /^(?:Is_?)?(?:Cs|Surrogate)$/i,
                    charset:
                        "\\uD800-\\uDFFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:Co|Private(?:[\-_]| *)Use)$/i,
                    charset:
                        "\\uE000-\\uF8FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:Cn|Unassigned)$/i,
                    charset:
                        "\\u0378-\\u0379\\u037F-\\u0383\\u038B\\u038D\\u03A2\\u0528-\\u0530" +
                        "\\u0557-\\u0558\\u0560\\u0588\\u058B-\\u058E\\u0590\\u05C8-\\u05CF" +
                        "\\u05EB-\\u05EF\\u05F5-\\u05FF\\u0605\\u061C-\\u061D\\u070E" +
                        "\\u074B-\\u074C\\u07B2-\\u07BF\\u07FB-\\u07FF\\u082E-\\u082F\\u083F" +
                        "\\u085C-\\u085D\\u085F-\\u089F\\u08A1\\u08AD-\\u08E3\\u08FF\\u0978" +
                        "\\u0980\\u0984\\u098D-\\u098E\\u0991-\\u0992\\u09A9\\u09B1" +
                        "\\u09B3-\\u09B5\\u09BA-\\u09BB\\u09C5-\\u09C6\\u09C9-\\u09CA" +
                        "\\u09CF-\\u09D6\\u09D8-\\u09DB\\u09DE\\u09E4-\\u09E5\\u09FC-\\u0A00" +
                        "\\u0A04\\u0A0B-\\u0A0E\\u0A11-\\u0A12\\u0A29\\u0A31\\u0A34\\u0A37" +
                        "\\u0A3A-\\u0A3B\\u0A3D\\u0A43-\\u0A46\\u0A49-\\u0A4A\\u0A4E-\\u0A50" +
                        "\\u0A52-\\u0A58\\u0A5D\\u0A5F-\\u0A65\\u0A76-\\u0A80\\u0A84\\u0A8E" +
                        "\\u0A92\\u0AA9\\u0AB1\\u0AB4\\u0ABA-\\u0ABB\\u0AC6\\u0ACA\\u0ACE-\\u0ACF" +
                        "\\u0AD1-\\u0ADF\\u0AE4-\\u0AE5\\u0AF2-\\u0B00\\u0B04\\u0B0D-\\u0B0E" +
                        "\\u0B11-\\u0B12\\u0B29\\u0B31\\u0B34\\u0B3A-\\u0B3B\\u0B45-\\u0B46" +
                        "\\u0B49-\\u0B4A\\u0B4E-\\u0B55\\u0B58-\\u0B5B\\u0B5E\\u0B64-\\u0B65" +
                        "\\u0B78-\\u0B81\\u0B84\\u0B8B-\\u0B8D\\u0B91\\u0B96-\\u0B98\\u0B9B" +
                        "\\u0B9D\\u0BA0-\\u0BA2\\u0BA5-\\u0BA7\\u0BAB-\\u0BAD\\u0BBA-\\u0BBD" +
                        "\\u0BC3-\\u0BC5\\u0BC9\\u0BCE-\\u0BCF\\u0BD1-\\u0BD6\\u0BD8-\\u0BE5" +
                        "\\u0BFB-\\u0C00\\u0C04\\u0C0D\\u0C11\\u0C29\\u0C34\\u0C3A-\\u0C3C\\u0C45" +
                        "\\u0C49\\u0C4E-\\u0C54\\u0C57\\u0C5A-\\u0C5F\\u0C64-\\u0C65" +
                        "\\u0C70-\\u0C77\\u0C80-\\u0C81\\u0C84\\u0C8D\\u0C91\\u0CA9\\u0CB4" +
                        "\\u0CBA-\\u0CBB\\u0CC5\\u0CC9\\u0CCE-\\u0CD4\\u0CD7-\\u0CDD\\u0CDF" +
                        "\\u0CE4-\\u0CE5\\u0CF0\\u0CF3-\\u0D01\\u0D04\\u0D0D\\u0D11" +
                        "\\u0D3B-\\u0D3C\\u0D45\\u0D49\\u0D4F-\\u0D56\\u0D58-\\u0D5F" +
                        "\\u0D64-\\u0D65\\u0D76-\\u0D78\\u0D80-\\u0D81\\u0D84\\u0D97-\\u0D99" +
                        "\\u0DB2\\u0DBC\\u0DBE-\\u0DBF\\u0DC7-\\u0DC9\\u0DCB-\\u0DCE\\u0DD5" +
                        "\\u0DD7\\u0DE0-\\u0DF1\\u0DF5-\\u0E00\\u0E3B-\\u0E3E\\u0E5C-\\u0E80" +
                        "\\u0E83\\u0E85-\\u0E86\\u0E89\\u0E8B-\\u0E8C\\u0E8E-\\u0E93\\u0E98" +
                        "\\u0EA0\\u0EA4\\u0EA6\\u0EA8-\\u0EA9\\u0EAC\\u0EBA\\u0EBE-\\u0EBF\\u0EC5" +
                        "\\u0EC7\\u0ECE-\\u0ECF\\u0EDA-\\u0EDB\\u0EE0-\\u0EFF\\u0F48" +
                        "\\u0F6D-\\u0F70\\u0F98\\u0FBD\\u0FCD\\u0FDB-\\u0FFF\\u10C6" +
                        "\\u10C8-\\u10CC\\u10CE-\\u10CF\\u1249\\u124E-\\u124F\\u1257\\u1259" +
                        "\\u125E-\\u125F\\u1289\\u128E-\\u128F\\u12B1\\u12B6-\\u12B7\\u12BF" +
                        "\\u12C1\\u12C6-\\u12C7\\u12D7\\u1311\\u1316-\\u1317\\u135B-\\u135C" +
                        "\\u137D-\\u137F\\u139A-\\u139F\\u13F5-\\u13FF\\u169D-\\u169F" +
                        "\\u16F1-\\u16FF\\u170D\\u1715-\\u171F\\u1737-\\u173F\\u1754-\\u175F" +
                        "\\u176D\\u1771\\u1774-\\u177F\\u17DE-\\u17DF\\u17EA-\\u17EF" +
                        "\\u17FA-\\u17FF\\u180F\\u181A-\\u181F\\u1878-\\u187F\\u18AB-\\u18AF" +
                        "\\u18F6-\\u18FF\\u191D-\\u191F\\u192C-\\u192F\\u193C-\\u193F" +
                        "\\u1941-\\u1943\\u196E-\\u196F\\u1975-\\u197F\\u19AC-\\u19AF" +
                        "\\u19CA-\\u19CF\\u19DB-\\u19DD\\u1A1C-\\u1A1D\\u1A5F\\u1A7D-\\u1A7E" +
                        "\\u1A8A-\\u1A8F\\u1A9A-\\u1A9F\\u1AAE-\\u1AFF\\u1B4C-\\u1B4F" +
                        "\\u1B7D-\\u1B7F\\u1BF4-\\u1BFB\\u1C38-\\u1C3A\\u1C4A-\\u1C4C" +
                        "\\u1C80-\\u1CBF\\u1CC8-\\u1CCF\\u1CF7-\\u1CFF\\u1DE7-\\u1DFB" +
                        "\\u1F16-\\u1F17\\u1F1E-\\u1F1F\\u1F46-\\u1F47\\u1F4E-\\u1F4F\\u1F58" +
                        "\\u1F5A\\u1F5C\\u1F5E\\u1F7E-\\u1F7F\\u1FB5\\u1FC5\\u1FD4-\\u1FD5\\u1FDC" +
                        "\\u1FF0-\\u1FF1\\u1FF5\\u1FFF\\u2065-\\u2069\\u2072-\\u2073\\u208F" +
                        "\\u209D-\\u209F\\u20BB-\\u20CF\\u20F1-\\u20FF\\u218A-\\u218F" +
                        "\\u23F4-\\u23FF\\u2427-\\u243F\\u244B-\\u245F\\u2700\\u2B4D-\\u2B4F" +
                        "\\u2B5A-\\u2BFF\\u2C2F\\u2C5F\\u2CF4-\\u2CF8\\u2D26\\u2D28-\\u2D2C" +
                        "\\u2D2E-\\u2D2F\\u2D68-\\u2D6E\\u2D71-\\u2D7E\\u2D97-\\u2D9F\\u2DA7" +
                        "\\u2DAF\\u2DB7\\u2DBF\\u2DC7\\u2DCF\\u2DD7\\u2DDF\\u2E3C-\\u2E7F\\u2E9A" +
                        "\\u2EF4-\\u2EFF\\u2FD6-\\u2FEF\\u2FFC-\\u2FFF\\u3040\\u3097-\\u3098" +
                        "\\u3100-\\u3104\\u312E-\\u3130\\u318F\\u31BB-\\u31BF\\u31E4-\\u31EF" +
                        "\\u321F\\u32FF\\u4DB6-\\u4DBF\\u9FCD-\\u9FFF\\uA48D-\\uA48F" +
                        "\\uA4C7-\\uA4CF\\uA62C-\\uA63F\\uA698-\\uA69E\\uA6F8-\\uA6FF\\uA78F" +
                        "\\uA794-\\uA79F\\uA7AB-\\uA7F7\\uA82C-\\uA82F\\uA83A-\\uA83F" +
                        "\\uA878-\\uA87F\\uA8C5-\\uA8CD\\uA8DA-\\uA8DF\\uA8FC-\\uA8FF" +
                        "\\uA954-\\uA95E\\uA97D-\\uA97F\\uA9CE\\uA9DA-\\uA9DD\\uA9E0-\\uA9FF" +
                        "\\uAA37-\\uAA3F\\uAA4E-\\uAA4F\\uAA5A-\\uAA5B\\uAA7C-\\uAA7F" +
                        "\\uAAC3-\\uAADA\\uAAF7-\\uAB00\\uAB07-\\uAB08\\uAB0F-\\uAB10" +
                        "\\uAB17-\\uAB1F\\uAB27\\uAB2F-\\uABBF\\uABEE-\\uABEF\\uABFA-\\uABFF" +
                        "\\uD7A4-\\uD7AF\\uD7C7-\\uD7CA\\uD7FC-\\uD7FF\\uFA6E-\\uFA6F" +
                        "\\uFADA-\\uFAFF\\uFB07-\\uFB12\\uFB18-\\uFB1C\\uFB37\\uFB3D\\uFB3F" +
                        "\\uFB42\\uFB45\\uFBC2-\\uFBD2\\uFD40-\\uFD4F\\uFD90-\\uFD91" +
                        "\\uFDC8-\\uFDEF\\uFDFE-\\uFDFF\\uFE1A-\\uFE1F\\uFE27-\\uFE2F\\uFE53" +
                        "\\uFE67\\uFE6C-\\uFE6F\\uFE75\\uFEFD-\\uFEFE\\uFF00\\uFFBF-\\uFFC1" +
                        "\\uFFC8-\\uFFC9\\uFFD0-\\uFFD1\\uFFD8-\\uFFD9\\uFFDD-\\uFFDF\\uFFE7" +
                        "\\uFFEF-\\uFFF8\\uFFFE-\\uFFFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:L|Bidi(?:[\-_]| *)Class:Left(?:[\-_]| *)to(?:[\-_]| *)Right)$/i,
                    charset:
                        "\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6" +
                        "\\u00D8-\\u00F6\\u00F8-\\u02B8\\u02BB-\\u02C1\\u02D0-\\u02D1" +
                        "\\u02E0-\\u02E4\\u02EE\\u0370-\\u0373\\u0376-\\u037D\\u037F-\\u0383" +
                        "\\u0386\\u0388-\\u03F5\\u03F7-\\u0482\\u048A-\\u0589\\u058B-\\u058E" +
                        "\\u0903-\\u0939\\u093B\\u093D-\\u0940\\u0949-\\u094C\\u094E-\\u0950" +
                        "\\u0958-\\u0961\\u0964-\\u0980\\u0982-\\u09BB\\u09BD-\\u09C0" +
                        "\\u09C5-\\u09CC\\u09CE-\\u09E1\\u09E4-\\u09F1\\u09F4-\\u09FA" +
                        "\\u09FC-\\u0A00\\u0A03-\\u0A3B\\u0A3D-\\u0A40\\u0A43-\\u0A46" +
                        "\\u0A49-\\u0A4A\\u0A4E-\\u0A50\\u0A52-\\u0A6F\\u0A72-\\u0A74" +
                        "\\u0A76-\\u0A80\\u0A83-\\u0ABB\\u0ABD-\\u0AC0\\u0AC6\\u0AC9-\\u0ACC" +
                        "\\u0ACE-\\u0AE1\\u0AE4-\\u0AF0\\u0AF2-\\u0B00\\u0B02-\\u0B3B" +
                        "\\u0B3D-\\u0B3E\\u0B40\\u0B45-\\u0B4C\\u0B4E-\\u0B55\\u0B57-\\u0B61" +
                        "\\u0B64-\\u0B81\\u0B83-\\u0BBF\\u0BC1-\\u0BCC\\u0BCE-\\u0BF2" +
                        "\\u0BFB-\\u0C3D\\u0C41-\\u0C45\\u0C49\\u0C4E-\\u0C54\\u0C57-\\u0C61" +
                        "\\u0C64-\\u0C77\\u0C7F-\\u0CBB\\u0CBD-\\u0CCB\\u0CCE-\\u0CE1" +
                        "\\u0CE4-\\u0D40\\u0D45-\\u0D4C\\u0D4E-\\u0D61\\u0D64-\\u0DC9" +
                        "\\u0DCB-\\u0DD1\\u0DD5\\u0DD7-\\u0E30\\u0E32-\\u0E33\\u0E3B-\\u0E3E" +
                        "\\u0E40-\\u0E46\\u0E4F-\\u0EB0\\u0EB2-\\u0EB3\\u0EBA\\u0EBD-\\u0EC7" +
                        "\\u0ECE-\\u0F17\\u0F1A-\\u0F34\\u0F36\\u0F38\\u0F3E-\\u0F70\\u0F7F" +
                        "\\u0F85\\u0F88-\\u0F8C\\u0F98\\u0FBD-\\u0FC5\\u0FC7-\\u102C\\u1031" +
                        "\\u1038\\u103B-\\u103C\\u103F-\\u1057\\u105A-\\u105D\\u1061-\\u1070" +
                        "\\u1075-\\u1081\\u1083-\\u1084\\u1087-\\u108C\\u108E-\\u109C" +
                        "\\u109E-\\u135C\\u1360-\\u138F\\u139A-\\u13FF\\u1401-\\u167F" +
                        "\\u1681-\\u169A\\u169D-\\u1711\\u1715-\\u1731\\u1735-\\u1751" +
                        "\\u1754-\\u1771\\u1774-\\u17B3\\u17B6\\u17BE-\\u17C5\\u17C7-\\u17C8" +
                        "\\u17D4-\\u17DA\\u17DC\\u17DE-\\u17EF\\u17FA-\\u17FF\\u180F-\\u18A8" +
                        "\\u18AA-\\u191F\\u1923-\\u1926\\u1929-\\u1931\\u1933-\\u1938" +
                        "\\u193C-\\u193F\\u1941-\\u1943\\u1946-\\u19DD\\u1A00-\\u1A16" +
                        "\\u1A19-\\u1A55\\u1A57\\u1A5F\\u1A61\\u1A63-\\u1A64\\u1A6D-\\u1A72" +
                        "\\u1A7D-\\u1A7E\\u1A80-\\u1AFF\\u1B04-\\u1B33\\u1B35\\u1B3B" +
                        "\\u1B3D-\\u1B41\\u1B43-\\u1B6A\\u1B74-\\u1B7F\\u1B82-\\u1BA1" +
                        "\\u1BA6-\\u1BA7\\u1BAA\\u1BAC-\\u1BE5\\u1BE7\\u1BEA-\\u1BEC\\u1BEE" +
                        "\\u1BF2-\\u1C2B\\u1C34-\\u1C35\\u1C38-\\u1CCF\\u1CD3\\u1CE1" +
                        "\\u1CE9-\\u1CEC\\u1CEE-\\u1CF3\\u1CF5-\\u1DBF\\u1DE7-\\u1DFB" +
                        "\\u1E00-\\u1FBC\\u1FBE\\u1FC2-\\u1FCC\\u1FD0-\\u1FDC\\u1FE0-\\u1FEC" +
                        "\\u1FF0-\\u1FFC\\u1FFF\\u200E\\u2071-\\u2073\\u207F\\u208F-\\u209F" +
                        "\\u20BB-\\u20CF\\u20F1-\\u20FF\\u2102\\u2107\\u210A-\\u2113\\u2115" +
                        "\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139" +
                        "\\u213C-\\u213F\\u2145-\\u2149\\u214E-\\u214F\\u2160-\\u2188" +
                        "\\u218A-\\u218F\\u2336-\\u237A\\u2395\\u23F4-\\u23FF\\u2427-\\u243F" +
                        "\\u244B-\\u245F\\u249C-\\u24E9\\u26AC\\u2700\\u2800-\\u28FF" +
                        "\\u2B4D-\\u2B4F\\u2B5A-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2-\\u2CF8" +
                        "\\u2D00-\\u2D7E\\u2D80-\\u2DDF\\u2E3C-\\u2E7F\\u2E9A\\u2EF4-\\u2EFF" +
                        "\\u2FD6-\\u2FEF\\u2FFC-\\u2FFF\\u3005-\\u3007\\u3021-\\u3029" +
                        "\\u302E-\\u302F\\u3031-\\u3035\\u3038-\\u303C\\u3040-\\u3098" +
                        "\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u31BF\\u31E4-\\u321C" +
                        "\\u321F-\\u324F\\u3260-\\u327B\\u327F-\\u32B0\\u32C0-\\u32CB" +
                        "\\u32D0-\\u3376\\u337B-\\u33DD\\u33E0-\\u33FE\\u3400-\\u4DBF" +
                        "\\u4E00-\\uA48F\\uA4C7-\\uA60C\\uA610-\\uA66E\\uA680-\\uA69E" +
                        "\\uA6A0-\\uA6EF\\uA6F2-\\uA6FF\\uA722-\\uA787\\uA789-\\uA801" +
                        "\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA824\\uA827\\uA82C-\\uA837" +
                        "\\uA83A-\\uA873\\uA878-\\uA8C3\\uA8C5-\\uA8DF\\uA8F2-\\uA925" +
                        "\\uA92E-\\uA946\\uA952-\\uA97F\\uA983-\\uA9B2\\uA9B4-\\uA9B5" +
                        "\\uA9BA-\\uA9BB\\uA9BD-\\uAA28\\uAA2F-\\uAA30\\uAA33-\\uAA34" +
                        "\\uAA37-\\uAA42\\uAA44-\\uAA4B\\uAA4D-\\uAAAF\\uAAB1\\uAAB5-\\uAAB6" +
                        "\\uAAB9-\\uAABD\\uAAC0\\uAAC2-\\uAAEB\\uAAEE-\\uAAF5\\uAAF7-\\uABE4" +
                        "\\uABE6-\\uABE7\\uABE9-\\uABEC\\uABEE-\\uFB1C\\uFE1A-\\uFE1F" +
                        "\\uFE27-\\uFE2F\\uFE53\\uFE67\\uFE6C-\\uFE6F\\uFF00\\uFF21-\\uFF3A" +
                        "\\uFF41-\\uFF5A\\uFF66-\\uFFDF\\uFFE7\\uFFEF"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:LRE|Bidi(?:[\-_]| *)Class:Left(?:[\-_]| *)to(?:[\-_]| *)Right(?:[\-_]| *)Embedding)$/i,
                    charset:
                        "\\u202A"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:LRO|Bidi(?:[\-_]| *)Class:Left(?:[\-_]| *)to(?:[\-_]| *)Right(?:[\-_]| *)Override)$/i,
                    charset:
                        "\\u202D"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:R|Bidi(?:[\-_]| *)Class:Right(?:[\-_]| *)to(?:[\-_]| *)Left)$/i,
                    charset:
                        "\\u0590\\u05BE\\u05C0\\u05C3\\u05C6\\u05C8-\\u05FF\\u07C0-\\u07EA" +
                        "\\u07F4-\\u07F5\\u07FA-\\u0815\\u081A\\u0824\\u0828\\u082E-\\u0858" +
                        "\\u085C-\\u089F\\u200F\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB4F"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:AL|Bidi(?:[\-_]| *)Class:Arabic(?:[\-_]| *)Letter)$/i,
                    charset:
                        "\\u0605\\u0608\\u060B\\u060D\\u061B-\\u064A\\u066D-\\u066F" +
                        "\\u0671-\\u06D5\\u06E5-\\u06E6\\u06EE-\\u06EF\\u06FA-\\u0710" +
                        "\\u0712-\\u072F\\u074B-\\u07A5\\u07B1-\\u07BF\\u08A0-\\u08E3\\u08FF" +
                        "\\uFB50-\\uFD3D\\uFD40-\\uFDCF\\uFDF0-\\uFDFC\\uFDFE-\\uFDFF" +
                        "\\uFE70-\\uFEFE"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:RLE|Bidi(?:[\-_]| *)Class:Right(?:[\-_]| *)to(?:[\-_]| *)Left(?:[\-_]| *)Embedding)$/i,
                    charset:
                        "\\u202B"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:RLO|Bidi(?:[\-_]| *)Class:Right(?:[\-_]| *)to(?:[\-_]| *)Left(?:[\-_]| *)Override)$/i,
                    charset:
                        "\\u202E"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:PDF|Bidi(?:[\-_]| *)Class:Pop(?:[\-_]| *)Directional(?:[\-_]| *)Format)$/i,
                    charset:
                        "\\u202C"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:EN|Bidi(?:[\-_]| *)Class:European(?:[\-_]| *)Number)$/i,
                    charset:
                        "\\u0030-\\u0039\\u00B2-\\u00B3\\u00B9\\u06F0-\\u06F9\\u2070" +
                        "\\u2074-\\u2079\\u2080-\\u2089\\u2488-\\u249B\\uFF10-\\uFF19"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:ES|Bidi(?:[\-_]| *)Class:European(?:[\-_]| *)Separator)$/i,
                    charset:
                        "\\u002B\\u002D\\u207A-\\u207B\\u208A-\\u208B\\u2212\\uFB29" +
                        "\\uFE62-\\uFE63\\uFF0B\\uFF0D"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:ET|Bidi(?:[\-_]| *)Class:European(?:[\-_]| *)Terminator)$/i,
                    charset:
                        "\\u0023-\\u0025\\u00A2-\\u00A5\\u00B0-\\u00B1\\u058F\\u0609-\\u060A" +
                        "\\u066A\\u09F2-\\u09F3\\u09FB\\u0AF1\\u0BF9\\u0E3F\\u17DB\\u2030-\\u2034" +
                        "\\u20A0-\\u20BA\\u212E\\u2213\\uA838-\\uA839\\uFE5F\\uFE69-\\uFE6A" +
                        "\\uFF03-\\uFF05\\uFFE0-\\uFFE1\\uFFE5-\\uFFE6"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:AN|Bidi(?:[\-_]| *)Class:Arabic(?:[\-_]| *)Number)$/i,
                    charset:
                        "\\u0600-\\u0604\\u0660-\\u0669\\u066B-\\u066C\\u06DD"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:CS|Bidi(?:[\-_]| *)Class:Common(?:[\-_]| *)Separator)$/i,
                    charset:
                        "\\u002C\\u002E-\\u002F\\u003A\\u00A0\\u060C\\u202F\\u2044\\uFE50\\uFE52" +
                        "\\uFE55\\uFF0C\\uFF0E-\\uFF0F\\uFF1A"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:NSM|Bidi(?:[\-_]| *)Class:Non(?:[\-_]| *)Spacing(?:[\-_]| *)Mark)$/i,
                    charset:
                        "\\u0300-\\u036F\\u0483-\\u0489\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2" +
                        "\\u05C4-\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670" +
                        "\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7-\\u06E8\\u06EA-\\u06ED\\u0711" +
                        "\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819" +
                        "\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B" +
                        "\\u08E4-\\u08FE\\u0900-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D" +
                        "\\u0951-\\u0957\\u0962-\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD" +
                        "\\u09E2-\\u09E3\\u0A01-\\u0A02\\u0A3C\\u0A41-\\u0A42\\u0A47-\\u0A48" +
                        "\\u0A4B-\\u0A4D\\u0A51\\u0A70-\\u0A71\\u0A75\\u0A81-\\u0A82\\u0ABC" +
                        "\\u0AC1-\\u0AC5\\u0AC7-\\u0AC8\\u0ACD\\u0AE2-\\u0AE3\\u0B01\\u0B3C" +
                        "\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62-\\u0B63\\u0B82\\u0BC0\\u0BCD" +
                        "\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55-\\u0C56" +
                        "\\u0C62-\\u0C63\\u0CBC\\u0CCC-\\u0CCD\\u0CE2-\\u0CE3\\u0D41-\\u0D44" +
                        "\\u0D4D\\u0D62-\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31" +
                        "\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB-\\u0EBC" +
                        "\\u0EC8-\\u0ECD\\u0F18-\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E" +
                        "\\u0F80-\\u0F84\\u0F86-\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6" +
                        "\\u102D-\\u1030\\u1032-\\u1037\\u1039-\\u103A\\u103D-\\u103E" +
                        "\\u1058-\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085-\\u1086" +
                        "\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734" +
                        "\\u1752-\\u1753\\u1772-\\u1773\\u17B4-\\u17B5\\u17B7-\\u17BD\\u17C6" +
                        "\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922" +
                        "\\u1927-\\u1928\\u1932\\u1939-\\u193B\\u1A17-\\u1A18\\u1A56" +
                        "\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F" +
                        "\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73" +
                        "\\u1B80-\\u1B81\\u1BA2-\\u1BA5\\u1BA8-\\u1BA9\\u1BAB\\u1BE6" +
                        "\\u1BE8-\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33\\u1C36-\\u1C37" +
                        "\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1CF4" +
                        "\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u20D0-\\u20F0\\u2CEF-\\u2CF1\\u2D7F" +
                        "\\u2DE0-\\u2DFF\\u302A-\\u302D\\u3099-\\u309A\\uA66F-\\uA672" +
                        "\\uA674-\\uA67D\\uA69F\\uA6F0-\\uA6F1\\uA802\\uA806\\uA80B" +
                        "\\uA825-\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951" +
                        "\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E" +
                        "\\uAA31-\\uAA32\\uAA35-\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4" +
                        "\\uAAB7-\\uAAB8\\uAABE-\\uAABF\\uAAC1\\uAAEC-\\uAAED\\uAAF6\\uABE5" +
                        "\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:BN|Bidi(?:[\-_]| *)Class:Boundary(?:[\-_]| *)Neutral)$/i,
                    charset:
                        "\\u0000-\\u0008\\u000E-\\u001B\\u007F-\\u0084\\u0086-\\u009F\\u00AD" +
                        "\\u200B-\\u200D\\u2060-\\u206F\\uFDD0-\\uFDEF\\uFEFF\\uFFF0-\\uFFF8" +
                        "\\uFFFE-\\uFFFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:B|Bidi(?:[\-_]| *)Class:Paragraph(?:[\-_]| *)Separator)$/i,
                    charset:
                        "\\u000A\\u000D\\u001C-\\u001E\\u0085\\u2029"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:S|Bidi(?:[\-_]| *)Class:Segment(?:[\-_]| *)Separator)$/i,
                    charset:
                        "\\u0009\\u000B\\u001F"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:WS|Bidi(?:[\-_]| *)Class:Whitespace)$/i,
                    charset:
                        "\\u000C\\u0020\\u1680\\u180E\\u2000-\\u200A\\u2028\\u205F\\u3000"
                },
                {
                    pattern: /^(?:Is_?)?(?:Bidi(?:[\-_]| *)Class:ON|Bidi(?:[\-_]| *)Class:Other(?:[\-_]| *)Neutrals)$/i,
                    charset:
                        "\\u0021-\\u0022\\u0026-\\u002A\\u003B-\\u0040\\u005B-\\u0060" +
                        "\\u007B-\\u007E\\u00A1\\u00A6-\\u00A9\\u00AB-\\u00AC\\u00AE-\\u00AF" +
                        "\\u00B4\\u00B6-\\u00B8\\u00BB-\\u00BF\\u00D7\\u00F7\\u02B9-\\u02BA" +
                        "\\u02C2-\\u02CF\\u02D2-\\u02DF\\u02E5-\\u02ED\\u02EF-\\u02FF" +
                        "\\u0374-\\u0375\\u037E\\u0384-\\u0385\\u0387\\u03F6\\u058A" +
                        "\\u0606-\\u0607\\u060E-\\u060F\\u06DE\\u06E9\\u07F6-\\u07F9" +
                        "\\u0BF3-\\u0BF8\\u0BFA\\u0C78-\\u0C7E\\u0F3A-\\u0F3D\\u1390-\\u1399" +
                        "\\u1400\\u169B-\\u169C\\u17F0-\\u17F9\\u1800-\\u180A\\u1940" +
                        "\\u1944-\\u1945\\u19DE-\\u19FF\\u1FBD\\u1FBF-\\u1FC1\\u1FCD-\\u1FCF" +
                        "\\u1FDD-\\u1FDF\\u1FED-\\u1FEF\\u1FFD-\\u1FFE\\u2010-\\u2027" +
                        "\\u2035-\\u2043\\u2045-\\u205E\\u207C-\\u207E\\u208C-\\u208E" +
                        "\\u2100-\\u2101\\u2103-\\u2106\\u2108-\\u2109\\u2114\\u2116-\\u2118" +
                        "\\u211E-\\u2123\\u2125\\u2127\\u2129\\u213A-\\u213B\\u2140-\\u2144" +
                        "\\u214A-\\u214D\\u2150-\\u215F\\u2189\\u2190-\\u2211\\u2214-\\u2335" +
                        "\\u237B-\\u2394\\u2396-\\u23F3\\u2400-\\u2426\\u2440-\\u244A" +
                        "\\u2460-\\u2487\\u24EA-\\u26AB\\u26AD-\\u26FF\\u2701-\\u27FF" +
                        "\\u2900-\\u2B4C\\u2B50-\\u2B59\\u2CE5-\\u2CEA\\u2CF9-\\u2CFF" +
                        "\\u2E00-\\u2E3B\\u2E80-\\u2E99\\u2E9B-\\u2EF3\\u2F00-\\u2FD5" +
                        "\\u2FF0-\\u2FFB\\u3001-\\u3004\\u3008-\\u3020\\u3030\\u3036-\\u3037" +
                        "\\u303D-\\u303F\\u309B-\\u309C\\u30A0\\u30FB\\u31C0-\\u31E3" +
                        "\\u321D-\\u321E\\u3250-\\u325F\\u327C-\\u327E\\u32B1-\\u32BF" +
                        "\\u32CC-\\u32CF\\u3377-\\u337A\\u33DE-\\u33DF\\u33FF\\u4DC0-\\u4DFF" +
                        "\\uA490-\\uA4C6\\uA60D-\\uA60F\\uA673\\uA67E-\\uA67F\\uA700-\\uA721" +
                        "\\uA788\\uA828-\\uA82B\\uA874-\\uA877\\uFD3E-\\uFD3F\\uFDFD" +
                        "\\uFE10-\\uFE19\\uFE30-\\uFE4F\\uFE51\\uFE54\\uFE56-\\uFE5E" +
                        "\\uFE60-\\uFE61\\uFE64-\\uFE66\\uFE68\\uFE6B\\uFF01-\\uFF02" +
                        "\\uFF06-\\uFF0A\\uFF1B-\\uFF20\\uFF3B-\\uFF40\\uFF5B-\\uFF65" +
                        "\\uFFE2-\\uFFE4\\uFFE8-\\uFFEE\\uFFF9-\\uFFFD"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Alphabetic(?:[\-_]| *)Presentation(?:[\-_]| *)Forms|In_?Alphabetic(?:[\-_]| *)Presentation(?:[\-_]| *)Forms)$/i,
                    charset:
                        "\\uFB00-\\uFB4F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Arabic|In_?Arabic)$/i,
                    charset:
                        "\\u0600-\\u06FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Arabic(?:[\-_]| *)Presentation(?:[\-_]| *)Forms(?:[\-_]| *)A|In_?Arabic(?:[\-_]| *)Presentation(?:[\-_]| *)Forms(?:[\-_]| *)A)$/i,
                    charset:
                        "\\uFB50-\\uFDFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Arabic(?:[\-_]| *)Presentation(?:[\-_]| *)Forms(?:[\-_]| *)B|In_?Arabic(?:[\-_]| *)Presentation(?:[\-_]| *)Forms(?:[\-_]| *)B)$/i,
                    charset:
                        "\\uFE70-\\uFEFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Arabic(?:[\-_]| *)Supplement|In_?Arabic(?:[\-_]| *)Supplement)$/i,
                    charset:
                        "\\u0750-\\u077F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Armenian|In_?Armenian)$/i,
                    charset:
                        "\\u0530-\\u058F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Arrows|In_?Arrows)$/i,
                    charset:
                        "\\u2190-\\u21FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Balinese|In_?Balinese)$/i,
                    charset:
                        "\\u1B00-\\u1B7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Bamum|In_?Bamum)$/i,
                    charset:
                        "\\uA6A0-\\uA6FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Basic(?:[\-_]| *)Latin|In_?Basic(?:[\-_]| *)Latin)$/i,
                    charset:
                        "\\u0000-\\u007F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Batak|In_?Batak)$/i,
                    charset:
                        "\\u1BC0-\\u1BFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Bengali|In_?Bengali)$/i,
                    charset:
                        "\\u0980-\\u09FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Block(?:[\-_]| *)Elements|In_?Block(?:[\-_]| *)Elements)$/i,
                    charset:
                        "\\u2580-\\u259F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Bopomofo|In_?Bopomofo)$/i,
                    charset:
                        "\\u3100-\\u312F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Bopomofo(?:[\-_]| *)Extended|In_?Bopomofo(?:[\-_]| *)Extended)$/i,
                    charset:
                        "\\u31A0-\\u31BF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Box(?:[\-_]| *)Drawing|In_?Box(?:[\-_]| *)Drawing)$/i,
                    charset:
                        "\\u2500-\\u257F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Braille(?:[\-_]| *)Patterns|In_?Braille(?:[\-_]| *)Patterns)$/i,
                    charset:
                        "\\u2800-\\u28FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Buginese|In_?Buginese)$/i,
                    charset:
                        "\\u1A00-\\u1A1F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Buhid|In_?Buhid)$/i,
                    charset:
                        "\\u1740-\\u175F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Cham|In_?Cham)$/i,
                    charset:
                        "\\uAA00-\\uAA5F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Cherokee|In_?Cherokee)$/i,
                    charset:
                        "\\u13A0-\\u13FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Compatibility|In_?CJK(?:[\-_]| *)Compatibility)$/i,
                    charset:
                        "\\u3300-\\u33FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Compatibility(?:[\-_]| *)Forms|In_?CJK(?:[\-_]| *)Compatibility(?:[\-_]| *)Forms)$/i,
                    charset:
                        "\\uFE30-\\uFE4F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Compatibility(?:[\-_]| *)Ideographs|In_?CJK(?:[\-_]| *)Compatibility(?:[\-_]| *)Ideographs)$/i,
                    charset:
                        "\\uF900-\\uFAFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Radicals(?:[\-_]| *)Supplement|In_?CJK(?:[\-_]| *)Radicals(?:[\-_]| *)Supplement)$/i,
                    charset:
                        "\\u2E80-\\u2EFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Strokes|In_?CJK(?:[\-_]| *)Strokes)$/i,
                    charset:
                        "\\u31C0-\\u31EF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Symbols(?:[\-_]| *)and(?:[\-_]| *)Punctuation|In_?CJK(?:[\-_]| *)Symbols(?:[\-_]| *)and(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u3000-\\u303F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Unified(?:[\-_]| *)Ideographs|In_?CJK(?:[\-_]| *)Unified(?:[\-_]| *)Ideographs)$/i,
                    charset:
                        "\\u4E00-\\u9FFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)CJK(?:[\-_]| *)Unified(?:[\-_]| *)Ideographs(?:[\-_]| *)Extension(?:[\-_]| *)A|In_?CJK(?:[\-_]| *)Unified(?:[\-_]| *)Ideographs(?:[\-_]| *)Extension(?:[\-_]| *)A)$/i,
                    charset:
                        "\\u3400-\\u4DBF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Combining(?:[\-_]| *)Diacritical(?:[\-_]| *)Marks|In_?Combining(?:[\-_]| *)Diacritical(?:[\-_]| *)Marks)$/i,
                    charset:
                        "\\u0300-\\u036F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Combining(?:[\-_]| *)Diacritical(?:[\-_]| *)Marks(?:[\-_]| *)Supplement|In_?Combining(?:[\-_]| *)Diacritical(?:[\-_]| *)Marks(?:[\-_]| *)Supplement)$/i,
                    charset:
                        "\\u1DC0-\\u1DFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Combining(?:[\-_]| *)Half(?:[\-_]| *)Marks|In_?Combining(?:[\-_]| *)Half(?:[\-_]| *)Marks)$/i,
                    charset:
                        "\\uFE20-\\uFE2F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Combining(?:[\-_]| *)Diacritical(?:[\-_]| *)Marks(?:[\-_]| *)for(?:[\-_]| *)Symbols|In_?Combining(?:[\-_]| *)Diacritical(?:[\-_]| *)Marks(?:[\-_]| *)for(?:[\-_]| *)Symbols)$/i,
                    charset:
                        "\\u20D0-\\u20FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Common(?:[\-_]| *)Indic(?:[\-_]| *)Number(?:[\-_]| *)Forms|In_?Common(?:[\-_]| *)Indic(?:[\-_]| *)Number(?:[\-_]| *)Forms)$/i,
                    charset:
                        "\\uA830-\\uA83F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Control(?:[\-_]| *)Pictures|In_?Control(?:[\-_]| *)Pictures)$/i,
                    charset:
                        "\\u2400-\\u243F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Coptic|In_?Coptic)$/i,
                    charset:
                        "\\u2C80-\\u2CFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Currency(?:[\-_]| *)Symbols|In_?Currency(?:[\-_]| *)Symbols)$/i,
                    charset:
                        "\\u20A0-\\u20CF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Cyrillic|In_?Cyrillic)$/i,
                    charset:
                        "\\u0400-\\u04FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Cyrillic(?:[\-_]| *)Extended(?:[\-_]| *)A|In_?Cyrillic(?:[\-_]| *)Extended(?:[\-_]| *)A)$/i,
                    charset:
                        "\\u2DE0-\\u2DFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Cyrillic(?:[\-_]| *)Extended(?:[\-_]| *)B|In_?Cyrillic(?:[\-_]| *)Extended(?:[\-_]| *)B)$/i,
                    charset:
                        "\\uA640-\\uA69F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Cyrillic(?:[\-_]| *)Supplementary|In_?Cyrillic(?:[\-_]| *)Supplementary)$/i,
                    charset:
                        "\\u0500-\\u052F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Devanagari|In_?Devanagari)$/i,
                    charset:
                        "\\u0900-\\u097F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Devanagari(?:[\-_]| *)Extended|In_?Devanagari(?:[\-_]| *)Extended)$/i,
                    charset:
                        "\\uA8E0-\\uA8FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Dingbats|In_?Dingbats)$/i,
                    charset:
                        "\\u2700-\\u27BF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Enclosed(?:[\-_]| *)Alphanumerics|In_?Enclosed(?:[\-_]| *)Alphanumerics)$/i,
                    charset:
                        "\\u2460-\\u24FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Enclosed(?:[\-_]| *)CJK(?:[\-_]| *)Letters(?:[\-_]| *)and(?:[\-_]| *)Months|In_?Enclosed(?:[\-_]| *)CJK(?:[\-_]| *)Letters(?:[\-_]| *)and(?:[\-_]| *)Months)$/i,
                    charset:
                        "\\u3200-\\u32FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Ethiopic|In_?Ethiopic)$/i,
                    charset:
                        "\\u1200-\\u137F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Ethiopic(?:[\-_]| *)Extended|In_?Ethiopic(?:[\-_]| *)Extended)$/i,
                    charset:
                        "\\u2D80-\\u2DDF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Ethiopic(?:[\-_]| *)Extended(?:[\-_]| *)A|In_?Ethiopic(?:[\-_]| *)Extended(?:[\-_]| *)A)$/i,
                    charset:
                        "\\uAB00-\\uAB2F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Ethiopic(?:[\-_]| *)Supplement|In_?Ethiopic(?:[\-_]| *)Supplement)$/i,
                    charset:
                        "\\u1380-\\u139F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)General(?:[\-_]| *)Punctuation|In_?General(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u2000-\\u206F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Geometric(?:[\-_]| *)Shapes|In_?Geometric(?:[\-_]| *)Shapes)$/i,
                    charset:
                        "\\u25A0-\\u25FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Georgian|In_?Georgian)$/i,
                    charset:
                        "\\u10A0-\\u10FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Georgian(?:[\-_]| *)Supplement|In_?Georgian(?:[\-_]| *)Supplement)$/i,
                    charset:
                        "\\u2D00-\\u2D2F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Glagolitic|In_?Glagolitic)$/i,
                    charset:
                        "\\u2C00-\\u2C5F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Greek(?:[\-_]| *)and(?:[\-_]| *)Coptic|In_?Greek(?:[\-_]| *)and(?:[\-_]| *)Coptic)$/i,
                    charset:
                        "\\u0370-\\u03FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Greek(?:[\-_]| *)Extended|In_?Greek(?:[\-_]| *)Extended)$/i,
                    charset:
                        "\\u1F00-\\u1FFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Gujarati|In_?Gujarati)$/i,
                    charset:
                        "\\u0A80-\\u0AFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Gurmukhi|In_?Gurmukhi)$/i,
                    charset:
                        "\\u0A00-\\u0A7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Halfwidth(?:[\-_]| *)and(?:[\-_]| *)Fullwidth(?:[\-_]| *)Forms|In_?Halfwidth(?:[\-_]| *)and(?:[\-_]| *)Fullwidth(?:[\-_]| *)Forms)$/i,
                    charset:
                        "\\uFF00-\\uFFEF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hangul(?:[\-_]| *)Compatibility(?:[\-_]| *)Jamo|In_?Hangul(?:[\-_]| *)Compatibility(?:[\-_]| *)Jamo)$/i,
                    charset:
                        "\\u3130-\\u318F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hangul(?:[\-_]| *)Jamo|In_?Hangul(?:[\-_]| *)Jamo)$/i,
                    charset:
                        "\\u1100-\\u11FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hangul(?:[\-_]| *)Jamo(?:[\-_]| *)Extended(?:[\-_]| *)A|In_?Hangul(?:[\-_]| *)Jamo(?:[\-_]| *)Extended(?:[\-_]| *)A)$/i,
                    charset:
                        "\\uA960-\\uA97F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hangul(?:[\-_]| *)Jamo(?:[\-_]| *)Extended(?:[\-_]| *)B|In_?Hangul(?:[\-_]| *)Jamo(?:[\-_]| *)Extended(?:[\-_]| *)B)$/i,
                    charset:
                        "\\uD7B0-\\uD7FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hangul(?:[\-_]| *)Syllables|In_?Hangul(?:[\-_]| *)Syllables)$/i,
                    charset:
                        "\\uAC00-\\uD7AF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hanunoo|In_?Hanunoo)$/i,
                    charset:
                        "\\u1720-\\u173F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hebrew|In_?Hebrew)$/i,
                    charset:
                        "\\u0590-\\u05FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)High(?:[\-_]| *)Private(?:[\-_]| *)Use(?:[\-_]| *)Surrogates|In_?High(?:[\-_]| *)Private(?:[\-_]| *)Use(?:[\-_]| *)Surrogates)$/i,
                    charset:
                        "\\uDB80-\\uDBFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)High(?:[\-_]| *)Surrogates|In_?High(?:[\-_]| *)Surrogates)$/i,
                    charset:
                        "\\uD800-\\uDB7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Hiragana|In_?Hiragana)$/i,
                    charset:
                        "\\u3040-\\u309F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Ideographic(?:[\-_]| *)Description(?:[\-_]| *)Characters|In_?Ideographic(?:[\-_]| *)Description(?:[\-_]| *)Characters)$/i,
                    charset:
                        "\\u2FF0-\\u2FFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)IPA(?:[\-_]| *)Extensions|In_?IPA(?:[\-_]| *)Extensions)$/i,
                    charset:
                        "\\u0250-\\u02AF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Javanese|In_?Javanese)$/i,
                    charset:
                        "\\uA980-\\uA9DF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Kanbun|In_?Kanbun)$/i,
                    charset:
                        "\\u3190-\\u319F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Kangxi(?:[\-_]| *)Radicals|In_?Kangxi(?:[\-_]| *)Radicals)$/i,
                    charset:
                        "\\u2F00-\\u2FDF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Kannada|In_?Kannada)$/i,
                    charset:
                        "\\u0C80-\\u0CFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Katakana|In_?Katakana)$/i,
                    charset:
                        "\\u30A0-\\u30FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Katakana(?:[\-_]| *)Phonetic(?:[\-_]| *)Extensions|In_?Katakana(?:[\-_]| *)Phonetic(?:[\-_]| *)Extensions)$/i,
                    charset:
                        "\\u31F0-\\u31FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Kayah(?:[\-_]| *)Li|In_?Kayah(?:[\-_]| *)Li)$/i,
                    charset:
                        "\\uA900-\\uA92F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Khmer|In_?Khmer)$/i,
                    charset:
                        "\\u1780-\\u17FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Khmer(?:[\-_]| *)Symbols|In_?Khmer(?:[\-_]| *)Symbols)$/i,
                    charset:
                        "\\u19E0-\\u19FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Lao|In_?Lao)$/i,
                    charset:
                        "\\u0E80-\\u0EFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Latin(?:[\-_]| *)1(?:[\-_]| *)Supplement|In_?Latin(?:[\-_]| *)1(?:[\-_]| *)Supplement)$/i,
                    charset:
                        "\\u0080-\\u00FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Latin(?:[\-_]| *)Extended(?:[\-_]| *)A|In_?Latin(?:[\-_]| *)Extended(?:[\-_]| *)A)$/i,
                    charset:
                        "\\u0100-\\u017F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Latin(?:[\-_]| *)Extended(?:[\-_]| *)Additional|In_?Latin(?:[\-_]| *)Extended(?:[\-_]| *)Additional)$/i,
                    charset:
                        "\\u1E00-\\u1EFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Latin(?:[\-_]| *)Extended(?:[\-_]| *)B|In_?Latin(?:[\-_]| *)Extended(?:[\-_]| *)B)$/i,
                    charset:
                        "\\u0180-\\u024F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Latin(?:[\-_]| *)Extended(?:[\-_]| *)C|In_?Latin(?:[\-_]| *)Extended(?:[\-_]| *)C)$/i,
                    charset:
                        "\\u2C60-\\u2C7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Latin(?:[\-_]| *)Extended(?:[\-_]| *)D|In_?Latin(?:[\-_]| *)Extended(?:[\-_]| *)D)$/i,
                    charset:
                        "\\uA720-\\uA7FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Lepcha|In_?Lepcha)$/i,
                    charset:
                        "\\u1C00-\\u1C4F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Letterlike(?:[\-_]| *)Symbols|In_?Letterlike(?:[\-_]| *)Symbols)$/i,
                    charset:
                        "\\u2100-\\u214F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Limbu|In_?Limbu)$/i,
                    charset:
                        "\\u1900-\\u194F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Lisu|In_?Lisu)$/i,
                    charset:
                        "\\uA4D0-\\uA4FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Low(?:[\-_]| *)Surrogates|In_?Low(?:[\-_]| *)Surrogates)$/i,
                    charset:
                        "\\uDC00-\\uDFFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Malayalam|In_?Malayalam)$/i,
                    charset:
                        "\\u0D00-\\u0D7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Mandaic|In_?Mandaic)$/i,
                    charset:
                        "\\u0840-\\u085F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Mathematical(?:[\-_]| *)Operators|In_?Mathematical(?:[\-_]| *)Operators)$/i,
                    charset:
                        "\\u2200-\\u22FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Meetei(?:[\-_]| *)Mayek|In_?Meetei(?:[\-_]| *)Mayek)$/i,
                    charset:
                        "\\uABC0-\\uABFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Miscellaneous(?:[\-_]| *)Mathematical(?:[\-_]| *)Symbols(?:[\-_]| *)A|In_?Miscellaneous(?:[\-_]| *)Mathematical(?:[\-_]| *)Symbols(?:[\-_]| *)A)$/i,
                    charset:
                        "\\u27C0-\\u27EF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Miscellaneous(?:[\-_]| *)Mathematical(?:[\-_]| *)Symbols(?:[\-_]| *)B|In_?Miscellaneous(?:[\-_]| *)Mathematical(?:[\-_]| *)Symbols(?:[\-_]| *)B)$/i,
                    charset:
                        "\\u2980-\\u29FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Miscellaneous(?:[\-_]| *)Symbols|In_?Miscellaneous(?:[\-_]| *)Symbols)$/i,
                    charset:
                        "\\u2600-\\u26FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Miscellaneous(?:[\-_]| *)Symbols(?:[\-_]| *)and(?:[\-_]| *)Arrows|In_?Miscellaneous(?:[\-_]| *)Symbols(?:[\-_]| *)and(?:[\-_]| *)Arrows)$/i,
                    charset:
                        "\\u2B00-\\u2BFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Miscellaneous(?:[\-_]| *)Technical|In_?Miscellaneous(?:[\-_]| *)Technical)$/i,
                    charset:
                        "\\u2300-\\u23FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Modifier(?:[\-_]| *)Tone(?:[\-_]| *)Letters|In_?Modifier(?:[\-_]| *)Tone(?:[\-_]| *)Letters)$/i,
                    charset:
                        "\\uA700-\\uA71F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Mongolian|In_?Mongolian)$/i,
                    charset:
                        "\\u1800-\\u18AF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Myanmar|In_?Myanmar)$/i,
                    charset:
                        "\\u1000-\\u109F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Myanmar(?:[\-_]| *)Extended(?:[\-_]| *)A|In_?Myanmar(?:[\-_]| *)Extended(?:[\-_]| *)A)$/i,
                    charset:
                        "\\uAA60-\\uAA7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)New(?:[\-_]| *)Tai(?:[\-_]| *)Lue|In_?New(?:[\-_]| *)Tai(?:[\-_]| *)Lue)$/i,
                    charset:
                        "\\u1980-\\u19DF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)NKo|In_?NKo)$/i,
                    charset:
                        "\\u07C0-\\u07FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Number(?:[\-_]| *)Forms|In_?Number(?:[\-_]| *)Forms)$/i,
                    charset:
                        "\\u2150-\\u218F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Ogham|In_?Ogham)$/i,
                    charset:
                        "\\u1680-\\u169F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Ol(?:[\-_]| *)Chiki|In_?Ol(?:[\-_]| *)Chiki)$/i,
                    charset:
                        "\\u1C50-\\u1C7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Optical(?:[\-_]| *)Character(?:[\-_]| *)Recognition|In_?Optical(?:[\-_]| *)Character(?:[\-_]| *)Recognition)$/i,
                    charset:
                        "\\u2440-\\u245F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Oriya|In_?Oriya)$/i,
                    charset:
                        "\\u0B00-\\u0B7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Phags(?:[\-_]| *)pa|In_?Phags(?:[\-_]| *)pa)$/i,
                    charset:
                        "\\uA840-\\uA87F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Phonetic(?:[\-_]| *)Extensions|In_?Phonetic(?:[\-_]| *)Extensions)$/i,
                    charset:
                        "\\u1D00-\\u1D7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Phonetic(?:[\-_]| *)Extensions(?:[\-_]| *)Supplement|In_?Phonetic(?:[\-_]| *)Extensions(?:[\-_]| *)Supplement)$/i,
                    charset:
                        "\\u1D80-\\u1DBF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Private(?:[\-_]| *)Use(?:[\-_]| *)Area|In_?Private(?:[\-_]| *)Use(?:[\-_]| *)Area)$/i,
                    charset:
                        "\\uE000-\\uF8FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Rejang|In_?Rejang)$/i,
                    charset:
                        "\\uA930-\\uA95F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Runic|In_?Runic)$/i,
                    charset:
                        "\\u16A0-\\u16FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Samaritan|In_?Samaritan)$/i,
                    charset:
                        "\\u0800-\\u083F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Saurashtra|In_?Saurashtra)$/i,
                    charset:
                        "\\uA880-\\uA8DF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Sinhala|In_?Sinhala)$/i,
                    charset:
                        "\\u0D80-\\u0DFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Small(?:[\-_]| *)Form(?:[\-_]| *)Variants|In_?Small(?:[\-_]| *)Form(?:[\-_]| *)Variants)$/i,
                    charset:
                        "\\uFE50-\\uFE6F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Spacing(?:[\-_]| *)Modifier(?:[\-_]| *)Letters|In_?Spacing(?:[\-_]| *)Modifier(?:[\-_]| *)Letters)$/i,
                    charset:
                        "\\u02B0-\\u02FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Specials|In_?Specials)$/i,
                    charset:
                        "\\uFFF0-\\uFFFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Sundanese|In_?Sundanese)$/i,
                    charset:
                        "\\u1B80-\\u1BBF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Superscripts(?:[\-_]| *)and(?:[\-_]| *)Subscripts|In_?Superscripts(?:[\-_]| *)and(?:[\-_]| *)Subscripts)$/i,
                    charset:
                        "\\u2070-\\u209F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Supplemental(?:[\-_]| *)Arrows(?:[\-_]| *)A|In_?Supplemental(?:[\-_]| *)Arrows(?:[\-_]| *)A)$/i,
                    charset:
                        "\\u27F0-\\u27FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Supplemental(?:[\-_]| *)Arrows(?:[\-_]| *)B|In_?Supplemental(?:[\-_]| *)Arrows(?:[\-_]| *)B)$/i,
                    charset:
                        "\\u2900-\\u297F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Supplemental(?:[\-_]| *)Mathematical(?:[\-_]| *)Operators|In_?Supplemental(?:[\-_]| *)Mathematical(?:[\-_]| *)Operators)$/i,
                    charset:
                        "\\u2A00-\\u2AFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Supplemental(?:[\-_]| *)Punctuation|In_?Supplemental(?:[\-_]| *)Punctuation)$/i,
                    charset:
                        "\\u2E00-\\u2E7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Syloti(?:[\-_]| *)Nagri|In_?Syloti(?:[\-_]| *)Nagri)$/i,
                    charset:
                        "\\uA800-\\uA82F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Syriac|In_?Syriac)$/i,
                    charset:
                        "\\u0700-\\u074F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tagalog|In_?Tagalog)$/i,
                    charset:
                        "\\u1700-\\u171F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tagbanwa|In_?Tagbanwa)$/i,
                    charset:
                        "\\u1760-\\u177F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tai(?:[\-_]| *)Le|In_?Tai(?:[\-_]| *)Le)$/i,
                    charset:
                        "\\u1950-\\u197F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tai(?:[\-_]| *)Tham|In_?Tai(?:[\-_]| *)Tham)$/i,
                    charset:
                        "\\u1A20-\\u1AAF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tai(?:[\-_]| *)Viet|In_?Tai(?:[\-_]| *)Viet)$/i,
                    charset:
                        "\\uAA80-\\uAADF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tamil|In_?Tamil)$/i,
                    charset:
                        "\\u0B80-\\u0BFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Telugu|In_?Telugu)$/i,
                    charset:
                        "\\u0C00-\\u0C7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Thaana|In_?Thaana)$/i,
                    charset:
                        "\\u0780-\\u07BF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Thai|In_?Thai)$/i,
                    charset:
                        "\\u0E00-\\u0E7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tibetan|In_?Tibetan)$/i,
                    charset:
                        "\\u0F00-\\u0FFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Tifinagh|In_?Tifinagh)$/i,
                    charset:
                        "\\u2D30-\\u2D7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Unified(?:[\-_]| *)Canadian(?:[\-_]| *)Aboriginal(?:[\-_]| *)Syllabics|In_?Unified(?:[\-_]| *)Canadian(?:[\-_]| *)Aboriginal(?:[\-_]| *)Syllabics)$/i,
                    charset:
                        "\\u1400-\\u167F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Unified(?:[\-_]| *)Canadian(?:[\-_]| *)Aboriginal(?:[\-_]| *)Syllabics(?:[\-_]| *)Extended|In_?Unified(?:[\-_]| *)Canadian(?:[\-_]| *)Aboriginal(?:[\-_]| *)Syllabics(?:[\-_]| *)Extended)$/i,
                    charset:
                        "\\u18B0-\\u18FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Vai|In_?Vai)$/i,
                    charset:
                        "\\uA500-\\uA63F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Variation(?:[\-_]| *)Selectors|In_?Variation(?:[\-_]| *)Selectors)$/i,
                    charset:
                        "\\uFE00-\\uFE0F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Vedic(?:[\-_]| *)Extensions|In_?Vedic(?:[\-_]| *)Extensions)$/i,
                    charset:
                        "\\u1CD0-\\u1CFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Vertical(?:[\-_]| *)Forms|In_?Vertical(?:[\-_]| *)Forms)$/i,
                    charset:
                        "\\uFE10-\\uFE1F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Yi(?:[\-_]| *)Radicals|In_?Yi(?:[\-_]| *)Radicals)$/i,
                    charset:
                        "\\uA490-\\uA4CF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Yi(?:[\-_]| *)Syllables|In_?Yi(?:[\-_]| *)Syllables)$/i,
                    charset:
                        "\\uA000-\\uA48F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Block: *|Blk=)Yijing(?:[\-_]| *)Hexagram(?:[\-_]| *)Symbols|In_?Yijing(?:[\-_]| *)Hexagram(?:[\-_]| *)Symbols)$/i,
                    charset:
                        "\\u4DC0-\\u4DFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Arabic|Arabic)$/i,
                    charset:
                        "\\u0600-\\u0604\\u0606-\\u060B\\u060D-\\u061A\\u061E\\u0620-\\u063F" +
                        "\\u0641-\\u064A\\u0656-\\u065F\\u066A-\\u066F\\u0671-\\u06DC" +
                        "\\u06DE-\\u06FF\\u0750-\\u077F\\u08A0\\u08A2-\\u08AC\\u08E4-\\u08FE" +
                        "\\uFB50-\\uFBC1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7" +
                        "\\uFDF0-\\uFDFC\\uFE70-\\uFE74\\uFE76-\\uFEFC"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Armenian|Armenian)$/i,
                    charset:
                        "\\u0531-\\u0556\\u0559-\\u055F\\u0561-\\u0587\\u058A\\u058F" +
                        "\\uFB13-\\uFB17"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Balinese|Balinese)$/i,
                    charset:
                        "\\u1B00-\\u1B4B\\u1B50-\\u1B7C"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Bamum|Bamum)$/i,
                    charset:
                        "\\uA6A0-\\uA6F7"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Batak|Batak)$/i,
                    charset:
                        "\\u1BC0-\\u1BF3\\u1BFC-\\u1BFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Bengali|Bengali)$/i,
                    charset:
                        "\\u0981-\\u0983\\u0985-\\u098C\\u098F-\\u0990\\u0993-\\u09A8" +
                        "\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BC-\\u09C4\\u09C7-\\u09C8" +
                        "\\u09CB-\\u09CE\\u09D7\\u09DC-\\u09DD\\u09DF-\\u09E3\\u09E6-\\u09FB"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Bopomofo|Bopomofo)$/i,
                    charset:
                        "\\u02EA-\\u02EB\\u3105-\\u312D\\u31A0-\\u31BA"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Braille|Braille)$/i,
                    charset:
                        "\\u2800-\\u28FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Buginese|Buginese)$/i,
                    charset:
                        "\\u1A00-\\u1A1B\\u1A1E-\\u1A1F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Buhid|Buhid)$/i,
                    charset:
                        "\\u1740-\\u1753"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Canadian(?:[\-_]| *)Aboriginal|Canadian(?:[\-_]| *)Aboriginal)$/i,
                    charset:
                        "\\u1400-\\u167F\\u18B0-\\u18F5"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Cham|Cham)$/i,
                    charset:
                        "\\uAA00-\\uAA36\\uAA40-\\uAA4D\\uAA50-\\uAA59\\uAA5C-\\uAA5F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Cherokee|Cherokee)$/i,
                    charset:
                        "\\u13A0-\\u13F4"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Common|Common)$/i,
                    charset:
                        "\\u0000-\\u0040\\u005B-\\u0060\\u007B-\\u00A9\\u00AB-\\u00B9" +
                        "\\u00BB-\\u00BF\\u00D7\\u00F7\\u02B9-\\u02DF\\u02E5-\\u02E9" +
                        "\\u02EC-\\u02FF\\u0374\\u037E\\u0385\\u0387\\u0589\\u060C\\u061B\\u061F" +
                        "\\u0640\\u0660-\\u0669\\u06DD\\u0964-\\u0965\\u0E3F\\u0FD5-\\u0FD8" +
                        "\\u10FB\\u16EB-\\u16ED\\u1735-\\u1736\\u1802-\\u1803\\u1805\\u1CD3" +
                        "\\u1CE1\\u1CE9-\\u1CEC\\u1CEE-\\u1CF3\\u1CF5-\\u1CF6\\u2000-\\u200B" +
                        "\\u200E-\\u2064\\u206A-\\u2070\\u2074-\\u207E\\u2080-\\u208E" +
                        "\\u20A0-\\u20BA\\u2100-\\u2125\\u2127-\\u2129\\u212C-\\u2131" +
                        "\\u2133-\\u214D\\u214F-\\u215F\\u2189\\u2190-\\u23F3\\u2400-\\u2426" +
                        "\\u2440-\\u244A\\u2460-\\u26FF\\u2701-\\u27FF\\u2900-\\u2B4C" +
                        "\\u2B50-\\u2B59\\u2E00-\\u2E3B\\u2FF0-\\u2FFB\\u3000-\\u3004\\u3006" +
                        "\\u3008-\\u3020\\u3030-\\u3037\\u303C-\\u303F\\u309B-\\u309C\\u30A0" +
                        "\\u30FB-\\u30FC\\u3190-\\u319F\\u31C0-\\u31E3\\u3220-\\u325F" +
                        "\\u327F-\\u32CF\\u3358-\\u33FF\\u4DC0-\\u4DFF\\uA700-\\uA721" +
                        "\\uA788-\\uA78A\\uA830-\\uA839\\uFD3E-\\uFD3F\\uFDFD\\uFE10-\\uFE19" +
                        "\\uFE30-\\uFE52\\uFE54-\\uFE66\\uFE68-\\uFE6B\\uFEFF\\uFF01-\\uFF20" +
                        "\\uFF3B-\\uFF40\\uFF5B-\\uFF65\\uFF70\\uFF9E-\\uFF9F\\uFFE0-\\uFFE6" +
                        "\\uFFE8-\\uFFEE\\uFFF9-\\uFFFD"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Coptic|Coptic)$/i,
                    charset:
                        "\\u03E2-\\u03EF\\u2C80-\\u2CF3\\u2CF9-\\u2CFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Cyrillic|Cyrillic)$/i,
                    charset:
                        "\\u0400-\\u0484\\u0487-\\u0527\\u1D2B\\u1D78\\u2DE0-\\u2DFF" +
                        "\\uA640-\\uA697\\uA69F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Devanagari|Devanagari)$/i,
                    charset:
                        "\\u0900-\\u0950\\u0953-\\u0963\\u0966-\\u0977\\u0979-\\u097F" +
                        "\\uA8E0-\\uA8FB"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Ethiopic|Ethiopic)$/i,
                    charset:
                        "\\u1200-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D" +
                        "\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5" +
                        "\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310" +
                        "\\u1312-\\u1315\\u1318-\\u135A\\u135D-\\u137C\\u1380-\\u1399" +
                        "\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6" +
                        "\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6" +
                        "\\u2DD8-\\u2DDE\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16" +
                        "\\uAB20-\\uAB26\\uAB28-\\uAB2E"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Georgian|Georgian)$/i,
                    charset:
                        "\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u10FF" +
                        "\\u2D00-\\u2D25\\u2D27\\u2D2D"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Glagolitic|Glagolitic)$/i,
                    charset:
                        "\\u2C00-\\u2C2E\\u2C30-\\u2C5E"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Greek|Greek)$/i,
                    charset:
                        "\\u0370-\\u0373\\u0375-\\u0377\\u037A-\\u037D\\u0384\\u0386" +
                        "\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03E1\\u03F0-\\u03FF" +
                        "\\u1D26-\\u1D2A\\u1D5D-\\u1D61\\u1D66-\\u1D6A\\u1DBF\\u1F00-\\u1F15" +
                        "\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59" +
                        "\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FC4" +
                        "\\u1FC6-\\u1FD3\\u1FD6-\\u1FDB\\u1FDD-\\u1FEF\\u1FF2-\\u1FF4" +
                        "\\u1FF6-\\u1FFE\\u2126"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Gujarati|Gujarati)$/i,
                    charset:
                        "\\u0A81-\\u0A83\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8" +
                        "\\u0AAA-\\u0AB0\\u0AB2-\\u0AB3\\u0AB5-\\u0AB9\\u0ABC-\\u0AC5" +
                        "\\u0AC7-\\u0AC9\\u0ACB-\\u0ACD\\u0AD0\\u0AE0-\\u0AE3\\u0AE6-\\u0AF1"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Gurmukhi|Gurmukhi)$/i,
                    charset:
                        "\\u0A01-\\u0A03\\u0A05-\\u0A0A\\u0A0F-\\u0A10\\u0A13-\\u0A28" +
                        "\\u0A2A-\\u0A30\\u0A32-\\u0A33\\u0A35-\\u0A36\\u0A38-\\u0A39\\u0A3C" +
                        "\\u0A3E-\\u0A42\\u0A47-\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A59-\\u0A5C" +
                        "\\u0A5E\\u0A66-\\u0A75"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Han|Han)$/i,
                    charset:
                        "\\u2E80-\\u2E99\\u2E9B-\\u2EF3\\u2F00-\\u2FD5\\u3005\\u3007" +
                        "\\u3021-\\u3029\\u3038-\\u303B\\u3400-\\u4DB5\\u4E00-\\u9FCC" +
                        "\\uF900-\\uFA6D\\uFA70-\\uFAD9"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Hangul|Hangul)$/i,
                    charset:
                        "\\u1100-\\u11FF\\u302E-\\u302F\\u3131-\\u318E\\u3200-\\u321E" +
                        "\\u3260-\\u327E\\uA960-\\uA97C\\uAC00-\\uD7A3\\uD7B0-\\uD7C6" +
                        "\\uD7CB-\\uD7FB\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF" +
                        "\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Hanunoo|Hanunoo)$/i,
                    charset:
                        "\\u1720-\\u1734"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Hebrew|Hebrew)$/i,
                    charset:
                        "\\u0591-\\u05C7\\u05D0-\\u05EA\\u05F0-\\u05F4\\uFB1D-\\uFB36" +
                        "\\uFB38-\\uFB3C\\uFB3E\\uFB40-\\uFB41\\uFB43-\\uFB44\\uFB46-\\uFB4F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Hiragana|Hiragana)$/i,
                    charset:
                        "\\u3041-\\u3096\\u309D-\\u309F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Inherited|Inherited)$/i,
                    charset:
                        "\\u0300-\\u036F\\u0485-\\u0486\\u064B-\\u0655\\u0670\\u0951-\\u0952" +
                        "\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1CF4" +
                        "\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u200C-\\u200D\\u20D0-\\u20F0" +
                        "\\u302A-\\u302D\\u3099-\\u309A\\uFE00-\\uFE0F\\uFE20-\\uFE26"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Javanese|Javanese)$/i,
                    charset:
                        "\\uA980-\\uA9CD\\uA9CF-\\uA9D9\\uA9DE-\\uA9DF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Kannada|Kannada)$/i,
                    charset:
                        "\\u0C82-\\u0C83\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8" +
                        "\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBC-\\u0CC4\\u0CC6-\\u0CC8" +
                        "\\u0CCA-\\u0CCD\\u0CD5-\\u0CD6\\u0CDE\\u0CE0-\\u0CE3\\u0CE6-\\u0CEF" +
                        "\\u0CF1-\\u0CF2"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Katakana|Katakana)$/i,
                    charset:
                        "\\u30A1-\\u30FA\\u30FD-\\u30FF\\u31F0-\\u31FF\\u32D0-\\u32FE" +
                        "\\u3300-\\u3357\\uFF66-\\uFF6F\\uFF71-\\uFF9D"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Kayah(?:[\-_]| *)Li|Kayah(?:[\-_]| *)Li)$/i,
                    charset:
                        "\\uA900-\\uA92F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Khmer|Khmer)$/i,
                    charset:
                        "\\u1780-\\u17DD\\u17E0-\\u17E9\\u17F0-\\u17F9\\u19E0-\\u19FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Lao|Lao)$/i,
                    charset:
                        "\\u0E81-\\u0E82\\u0E84\\u0E87-\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97" +
                        "\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA-\\u0EAB" +
                        "\\u0EAD-\\u0EB9\\u0EBB-\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EC8-\\u0ECD" +
                        "\\u0ED0-\\u0ED9\\u0EDC-\\u0EDF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Latin|Latin)$/i,
                    charset:
                        "\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00BA\\u00C0-\\u00D6" +
                        "\\u00D8-\\u00F6\\u00F8-\\u02B8\\u02E0-\\u02E4\\u1D00-\\u1D25" +
                        "\\u1D2C-\\u1D5C\\u1D62-\\u1D65\\u1D6B-\\u1D77\\u1D79-\\u1DBE" +
                        "\\u1E00-\\u1EFF\\u2071\\u207F\\u2090-\\u209C\\u212A-\\u212B\\u2132" +
                        "\\u214E\\u2160-\\u2188\\u2C60-\\u2C7F\\uA722-\\uA787\\uA78B-\\uA78E" +
                        "\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA7FF\\uFB00-\\uFB06" +
                        "\\uFF21-\\uFF3A\\uFF41-\\uFF5A"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Lepcha|Lepcha)$/i,
                    charset:
                        "\\u1C00-\\u1C37\\u1C3B-\\u1C49\\u1C4D-\\u1C4F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Limbu|Limbu)$/i,
                    charset:
                        "\\u1900-\\u191C\\u1920-\\u192B\\u1930-\\u193B\\u1940\\u1944-\\u194F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Lisu|Lisu)$/i,
                    charset:
                        "\\uA4D0-\\uA4FF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Malayalam|Malayalam)$/i,
                    charset:
                        "\\u0D02-\\u0D03\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A" +
                        "\\u0D3D-\\u0D44\\u0D46-\\u0D48\\u0D4A-\\u0D4E\\u0D57\\u0D60-\\u0D63" +
                        "\\u0D66-\\u0D75\\u0D79-\\u0D7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Mandaic|Mandaic)$/i,
                    charset:
                        "\\u0840-\\u085B\\u085E"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Meetei(?:[\-_]| *)Mayek|Meetei(?:[\-_]| *)Mayek)$/i,
                    charset:
                        "\\uAAE0-\\uAAF6\\uABC0-\\uABED\\uABF0-\\uABF9"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Mongolian|Mongolian)$/i,
                    charset:
                        "\\u1800-\\u1801\\u1804\\u1806-\\u180E\\u1810-\\u1819\\u1820-\\u1877" +
                        "\\u1880-\\u18AA"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Myanmar|Myanmar)$/i,
                    charset:
                        "\\u1000-\\u109F\\uAA60-\\uAA7B"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)New(?:[\-_]| *)Tai(?:[\-_]| *)Lue|New(?:[\-_]| *)Tai(?:[\-_]| *)Lue)$/i,
                    charset:
                        "\\u1980-\\u19AB\\u19B0-\\u19C9\\u19D0-\\u19DA\\u19DE-\\u19DF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Nko|Nko)$/i,
                    charset:
                        "\\u07C0-\\u07FA"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Ogham|Ogham)$/i,
                    charset:
                        "\\u1680-\\u169C"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Ol(?:[\-_]| *)Chiki|Ol(?:[\-_]| *)Chiki)$/i,
                    charset:
                        "\\u1C50-\\u1C7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Oriya|Oriya)$/i,
                    charset:
                        "\\u0B01-\\u0B03\\u0B05-\\u0B0C\\u0B0F-\\u0B10\\u0B13-\\u0B28" +
                        "\\u0B2A-\\u0B30\\u0B32-\\u0B33\\u0B35-\\u0B39\\u0B3C-\\u0B44" +
                        "\\u0B47-\\u0B48\\u0B4B-\\u0B4D\\u0B56-\\u0B57\\u0B5C-\\u0B5D" +
                        "\\u0B5F-\\u0B63\\u0B66-\\u0B77"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Phags(?:[\-_]| *)Pa|Phags(?:[\-_]| *)Pa)$/i,
                    charset:
                        "\\uA840-\\uA877"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Rejang|Rejang)$/i,
                    charset:
                        "\\uA930-\\uA953\\uA95F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Runic|Runic)$/i,
                    charset:
                        "\\u16A0-\\u16EA\\u16EE-\\u16F0"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Samaritan|Samaritan)$/i,
                    charset:
                        "\\u0800-\\u082D\\u0830-\\u083E"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Saurashtra|Saurashtra)$/i,
                    charset:
                        "\\uA880-\\uA8C4\\uA8CE-\\uA8D9"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Sinhala|Sinhala)$/i,
                    charset:
                        "\\u0D82-\\u0D83\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD" +
                        "\\u0DC0-\\u0DC6\\u0DCA\\u0DCF-\\u0DD4\\u0DD6\\u0DD8-\\u0DDF" +
                        "\\u0DF2-\\u0DF4"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Sundanese|Sundanese)$/i,
                    charset:
                        "\\u1B80-\\u1BBF\\u1CC0-\\u1CC7"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Syloti(?:[\-_]| *)Nagri|Syloti(?:[\-_]| *)Nagri)$/i,
                    charset:
                        "\\uA800-\\uA82B"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Syriac|Syriac)$/i,
                    charset:
                        "\\u0700-\\u070D\\u070F-\\u074A\\u074D-\\u074F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tagalog|Tagalog)$/i,
                    charset:
                        "\\u1700-\\u170C\\u170E-\\u1714"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tagbanwa|Tagbanwa)$/i,
                    charset:
                        "\\u1760-\\u176C\\u176E-\\u1770\\u1772-\\u1773"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tai(?:[\-_]| *)Le|Tai(?:[\-_]| *)Le)$/i,
                    charset:
                        "\\u1950-\\u196D\\u1970-\\u1974"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tai(?:[\-_]| *)Tham|Tai(?:[\-_]| *)Tham)$/i,
                    charset:
                        "\\u1A20-\\u1A5E\\u1A60-\\u1A7C\\u1A7F-\\u1A89\\u1A90-\\u1A99" +
                        "\\u1AA0-\\u1AAD"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tai(?:[\-_]| *)Viet|Tai(?:[\-_]| *)Viet)$/i,
                    charset:
                        "\\uAA80-\\uAAC2\\uAADB-\\uAADF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tamil|Tamil)$/i,
                    charset:
                        "\\u0B82-\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95" +
                        "\\u0B99-\\u0B9A\\u0B9C\\u0B9E-\\u0B9F\\u0BA3-\\u0BA4\\u0BA8-\\u0BAA" +
                        "\\u0BAE-\\u0BB9\\u0BBE-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCD\\u0BD0" +
                        "\\u0BD7\\u0BE6-\\u0BFA"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Telugu|Telugu)$/i,
                    charset:
                        "\\u0C01-\\u0C03\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28" +
                        "\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D-\\u0C44\\u0C46-\\u0C48" +
                        "\\u0C4A-\\u0C4D\\u0C55-\\u0C56\\u0C58-\\u0C59\\u0C60-\\u0C63" +
                        "\\u0C66-\\u0C6F\\u0C78-\\u0C7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Thaana|Thaana)$/i,
                    charset:
                        "\\u0780-\\u07B1"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Thai|Thai)$/i,
                    charset:
                        "\\u0E01-\\u0E3A\\u0E40-\\u0E5B"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tibetan|Tibetan)$/i,
                    charset:
                        "\\u0F00-\\u0F47\\u0F49-\\u0F6C\\u0F71-\\u0F97\\u0F99-\\u0FBC" +
                        "\\u0FBE-\\u0FCC\\u0FCE-\\u0FD4\\u0FD9-\\u0FDA"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Tifinagh|Tifinagh)$/i,
                    charset:
                        "\\u2D30-\\u2D67\\u2D6F-\\u2D70\\u2D7F"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Unknown|Unknown)$/i,
                    charset:
                        "\\u0378-\\u0379\\u037F-\\u0383\\u038B\\u038D\\u03A2\\u0528-\\u0530" +
                        "\\u0557-\\u0558\\u0560\\u0588\\u058B-\\u058E\\u0590\\u05C8-\\u05CF" +
                        "\\u05EB-\\u05EF\\u05F5-\\u05FF\\u0605\\u061C-\\u061D\\u070E" +
                        "\\u074B-\\u074C\\u07B2-\\u07BF\\u07FB-\\u07FF\\u082E-\\u082F\\u083F" +
                        "\\u085C-\\u085D\\u085F-\\u089F\\u08A1\\u08AD-\\u08E3\\u08FF\\u0978" +
                        "\\u0980\\u0984\\u098D-\\u098E\\u0991-\\u0992\\u09A9\\u09B1" +
                        "\\u09B3-\\u09B5\\u09BA-\\u09BB\\u09C5-\\u09C6\\u09C9-\\u09CA" +
                        "\\u09CF-\\u09D6\\u09D8-\\u09DB\\u09DE\\u09E4-\\u09E5\\u09FC-\\u0A00" +
                        "\\u0A04\\u0A0B-\\u0A0E\\u0A11-\\u0A12\\u0A29\\u0A31\\u0A34\\u0A37" +
                        "\\u0A3A-\\u0A3B\\u0A3D\\u0A43-\\u0A46\\u0A49-\\u0A4A\\u0A4E-\\u0A50" +
                        "\\u0A52-\\u0A58\\u0A5D\\u0A5F-\\u0A65\\u0A76-\\u0A80\\u0A84\\u0A8E" +
                        "\\u0A92\\u0AA9\\u0AB1\\u0AB4\\u0ABA-\\u0ABB\\u0AC6\\u0ACA\\u0ACE-\\u0ACF" +
                        "\\u0AD1-\\u0ADF\\u0AE4-\\u0AE5\\u0AF2-\\u0B00\\u0B04\\u0B0D-\\u0B0E" +
                        "\\u0B11-\\u0B12\\u0B29\\u0B31\\u0B34\\u0B3A-\\u0B3B\\u0B45-\\u0B46" +
                        "\\u0B49-\\u0B4A\\u0B4E-\\u0B55\\u0B58-\\u0B5B\\u0B5E\\u0B64-\\u0B65" +
                        "\\u0B78-\\u0B81\\u0B84\\u0B8B-\\u0B8D\\u0B91\\u0B96-\\u0B98\\u0B9B" +
                        "\\u0B9D\\u0BA0-\\u0BA2\\u0BA5-\\u0BA7\\u0BAB-\\u0BAD\\u0BBA-\\u0BBD" +
                        "\\u0BC3-\\u0BC5\\u0BC9\\u0BCE-\\u0BCF\\u0BD1-\\u0BD6\\u0BD8-\\u0BE5" +
                        "\\u0BFB-\\u0C00\\u0C04\\u0C0D\\u0C11\\u0C29\\u0C34\\u0C3A-\\u0C3C\\u0C45" +
                        "\\u0C49\\u0C4E-\\u0C54\\u0C57\\u0C5A-\\u0C5F\\u0C64-\\u0C65" +
                        "\\u0C70-\\u0C77\\u0C80-\\u0C81\\u0C84\\u0C8D\\u0C91\\u0CA9\\u0CB4" +
                        "\\u0CBA-\\u0CBB\\u0CC5\\u0CC9\\u0CCE-\\u0CD4\\u0CD7-\\u0CDD\\u0CDF" +
                        "\\u0CE4-\\u0CE5\\u0CF0\\u0CF3-\\u0D01\\u0D04\\u0D0D\\u0D11" +
                        "\\u0D3B-\\u0D3C\\u0D45\\u0D49\\u0D4F-\\u0D56\\u0D58-\\u0D5F" +
                        "\\u0D64-\\u0D65\\u0D76-\\u0D78\\u0D80-\\u0D81\\u0D84\\u0D97-\\u0D99" +
                        "\\u0DB2\\u0DBC\\u0DBE-\\u0DBF\\u0DC7-\\u0DC9\\u0DCB-\\u0DCE\\u0DD5" +
                        "\\u0DD7\\u0DE0-\\u0DF1\\u0DF5-\\u0E00\\u0E3B-\\u0E3E\\u0E5C-\\u0E80" +
                        "\\u0E83\\u0E85-\\u0E86\\u0E89\\u0E8B-\\u0E8C\\u0E8E-\\u0E93\\u0E98" +
                        "\\u0EA0\\u0EA4\\u0EA6\\u0EA8-\\u0EA9\\u0EAC\\u0EBA\\u0EBE-\\u0EBF\\u0EC5" +
                        "\\u0EC7\\u0ECE-\\u0ECF\\u0EDA-\\u0EDB\\u0EE0-\\u0EFF\\u0F48" +
                        "\\u0F6D-\\u0F70\\u0F98\\u0FBD\\u0FCD\\u0FDB-\\u0FFF\\u10C6" +
                        "\\u10C8-\\u10CC\\u10CE-\\u10CF\\u1249\\u124E-\\u124F\\u1257\\u1259" +
                        "\\u125E-\\u125F\\u1289\\u128E-\\u128F\\u12B1\\u12B6-\\u12B7\\u12BF" +
                        "\\u12C1\\u12C6-\\u12C7\\u12D7\\u1311\\u1316-\\u1317\\u135B-\\u135C" +
                        "\\u137D-\\u137F\\u139A-\\u139F\\u13F5-\\u13FF\\u169D-\\u169F" +
                        "\\u16F1-\\u16FF\\u170D\\u1715-\\u171F\\u1737-\\u173F\\u1754-\\u175F" +
                        "\\u176D\\u1771\\u1774-\\u177F\\u17DE-\\u17DF\\u17EA-\\u17EF" +
                        "\\u17FA-\\u17FF\\u180F\\u181A-\\u181F\\u1878-\\u187F\\u18AB-\\u18AF" +
                        "\\u18F6-\\u18FF\\u191D-\\u191F\\u192C-\\u192F\\u193C-\\u193F" +
                        "\\u1941-\\u1943\\u196E-\\u196F\\u1975-\\u197F\\u19AC-\\u19AF" +
                        "\\u19CA-\\u19CF\\u19DB-\\u19DD\\u1A1C-\\u1A1D\\u1A5F\\u1A7D-\\u1A7E" +
                        "\\u1A8A-\\u1A8F\\u1A9A-\\u1A9F\\u1AAE-\\u1AFF\\u1B4C-\\u1B4F" +
                        "\\u1B7D-\\u1B7F\\u1BF4-\\u1BFB\\u1C38-\\u1C3A\\u1C4A-\\u1C4C" +
                        "\\u1C80-\\u1CBF\\u1CC8-\\u1CCF\\u1CF7-\\u1CFF\\u1DE7-\\u1DFB" +
                        "\\u1F16-\\u1F17\\u1F1E-\\u1F1F\\u1F46-\\u1F47\\u1F4E-\\u1F4F\\u1F58" +
                        "\\u1F5A\\u1F5C\\u1F5E\\u1F7E-\\u1F7F\\u1FB5\\u1FC5\\u1FD4-\\u1FD5\\u1FDC" +
                        "\\u1FF0-\\u1FF1\\u1FF5\\u1FFF\\u2065-\\u2069\\u2072-\\u2073\\u208F" +
                        "\\u209D-\\u209F\\u20BB-\\u20CF\\u20F1-\\u20FF\\u218A-\\u218F" +
                        "\\u23F4-\\u23FF\\u2427-\\u243F\\u244B-\\u245F\\u2700\\u2B4D-\\u2B4F" +
                        "\\u2B5A-\\u2BFF\\u2C2F\\u2C5F\\u2CF4-\\u2CF8\\u2D26\\u2D28-\\u2D2C" +
                        "\\u2D2E-\\u2D2F\\u2D68-\\u2D6E\\u2D71-\\u2D7E\\u2D97-\\u2D9F\\u2DA7" +
                        "\\u2DAF\\u2DB7\\u2DBF\\u2DC7\\u2DCF\\u2DD7\\u2DDF\\u2E3C-\\u2E7F\\u2E9A" +
                        "\\u2EF4-\\u2EFF\\u2FD6-\\u2FEF\\u2FFC-\\u2FFF\\u3040\\u3097-\\u3098" +
                        "\\u3100-\\u3104\\u312E-\\u3130\\u318F\\u31BB-\\u31BF\\u31E4-\\u31EF" +
                        "\\u321F\\u32FF\\u4DB6-\\u4DBF\\u9FCD-\\u9FFF\\uA48D-\\uA48F" +
                        "\\uA4C7-\\uA4CF\\uA62C-\\uA63F\\uA698-\\uA69E\\uA6F8-\\uA6FF\\uA78F" +
                        "\\uA794-\\uA79F\\uA7AB-\\uA7F7\\uA82C-\\uA82F\\uA83A-\\uA83F" +
                        "\\uA878-\\uA87F\\uA8C5-\\uA8CD\\uA8DA-\\uA8DF\\uA8FC-\\uA8FF" +
                        "\\uA954-\\uA95E\\uA97D-\\uA97F\\uA9CE\\uA9DA-\\uA9DD\\uA9E0-\\uA9FF" +
                        "\\uAA37-\\uAA3F\\uAA4E-\\uAA4F\\uAA5A-\\uAA5B\\uAA7C-\\uAA7F" +
                        "\\uAAC3-\\uAADA\\uAAF7-\\uAB00\\uAB07-\\uAB08\\uAB0F-\\uAB10" +
                        "\\uAB17-\\uAB1F\\uAB27\\uAB2F-\\uABBF\\uABEE-\\uABEF\\uABFA-\\uABFF" +
                        "\\uD7A4-\\uD7AF\\uD7C7-\\uD7CA\\uD7FC-\\uF8FF\\uFA6E-\\uFA6F" +
                        "\\uFADA-\\uFAFF\\uFB07-\\uFB12\\uFB18-\\uFB1C\\uFB37\\uFB3D\\uFB3F" +
                        "\\uFB42\\uFB45\\uFBC2-\\uFBD2\\uFD40-\\uFD4F\\uFD90-\\uFD91" +
                        "\\uFDC8-\\uFDEF\\uFDFE-\\uFDFF\\uFE1A-\\uFE1F\\uFE27-\\uFE2F\\uFE53" +
                        "\\uFE67\\uFE6C-\\uFE6F\\uFE75\\uFEFD-\\uFEFE\\uFF00\\uFFBF-\\uFFC1" +
                        "\\uFFC8-\\uFFC9\\uFFD0-\\uFFD1\\uFFD8-\\uFFD9\\uFFDD-\\uFFDF\\uFFE7" +
                        "\\uFFEF-\\uFFF8\\uFFFE-\\uFFFF"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Vai|Vai)$/i,
                    charset:
                        "\\uA500-\\uA62B"
                },
                {
                    pattern: /^(?:Is_?)?(?:(?:Script=|sc=|Script: *)Yi|Yi)$/i,
                    charset:
                        "\\uA000-\\uA48C\\uA490-\\uA4C6"
                }
            ];

            if(opts.userProperties) {
                categories = categories.concat(opts.userProperties);
            }

            function scanCategories(name) {
                var i;

                for(i = 0; i < categories.length; i++) {
                    if(categories[i].pattern.test(name)) {
                        return categories[i].charset;
                    }
                }
                throw new Error("invalid character set name: " + name);
            }

            function build(nameOrNames) {
                var i,
                    result = "";
                if(typeof nameOrNames === "string") {
                    return scanCategories(nameOrNames);
                } else if(isArray(nameOrNames)) {
                    for(i = 0; i < nameOrNames.length; i++) {
                        result += scanCategories(nameOrNames[i]);
                    }
                    return result;
                } else {
                    throw new Error("invalid category: " + nameOrNames);
                }
            }
            return build;
        }

        unicodeCategories = createUnicodeCategories(opts.userProperties);
        function createCharacterSetNotation(userSet) {
            var notation,
                definedSet;

            notation = [
                {
                    /**
                     * @setnotation range
                     * ```format
                     * {
                     *   "range": {
                     *     "from": <charcter>
                     *     "to": <charcter>
                     *   }
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "range": {
                     *     "from": "a",
                     *     "to": "z"
                     *   }
                     * }
                     * ```
                     * @en
                     * matches a character between "from" property to "to" property.
                     * @ja
                     * 与えられた"from"プロパティから"to"プロパティに含まれる文字にマッチします。
                     */
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
                },

                {
                    /**
                     * @setnotation unicode
                     * @alias unicodeProperty
                     * ```format
                     * {
                     *   "unicode": <unicode property>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "unicode": "L"
                     * }
                     * ```
                     * @en
                     * matches a character which is in the given Unicode property.
                     * @ja
                     * 与えられたUnicodeプロパティにある文字にマッチします。
                     */
                    pattern: /^(?:unicode(?:Property)?)$/i,
                    action: function(json) {
                        return unicodeCategories(json);
                    }
                },

                {
                    /**
                     * @setnotation complementUnicode
                     * @alias complementaryUnicode complementUnicodeProperty complementaryUnicodeProperty
                     * ```format
                     * {
                     *   "complementUnicode": <unicode property>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "complementUnicode": "L"
                     * }
                     * ```
                     * @en
                     * matches a character which is not in the given Unicode property.
                     * @ja
                     * 与えられたUnicodeプロパティにない文字にマッチします。
                     */
                    pattern: /^(?:complement(?:ary)?Unicode(?:Property)?)$/i,
                    action: function(json) {
                        return negateCharacterSet(unicodeCategories(json));
                    }
                }
            ];

            definedSet = [
                {
                    /**
                     * @definedset all
                     * @en
                     * matches any character.
                     * @ja
                     * 全ての文字にマッチします。
                     */
                    pattern: /^all$/i,
                    charset: "\\S\\s"
                },

                {
                    /**
                     * @definedset digit
                     * @en
                     * matches any digit.
                     * @ja
                     * 数字にマッチします。
                     */
                    pattern: /^digit$/i,
                    charset: "\\d"
                },

                {
                    /**
                     * @definedset nonDigit
                     * @alias notDigit
                     * @en
                     * matches any character which is not digit.
                     * @ja
                     * 数字でない文字にマッチします。
                     */
                    pattern: /^no[nt]Digit$/i,
                    charset: "\\D"
                },

                {
                    /**
                     * @definedset word
                     * @en
                     * matches any word.
                     * @ja
                     * 単語を構成する文字にマッチします。
                     */
                    pattern: /^word$/i,
                    charset: "\\w"
                },

                {
                    /**
                     * @definedset nonWord
                     * @alias notWord
                     * @en
                     * matches any character which is not word.
                     * @ja
                     * 単語を構成しない文字にマッチします。
                     */
                    pattern: /^no[nt]Word$/i,
                    charset: "\\W"
                },

                {
                    /**
                     * @definedset space
                     * @alias whitespace
                     * @en
                     * matches any whitespace.
                     * @ja
                     * 空白文字にマッチします。
                     */
                    pattern: /^(?:white)?space$/i,
                    charset: "\\s"
                },

                {
                    /**
                     * @definedset nonSpace
                     * @alias notSpace nonWhitespace notWhitespace
                     * @en
                     * matches any character which is not whitespace.
                     * @ja
                     * 空白文字でない文字にマッチします。
                     */
                    pattern: /^no[nt](?:white)?space$/i,
                    charset: "\\S"
                },

                {
                    /**
                     * @definedset tab
                     * @en
                     * matches a tab character.
                     * @ja
                     * タブ文字にマッチします。
                     */
                    pattern: /^tab$/i,
                    charset: "\\t"
                },

                {
                    /**
                     * @definedset carriageReturn
                     * @alias cr
                     * @en
                     * matches a carriage return.
                     * @ja
                     * CR文字にマッチします。
                     */
                    pattern: /^(?:cr|carriageReturn)$/i,
                    charset: "\\r"
                },

                {
                    /**
                     * @definedset lineFeed
                     * @alias lf
                     * @en
                     * matches a line feed.
                     * @ja
                     * 行送り文字にマッチします。
                     */
                    pattern: /^(?:lf|lineFeed)$/i,
                    charset: "\\n"
                },

                {
                    /**
                     * @definedset verticalTab
                     * @alias vt
                     * @en
                     * matches a vertical tab.
                     * @ja
                     * 垂直タブ文字にマッチします。
                     */
                    pattern: /^(?:vt|verticalTab)$/i,
                    charset: "\\v"
                },

                {
                    /**
                     * @definedset formFeed
                     * @alias ff
                     * @en
                     * matches a form feed.
                     * @ja
                     * form feed文字にマッチします。
                     */
                    pattern: /^(?:ff|formFeed)$/i,
                    charset: "\\f"
                },

                {
                    /**
                     * @definedset backspace
                     * @alias bs
                     * @en
                     * matches a backspace.
                     * @ja
                     * バックスペース文字にマッチします。
                     */
                    pattern: /^(?:bs|backspace)$/i,
                    charset: "\\b"
                }
            ];

            if(opts.userSet) {
                definedSet = definedSet.concat(opts.userSet);
            }

            function scanNotation(json) {
                var element = getOneAndOnlyField(json),
                    i;

                for(i = 0; i < notation.length; i++) {
                    if(notation[i].pattern.test(element)) {
                        return notation[i].action(json[element]);
                    }
                }
                throw new Error("invalid character set element: " + element);
            }

            function scanDefinedSet(name) {
                var i;

                for(i = 0; i < definedSet.length; i++) {
                    if(definedSet[i].pattern.test(name)) {
                        return definedSet[i].charset;
                    }
                }
                throw new Error("invalid character set name: " + name);
            }

            function build(json) {
                var i, result;

                if(isCharacter(json)) {
                    return escapeCharacterSetFunnyCharacter(json);
                } else if(typeof json === "string") {
                    return scanDefinedSet(json);
                } else if(isArray(json)) {
                    result = "";
                    for(i = 0; i < json.length; i++) {
                        result += build(json[i]);
                    }
                    return result;
                } else if(isObject(json)) {
                    return scanNotation(json);
                } else {
                    throw new Error("invalid character set JSON");
                }
            }
            return build;
        }

        characterSetNotation = createCharacterSetNotation(opts.userSet);
        function escapeFunnyCharacter(aString) {
            return aString.replace(/([\/\.\\\[\]\|\^\$\(\)\*\+\?\{\}])/g, "\\$1");
        }

        function createRegexNotation() {
            var notation,
                sequence,
                i;

            function generateFromTo(suffix) {
                return function(json, captureObject) {
                    var fromTimes, toTimes;
                    fromTimes = typeof json["from"] === "number" ? json["from"] : 0;
                    toTimes = typeof json["to"] === "number" ? json["to"] : "";
                    return "(?:" + build(json["pattern"], captureObject) + "){" + fromTimes + "," + toTimes + "}" + suffix;
                };
            }

            sequence = [
                {
                    /**
                     * @sequence all
                     * @en
                     * matches any character.
                     * @ja
                     * 全ての文字にマッチします。
                     */
                    pattern: /^(?:all)$/i,
                    regex: "[\\s\\S]"
                },

                {
                    /**
                     * @sequence exceptNewline
                     * @alias allExceptNewline
                     * @en
                     * matches all characters except newline.
                     * @ja
                     * 改行文字を除く全ての文字にマッチします。
                     */
                    pattern: /^(?:(?:all)?ExceptNewline)$/i,
                    regex: "."
                },

                {
                    /**
                     * @sequence newline
                     * @alias nl br
                     * @en
                     * matches sequence of newline. It will match like CRLF.
                     * @ja
                     * 改行を表すシーケンスに一致します。CRLFのようなシーケンスにもマッチします。
                     */
                    pattern: /^(?:br|nl|newline)$/i,
                    regex: "\\r\\n|\\r|\\n"
                },

                {
                    /**
                     * @sequence real
                     * @alias float realNumber floatNumber realNumberWithSign floatNumberWithSign
                     * @en
                     * matches sequence of float numbers. Sign is considerated.
                     * @ja
                     * 浮動小数点数にマッチします。符号にもマッチします。
                     */
                    pattern: /^(?:(?:real|float)(?:Number)?(?:WithSign)?)$/i,
                    regex: "[\\+\\-]?(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:[eE][\\+\\-]?[0-9]+)?"
                },

                {
                    /**
                     * @sequence realWithoutSign
                     * @alias floatWithoutSign realNumberWithoutSign floatNumberWithoutSign
                     * @en
                     * matches sequence of flaot numbers without sign.
                     * @ja
                     * 浮動小数点数にマッチします。符号にはマッチしません。
                     */
                    pattern: /^(?:(?:real|float)(?:Number)?WithoutSign)$/i,
                    regex: "(?:[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+)(?:[eE][\\+\\-]?[0-9]+)?"
                }
            ];

            if(opts.userSequence) {
                sequence = sequence.concat(opts.userSequence);
            }
            notation = [
                {
                    /**
                     * @notation zeroOrMore
                     * @alias repeatZeroOrMore
                     * ```format
                     * {
                     *   "zeroOrMore": <pattern>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "zeroOrMore": "a"
                     * }
                     * ```
                     * qr[a*]
                     * matches aaaaa for input aaaaab
                     * matches <empty> for input b
                     * @en
                     * repeat given pattern zero or more times.
                     * @ja
                     * 与えられたパターンを0回以上繰り返します。
                     */
                    pattern: /^(?:repeat)?ZeroOrMore$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")*";
                    }
                },

                {
                    /**
                     * @notation oneOrMore
                     * @alias repeatOneOrMore
                     * ```format
                     * {
                     *   "oneOrMore": <pattern>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "oneOrMore": "a"
                     * }
                     * ```
                     * qr[a+]
                     * matches aaaaa for input aaaaab
                     * no match for input b
                     * @en
                     * repeat given pattern one or more times.
                     * @ja
                     * 与えられたパターンを1回以上繰り返します。
                     */
                    pattern: /^(?:repeat)?OneOrMore$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")+";
                    }
                },

                {
                    /**
                     * @notation maybe
                     * @alias option optional
                     * ```format
                     * {
                     *   "maybe": <pattern>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "maybe": "a"
                     * }
                     * ```
                     * qr[a?]
                     * matches a for input aaaaab
                     * matches <empty> for input b
                     * @en
                     * repeat given pattern zero times or one times
                     * @ja
                     * 与えられたパターンを0回または1回繰り返します。
                     */
                    pattern: /^(?:option(?:al)?|maybe)$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")?";
                    }
                },

                {
                    /**
                     * @notation repeat
                     * ```format
                     * {
                     *   "repeat": {
                     *     "from": <number>,
                     *     "to": <number>,
                     *     "pattern": <pattern>
                     *   }
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "repeat": {
                     *     "from": 1,
                     *     "to": 3,
                     *     "pattern": "a"
                     *   }
                     * }
                     * ```
                     * qr[a{1,3}]
                     * matches aaa for input aaaaab
                     * matches a for input ab
                     * @en
                     * repeat given pattern at least "from" times and at most "to" times.  
                     * If value "from" is not specified, "from" will be 0.  
                     * If value "to" is not specified, "to" will be infinity.
                     * @ja
                     * 与えられたパターンを少なくとも"from"回、多くとも"to"回繰り返します。  
                     * "from"が指定されなかったときは0になります。
                     * "to"が指定されなかったときは繰り返しの上限はなくなります。
                     */
                    pattern: /^repeat$/i,
                    action: generateFromTo("")
                },

                {
                    /**
                     * @notation zeroOrMoreNonGreedy
                     * @alias repeatZeroOrMoreNonGreedy repeatZeroOrMoreNotGreedy zeroOrMoreNotGreedy
                     * ```format
                     * {
                     *   "zeroOrMoreNonGreedy": <pattern>
                     * }
                     * ```
                     * ```rei
                     * [
                     *   {
                     *     "zeroOrMoreNonGreedy": {
                     *       "charset": "exceptNewline"
                     *     }
                     *   },
                     *   "-"
                     * ]
                     * ```
                     * qr[.*?-]
                     * matches aaaaa for input aaaaa-a-
                     * @en
                     * repeat given pattern zero or more times. This match is the smallest posible match.  
                     * For above example aaaaa-a, matches aaaaa.  
                     * But if you use zeroOrMore instead, it will match aaaaa-a.
                     * @ja
                     * 与えられたパターンを0回以上繰り返します。最小の範囲にマッチします。  
                     * 上記の例ではaaaaa-a-はaaaaaにマッチします。
                     * もし、zeroOrMoreを代わりに使用したときはaaaaa-aにマッチします。
                     */
                    pattern: /^(?:repeat)?ZeroOrMoreNo[nt]Greedy$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")*?";
                    }
                },

                {
                    /**
                     * @notation oneOrMoreNonGreedy
                     * @alias repeatOneOrMoreNonGreedy repeatOneOrMoreNotGreedy oneOrMoreNotGreedy
                     * ```format
                     * {
                     *   "oneOrMoreNonGreedy": <pattern>
                     * }
                     * ```
                     * ```rei
                     * [
                     *   {
                     *     "oneOrMoreNonGreedy": {
                     *       "charset": "exceptNewline"
                     *     }
                     *   },
                     *   "-"
                     * ]
                     * ```
                     * qr[.+?-]
                     * matches aaaaa for input aaaaa-a-
                     * @en
                     * repeat given pattern one or more times. This match is the smallest posible match.  
                     * For above example aaaaa,a, matches aaaaa.  
                     * But if you use oneOrMore instead, it will match aaaaa-a.
                     * @ja
                     * 与えられたパターンを1回以上繰り返します。最小の範囲にマッチします。  
                     * 上記の例ではaaaaa-a-はaaaaaにマッチします。
                     * もし、oneOrMoreを代わりに使用したときはaaaaa-aにマッチします。
                     */
                    pattern: /^(?:repeat)?OneOrMoreNo[nt]Greedy$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")+?";
                    }
                },

                {
                    /**
                     * @notation maybeNonGreedy
                     * @alias optionalNonGreedy optionalNotGreedy optionNonGreedy optionNotGreedy maybeNotGreedy
                     * ```format
                     * {
                     *   "maybeNonGreedy": <pattern>
                     * }
                     * ```
                     * ```rei
                     * [
                     *   {
                     *     "maybeNonGreedy": {
                     *       "charset": "exceptNewline"
                     *     }
                     *   },
                     *   "-"
                     * ]
                     * ```
                     * qr[.??-]
                     * matches <empty> for input --
                     * @en
                     * repeat given pattern zero times or one time. This match is the smallest posible match.  
                     * For above example -- matches empty string.  
                     * But if you use oneOrMore instead, it will match -.
                     * @ja
                     * 与えられたパターンを0回または1回繰り返します。最小の範囲にマッチします。  
                     * 上記の例では--は空文字列にマッチします。
                     * もし、maybeを代わりに使用したときは-にマッチします。
                     */
                    pattern: /^(?:option(?:al)?|maybe)No[nt]Greedy$/i,
                    action: function(json, captureObject) {
                        return "(?:" + build(json, captureObject) + ")??";
                    }
                },

                {
                    /**
                     * @notation repeatNonGreedy
                     * @alias repeatNotGreedy
                     * ```format
                     * {
                     *   "repeatNonGreedy": {
                     *     "from": <number>,
                     *     "to": <number>,
                     *     "pattern": <pattern>
                     *   }
                     * }
                     * ```
                     * ```rei
                     * [
                     *   {
                     *     "repeat": {
                     *       "from": 1,
                     *       "to": 10,
                     *       "pattern": {
                     *         "charset": "exceptNewline"
                     *       }
                     *     }
                     *   },
                     *   "-"
                     * ]
                     * ```
                     * qr[.{1,10}?-]
                     * matches aaaaa for input aaaaa-a-
                     * @en
                     * repeat given pattern at least "from" times and at most "to" times. This match is the smallest posible match.  
                     * If value "from" is not specified, "from" will be 0.  
                     * If value "to" is not specified, "to" will be infinity.
                     * For above example aaaaa,a, matches aaaaa.  
                     * But if you use repeat instead, it will match aaaaa-a.
                     * @ja
                     * 与えられたパターンを少なくとも"from"回、多くとも"to"回繰り返します。最小の範囲にマッチします。  
                     * "from"が指定されなかったときは0になります。
                     * "to"が指定されなかったときは繰り返しの上限はなくなります。
                     * 上記の例ではaaaaa-a-はaaaaaにマッチします。
                     * もし、repeatを代わりに使用したときはaaaaa-aにマッチします。
                     */
                    pattern: /^repeatNo[nt]Greedy$/i,
                    action: generateFromTo("?")
                },

                {
                    /**
                     * @notation or
                     * @alias alter alternate alternation alternative
                     * ```format
                     * {
                     *   "or": [ list of alternation ]
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "or": [ "765", "346", "283" ]
                     * }
                     * ```
                     * qr[765|346|283]
                     * matches 765 for input 765pro
                     * @en
                     * matches one of the list of alternation.
                     * @ja
                     * リスト内のパターンのいずれかにマッチします。
                     */
                    pattern: /^(?:or|alter(?:nate|nation|native)?)$/i,
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
                    /**
                     * @notation capture
                     * ```format
                     * {
                     *   "capture": <pattern>
                     * }
                     * ```
                     * ```format
                     * {
                     *   "capture": {
                     *     "name": <name>
                     *     "pattern": <pattern>
                     *   }
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "capture": {
                     *     "zeroOrMore": "a"
                     *   }
                     * }
                     * ```
                     * qr["(a*)"]
                     * @en
                     * matches the given pattern and caputures the matched result.  
                     * If the value is an object which has the property "name", the capture is named.  
                     * The named capture can use API of Morilib Rei.  
                     * The named capture will be numbered as normal capturing.
                     * @ja
                     * 与えられたパターンにマッチし、結果を保存します。  
                     * 値に"name"のプロパティを含むオブジェクトが与えられたときは結果に名前がつけられます。  
                     * 名前付きキャプチャはMorilib ReiのAPIを通じて使用することができます。  
                     * 名前付きキャプチャにも通常と同様のキャプチャ番号が採番されます。
                     */
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
                    /**
                     * @notation refer
                     * @alias reference backreference backrefer
                     * ```format
                     * {
                     *   "refer": <number or name>
                     * }
                     * ```
                     * ```rei
                     * [
                     *   {
                     *     "capture": {
                     *       "charset": "exceptNewline"
                     *     }
                     *   },
                     *   {
                     *     "refer": 1
                     *   }
                     * ]
                     * qr[(.)\1]
                     * matches aa for input aa
                     * no match for input ab
                     * @en
                     * Backrefence of captured result.  
                     * @ja
                     * 保存した結果を後方参照します。
                     */
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
                    /**
                     * @notation raw
                     * @alias regex regexp
                     * ```format
                     * {
                     *   "raw": <raw regex>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "raw": "a+b"
                     * }
                     * ```
                     * qr[a+b]
                     * @en
                     * buries raw regular expression.
                     * @ja
                     * 生の正規表現を埋め込みます。
                     */
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
                            } else if(matcher.usePattern(/\[(?:[^\]\\]|\\[\s\S])*\]/g).lookingAt()) {
                            } else if(matcher.usePattern(/\\[\s\S]|[\s\S]/g).lookingAt()) {
                            }
                        }
                        return json;
                    }
                },

                {
                    /**
                     * @notation charset
                     * @alias characterSet
                     * ```format
                     * {
                     *   "charset": <name of character set>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "charset": "all"
                     * }
                     * ```
                     * qr[[\s\S]]
                     * @en
                     * matches a character in the given character set.
                     * @ja
                     * 与えられた文字セット内の文字にマッチします。
                     */
                    pattern: /^char(?:acter)?Set$/i,
                    action: function(json, captureObject) {
                        return "[" + characterSetNotation(json) + "]";
                    }
                },

                {
                    /**
                     * @notation complementCharset
                     * @alias complementSet complementaryCharset complementarySet complementCharacterSet complementaryCharacterSet
                     * ```format
                     * {
                     *   "complementCharset": <name of character set>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "complementCharset": "digit"
                     * }
                     * ```
                     * qr[[^\d]]
                     * @en
                     * matches a character not in the given character set.
                     * @ja
                     * 与えられた文字セットにない文字にマッチします。
                     */
                    pattern: /^complement(?:ary)?(?:char(?:acter)?)?Set$/i,
                    action: function(json, captureObject) {
                        return "[^" + characterSetNotation(json) + "]";
                    }
                },

                {
                    /**
                     * @notation anchor
                     * @alias bound
                     * ```format
                     * {
                     *   "anchor": <name of anchor>
                     * }
                     * ```
                     * ```rei
                     * [
                     *   {
                     *     "anchor": "beginOfLine"
                     *   },
                     *   "abc"
                     * ]
                     * ```
                     * qr[^abc]
                     * matches abc for input abc
                     * no match for input dabc
                     * @en
                     * matches boundaries. Name of anchor can be shown as follows.
                     * [options=\"header\"]
                     * |====
                     * |begin, start, beginOfLine startOfLine|matches beginning of line or input
                     * |end, endOfLine|matches end of line or input
                     * |word, wordBound, wordBoundary|matches word boundary
                     * |nonWord, nonWordBound, nonWordBoundary, notWord, notWordBound, notWordBoundary|matches non-word boundary
                     * |====
                     * @ja
                     * 境界にマッチします。以下のものが名称として使用できます。
                     * [options=\"header\"]
                     * |====
                     * |begin, start, beginOfLine startOfLine|行または入力の最初にマッチする
                     * |end, endOfLine|行または入力の最後にマッチする
                     * |word, wordBound, wordBoundary|単語の境界にマッチする
                     * |nonWord, nonWordBound, nonWordBoundary, notWord, notWordBound, notWordBoundary|非単語の境界にマッチする
                     * |====
                     */
                    pattern: /^(?:anchor|bound)$/i,
                    action: function(json, captureObject) {
                        if(typeof json !== "string") {
                            throw new Error("invalid anchor");
                        } else if(/^(?:begin|start)(?:OfLine)?$/i.test(json)) {
                            return "^";
                        } else if(/^end(?:OfLine)?$/i.test(json)) {
                            return "$";
                        } else if(/^word(?:Bound(?:ary)?)?$/i.test(json)) {
                            return "\\b";
                        } else if(/^no[nt]Word(?:Bound(?:ary)?)?$/i.test(json)) {
                            return "\\B";
                        }
                    }
                },

                {
                    /**
                     * @notation charCode
                     * @alias characterCode
                     * ```format
                     * {
                     *   "charCode": <character code>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "charCode": 41
                     * }
                     * ```
                     * qr[\u0041]
                     * @en
                     * matches a character which has the given code by UTF-16.
                     * @ja
                     * UTF-16文字コードで与えられた文字にマッチします。
                     */
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
                    /**
                     * @notation lookahead
                     * @alias positiveLookahead lookaheadAssertion positiveLookaheadAssertion
                     * ```format
                     * {
                     *   "lookahead": <pattern>
                     * }
                     * ```
                     * ```rei
                     * [
                     *   "765",
                     *   {
                     *     "lookahead": "pro"
                     *   }
                     * ]
                     * ```
                     * qr[765(?=pro)]
                     * matches 765 for input 765pro
                     * no match for input 765
                     * @en
                     * matches the given pattern but input will not consume.
                     * @ja
                     * 与えられたパターンにマッチしますが、入力は消費しません。
                     */
                    pattern: /^(?:positive)?Lookahead(?:Assertion)?$/i,
                    action: function(json, captureObject) {
                        return "(?=" + build(json, captureObject) + ")";
                    }
                },

                {
                    /**
                     * @notation negativeLookahead
                     * @alias negativeLookaheadAssertion
                     * ```format
                     * {
                     *   "negativeLookahead": <pattern>
                     * }
                     * ```
                     * ```rei
                     * [
                     *   "765",
                     *   {
                     *     "negativeLookahead": "?"
                     *   }
                     * ]
                     * ```
                     * qr[765(?!\?)]
                     * matches 765 for input 765!
                     * no match for input 765?
                     * @en
                     * matches if the given pattern is not matched but input will not consume.
                     * @ja
                     * 与えられたパターンにマッチしないときマッチしますが、入力は消費しません。
                     */
                    pattern: /^negativeLookahead(?:Assertion)?$/i,
                    action: function(json, captureObject) {
                        return "(?!" + build(json, captureObject) + ")";
                    }
                },

                {
                    /**
                     * @notation unicode
                     * @alias unicodeProperty
                     * ```format
                     * {
                     *   "unicode": <unicode property>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "unicode": "L"
                     * }
                     * ```
                     * qr[\p{L}]
                     * @en
                     * matches a character which is in the given Unicode property.
                     * @ja
                     * 与えられたUnicodeプロパティにある文字にマッチします。
                     */
                    pattern: /^(?:unicode(?:Property)?)$/i,
                    action: function(json) {
                        return "[" + unicodeCategories(json) + "]";
                    }
                },

                {
                    /**
                     * @notation complementUnicode
                     * @alias complementaryUnicode complementUnicodeProperty complementaryUnicodeProperty
                     * ```format
                     * {
                     *   "complementUnicode": <unicode property>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "complementUnicode": "L"
                     * }
                     * ```
                     * qr[\P{L}]
                     * @en
                     * matches a character which is not in the given Unicode property.
                     * @ja
                     * 与えられたUnicodeプロパティにない文字にマッチします。
                     */
                    pattern: /^(?:complement(?:ary)?Unicode(?:Property)?)$/i,
                    action: function(json) {
                        return "[^" + unicodeCategories(json) + "]";
                    }
                },

                {
                    /**
                     * @notation sequence
                     * @alias seq
                     * ```format
                     * {
                     *   "sequence": <name of sequence>
                     * }
                     * ```
                     * ```rei
                     * {
                     *   "sequence": "real"
                     * }
                     * ```
                     * @en
                     * matches the predefined pattern.
                     * @ja
                     * 与えられた名称の定義済みパターンにマッチします。
                     */
                    pattern: /^(?:seq(?:uence)?)$/i,
                    action: function(json) {
                        var i;

                        if(typeof json !== "string") {
                            throw new Error("Invalid sequence: " + json);
                        }
                        for(i = 0; i < sequence.length; i++) {
                            if(sequence[i].pattern.test(json)) {
                                return sequence[i].regex;
                            }
                        }
                        throw new Error("Invalid sequence: " + json);
                    }
                }
            ];

            if(opts.userNotation) {
                for(i = 0; i < opts.userNotation.length; i++) {
                    notation.push({
                        pattern: opts.userNotation[i].pattern,
                        action: (function(i) {
                            return function(json, captureObject) {
                                var bound;

                                function wrappedBuild(anObject) {
                                    return build(anObject, captureObject);
                                }

                                bound = {
                                    build: wrappedBuild
                                };
                                return opts.userNotation[i].action.call(bound, json);
                            }
                        })(i)
                    });
                }
            }

            function scanNotation(json, captureObject) {
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
                var i,
                    result,
                    reString;

                if(typeof json === "string") {
                    return escapeFunnyCharacter(json);
                } else if(isArray(json)) {
                    result = "";
                    for(i = 0; i < json.length; i++) {
                        result += build(json[i], captureObject);
                    }
                    return result;
                } else if(json instanceof RegExp) {
                    reString = json.toString();
                    reString = reString.replace(/^\//, "");
                    reString = reString.replace(/\/[a-zA-Z]*$/, "");
                    return build({ raw: reString }, captureObject);
                } else if(isObject(json)) {
                    return scanNotation(json, captureObject);
                } else {
                    throw new Error("invalid JSON");
                }
            }
            return build;
        }

        regexNotation = createRegexNotation(opts.userNotation);
        function buildFlag(flag) {
            if(typeof flag !== "string") {
                throw new Error("invalid flag: " + flag);
            } else if(/^g(?:lobal)?$/i.test(flag)) {
                return "g";
            } else if(/^i(?:gnoreCases?)?$/i.test(flag)) {
                return "i";
            } else if(/^m(?:ultiline)?$/i.test(flag)) {
                return "m";
            } else if(/^u(?:nicode)?$/i.test(flag)) {
                return "u";
            } else if(/^(?:y|sticky)$/i.test(flag)) {
                return "y";
            } else {
                throw new Error("invalid flag: " + flag);
            }
        }

        function buildFlags(flags) {
            var i,
                result = "";

            if(!flags) {
                return "";
            } else if(isArray(flags)) {
                for(i = 0; i < flags.length; i++) {
                    result += buildFlag(flags[i]);
                }
            } else {
                return buildFlag(flags);
            }
        }

        function buildRegex(json, flags) {
            var captureObject,
                builtRegex;

            captureObject = {
                captures: 1,
                names: {},
                inverted: {}
            };
            builtRegex = regexNotation(json, captureObject);
            return {
                regex: new RegExp(builtRegex, buildFlags(flags)),
                capture: captureObject
            };
        }

        function expandRegExp(regexOrJson, flags) {
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
                    return buildRegex(regexOrJson, flags);
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
            /**
             * @class Rei
             * ```code
             * var result = Re.i([
             *   {
             *     "capture": {
             *        "name": "a",
             *        "pattern": {
             *          "oneOrMoreNonGreedy": {
             *            "charset": "all"
             *          }
             *        }
             *     }
             *   },
             *   ";"
             * ]).execWithName("abc;");
             * console.log(result.a);  // output "abc"
             * ```
             * @en
             * @param aString string to match
             * @return matched and captured result
             * matches the given string to this pattern.
             * @ja
             * @param aString マッチさせる文字列
             * @return キャプチャされた文字列
             * 与えらた文字列をパターンにマッチさせます。
             */
            regex.regex.execWithName = function(aString) {
                var groupResult = {};

                copyToGroup(groupResult, regex, regex.regex.exec(aString));
                return groupResult.group;
            };

            /**
             * @class Rei
             * ```code
             * var matcher = Re.i([
             *   {
             *     "capture": {
             *        "name": "a",
             *        "pattern": {
             *          "oneOrMoreNonGreedy": {
             *            "charset": "all"
             *          }
             *        }
             *     }
             *   },
             *   ";"
             * ]).matcher("abc;");
             * ```
             * @en
             * @param aString string to match
             * @return a created matcher
             * creates matcher for the given string.
             * @ja
             * @param aString マッチさせる文字列
             * @return 生成されたマッチャ
             * マッチャを生成します。
             */
            regex.regex.matcher = function(aString, option) {
                var pattern = regex,
                    opt = option ? option : {},
                    me;

                me = {
                    /**
                     * @class Rei.matcher
                     * ```code
                     * var json = [
                     *   {
                     *     "capture": {
                     *        "name": "a",
                     *        "pattern": {
                     *          "oneOrMoreNonGreedy": {
                     *            "charset": "all"
                     *          }
                     *        }
                     *     }
                     *   },
                     *   ";"
                     * ];
                     * var matcher = Re.i(json).matches("@@@@@abc;@@@@@def;");
                     * var result = matcher.find();
                     * console.log(result.a);  // output abc
                     * result = matcher.find();
                     * console.log(result.a);  // output def
                     * ```
                     * @en
                     * @return matched result
                     * finds the next sequence of the pattern.  
                     * The return value is the same to the return value of RegExp.exec().
                     * @ja
                     * @return マッチした結果
                     * パターンにマッチするシーケンスを探します。  
                     * 戻り値はRegExp.exec()と同じです。
                     */
                    find: function() {
                        var previousIndex = pattern.regex.lastIndex,
                            result = pattern.regex.exec(aString);

                        if(!result) {
                            pattern.regex.lastIndex = previousIndex;
                        }
                        return copyToGroup(me, pattern, result);
                    },

                    /**
                     * @class Rei.matcher
                     * ```code
                     * var json = [
                     *   {
                     *     "capture": {
                     *        "name": "a",
                     *        "pattern": {
                     *          "oneOrMoreNonGreedy": {
                     *            "charset": "all"
                     *          }
                     *        }
                     *     }
                     *   },
                     *   ";"
                     * ];
                     * var matcher = Re.i(json).matches("abc;@@@@@def;");
                     * var result = matcher.lookingAt();
                     * console.log(result.a);  // output abc
                     * result = matcher.lookingAt();
                     * console.log(result);  // output null
                     * ```
                     * @en
                     * @return matched result
                     * matches the next sequence of the pattern from the index of last match.  
                     * If the match is failed, the index of last match is unchanged.  
                     * The return value is the same to the return value of RegExp.exec().
                     * @ja
                     * @return マッチした結果
                     * パターンにマッチするシーケンスに最後にマッチした位置からマッチさせます。  
                     * マッチに失敗したときのマッチの最後位置は変わりません。  
                     * 戻り値はRegExp.exec()と同じです。
                     */
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

                    /**
                     * @class Rei.matcher
                     * ```code
                     * var json = [
                     *   {
                     *     "capture": {
                     *        "name": "a",
                     *        "pattern": {
                     *          "oneOrMoreNonGreedy": {
                     *            "charset": "all"
                     *          }
                     *        }
                     *     }
                     *   },
                     *   ";"
                     * ];
                     * var matcher = Re.i(json).matches("abc;");
                     * var result = matcher.lookingAt();
                     * console.log(result.a);  // output abc
                     * matcher = Re.i(json).matches("@@@@abc;");
                     * result = matcher.matches();
                     * console.log(result);  // output null
                     * ```
                     * @en
                     * @return matched result
                     * matches the next sequence of the pattern from the index of last match to the end of sequence.  
                     * If the match is failed, the index of last match is unchanged.  
                     * The return value is the same to the return value of RegExp.exec().
                     * @ja
                     * @return マッチした結果
                     * パターンにマッチするシーケンスに最後にマッチした位置からシーケンスの最後までマッチします。  
                     * マッチに失敗したときのマッチの最後位置は変わりません。  
                     * 戻り値はRegExp.exec()と同じです。
                     */
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

                    /**
                     * @class Rei.matcher
                     * ```code
                     * var json1 = [
                     *   {
                     *     "capture": {
                     *        "name": "a",
                     *        "pattern": {
                     *          "oneOrMoreNonGreedy": {
                     *            "charset": "all"
                     *          }
                     *        }
                     *     }
                     *   },
                     *   ";"
                     * ];
                     * var json2 = {
                     *   "capture": {
                     *      "name": "a",
                     *      "pattern": {
                     *        "oneOrMoreNonGreedy": {
                     *          "charset": "digit"
                     *        }
                     *      }
                     *   }
                     * };
                     * var matcher = Re.i(json1).matches("@@@@@abc@@@@@a01a;");
                     * var result = matcher.find();
                     * console.log(result.a);  // output abc
                     * matcher.usePattern(json2);
                     * result = matcher.matches();
                     * console.log(result);  // output 01
                     * ```
                     * @en
                     * @param regexOrJson regular expression or Morilib Rei formed JavaScript object
                     * @return this instance
                     * change matching pattern to the given pattern.  
                     * The index of last match is not changed.
                     * @ja
                     * @param regexOrJson RegExpオブジェクトまたはMorilib Reiで解釈できるJavaScriptオブジェクト
                     * @return このインスタンス
                     * マッチに使用するパターンを与えられたものに切り替えます。  
                     * マッチの最後位置は変わりません。
                     */
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
        i: createModule(),
        build: createModule(),
        plugin: createModule
    };

    if(typeof module !== "undefined" && module.exports) {
        module.exports = Re;
    } else {
        root["Re"] = Re;
    }
})(this);
