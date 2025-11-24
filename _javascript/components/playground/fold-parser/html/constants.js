export const htmlTokens = {
  tagStart: "<",
  tagEnd: ">",
  commentStart: "<!--",
  cdataStart: "<![CDATA[",
  doctypeStart: "<!DOCTYPE",
  tags: new Set([
    "!--", "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base",
    "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite",
    "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn",
    "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure",
    "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr",
    "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li",
    "link", "main", "map", "mark", "meta", "meter", "nav", "noscript", "object", "ol",
    "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q",
    "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source",
    "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td",
    "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track",
    "u", "ul", "var", "video", "wbr"
  ]),
  attributes: new Set([
    "accept", "accept-charset", "accesskey", "action", "align", "allow", "alt",
    "aria-activedescendant", "aria-atomic", "aria-autocomplete", "aria-busy",
    "aria-checked", "aria-colcount", "aria-colindex", "aria-colspan", "aria-controls",
    "aria-current", "aria-describedby", "aria-details", "aria-disabled", "aria-errormessage",
    "aria-expanded", "aria-flowto", "aria-haspopup", "aria-hidden", "aria-invalid",
    "aria-keyshortcuts", "aria-label", "aria-labelledby", "aria-level", "aria-live",
    "aria-modal", "aria-multiline", "aria-multiselectable", "aria-orientation", "aria-owns",
    "aria-placeholder", "aria-posinset", "aria-pressed", "aria-readonly", "aria-relevant",
    "aria-required", "aria-roledescription", "aria-rowcount", "aria-rowindex", "aria-rowspan",
    "aria-selected", "aria-setsize", "aria-sort", "aria-valuemax", "aria-valuemin",
    "aria-valuenow", "aria-valuetext", "async", "autocapitalize", "autocomplete", "autofocus",
    "autoplay", "background", "bgcolor", "border", "capture", "charset", "checked",
    "cite", "class", "cols", "colspan", "content", "contenteditable", "controls",
    "coords", "crossorigin", "data", "datetime", "decoding", "default", "defer", "dir", "dirname",
    "disabled", "download", "draggable", "enctype", "enterkeyhint", "for", "form",
    "formaction", "formenctype", "formmethod", "formnovalidate", "formtarget", "headers",
    "height", "hidden", "high", "href", "hreflang", "http-equiv", "id", "integrity",
    "inputmode", "ismap", "itemid", "itemprop", "itemref", "itemscope", "itemtype", "kind",
    "label", "lang", "list", "loading", "loop", "low", "manifest", "max", "maxlength",
    "media", "method", "min", "minlength", "multiple", "muted", "name", "novalidate",
    "onabort", "onauxclick", "onbeforeinput", "onbeforematch", "onblur", "oncancel",
    "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu",
    "oncopy", "oncuechange", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter",
    "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied",
    "onended", "onerror", "onfocus", "onformdata", "oninput", "oninvalid", "onkeydown",
    "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart",
    "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover",
    "onmouseup", "onpaste", "onpause", "onplay", "onplaying", "onprogress", "onratechange",
    "onreset", "onresize", "onscroll", "onsecuritypolicyviolation", "onseeked", "onseeking",
    "onselect", "onshow", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle",
    "onvolumechange", "onwaiting", "onwheel", "open", "optimum", "pattern", "ping", "placeholder",
    "playsinline", "poster", "preload", "readonly", "referrerpolicy", "rel", "required", "role",
    "reversed", "rows", "rowspan", "sandbox", "scope", "selected", "shape", "size", "slot",
    "span", "spellcheck", "src", "srcdoc", "srclang", "srcset", "start", "step", "style",
    "tabindex", "target", "title", "translate", "type", "usemap", "value", "width", "wrap"
  ]),
  entities: new Set([
    // Core Entities (HTML Syntax)
    "&amp;", "&lt;", "&gt;", "&quot;", "&apos;",

    // Whitespace & Basic Symbols
    "&nbsp;", "&ensp;", "&emsp;", "&thinsp;", "&zwnj;", "&zwj;", "&shy;",
    "&copy;", "&reg;", "&trade;", "&bull;", "&euro;", "&sect;", "&para;",
    "&cent;", "&pound;", "&yen;", "&deg;", "&prime;", "&Prime;", "&frasl;",

    // Math & Greek Letters (Common)
    "&plus;", "&minus;", "&times;", "&divide;", "&plusmn;", "&ne;", "&le;", "&ge;",
    "&sum;", "&prod;", "&infin;", "&part;", "&nabla;", "&isin;", "&notin;", "&cong;",
    "&asymp;", "&equiv;", "&forall;", "&exist;", "&sub;", "&sup;", "&cap;", "&cup;",
    "&and;", "&or;", "&oplus;", "&otimes;",
    "&alpha;", "&beta;", "&gamma;", "&delta;", "&epsilon;", "&zeta;", "&eta;", "&theta;",
    "&iota;", "&kappa;", "&lambda;", "&mu;", "&nu;", "&xi;", "&omicron;", "&pi;",
    "&rho;", "&sigmaf;", "&sigma;", "&tau;", "&upsilon;", "&phi;", "&chi;", "&psi;",
    "&omega;", "&Alpha;", "&Beta;", "&Gamma;", "&Delta;", "&Theta;", "&Lambda;", "&Xi;",
    "&Pi;", "&Sigma;", "&Upsilon;", "&Phi;", "&Psi;", "&Omega;",

    // Punctuation & Typography
    "&ndash;", "&mdash;", "&hellip;", "&lsquo;", "&rsquo;", "&ldquo;", "&rdquo;",
    "&sbquo;", "&bdquo;", "&lsaquo;", "&rsaquo;", "&laquo;", "&raquo;", "&loz;",
    "&spades;", "&clubs;", "&hearts;", "&diams;",

    // Latin-1 Supplement (Accents)
    "&Aacute;", "&aacute;", "&Acirc;", "&acirc;", "&Agrave;", "&agrave;",
    "&Aring;", "&aring;", "&Atilde;", "&atilde;", "&Auml;", "&auml;",
    "&Ccedil;", "&ccedil;", "&Eacute;", "&eacute;", "&Ecirc;", "&ecirc;",
    "&Egrave;", "&egrave;", "&Euml;", "&euml;", "&Iacute;", "&iacute;",
    "&Icirc;", "&icirc;", "&Igrave;", "&igrave;", "&Iuml;", "&iuml;",
    "&Ntilde;", "&ntilde;", "&Oacute;", "&oacute;", "&Ocirc;", "&ocirc;",
    "&Ograve;", "&ograve;", "&Oslash;", "&oslash;", "&Otilde;", "&otilde;",
    "&Ouml;", "&ouml;", "&Scaron;", "&scaron;", "&Uacute;", "&uacute;",
    "&Ucirc;", "&ucirc;", "&Ugrave;", "&ugrave;", "&Uuml;", "&uuml;",
    "&Yacute;", "&yacute;", "&Yuml;", "&yuml;", "&thorn;", "&ETH;", "&eth;",
    "&Dstrok;", "&dstrok;",

    // Numeric Entities (If you want to keep your decimal/hex style)
    // Note: The official NAMED entities are strictly the string names,
    // but these numeric forms are often grouped with them in utility sets.
    "&#32;",   // Space
    "&#160;",  // Non-breaking space
    "&#8204;", // zwnj
    "&#8205;", // zwj
  ]),
};
