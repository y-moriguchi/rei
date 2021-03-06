#
# Morilib Rei
#
# Copyright (c) 2018 Yuichiro MORIGUCHI
#
# This software is released under the MIT License.
# http://opensource.org/licenses/mit-license.php
#
use utf8;
my @categories = (
    ["L", "Letter"],
    ["LC", "Cased_Letter"],
    ["Lu", "Uppercase_Letter"],
    ["Ll", "Lowercase_Letter"],
    ["Lt", "Titlecase_Letter"],
    ["Lm", "Modifier_Letter"],
    ["Lo", "Other_Letter"],
    ["M", "Mark"],
    ["Mn", "Nonspacing_Mark"],
    ["Mc", "Spacing_Mark"],
    ["Me", "Enclosing_Mark"],
    ["N", "Number"],
    ["Nd", "Decimal_Number"],
    ["Nl", "Letter_Number"],
    ["No", "Other_Number"],
    ["P", "Punctuation"],
    ["Pc", "Connector_Punctuation"],
    ["Pd", "Dash_Punctuation"],
    ["Ps", "Open_Punctuation"],
    ["Pe", "Close_Punctuation"],
    ["Pi", "Initial_Punctuation"],
    ["Pf", "Final_Punctuation"],
    ["Po", "Other_Punctuation"],
    ["S", "Symbol"],
    ["Sm", "Math_Symbol"],
    ["Sc", "Currency_Symbol"],
    ["Sk", "Modifier_Symbol"],
    ["So", "Other_Symbol"],
    ["Z", "Separator"],
    ["Zs", "Space_Separator"],
    ["Zl", "Line_Separator"],
    ["Zp", "Paragraph_Separator"],
    ["C", "Other"],
    ["Cc", "Control"],
    ["Cf", "Format"],
    ["Cs", "Surrogate"],
    ["Co", "Private_Use"],
    ["Cn", "Unassigned"],
    ["Bidi_Class:L", "Bidi_Class:Left-to-Right"],
    ["Bidi_Class:LRE", "Bidi_Class:Left-to-Right_Embedding"],
    ["Bidi_Class:LRO", "Bidi_Class:Left-to-Right_Override"],
    ["Bidi_Class:R", "Bidi_Class:Right-to-Left"],
    ["Bidi_Class:AL", "Bidi_Class:Arabic_Letter"],
    ["Bidi_Class:RLE", "Bidi_Class:Right-to-Left_Embedding"],
    ["Bidi_Class:RLO", "Bidi_Class:Right-to-Left_Override"],
    ["Bidi_Class:PDF", "Bidi_Class:Pop_Directional_Format"],
    ["Bidi_Class:EN", "Bidi_Class:European_Number"],
    ["Bidi_Class:ES", "Bidi_Class:European_Separator"],
    ["Bidi_Class:ET", "Bidi_Class:European_Terminator"],
    ["Bidi_Class:AN", "Bidi_Class:Arabic_Number"],
    ["Bidi_Class:CS", "Bidi_Class:Common_Separator"],
    ["Bidi_Class:NSM", "Bidi_Class:Non-Spacing_Mark"],
    ["Bidi_Class:BN", "Bidi_Class:Boundary_Neutral"],
    ["Bidi_Class:B", "Bidi_Class:Paragraph_Separator"],
    ["Bidi_Class:S", "Bidi_Class:Segment_Separator"],
    ["Bidi_Class:WS", "Bidi_Class:Whitespace"],
    ["Bidi_Class:ON", "Bidi_Class:Other_Neutrals"],
    ["Block:Aegean_Numbers", "InAegean_Numbers"],
    ["Block:Alchemical_Symbols", "InAlchemical_Symbols"],
    ["Block:Alphabetic_Presentation_Forms", "InAlphabetic_Presentation_Forms"],
    ["Block:Ancient_Greek_Musical_Notation", "InAncient_Greek_Musical_Notation"],
    ["Block:Ancient_Greek_Numbers", "InAncient_Greek_Numbers"],
    ["Block:Ancient_Symbols", "InAncient_Symbols"],
    ["Block:Arabic", "InArabic"],
    ["Block:Arabic_Presentation_Forms-A", "InArabic_Presentation_Forms-A"],
    ["Block:Arabic_Presentation_Forms-B", "InArabic_Presentation_Forms-B"],
    ["Block:Arabic_Supplement", "InArabic_Supplement"],
    ["Block:Armenian", "InArmenian"],
    ["Block:Arrows", "InArrows"],
    ["Block:Avestan", "InAvestan"],
    ["Block:Balinese", "InBalinese"],
    ["Block:Bamum", "InBamum"],
    ["Block:Bamum_Supplement", "InBamum_Supplement"],
    ["Block:Basic_Latin", "InBasic_Latin"],
    ["Block:Batak", "InBatak"],
    ["Block:Bengali", "InBengali"],
    ["Block:Block_Elements", "InBlock_Elements"],
    ["Block:Bopomofo", "InBopomofo"],
    ["Block:Bopomofo_Extended", "InBopomofo_Extended"],
    ["Block:Box_Drawing", "InBox_Drawing"],
    ["Block:Brahmi", "InBrahmi"],
    ["Block:Braille_Patterns", "InBraille_Patterns"],
    ["Block:Buginese", "InBuginese"],
    ["Block:Buhid", "InBuhid"],
    ["Block:Byzantine_Musical_Symbols", "InByzantine_Musical_Symbols"],
    ["Block:Carian", "InCarian"],
    ["Block:Cham", "InCham"],
    ["Block:Cherokee", "InCherokee"],
    ["Block:CJK_Compatibility", "InCJK_Compatibility"],
    ["Block:CJK_Compatibility_Forms", "InCJK_Compatibility_Forms"],
    ["Block:CJK_Compatibility_Ideographs", "InCJK_Compatibility_Ideographs"],
    ["Block:CJK_Compatibility_Ideographs_Supplement", "InCJK_Compatibility_Ideographs_Supplement"],
    ["Block:CJK_Radicals_Supplement", "InCJK_Radicals_Supplement"],
    ["Block:CJK_Strokes", "InCJK_Strokes"],
    ["Block:CJK_Symbols_and_Punctuation", "InCJK_Symbols_and_Punctuation"],
    ["Block:CJK_Unified_Ideographs", "InCJK_Unified_Ideographs"],
    ["Block:CJK_Unified_Ideographs_Extension_A", "InCJK_Unified_Ideographs_Extension_A"],
    ["Block:CJK_Unified_Ideographs_Extension_B", "InCJK_Unified_Ideographs_Extension_B"],
    ["Block:CJK_Unified_Ideographs_Extension_C", "InCJK_Unified_Ideographs_Extension_C"],
    ["Block:CJK_Unified_Ideographs_Extension_D", "InCJK_Unified_Ideographs_Extension_D"],
    ["Block:Combining_Diacritical_Marks", "InCombining_Diacritical_Marks"],
    ["Block:Combining_Diacritical_Marks_Supplement", "InCombining_Diacritical_Marks_Supplement"],
    ["Block:Combining_Half_Marks", "InCombining_Half_Marks"],
    ["Block:Combining_Diacritical_Marks_for_Symbols", "InCombining_Diacritical_Marks_for_Symbols"],
    ["Block:Common_Indic_Number_Forms", "InCommon_Indic_Number_Forms"],
    ["Block:Control_Pictures", "InControl_Pictures"],
    ["Block:Coptic", "InCoptic"],
    ["Block:Counting_Rod_Numerals", "InCounting_Rod_Numerals"],
    ["Block:Cuneiform", "InCuneiform"],
    ["Block:Cuneiform_Numbers_and_Punctuation", "InCuneiform_Numbers_and_Punctuation"],
    ["Block:Currency_Symbols", "InCurrency_Symbols"],
    ["Block:Cypriot_Syllabary", "InCypriot_Syllabary"],
    ["Block:Cyrillic", "InCyrillic"],
    ["Block:Cyrillic_Extended-A", "InCyrillic_Extended-A"],
    ["Block:Cyrillic_Extended-B", "InCyrillic_Extended-B"],
    ["Block:Cyrillic_Supplementary", "InCyrillic_Supplementary"],
    ["Block:Deseret", "InDeseret"],
    ["Block:Devanagari", "InDevanagari"],
    ["Block:Devanagari_Extended", "InDevanagari_Extended"],
    ["Block:Dingbats", "InDingbats"],
    ["Block:Domino_Tiles", "InDomino_Tiles"],
    ["Block:Egyptian_Hieroglyphs", "InEgyptian_Hieroglyphs"],
    ["Block:Emoticons", "InEmoticons"],
    ["Block:Enclosed_Alphanumeric_Supplement", "InEnclosed_Alphanumeric_Supplement"],
    ["Block:Enclosed_Alphanumerics", "InEnclosed_Alphanumerics"],
    ["Block:Enclosed_CJK_Letters_and_Months", "InEnclosed_CJK_Letters_and_Months"],
    ["Block:Enclosed_Ideographic_Supplement", "InEnclosed_Ideographic_Supplement"],
    ["Block:Ethiopic", "InEthiopic"],
    ["Block:Ethiopic_Extended", "InEthiopic_Extended"],
    ["Block:Ethiopic_Extended-A", "InEthiopic_Extended-A"],
    ["Block:Ethiopic_Supplement", "InEthiopic_Supplement"],
    ["Block:General_Punctuation", "InGeneral_Punctuation"],
    ["Block:Geometric_Shapes", "InGeometric_Shapes"],
    ["Block:Georgian", "InGeorgian"],
    ["Block:Georgian_Supplement", "InGeorgian_Supplement"],
    ["Block:Glagolitic", "InGlagolitic"],
    ["Block:Gothic", "InGothic"],
    ["Block:Greek_and_Coptic", "InGreek_and_Coptic"],
    ["Block:Greek_Extended", "InGreek_Extended"],
    ["Block:Gujarati", "InGujarati"],
    ["Block:Gurmukhi", "InGurmukhi"],
    ["Block:Halfwidth_and_Fullwidth_Forms", "InHalfwidth_and_Fullwidth_Forms"],
    ["Block:Hangul_Compatibility_Jamo", "InHangul_Compatibility_Jamo"],
    ["Block:Hangul_Jamo", "InHangul_Jamo"],
    ["Block:Hangul_Jamo_Extended-A", "InHangul_Jamo_Extended-A"],
    ["Block:Hangul_Jamo_Extended-B", "InHangul_Jamo_Extended-B"],
    ["Block:Hangul_Syllables", "InHangul_Syllables"],
    ["Block:Hanunoo", "InHanunoo"],
    ["Block:Hebrew", "InHebrew"],
    ["Block:High_Private_Use_Surrogates", "InHigh_Private_Use_Surrogates"],
    ["Block:High_Surrogates", "InHigh_Surrogates"],
    ["Block:Hiragana", "InHiragana"],
    ["Block:Ideographic_Description_Characters", "InIdeographic_Description_Characters"],
    ["Block:Imperial_Aramaic", "InImperial_Aramaic"],
    ["Block:Inscriptional_Pahlavi", "InInscriptional_Pahlavi"],
    ["Block:Inscriptional_Parthian", "InInscriptional_Parthian"],
    ["Block:IPA_Extensions", "InIPA_Extensions"],
    ["Block:Javanese", "InJavanese"],
    ["Block:Kaithi", "InKaithi"],
    ["Block:Kana_Supplement", "InKana_Supplement"],
    ["Block:Kanbun", "InKanbun"],
    ["Block:Kangxi_Radicals", "InKangxi_Radicals"],
    ["Block:Kannada", "InKannada"],
    ["Block:Katakana", "InKatakana"],
    ["Block:Katakana_Phonetic_Extensions", "InKatakana_Phonetic_Extensions"],
    ["Block:Kayah_Li", "InKayah_Li"],
    ["Block:Kharoshthi", "InKharoshthi"],
    ["Block:Khmer", "InKhmer"],
    ["Block:Khmer_Symbols", "InKhmer_Symbols"],
    ["Block:Lao", "InLao"],
    ["Block:Latin-1_Supplement", "InLatin-1_Supplement"],
    ["Block:Latin_Extended-A", "InLatin_Extended-A"],
    ["Block:Latin_Extended_Additional", "InLatin_Extended_Additional"],
    ["Block:Latin_Extended-B", "InLatin_Extended-B"],
    ["Block:Latin_Extended-C", "InLatin_Extended-C"],
    ["Block:Latin_Extended-D", "InLatin_Extended-D"],
    ["Block:Lepcha", "InLepcha"],
    ["Block:Letterlike_Symbols", "InLetterlike_Symbols"],
    ["Block:Limbu", "InLimbu"],
    ["Block:Linear_B_Ideograms", "InLinear_B_Ideograms"],
    ["Block:Linear_B_Syllabary", "InLinear_B_Syllabary"],
    ["Block:Lisu", "InLisu"],
    ["Block:Low_Surrogates", "InLow_Surrogates"],
    ["Block:Lycian", "InLycian"],
    ["Block:Lydian", "InLydian"],
    ["Block:Mahjong_Tiles", "InMahjong_Tiles"],
    ["Block:Malayalam", "InMalayalam"],
    ["Block:Mandaic", "InMandaic"],
    ["Block:Mathematical_Alphanumeric_Symbols", "InMathematical_Alphanumeric_Symbols"],
    ["Block:Mathematical_Operators", "InMathematical_Operators"],
    ["Block:Meetei_Mayek", "InMeetei_Mayek"],
    ["Block:Miscellaneous_Mathematical_Symbols-A", "InMiscellaneous_Mathematical_Symbols-A"],
    ["Block:Miscellaneous_Mathematical_Symbols-B", "InMiscellaneous_Mathematical_Symbols-B"],
    ["Block:Miscellaneous_Symbols", "InMiscellaneous_Symbols"],
    ["Block:Miscellaneous_Symbols_and_Arrows", "InMiscellaneous_Symbols_and_Arrows"],
    ["Block:Miscellaneous_Symbols_And_Pictographs", "InMiscellaneous_Symbols_And_Pictographs"],
    ["Block:Miscellaneous_Technical", "InMiscellaneous_Technical"],
    ["Block:Modifier_Tone_Letters", "InModifier_Tone_Letters"],
    ["Block:Mongolian", "InMongolian"],
    ["Block:Musical_Symbols", "InMusical_Symbols"],
    ["Block:Myanmar", "InMyanmar"],
    ["Block:Myanmar_Extended-A", "InMyanmar_Extended-A"],
    ["Block:New_Tai_Lue", "InNew_Tai_Lue"],
    ["Block:NKo", "InNKo"],
    ["Block:Number_Forms", "InNumber_Forms"],
    ["Block:Ogham", "InOgham"],
    ["Block:Ol_Chiki", "InOl_Chiki"],
    ["Block:Old_Italic", "InOld_Italic"],
    ["Block:Old_Persian", "InOld_Persian"],
    ["Block:Old_South_Arabian", "InOld_South_Arabian"],
    ["Block:Old_Turkic", "InOld_Turkic"],
    ["Block:Optical_Character_Recognition", "InOptical_Character_Recognition"],
    ["Block:Oriya", "InOriya"],
    ["Block:Osmanya", "InOsmanya"],
    ["Block:Phags-pa", "InPhags-pa"],
    ["Block:Phaistos_Disc", "InPhaistos_Disc"],
    ["Block:Phoenician", "InPhoenician"],
    ["Block:Phonetic_Extensions", "InPhonetic_Extensions"],
    ["Block:Phonetic_Extensions_Supplement", "InPhonetic_Extensions_Supplement"],
    ["Block:Playing_Cards", "InPlaying_Cards"],
    ["Block:Private_Use_Area", "InPrivate_Use_Area"],
    ["Block:Rejang", "InRejang"],
    ["Block:Rumi_Numeral_Symbols", "InRumi_Numeral_Symbols"],
    ["Block:Runic", "InRunic"],
    ["Block:Samaritan", "InSamaritan"],
    ["Block:Saurashtra", "InSaurashtra"],
    ["Block:Shavian", "InShavian"],
    ["Block:Sinhala", "InSinhala"],
    ["Block:Small_Form_Variants", "InSmall_Form_Variants"],
    ["Block:Spacing_Modifier_Letters", "InSpacing_Modifier_Letters"],
    ["Block:Specials", "InSpecials"],
    ["Block:Sundanese", "InSundanese"],
    ["Block:Superscripts_and_Subscripts", "InSuperscripts_and_Subscripts"],
    ["Block:Supplemental_Arrows-A", "InSupplemental_Arrows-A"],
    ["Block:Supplemental_Arrows-B", "InSupplemental_Arrows-B"],
    ["Block:Supplemental_Mathematical_Operators", "InSupplemental_Mathematical_Operators"],
    ["Block:Supplemental_Punctuation", "InSupplemental_Punctuation"],
    ["Block:Supplementary_Private_Use_Area-A", "InSupplementary_Private_Use_Area-A"],
    ["Block:Supplementary_Private_Use_Area-B", "InSupplementary_Private_Use_Area-B"],
    ["Block:Syloti_Nagri", "InSyloti_Nagri"],
    ["Block:Syriac", "InSyriac"],
    ["Block:Tagalog", "InTagalog"],
    ["Block:Tagbanwa", "InTagbanwa"],
    ["Block:Tags", "InTags"],
    ["Block:Tai_Le", "InTai_Le"],
    ["Block:Tai_Tham", "InTai_Tham"],
    ["Block:Tai_Viet", "InTai_Viet"],
    ["Block:Tai_Xuan_Jing_Symbols", "InTai_Xuan_Jing_Symbols"],
    ["Block:Tamil", "InTamil"],
    ["Block:Telugu", "InTelugu"],
    ["Block:Thaana", "InThaana"],
    ["Block:Thai", "InThai"],
    ["Block:Tibetan", "InTibetan"],
    ["Block:Tifinagh", "InTifinagh"],
    ["Block:Transport_And_Map_Symbols", "InTransport_And_Map_Symbols"],
    ["Block:Ugaritic", "InUgaritic"],
    ["Block:Unified_Canadian_Aboriginal_Syllabics", "InUnified_Canadian_Aboriginal_Syllabics"],
    ["Block:Unified_Canadian_Aboriginal_Syllabics_Extended", "InUnified_Canadian_Aboriginal_Syllabics_Extended"],
    ["Block:Vai", "InVai"],
    ["Block:Variation_Selectors", "InVariation_Selectors"],
    ["Block:Variation_Selectors_Supplement", "InVariation_Selectors_Supplement"],
    ["Block:Vedic_Extensions", "InVedic_Extensions"],
    ["Block:Vertical_Forms", "InVertical_Forms"],
    ["Block:Yi_Radicals", "InYi_Radicals"],
    ["Block:Yi_Syllables", "InYi_Syllables"],
    ["Block:Yijing_Hexagram_Symbols", "InYijing_Hexagram_Symbols"],
    ["Script=Arabic", "Arabic"],
    ["Script=Armenian", "Armenian"],
    ["Script=Avestan", "Avestan"],
    ["Script=Balinese", "Balinese"],
    ["Script=Bamum", "Bamum"],
    ["Script=Batak", "Batak"],
    ["Script=Bengali", "Bengali"],
    ["Script=Bopomofo", "Bopomofo"],
    ["Script=Brahmi", "Brahmi"],
    ["Script=Braille", "Braille"],
    ["Script=Buginese", "Buginese"],
    ["Script=Buhid", "Buhid"],
    ["Script=Canadian_Aboriginal", "Canadian_Aboriginal"],
    ["Script=Carian", "Carian"],
    ["Script=Cham", "Cham"],
    ["Script=Cherokee", "Cherokee"],
    ["Script=Common", "Common"],
    ["Script=Coptic", "Coptic"],
    ["Script=Cuneiform", "Cuneiform"],
    ["Script=Cypriot", "Cypriot"],
    ["Script=Cyrillic", "Cyrillic"],
    ["Script=Deseret", "Deseret"],
    ["Script=Devanagari", "Devanagari"],
    ["Script=Egyptian_Hieroglyphs", "Egyptian_Hieroglyphs"],
    ["Script=Ethiopic", "Ethiopic"],
    ["Script=Georgian", "Georgian"],
    ["Script=Glagolitic", "Glagolitic"],
    ["Script=Gothic", "Gothic"],
    ["Script=Greek", "Greek"],
    ["Script=Gujarati", "Gujarati"],
    ["Script=Gurmukhi", "Gurmukhi"],
    ["Script=Han", "Han"],
    ["Script=Hangul", "Hangul"],
    ["Script=Hanunoo", "Hanunoo"],
    ["Script=Hebrew", "Hebrew"],
    ["Script=Hiragana", "Hiragana"],
    ["Script=Imperial_Aramaic", "Imperial_Aramaic"],
    ["Script=Inherited", "Inherited"],
    ["Script=Inscriptional_Pahlavi", "Inscriptional_Pahlavi"],
    ["Script=Inscriptional_Parthian", "Inscriptional_Parthian"],
    ["Script=Javanese", "Javanese"],
    ["Script=Kaithi", "Kaithi"],
    ["Script=Kannada", "Kannada"],
    ["Script=Katakana", "Katakana"],
    ["Script=Kayah_Li", "Kayah_Li"],
    ["Script=Kharoshthi", "Kharoshthi"],
    ["Script=Khmer", "Khmer"],
    ["Script=Lao", "Lao"],
    ["Script=Latin", "Latin"],
    ["Script=Lepcha", "Lepcha"],
    ["Script=Limbu", "Limbu"],
    ["Script=Linear_B", "Linear_B"],
    ["Script=Lisu", "Lisu"],
    ["Script=Lycian", "Lycian"],
    ["Script=Lydian", "Lydian"],
    ["Script=Malayalam", "Malayalam"],
    ["Script=Mandaic", "Mandaic"],
    ["Script=Meetei_Mayek", "Meetei_Mayek"],
    ["Script=Mongolian", "Mongolian"],
    ["Script=Myanmar", "Myanmar"],
    ["Script=New_Tai_Lue", "New_Tai_Lue"],
    ["Script=Nko", "Nko"],
    ["Script=Ogham", "Ogham"],
    ["Script=Ol_Chiki", "Ol_Chiki"],
    ["Script=Old_Italic", "Old_Italic"],
    ["Script=Old_Persian", "Old_Persian"],
    ["Script=Old_South_Arabian", "Old_South_Arabian"],
    ["Script=Old_Turkic", "Old_Turkic"],
    ["Script=Oriya", "Oriya"],
    ["Script=Osmanya", "Osmanya"],
    ["Script=Phags_Pa", "Phags_Pa"],
    ["Script=Phoenician", "Phoenician"],
    ["Script=Rejang", "Rejang"],
    ["Script=Runic", "Runic"],
    ["Script=Samaritan", "Samaritan"],
    ["Script=Saurashtra", "Saurashtra"],
    ["Script=Shavian", "Shavian"],
    ["Script=Sinhala", "Sinhala"],
    ["Script=Sundanese", "Sundanese"],
    ["Script=Syloti_Nagri", "Syloti_Nagri"],
    ["Script=Syriac", "Syriac"],
    ["Script=Tagalog", "Tagalog"],
    ["Script=Tagbanwa", "Tagbanwa"],
    ["Script=Tai_Le", "Tai_Le"],
    ["Script=Tai_Tham", "Tai_Tham"],
    ["Script=Tai_Viet", "Tai_Viet"],
    ["Script=Tamil", "Tamil"],
    ["Script=Telugu", "Telugu"],
    ["Script=Thaana", "Thaana"],
    ["Script=Thai", "Thai"],
    ["Script=Tibetan", "Tibetan"],
    ["Script=Tifinagh", "Tifinagh"],
    ["Script=Ugaritic", "Ugaritic"],
    ["Script=Unknown", "Unknown"],
    ["Script=Vai", "Vai"],
    ["Script=Yi", "Yi"]
);
foreach my $category (@categories) {
    my $count, $regex, $beginCode, $endCode, $line, $range, $category0, $category0r, $category1;
    my $output, $charCount;
    $beginCode = -1;
    $category0 = $category->[0];
    $category0r = $category0;
    $category0r =~ s/[\-_]/(?:[\\-_]| *)/g;
    $category0r =~ s/^Block:/(?:Block: *|Blk=)/;
    $category0r =~ s/^Script=/(?:Script=|sc=|Script: *)/;
    $category1 = $category->[1];
    $category1 =~ s/[\-_]/(?:[\\-_]| *)/g;
    if($category0 =~ /^Block:/) {
        $category1 =~ s/^In/In_?/g;
    }
    $line = "";
    $output = "";
    $output .= "                {\n";
    $output .= "                    pattern: /^(?:Is_?)?(?:$category0r|$category1)\$/i,\n";
    $output .= "                    charset:\n";
    $charCount = 0;
    for($count = 0; $count <= 0xffff; $count++) {
        my $aCharacter;
        $aCharacter = chr($count);
        if($aCharacter =~ /^[\p{$category0}]$/) {
            $charCount++;
            if($beginCode < 0) {
                $beginCode = $endCode = $count;
            } else {
                $endCode++;
            }
        } elsif($beginCode >= 0) {
            if($beginCode == $endCode) {
                $range = sprintf("\\\\u%04X", $beginCode);
            } else {
                $range = sprintf("\\\\u%04X-\\\\u%04X", $beginCode, $endCode);
            }
            if(length($line) + length($range) > 72) {
                $output .= "                        \"$line\" +\n";
                $line = $range;
            } else {
                $line .= $range;
            }
            $beginCode = -1;
        }
    }
    if($beginCode >= 0) {
        if($beginCode == $endCode) {
            $range = sprintf("\\\\u%04X", $beginCode);
        } else {
            $range = sprintf("\\\\u%04X-\\\\u%04X", $beginCode, $endCode);
        }
        if(length($line) + length($range) > 72) {
            $output .= "                        \"$line\" +\n";
            $line = $range;
        } else {
            $line .= $range;
        }
    }
    $output .= "                        \"$line\"\n";
    $output .= "                },\n";
    if($charCount > 0) {
        print $output;
    }
}

