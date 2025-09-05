import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: {
    app: "_javascript/main.js",
    style: "_sass/main.sass"
  },
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "dist",
  plugins: [sassPlugin()],
  loader: {
    ".css": "css",
    ".sass": "file",
    ".png": "file",
    ".svg": "file"
  },
  plugins: [
    sassPlugin({
      loadPaths: ["_sass"]
    })
  ],
};

async function runBuild() {
  const ctx = await esbuild.context(buildOptions);

  if (isWatch) {
    await ctx.watch();
    console.log("👀 Watching for changes...");
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log("✅ Build complete");
  }
}

runBuild().catch((e) => {
  console.error("❌ Build failed", e);
  process.exit(1);
});
