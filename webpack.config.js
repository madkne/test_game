const path = require('path');
module.exports = {
    mode: 'none',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'public', 'webpack'),
        filename: 'main.js'
    },
    devtool: "source-map", // this is a key point, this option makes browser catch breakpoints faster than "inline-source-map"
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};