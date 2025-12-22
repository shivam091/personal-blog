import prettier from "prettier/standalone";
import pluginEstree from "prettier/plugins/estree";
import parserBabel from "prettier/plugins/babel";
import parserPostcss from "prettier/plugins/postcss";
import parserHtml from "prettier/plugins/html";

// Centralized configuration for cleaner structure.
const FORMAT_CONFIG = {
  js: {
    parser: "babel",
    plugins: [pluginEstree, parserBabel],
  },
  css: {
    parser: "css",
    plugins: [parserPostcss],
  },
  html: {
    parser: "html",
    plugins: [parserHtml],
  },
};

// Centralized common options.
const PRETTIER_OPTIONS = {
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  arrowParens: "always"
};

/*
 * Asynchronously formats a string of code using the configured Prettier settings for
 * the specified file type.
 */
export async function prettifyCode(code, fileType) {
  const config = FORMAT_CONFIG[fileType];

  if (!config) {
    throw new TypeError(`[Playground] Unsupported file type for formatting: ${fileType}`);
  }

  try {
    return await prettier.format(code, {
      ...PRETTIER_OPTIONS,
      ...config,
    });
  } catch (err) {
    throw new Error(`[Playground] Prettier failed for type '${fileType}': ${err.message}`);
  }
}
