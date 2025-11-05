export const jsGrammar = {
  startRule: 'Program',
  rules: {
    Program(p) {
      const body = [];
      while (!p.eof()) {
        const stmt = p.oneOf(['FunctionDeclaration', 'VariableDeclaration', 'ExpressionStatement', 'WS', 'COMMENT']);
        if (!stmt) break;
        if (stmt.type && stmt.type !== 'WS' && stmt.type !== 'COMMENT') body.push(stmt);
      }
      return { type: 'Program', body };
    },

    WS(p) { const t = p.matchType('WS'); return t ? { type: 'WS' } : null; },
    COMMENT(p) { const t = p.matchType('COMMENT'); return t ? { type: 'Comment', value: t.value } : null; },

    FunctionDeclaration(p) {
      const kw = p.matchType('KEYWORD', 'function'); if (!kw) return null;
      const name = p.matchType('IDENT');
      p.matchType('PUNC', '(');
      // params simplistic
      const params = [];
      while (!p.matchType('PUNC', ')')) {
        const id = p.matchType('IDENT'); if (!id) break; params.push(id.value); if (!p.matchType('PUNC', ',')) break;
      }
      const body = p.apply('Block');
      return { type: 'FunctionDeclaration', name: name?.value ?? null, params, body };
    },

    VariableDeclaration(p) {
      const kw = p.matchType('KEYWORD'); if (!kw || !['var', 'let', 'const'].includes(kw.value)) return null;
      const id = p.matchType('IDENT');
      let init = null;
      if (p.matchType('PUNC', '=')) {
        const expr = [];
        while (p.peek() && !(p.peek().type === 'PUNC' && p.peek().value === ';')) expr.push(p.next());
        init = expr.map(t => t.value).join('');
      }
      p.matchType('PUNC', ';');
      return { type: 'VariableDeclaration', kind: kw.value, id: id?.value ?? null, init };
    },

    Block(p) {
      if (!p.matchType('PUNC', '{')) return null;
      const stmts = [];
      while (!p.matchType('PUNC', '}')) {
        const s = p.oneOf(['VariableDeclaration', 'ExpressionStatement', 'WS', 'COMMENT']); if (!s) break; if (s.type && s.type !== 'WS' && s.type !== 'COMMENT') stmts.push(s);
      }
      return { type: 'Block', body: stmts };
    },

    ExpressionStatement(p) {
      const tokens = [];
      while (p.peek() && !(p.peek().type === 'PUNC' && p.peek().value === ';')) tokens.push(p.next());
      if (p.peek() && p.peek().type === 'PUNC' && p.peek().value === ';') p.next();
      if (tokens.length === 0) return null;
      return { type: 'ExpressionStatement', expr: tokens.map(t => t.value).join('') };
    }
  }
};