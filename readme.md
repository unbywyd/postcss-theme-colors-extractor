# Theme colors extractor

This is a postcss plugin that extracts colors from css styles into new css rules with changed selector, example:

```css
/* Before */
.btn {
    display: block;
    padding: 1em;
    font-size: 2em;
    color: #000;
    border: 3px solid #000;
}

/* After */
.btn {
    display: block;
    padding: 1em;
    font-size: 2em;
}
.default-theme .btn {
    color: #000;
    border: 3px solid #000;
}
```

## Features of this plugin

* Extract all css colors
* Selectors wrapper (you can add prefixes to selectors to create multiple themes) 
* Extract to external files via webpack assets
* Extract to external files via custom function
* Support and integration for [ungic-sass-theme] module


## Get Started 

Install `npm install theme-colors-extractor`

### Demo

* [demo project](https://github.com/unbywyd/ungic-sass-theme-demo).

Use in your webpack project:

```js
// Webpack configuration
const { plugin } = require('./postcss-plugin.js');

let isProductionMode = env.production;

module: {
    rules: [
        {
            test: /\.scss$/,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                    url: false,
                    import: false,
                    },
                },
                {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: {
                            plugins: [
                                require("postcss-rtl")(),
                                require("autoprefixer")()
                                plugin(
                                    selector: {
                                        before: true, // Add before each selector
                                        as: 'className', // class
                                        value: 'default-theme', // with default-theme name
                                        replace: ['html', ':root', 'body', '[dir]'], // Replace root elements to theme name
                                    }
                                );
                            ]
                        }
                    }
                },
                {
                    loader: "sass-loader",
                    options: {}
                }
            ],
        },
    ],
}
```

## Ungic SASS theme integration + Extract to external files

```js
// Webpack configuration
const { plugin, ungicSassThemeIntegrator } = require('./postcss-plugin.js');

let isProductionMode = env.production;

module: {
    rules: [
        {
            test: /\.scss$/,
            use: [
                isProductionMode ? MiniCssExtractPlugin.loader : "style-loader",
                {
                    loader: "css-loader",
                    options: {
                    url: false,
                    import: false,
                    },
                },
                {
                    loader: "postcss-loader",
                    options: {
                        postcssOptions: (loaderContext) => {
                            let plugins = [
                                require("postcss-rtl")(),
                                require("autoprefixer")()
                            ]

                            if (isProductionMode) {
                                plugins.push(plugin({
                                    loaderContext,
                                    root: path.join(__dirname, 'app'),
                                    extract: { // Or function
                                        fileName: '[name]-theme'+ (env.inverse? '-inv' : '') + '-[suffix].css', // Save as
                                    },
                                    selector: {
                                        before: true,
                                        as: 'className',
                                        value: env.inverse ? env.theme + '-inv' : env.theme, // Theme name
                                        replace: ['html', ':root', 'body', '[dir]'], // Replace root elements to theme name
                                    }
                                }))
                            }

                            return {
                                plugins
                            }
                        }
                    }
                },
                {
                    loader: "sass-loader",
                    options: {
                        implementation: require("sass"),
                        additionalData: ungicSassThemeIntegrator({ // Not required
                            themeName: env.theme,
                            themeOptions: {
                                'inverse-mode': !!env.inverse
                            }
                        }),
                        sassOptions: {
                            outputStyle: "expanded",
                            sourceComments: true
                        },
                    },
                }
            ],
        },
    ],
}
```

Then add the following to the **scripts** section in the `package.json` file:

```json
...
"scripts": {
    ...
    "build": "webpack --mode production --env production --env theme=default",
    "build-inverse": "webpack --mode production --env production --env theme=default --env inverse"
},
```


## Options


### extract

This option is used to extract colors, `not required`

- **Type:** `function` or `object`
- **as object:**
	- **fileName** - output file name, By default:`[name]-theme-[suffix].css`
    
    **fileName** - can contain two replaceable keys:
        - **[name]** - source scss file name
        - **[suffix]** - value from selector.value parameter of configuration
    ```js
    plugin({
        extract: { // Or function
            fileName: '[name]-theme'+ (env.inverse? '-inv' : '') + '-[suffix].css', // Save as
        },
        ...
    })
    ```

- **as function:**
    ```js
        plugin({
            extract: function({content, loaderContext}) {
                // here you can export the resulting colors
            }
            ...
        })
    ```

### saveProps

Remove colors in original scss files? By default, colors are removed from source files, `not required`

- **Type:** `boolean`
- **Default:** `false`


### loaderContext

Webpack `loaderContext`, `required` for `extract` option!

### root

Root path of application, if not specified, `loaderContext.rootContext` will be used 
- **Type:** `string` - full path (for example: `path.join(__dirname, 'app')`)

### selector (required)

Customizing the Selector for Exported Style Rules

- **Type:** `object`
    - **before** `boolean`, - selector handling method
        - `true` **default**  - Add prefix to each selector (.theme-name .app) 
        - `false` - Merge prefix with root of selector (.app.theme-name)
    - **as** `string` - type of prefix
        - `attribute` 
        - `className` **default**
        - `id` 
        - `tag` 
    - **value** `string` - name of prefix, **default:** *theme*
    - **replace** `array` - what should be replaced with selector.value, **default:** `['html', ':root']`
