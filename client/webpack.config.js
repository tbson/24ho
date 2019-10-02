const webpack = require('webpack');
const merge = require('webpack-merge');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;
const path = require('path');
const fs = require('fs');
const PATHS = {
    app: path.join(__dirname, 'src'),
    build: path.join(__dirname, 'build'),
    test: path.join(__dirname, 'tests')
};

process.env.BABEL_ENV = TARGET;

const common = {
    resolve: {
        modules: [path.resolve(__dirname), 'node_modules'],
        extensions: ['.js']
    },
    output: {
        path: PATHS.build,
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.styl$/,
                use: [
                    {
                        loader: 'style-loader' // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                        options: {
                            modules: {
                                localIdentName: '[name]__[local]___[hash:base64:5]'
                            }
                        }
                    },
                    {
                        loader: 'stylus-loader' // compiles Stylus to CSS
                    }
                ]
            },
            {
                test: /\.png($|\?)|\.jpg($|\?)|\.gif($|\?)/,
                loader: 'file-loader'
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)|\.otf($|\?)/,
                loader: 'file-loader'
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    plugins: [
        new MomentLocalesPlugin(),
        new HtmlWebpackPlugin({
            inject: false,
            version: new Date().getTime(),
            template: './src/index.html'
        })
    ]
};

if (TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        entry: {
            app: [path.join(PATHS.app, 'index.js')]
        },
        mode: 'development',
        watchOptions: {
            ignored: /node_modules/
        },
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            disableHostCheck: true,
            contentBase: PATHS.build,
            historyApiFallback: true,
            hot: true,
            stats: 'errors-only',
            host: '0.0.0.0',
            port: 3000,
            public: '24ho.test'
        },
        plugins: [new ErrorOverlayPlugin(), new webpack.NamedModulesPlugin()]
    });
}

if (['build-back', 'build-front'].includes(TARGET)) {
    const part = TARGET.split('-')[1];
    module.exports = merge(common, {
        entry: {
            app: path.join(PATHS.app, part, 'index.js')
        },
        mode: 'production'
    });
}
