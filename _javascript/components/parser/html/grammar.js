export const htmlGrammar = {
  startRule: 'Document',
  rules: {
    Document(p) {
      const children = [];
      while (!p.eof()) {
        const node = p.oneOf(['Element', 'Text', 'Comment']);
        if (!node) break;
        children.push(node);
      }
      return { type: 'Document', children };
    },

    Comment(p) {
      const t = p.matchType('COMMENT');
      return t ? { type: 'Comment', value: t.value, start: t.start, end: t.end } : null;
    },

    Element(p) {
      const open = p.matchType('SYMBOL', '<') || p.matchType('SYMBOL', '</');
      if (!open) return null;

      const name = p.matchType('IDENT');
      if (!name) { p.error('Expected tag name', open); return null; }

      const attrs = [];
      while (true) {
        const a = p.apply('Attribute');
        if (!a) break;
        attrs.push(a);
      }

      // self-close detection:
      // either we see '/>' (two tokens) or '>' alone; lexer does not emit '/>' by default
      const close = p.matchType('SYMBOL', '>');
      if (!close) { p.error('Expected > after tag', name); return null; }

      // children until closing tag
      const children = [];
      while (true) {
        const next = p.peek();
        if (!next) break;
        if (next.type === 'SYMBOL' && next.value === '</') break;
        const child = p.oneOf(['Element', 'Text', 'Comment']);
        if (!child) break;
        children.push(child);
      }

      // consume closing sequence '</ name >'
      if (p.matchType('SYMBOL', '</')) {
        const closeName = p.matchType('IDENT');
        p.matchType('SYMBOL', '>');
      }

      return {
        type: 'Element',
        name: name.value,
        attrs,
        children,
        start: open.start,
        end: close.end
      };
    },

    Attribute(p) {
      const key = p.matchType('IDENT');
      if (!key) return null;
      // maybe boolean attribute
      const eq = p.matchType('SYMBOL', '=');
      if (!eq) return { type: 'Attribute', key: key.value, value: null, start: key.start, end: key.end };
      const val = p.matchType('STRING') || p.matchType('IDENT');
      if (!val) { p.error('Expected attribute value', eq); return null; }
      return { type: 'Attribute', key: key.value, value: val.value, start: key.start, end: val.end };
    },

    Text(p) {
      const t = p.matchType('TEXT');
      return t ? { type: 'Text', value: t.value, start: t.start, end: t.end } : null;
    }
  }
};