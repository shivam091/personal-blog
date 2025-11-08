export const cssGrammar = {
  startRule: 'Stylesheet',
  rules: {
    Stylesheet(p) {
      const rules = [];
      while (!p.eof()) {
        const r = p.oneOf(['Rule', 'AtRule', 'WS', 'COMMENT']); // Added AtRule
        if (!r) break;
        if (r.type === 'Rule' || r.type === 'AtRule') rules.push(r);
      }
      return { type: 'Stylesheet', rules };
    },

    WS(p) {
      const t = p.matchType('WS');

      return t ? { type: 'WS', start: t.start, end: t.end } : null;
    },

    COMMENT(p) {
      const t = p.matchType('COMMENT');

      return t ? { type: 'Comment', value: t.value, start: t.start, end: t.end } : null;
    },

    // --- New Rule for At-Rules (@media, @import, etc.) ---
    AtRule(p) {
      const atRule = p.matchType('AT_RULE');
      if (!atRule) return null;

      const params = [];
      let endToken = null;
      let body = null;
      let currentToken = p.peek();

      // Collect at-rule parameters/values until '{' or ';' or EOF
      while (currentToken && !(currentToken.type === 'SYMBOL' && (currentToken.value === '{' || currentToken.value === ';'))) {
        params.push(p.next());
        currentToken = p.peek();
      }

      const l = p.matchType('SYMBOL', '{');
      if (l) {
        // At-rule with a body (e.g., @media, @keyframes)
        const rules = [];
        while (!p.eof() && !(p.peek()?.type === 'SYMBOL' && p.peek().value === '}')) {
          // Inside an at-rule block, we can have rules, other at-rules, comments, or declarations (depending on the rule)
          const r = p.oneOf(['Rule', 'AtRule', 'Declaration', 'WS', 'COMMENT']);
          if (!r) { p.next(); continue; }
          if (r.type === 'Rule' || r.type === 'AtRule' || r.type === 'Declaration') rules.push(r);
        }
        endToken = p.matchType('SYMBOL', '}');
        body = { type: 'AtRuleBody', rules, start: l.start, end: endToken?.end ?? l.end };
      } else {
        // At-rule without a body (e.g., @import, @charset)
        endToken = p.matchType('SYMBOL', ';');
      }

      if (!endToken && !body) {
        p.error(`Expected '{' or ';' after at-rule: ${atRule.value}`);
        // Attempt to consume until EOF or next block start/end for recovery
        while (!p.eof() && p.next()?.type !== 'AT_RULE' && p.next()?.type !== 'IDENT');
      }

      return {
        type: 'AtRule',
        name: atRule.value,
        params: params.map(t => t.value).join(''),
        paramTokens: params,
        body: body,
        start: atRule.start,
        end: endToken?.end ?? body?.end ?? atRule.end
      };
    },

    Rule(p) {
      // selector tokens until {
      const selTokens = [];
      // The loop now correctly consumes PSEUDO_CLASS and PSEUDO_ELEMENT tokens
      while (!p.eof() && !(p.peek()?.type === 'SYMBOL' && p.peek().value === '{')) selTokens.push(p.next());
      const l = p.matchType('SYMBOL', '{');
      if (!l) return null;
      const decls = [];
      while (!p.eof() && !(p.peek()?.type === 'SYMBOL' && p.peek().value === '}')) {
        const d = p.oneOf(['Declaration', 'WS', 'COMMENT']);
        if (!d) { p.next(); continue; }
        if (d.type === 'Declaration') decls.push(d);
      }
      const r = p.matchType('SYMBOL', '}');
      // Fix: Selector start should be at the first token of the selector
      const start = selTokens[0]?.start ?? l.start;
      const end = r?.end ?? l.end;
      return { type: 'Rule', selector: selTokens.map(t => t.value).join(''), selectorTokens: selTokens, decls, start, end };
    },

    Declaration(p) {
      // 1. Try to match a known PROPERTY or VARIABLE
      let prop = p.matchType('PROPERTY') || p.matchType('VARIABLE');

      // 2. If not a known property, allow it to be IDENTIFIER or a VALUE_KEYWORD.
      //    This handles cases like 'flex: 1' where 'flex' is acting as PROPERTY.
      const propFallback = prop || p.matchType('IDENT') || p.matchType('VALUE_KEYWORD');

      if (!propFallback) return null;

      // skip WS
      while (p.peek()?.type === 'WS') p.next();
      const colon = p.matchType('SYMBOL', ':');
      // Added check for ':' being a symbol, since it's now also used for pseudo-selectors
      if (!colon) { p.error('Expected :'); return null; }

      // skip WS
      while (p.peek()?.type === 'WS') p.next();

      const valTokens = [];
      // Collect all tokens that could be part of the value
      while (p.peek() && !(p.peek().type === 'SYMBOL' && (p.peek().value === ';' || p.peek().value === '}'))) {
        // ADD 'VARIABLE' here to allow usage of variables as values
        const t = p.oneOf(['WS', 'COMMENT', 'STRING', 'COLOR', 'NUMBER', 'FUNCTION_NAME', 'VALUE_KEYWORD', 'IDENT', 'VARIABLE', 'SYMBOL', 'UNKNOWN']);
        if (t) valTokens.push(t);
        else p.next(); // Consume unknown if needed
      }

      const lastToken = valTokens[valTokens.length - 1];
      if (p.peek()?.type === 'SYMBOL' && p.peek().value === ';') p.next();

      return {
        type: 'Declaration',
        property: propFallback.value,
        value: valTokens.map(t => t.value).join(''),
        valueTokens: valTokens,
        start: propFallback.start,
        end: lastToken?.end ?? propFallback.end
      };
    }
  }
};