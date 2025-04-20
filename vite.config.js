import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: '/NEXLABS/',
  plugins: [glsl()],
  // optimizeDeps: {
  //   include: ['three', 'three-stdlib/loaders/FontLoader.js', 'three-stdlib/geometries/TextGeometry.js']
  // }
  
});
