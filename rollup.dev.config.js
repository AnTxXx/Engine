import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
    input: 'src/main.js',
    output: {
        file: 'lib/audicom.js',
        format: 'esm'                   // bundle as ES module
    },
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'  // only transpile our source code
        }),
        serve(),                        // index.html should be in root of project
        livereload()
    ]
};