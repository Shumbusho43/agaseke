module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          alias: {
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@theme": "./src/theme",
            "@data": "./src/data",
            "@services": "./src/services",
            "@context": "./src/context",
          },
        },
      ],
    ],
  };
};
