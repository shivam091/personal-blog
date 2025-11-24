export const jsGrammar = {
  startRule: 'Program',
  rules: {
    /**
     * Top-level rule: Consumes statements until EOF.
     */
    Program(p) {
      const body = [];
      while (!p.eof()) {
        // Added IfStatement and ReturnStatement as placeholders for extensibility
        const stmt = p.oneOf(['FunctionDeclaration', 'VariableDeclaration', 'IfStatement', 'ReturnStatement', 'ExpressionStatement', 'WS', 'COMMENT']);
        if (!stmt) break;
        if (stmt.type && stmt.type !== 'WS' && stmt.type !== 'COMMENT') body.push(stmt);
      }
      return { type: 'Program', body };
    },

    // --- Utility Rules ---

    WS(p) {
      const t = p.matchType('WS');
      return t ? { type: 'WS', start: t.start, end: t.end } : null;
    },

    COMMENT(p) {
      const t = p.matchType('COMMENT');
      return t ? { type: 'Comment', value: t.value, start: t.start, end: t.end } : null;
    },

    // --- Statement Rules ---

    /**
     * Parses a block of statements enclosed in {}.
     */
    Block(p) {
      if (!p.matchType('PUNC', '{')) return null;
      const stmts = [];
      while (!p.matchType('PUNC', '}')) {
        // Uses the same statement set as Program
        const s = p.oneOf(['VariableDeclaration', 'ExpressionStatement', 'WS', 'COMMENT']);
        if (!s) break; // Error recovery: if no statement matches, break the loop
        if (s.type && s.type !== 'WS' && s.type !== 'COMMENT') stmts.push(s);
      }
      // Note: If '}' is missing, an error should be logged, but the parser continues.
      return { type: 'Block', body: stmts };
    },

    /**
     * Parses a function declaration: function name(params) { body }
     */
    FunctionDeclaration(p) {
      const startToken = p.matchType('KEYWORD', 'function');
      if (!startToken) return null;

      const name = p.matchType('IDENT');
      p.matchType('PUNC', '(');

      // Simplistic parameter parsing
      const params = [];
      while (!p.matchType('PUNC', ')')) {
        const id = p.matchType('IDENT');
        if (!id) break;
        params.push(id.value);
        if (!p.matchType('PUNC', ',')) break;
      }

      const body = p.apply('Block');

      return {
        type: 'FunctionDeclaration',
        name: name?.value ?? null,
        params,
        body
      };
    },

    /**
     * Parses a variable declaration: (var|let|const) id = expression;
     * Initialization (expression) is handled by simple token collection.
     */
    VariableDeclaration(p) {
      const kw = p.matchType('KEYWORD');
      if (!kw || !['var', 'let', 'const'].includes(kw.value)) return null;

      const id = p.matchType('IDENT');
      let init = null;

      if (p.matchType('PUNC', '=')) {
        const expr = [];
        // Consume ALL tokens until the next ';' (or '}')
        while (p.peek() && !(p.peek().type === 'PUNC' && (p.peek().value === ';' || p.peek().value === '}'))) {
          expr.push(p.next());
        }
        init = expr.length > 0 ? { type: 'Expression', value: expr.map(t => t.value).join('') } : null;
      }

      // Consume the mandatory semicolon
      p.matchType('PUNC', ';');

      return {
        type: 'VariableDeclaration',
        kind: kw.value,
        id: id?.value ?? null,
        init: init
      };
    },

    /**
     * Parses any statement that is not a declaration/block, ending with a semicolon.
     * Everything is treated as one large expression token string.
     */
    ExpressionStatement(p) {
      const tokens = [];
      // Collect tokens until ';' (or EOF/Block end)
      while (p.peek() && !(p.peek().type === 'PUNC' && (p.peek().value === ';' || p.peek().value === '}'))) tokens.push(p.next());

      if (tokens.length === 0) return null;

      // Consume the optional semicolon
      if (p.peek() && p.peek().type === 'PUNC' && p.peek().value === ';') p.next();

      return {
        type: 'ExpressionStatement',
        expr: tokens.map(t => t.value).join('')
      };
    },

    // --- Placeholder Rules for Extensibility ---
    // (These currently just skip the keyword and treat the rest as a simple expression/statement)

    IfStatement(p) {
      const kw = p.matchType('KEYWORD', 'if');
      if (!kw) return null;

      // Simplistic parsing: Consume everything until the end of the statement or block
      while (p.peek() && p.peek().type !== 'PUNC' && p.peek().value !== '}') p.next();

      // Attempt to parse the following block (the 'then' part)
      p.oneOf(['Block', 'ExpressionStatement']);

      return { type: 'IfStatement', value: '...' };
    },

    ReturnStatement(p) {
      const kw = p.matchType('KEYWORD', 'return');
      if (!kw) return null;

      // Consume the return value expression tokens
      p.apply('ExpressionStatement');

      return { type: 'ReturnStatement', value: '...' };
    },
  }
};