import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/main.js',
    output: {
        file: 'lib/audicom.js',
        format: 'esm'
    },
    plugins: [
        resolve(),
        babel({
            runtimeHelpers: true,
            exclude: 'node_modules/**' // only transpile our source code
        })
    ]
};