const path = require('path');
const baseConfig = require("@belucha/config/tailwind/next");

module.exports = {
  ...baseConfig,
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    path.resolve(__dirname, "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"),
  ],
};

