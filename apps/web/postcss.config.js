const path = require('path');

/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    tailwindcss: {
      config: path.join(__dirname, './tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
