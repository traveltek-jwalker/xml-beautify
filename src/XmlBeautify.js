/*
 * xml-beautify - pretty-print text in XML formats.
 *
 * Copyright (c) 2018 Tom Misawa, riversun.org@gmail.com
 *
 * MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Usage:
 *
 *       var resultXmlText = new XmlBeautify().beautify(textInput.value,
 *       {
 *            indent: "  ",  //indent pattern like white spaces
 *            useSelfClosingElement: true //true:use self-closing element when empty element.
 *       });
 *
 * How "useSelfClosingElement" property works.
 *
 *   useSelfClosingElement:true
 *   <foo></foo> ==> <foo/>
 *
 *   useSelfClosingElement:false
 *   <foo></foo> ==> <foo></foo>
 *   
 */
var XmlBeautify =
    (function () {
        'use strict';

        function XmlBeautify() {
            this.parser = new DOMParser();

        }

        XmlBeautify.prototype.hasXmlDef = function (xmlText) {
            return xmlText.indexOf('<?xml') >= 0;
        }
        XmlBeautify.prototype.getEncoding = function (xmlText) {
            var me = this;
            if (!me.hasXmlDef(xmlText)) {
                return null;
            }

            var encodingStartPos = xmlText.toLowerCase().indexOf('encoding="') + 'encoding="'.length;
            var encodingEndPos = xmlText.indexOf('"?>');
            var encoding = xmlText.substr(encodingStartPos, encodingEndPos - encodingStartPos);
            return encoding;
        }
        XmlBeautify.prototype.beautify = function (xmlText, data) {
            var me = this;

            var doc = me.parser.parseFromString(xmlText, "text/xml");

            var indent = "  ";
            var encoding = "UTF-8";
            var useSelfClosingElement = false;

            if (data) {
                if (data.indent) {
                    indent = data.indent;
                }

                if (data.useSelfClosingElement == true) {
                    useSelfClosingElement = data.useSelfClosingElement;
                }
            }

            var xmlHeader = null;

            if (me.hasXmlDef(xmlText)) {
                var encoding = me.getEncoding(xmlText);
                xmlHeader = '<?xml version="1.0" encoding="' + encoding + '"?>';
            }
            var buildInfo = {
                indentText: indent,
                xmlText: "",
                useSelfClosingElement: useSelfClosingElement,
                indentLevel: 0
            }


            me._parseInternally(doc.children[0], buildInfo);

            var resultXml = "";

            if (xmlHeader) {
                resultXml += xmlHeader + '\n';
            }
            resultXml += buildInfo.xmlText;

            return resultXml;


        };

        XmlBeautify.prototype._parseInternally = function (element, buildInfo) {
            var me = this;

            var elementTextContent = element.textContent;

            var blankReplacedElementContent = elementTextContent.replace(/ /g, '').replace(/\r?\n/g, '').replace(/\n/g, '').replace(/\t/g, '');

            if (blankReplacedElementContent.length == 0) {
                elementTextContent = "";
            }

            var elementHasNoChildren = !(element.children.length > 0);
            var elementHasValueOrChildren = (elementTextContent && elementTextContent.length > 0);
            var elementHasItsValue = elementHasNoChildren && elementHasValueOrChildren;
            var isEmptyElement = elementHasNoChildren && !elementHasValueOrChildren;

            var useSelfClosingElement = buildInfo.useSelfClosingElement;

            var startTagPrefix = '<';
            var startTagSuffix = '>';
            var startTagSuffixEmpty = ' />';
            var endTagPrefix = '</';
            var endTagSuffix = '>';

            var valueOfElement = '';

            if (elementHasItsValue) {


                valueOfElement = elementTextContent;


            }

            var indentText = "";

            var idx;

            for (idx = 0; idx < buildInfo.indentLevel; idx++) {
                indentText += buildInfo.indentText;
            }
            buildInfo.xmlText += indentText;
            buildInfo.xmlText += startTagPrefix + element.tagName

            //add attributes
            for (var i = 0; i < element.attributes.length; i++) {
                var attr = element.attributes[i];
                buildInfo.xmlText += ' ' + attr.name + '=' + '"' + attr.textContent + '"';
            }

            if (isEmptyElement && useSelfClosingElement) {
                buildInfo.xmlText += startTagSuffixEmpty;

            } else {
                buildInfo.xmlText += startTagSuffix;
            }

            if (elementHasItsValue) {
                buildInfo.xmlText += valueOfElement;
            } else {

                if (isEmptyElement && !useSelfClosingElement) {
                } else {
                    buildInfo.xmlText += '\n';
                }

            }

            buildInfo.indentLevel++;

            for (var i = 0; i < element.children.length; i++) {
                var child = element.children[i];

                me._parseInternally(child, buildInfo);
            }
            buildInfo.indentLevel--;

            if (isEmptyElement) {

                if (useSelfClosingElement) {

                } else {
                    var endTag = endTagPrefix + element.tagName + endTagSuffix;
                    buildInfo.xmlText += endTag;
                    buildInfo.xmlText += '\n';
                }
            } else {
                var endTag = endTagPrefix + element.tagName + endTagSuffix;

                if (!(elementHasNoChildren && elementHasValueOrChildren)) {
                    buildInfo.xmlText += indentText;
                }
                buildInfo.xmlText += endTag;
                buildInfo.xmlText += '\n';
            }

        };

        return XmlBeautify;
    })();

module.exports = XmlBeautify;