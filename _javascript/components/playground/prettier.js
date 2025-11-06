import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserHtml from "prettier/plugins/html";
import parserPostcss from "prettier/plugins/postcss";
import pluginEstree from "prettier/plugins/estree";

// Centralized configuration for cleaner structure.
const FORMAT_CONFIG = {
  js: {
    parser: "babel",
    // Include all necessary JS plugins here
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

/**
 * Asynchronously formats a string of code using the configured Prettier settings f
 * or the specified file type.
 *
 * @param {string} code - The code string to format.
 * @param {string} type - The file type ('js', 'css', or 'html').
 * @returns {Promise<string>} The formatted code string.
 * @throws {Error} If the file type is unsupported or Prettier fails.
 */
export async function prettifyCode(code, type) {
  const config = FORMAT_CONFIG[type];

  if (!config) {
    throw new TypeError(`Unsupported file type for formatting: ${type}`);
  }

  try {
    return await prettier.format(code, {
      ...PRETTIER_OPTIONS,
      ...config,
    });
  } catch (err) {
    throw new Error(`Prettier failed for type '${type}': ${err.message}`);
  }
}