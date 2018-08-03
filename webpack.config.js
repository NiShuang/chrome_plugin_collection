process.env.NODE_ENV = 'production';
const glob = require("glob");
const path = require("path");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const destDir = path.resolve(__dirname, "./dist/js");

const config = {
    mode: "production",

    entry: {},

    output: {
        path: path.resolve(destDir, ""),
        filename: "[name].js",
        publicPath: '/'
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },

    plugins: [
        new CleanWebpackPlugin([
            path.resolve(destDir, "")
        ])
    ]
};

glob.sync('./src/*.js').forEach(f => {
    const key = f
        .split(path.sep)
        .join("/")
        .replace(/.\/src\//g, "")
        .replace('.js', "");

    console.log(key);
    config.entry[key] = f;
});

module.exports = config;