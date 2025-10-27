import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserHtml from "prettier/plugins/html";
import parserPostcss from "prettier/plugins/postcss";
import pluginEstree from "prettier/plugins/estree";

export async function prettifyCode(code, type) {
  let parser, plugins;

  switch (type) {
    case "js":
      parser = "babel";
      plugins = [pluginEstree, parserBabel];
      break;
    case "css":
      parser = "css";
      plugins = [parserPostcss];
      break;
    case "html":
      parser = "html";
      plugins = [parserHtml];
      break;
    default:
      throw new TypeError(`Unsupported type: ${type}`);
  }

  try {
    return await prettier.format(code, {
      parser,
      plugins,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      trailingComma: "none",
      bracketSpacing: true,
      arrowParens: "always"
    });
  } catch (err) {
    throw new Error(`Prettier failed: ${err.message}`);
  }
}