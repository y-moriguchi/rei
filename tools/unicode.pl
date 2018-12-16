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
    ["Cn", "Unassigned"]
);
foreach my $category (@categories) {
    my $count, $regex, $beginCode, $endCode, $line, $range, $category0, $category1, $category1r;
    $beginCode = -1;
    $category0 = $category->[0];
    $category1 = $category->[1];
    $category1 =~ s/_/(?:_| *)/g;
    $line = "";
    print "                {\n";
    print "                    pattern: /^(?:$category0|$category1)\$/,\n";
    print "                    charset:\n";
    for($count = 0; $count <= 0xffff; $count++) {
        my $aCharacter;
        $aCharacter = chr($count);
        if($aCharacter =~ /^[\p{$category0}]$/) {
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
                print "                        \"$line\" +\n";
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
            print "                        \"$line\" +\n";
            $line = $range;
        } else {
            $line .= $range;
        }
    }
    print "                        \"$line\"\n";
    print "                },\n";
}
