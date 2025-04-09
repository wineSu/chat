import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'sidepanel/index.js',
  output: {
    file: 'dist/sidepanel.bundle.js',
    format: 'iife' // 或其他格式如 'cjs', 'es' 等
  },
  plugins: [commonjs()]
};