open(FH, '>', "rei_spec_unicode.js") or die $!;
print FH << "EOF";
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

    describe("testing unicode", function () {
EOF

foreach my $category (@categories) {
    my $count, $regex, $inCode, $outCode, $category0, $category1, $category0r, $category1r, $output;
    sub generateSub {
        $output .= sprintf("            match(\"\\u%04X\", { \"unicode\": \"%s\" });\n", $inCode, $_[0]);
        $output .= sprintf("            nomatch(\"\\u%04X\", { \"unicode\": \"%s\" });\n", $outCode, $_[0]);
        $output .= sprintf("            match(\"\\u%04X\", { \"unicode\": \"%s\" });\n", $inCode, "Is" . $_[0]);
        $output .= sprintf("            nomatch(\"\\u%04X\", { \"unicode\": \"%s\" });\n", $outCode, "Is" . $_[0]);
        $output .= sprintf("            match(\"\\u%04X\", { \"unicode\": \"%s\" });\n", $inCode, "Is_" . $_[0]);
        $output .= sprintf("            nomatch(\"\\u%04X\", { \"unicode\": \"%s\" });\n", $outCode, "Is_" . $_[0]);
    }
    sub generateSeparator {
        my @splited;
        @splited = split(/[\-_]/, $_[0]);
        if($splited[0] =~ /@/) {
            $splited[0] =~ s/@/_/;
            generateSub(join("_", @splited));
            generateSub(join("-", @splited));
            generateSub(join("", @splited));
            generateSub(join("  ", @splited));
            @splited = split(/[\-_]/, $_[0]);
            $splited[0] =~ s/@//;
            generateSub(join("_", @splited));
            generateSub(join("-", @splited));
            generateSub(join("", @splited));
            generateSub(join("  ", @splited));
        } else {
            generateSub(join("_", @splited));
            generateSub(join("-", @splited));
            generateSub(join("", @splited));
            generateSub(join("  ", @splited));
        }
    }
    $beginCode = -1;
    $category0 = $category->[0];
    $category1 = $category->[1];
    $output = "";
    $output .= "        it(\"$category0\", function() {\n";
    $inCode = -1;
    for($count = 0; $count <= 0xffff; $count++) {
        my $aCharacter;
        $aCharacter = chr($count);
        if($aCharacter =~ /^[\p{$category0}]$/) {
            if($inCode < 0) {
                $inCode = $count;
                if($inCode > 0) {
                    $outCode = $inCode - 1;
                    last;
                }
            }
        } elsif($inCode >= 0) {
            $outCode = $count;
            $inCode = $count - 1;
            last;
        }
    }
    if($inCode < 0) {
        next;
    } elsif($category0 =~ /^Bidi_Class:/) {
        generateSeparator($category0);
        generateSeparator($category1);
    } elsif($category0 =~ /^Block:/) {
        generateSeparator($category0);
        $category0r = $category0;
        $category0r =~ s/^Block:/Block:  /;
        generateSeparator($category0r);
        $category0r = $category0;
        $category0r =~ s/^Block:/Blk=/;
        generateSeparator($category0r);
        generateSeparator($category1);
        $category1r = $category1;
        $category1r =~ s/^In/In@/;
        generateSeparator($category1r);
    } elsif($category0 =~ /^Script=/) {
        generateSeparator($category0);
        $category0r = $category0;
        $category0r =~ s/^Script=/sc=/;
        generateSeparator($category0r);
        $category0r = $category0;
        $category0r =~ s/^Script=/Script:/;
        generateSeparator($category0r);
        $category0r = $category0;
        $category0r =~ s/^Script=/Script:  /;
        generateSeparator($category0r);
        generateSeparator($category1);
    } else {
        generateSub($category0);
        generateSeparator($category1);
    }
    $output .= "        });\n";
    print FH $output
}

print FH << "EOF";
    });
});
EOF

close(FH);
