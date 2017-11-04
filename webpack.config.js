module.exports = {
    entry: {
        index: './index.ts'
    },
    output: {
        path: __dirname,
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                }
            },
        ]
    },
    resolve: {
        extensions: [
            '.js', '.ts', '.tsx'
        ]
    }
}
