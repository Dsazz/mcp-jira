const { build, context } = require("esbuild");

// List of dependencies to exclude from bundle (treated as external)
const external = [
  "express",
  "jira-client",
  "date-fns",
  "dotenv",
  "marked",
  "zod",
  "@modelcontextprotocol/sdk",
  "@modelcontextprotocol/inspector",
  // Add any other dependencies that should be external
];

// Common build options
const commonOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node16",
  outdir: "dist",
  sourcemap: true,
  format: "cjs", // Explicitly set CommonJS format
  external,
  // The banner is causing the syntax error - removing it
  // banner: {
  //   js: "#!/usr/bin/env node",
  // },
};

// Main function to handle different build modes
async function runBuild() {
  // Production build
  if (process.argv.includes("--prod")) {
    await build({
      ...commonOptions,
      minify: true,
      define: {
        "process.env.NODE_ENV": '"production"',
      },
    });
    console.log("⚡ Production build complete!");
  }
  // Development build with watch mode
  else if (process.argv.includes("--watch")) {
    // Create a build context instead of a direct build
    const ctx = await context({
      ...commonOptions,
      minify: false,
      sourcemap: "inline",
      define: {
        "process.env.NODE_ENV": '"development"',
      },
    });

    // Start watch mode
    await ctx.watch();
    console.log("⚡ Watch mode enabled. Waiting for changes...");
  }
  // Standard development build
  else {
    await build({
      ...commonOptions,
      minify: false,
      sourcemap: "inline",
      define: {
        "process.env.NODE_ENV": '"development"',
      },
    });
    console.log("⚡ Build complete!");
  }
}

// Run the build and handle errors
runBuild().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
