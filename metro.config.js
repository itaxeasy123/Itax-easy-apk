const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite on web ships a WebAssembly build (wa-sqlite); Metro must treat
// .wasm as an asset so the worker import resolves.
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

// Workaround for Zustand v5 import.meta issue on Expo Web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "zustand" || moduleName.startsWith("zustand/")) {
    return {
      filePath: require.resolve(moduleName),
      type: "sourceFile",
    };
  }

  // Call the default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
