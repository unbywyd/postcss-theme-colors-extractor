# Ungic SASS Theme module

This module was created in order to manage the colors and styles of SASS projects.

## Features

* Store colors in a separate **theme config** file
* Methods for quickly manipulating theme colors.
* Own technique for creating shades, tints of given theme colors which has a flexible configuration
* Maintaining a balance between light and dark theme color (text color and background color)
* Flexible customization of the theme color palette
* Simultaneous support for light and dark theme (Inverse theme). Correct theme inversion is performed automatically when switching the [inverse-mode](#theme-inversion) theme configuration parameter.
* It is possible to generate projects with different configuration themes (with different colors) without changing styles!
* Greyscale functionality that automatically calculates gray color based on background and text colors of current theme, and provides methods for dealing with grayscale from darkest to lightest relative to main theme colors (background and text)!
* It works with css colors and css vars! Just choose your preferred method!
* Integrate into any SASS framework that supports **dart sass** build

**Everything you need to work with colors in your sass projects is here!**


## Demo

* [My site](https://unbywyd.com/) built with this plugin (Try the theme switcher on the side of website)
* [Ungic demo](https://ungic.com/demo) - Ungic framework is based on this module
* [Simple example](https://israelicoder.com/public/ungic-theme)
* [Another good job for demo](https://israelicoder.com/public/app2/)

## Get Started

First, you can look at the ready-made [demo project](https://github.com/unbywyd/ungic-sass-theme-demo).


### New project

Add [ungic-sass-theme](https://npmjs.com/package/ungic-sass-theme) npm package to your project

```
npm install ungic-sass-theme
```

And use it in your sass files, but first you need to configure this module!

1. Create your first theme configuration file:

You can see an example of [theme configuration file here](https://github.com/unbywyd/ungic-sass-theme-demo/blob/master/app/themes/default.scss)

```scss
// myproject/themes/default.scss 

$colors: (
    primary: #07f857,
    secondary: #3d3931,
    success: #cce678,
    danger: #e6787d,
    info: #4bafee,
    warning: #eee84b,
    system: (#C6530C, #ef8646),
    text-color: (#192d20, #fff9ea),
    background-color: (#fff9ea, #192d20)
);

$config: (
    brightness: (
        offset-brighten: 0,          // List type possible
        offset-dim: 0,               // List type possible
        saturation-brighten: (0, 0),  // List type possible
        saturation-dim: (0, 0)        // List type possible
    ),
    relative-light-limit : true,
    gray: (
        saturation: 5%,   // List type possible
        hue: blue       // List type possible
    )
);

$palettes: (
    primary: (
        lighten: #e8f2c7,
        darken: #4c5d15
    ),
    secondary: (
        lighten: #f5f3e6,
        darken: #2a2925
    )
); 


// Inverse mode
$inverse-mode: false;

// Colors mode
$colors-vars-mode: true;
```

2. Configure the **ungic-sass-theme** module and pass it the configuration we created


```scss
// myproject/theme.scss

@use "sass:meta";

@use "./themes/default" as theme-config; // Get your theme configuration

@use "ungic-sass-theme" with (
    $theme: meta.module-variables(theme-config) // and pass it to ungic-sass-theme module
);

@forward "ungic-sass-theme";
```


3. Use your configured module!

```scss
@use "./theme" as theme; // our configured module, also you can use as *

body {
    background-color: theme.color(background-color); // or theme.bgc()
    color: theme.color(); // or theme.color(text-color)
}

.btn {
    color: theme.primary();
    border: 2px solid theme.color(primary); // the same as theme.primary();
    &:hover {
        /*
        * Create a tint 20% lighter or darker relative to the primary colors (text and background colors) and also, relative to the current theme (light or dark), 
        * the light theme will have a lightening, 
        * the dark theme will darken!
        */
        color: theme.primary(.2);

        /*
        * There are also tools that help you set values relative to the theme type.
        * subs(valueForLightTheme, valueForDarkTheme), see documentation for details
        * subs(NUMBER); - inverts the number for the opposite theme type
        */
        border-color: theme.primary(theme.subs(2));
    }
}
```

### Theme inversion

To generate a theme inversion, just switch the **inverse-mode** theme configuration parameter (sass var)

```scss
// myproject/themes/default.scss 

...

$inverse-mode: true;
```

and rebuild your project.

Would you like to add both versions to your project? [See below](#multiple-themes)

### Multiple themes

Only one theme and one theme type (light or dark) can be built per project build, but wait, don't go, as always there is a way!

To get started, to generate another theme, just pass another configuration file to the ungic-sass-theme module

```scss
// myproject/theme.scss

@use "sass:meta";

@use "./themes/my-other-theme" as theme-config; // Your other theme
@use "ungic-sass-theme" with (
    $theme: meta.module-variables(theme-config)
);

@forward "ungic-sass-theme";
```

And now about how to add **multiple themes** and **inversion** to your project!

First of all, you need to understand that we cannot generate colors for everything at once in one build, only if you want to use my [ungic](https://ungic.com) framework .. which imitates this behavior...

Therefore, we can generate styles by extracting colors from common css styles and prefixing the selector with the name of our theme or theme type. For this I have created the [postcss-theme-colors-extractor](https://www.npmjs.com/package/theme-colors-extractor) plugin

### postcss-theme-colors-extractor

This is a postcss plugin that extracts colors into separate css rules and adds the desired prefix to the selector, and can extracts such rules into separate .css files 


#### Webpack configuration example 

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

## Documentation

### Usage

```scss
@use "sass:meta";

@use "./themes/my-other-theme" as theme-config; // Your other theme
@use "ungic-sass-theme" as theme with (
    $theme: meta.module-variables(theme-config)
);

.color {
    color: theme.color(primary); // Methods
}

@debug theme.$inverse-mode; // Vars

```


### $inverse-mode

- **Type:** `variable`

- **Usage**:

	Contains the status of inversion build mode

	:::tip
	Use the [get]() method instead

	```SCSS
	@use "ungic.theme" as theme;

	@debug get(inverse-mode);
	```
	:::

### $colors

- **Type:** `variable`

- **Usage**:

	Contains the colors of the current project theme

	:::tip
	Use the [color]() method instead
	:::

### $config

- **Type:** `variable`

- **Usage**:

	Contains the config of the current project theme

### $palettes

- **Type:** `variable`

- **Usage**:

	Contains the palettes of the current project theme

	:::tip
	Use the [palette]() method instead
	:::

	:::tip
	The [palette]() method also used in the [color]() method as the second parameter!
	:::

	
### $theme-type

- **Type:** `variable`

- **Usage**:

	Theme type, *dark* or *light*

	:::tip
	Use the [get]() method instead

	```SCSS
	@use "ungic.theme" as theme;

	@debug get(theme-type);
	```
	:::

### has-palette
- **Type:** `function`

- **Parameters**:
	- **$color-name** - theme color name
	- **$tint-name**, <span class="mark">Default: null</span> - color tint name (optional parameter to generate more detailed error in logs)
	- **$silent**, <span class="mark">Default: false</span> - error output to console

- **Usage**: `theme.has-palette($color-name, $tint-name: null, $silent: false)`

	Checks if the theme color has a palette
	
### has-palette-tint
- **Type:** `function`

- **Parameters**:
	- **$color-name** - theme color name
	- **$tint-name** - color tint name
	- **$silent**, <span class="mark">Default: false</span> - error output to console

- **Usage**: `theme.has-palette-tint($color-name, $tint-name, $silent: false)`

	Checks if the color of the palette has a specific color tint

### palette
- **Type:** `function`

- **Parameters**:
	- **$color-name** - theme color name
	- **$tint-name** - color tint name
	- **$hue-offset**, <span class="mark">Default: 0</span> - offset the hue of color using the [color.adjust]() sass method

- **Usage**: `theme.palette($color-name, $tint-name, $hue-offset: 0)`

	Get color tint of theme color with hue offset

### lighten
- **Type:** `function`

- **Parameters**:
	- **$color** - theme color name
	- **$intensity** - <span class="mark">Number</span> - must be a number from 0 to 1 or percentage from 0 to 100%

- **Usage**: `theme.lighten($color, $intensity)`

	Custom color lighten method, works in relation to the main colors (text-color, background-color) of the theme.
	

### darken
- **Type:** `function`

- **Parameters**:
	- **$color** - color or theme color name
	- **$intensity** - <span class="mark">Number</span> - must be a number from 0 to 1 or percentage from 0 to 100%

- **Usage**: `theme.darken($color, $intensity)`

	Custom color darken method, works in relation to the main colors (text-color, background-color) of the theme.
	

### lightness
- **Type:** `function`

- **Parameters**:
	- **$color** - color or theme color name
	- **$intensity** - <span class="mark">Number</span> - must be a number **from -1 to 1**

- **Usage**: `theme.lightness($color, $intensity)`

	A method that lightens or darkens a color depending on the type of theme.
	- **if theme is light** - a positive number increases light in color and a negative number decreases the amount of light in color
	- **if theme is dark** - a positive number decreases the light in color, and a negative number increases the amount of light in a color

### brightness
- **Type:** `function`

- **Parameters**:
	- **$color** - color or theme color name
	- **$intensity** - <span class="mark">Number</span> - must be a number **from -1 to 1**
	- **$hue-offset** - <span class="mark">Default: 0</span> - offset the hue of color using the [color.adjust]() sass method
	- **$saturation** - <span class="mark">Default: 0</span> - offset the saturation of color using the [color.adjust]() sass method

- **Usage**: `theme.brightness($color, $intensity, $hue-offset: 0, $saturation: 0)`

	Works like [lightness]() method but also adjusts the hue and saturation of color

### dim
- **Type:** `function`

- **Parameters**:
	- **$color** - color or theme color name
	- **$intensity** - <span class="mark">Number</span> - must be a number **from -1 to 1**
	- **$hue-offset** - <span class="mark">Default: 0</span> - offset the hue of color using the [color.adjust]() sass method
	- **$saturation** - <span class="mark">Default: 0</span> - offset the saturation of color using the [color.adjust]() sass method

- **Usage**: `theme.dim($color, $intensity, $hue-offset: 0, $saturation: 0)`

	Used in the [brightness]() method to darken the color

### brighten
- **Type:** `function`

- **Parameters**:
	- **$color** - color or theme color name
	- **$intensity** - <span class="mark">Number</span> - must be a number **from -1 to 1**
	- **$hue-offset** - <span class="mark">Default: 0</span> - offset the hue of color using the [color.adjust]() sass method
	- **$saturation** - <span class="mark">Default: 0</span> - offset the saturation of color using the [color.adjust]() sass method

- **Usage**: `theme.brighten($color, $intensity, $hue-offset: 0, $saturation: 0)`

	Used in the [brightness]() method to lighten the color

### tint
- **Type:** `function`

- **Parameters**:
	- **$color** - color or theme color name
	- **$offset** - <span class="mark">Number</span>

- **Usage**: `theme.tint($color, $offset)`

	Generate color tint

	```SCSS
	// Theme module
	@use "ungic.theme"as theme;

	@for $i from 1 through 10 {
		.tint-#{$i} {
			padding: 10px;
			background-color: theme.tint(red, ($i / 10));
		}
		.tint-reverse-#{$i} {
			padding: 10px;
			background-color: theme.tint(red, ($i / 10) * -1);
		}
	}
	```

### theme-config
- **Type:** `function`

- **Parameters**:
	- **$key** - config option name

- **Usage**: `theme.theme-config($key:'')`

	Get theme config option

### get
- **Type:** `function`

- **Parameters**:
	- **$key** - name of the requested variable

- **Usage**: `theme.get($key:'')`

	Get data belonging to the current project theme

	```SCSS
	// Theme module
	@use "ungic.theme"as theme;

	@debug theme.get(name); // default
	```

### subs
- **Type:** `function`

- **Parameters**:
	- **$light** - if the theme is light will return the given value
	- **$dark** - <span class="mark">Defaut: null</span> if the theme is dark will return the given value. 

- **Usage**: `theme.subs($light, $dark: null)`

	:::warning
	The second argument is optional only if the first parameter passed is a number! 
	If the first passed parameter is a number, and the second parameter is not specified, then the number will be inverted during inversion!

	```SCSS
	@use "ungic.theme"as theme;

	// will return 1 if the theme is not 
	// in inversion mode, and vice versa, 
	// in inversion mode will return -1

	@debug theme.subs(1); 
	```
	:::

	Get value relative to theme type (light or dark theme)

	```SCSS
	// Theme module
	@use ".core"as this;

	@include this.component {
		color: subs(dark, white);
	}
	```

### colors
- **Type:** `function`

- **Parameters**:
	- **$color** - theme color name

- **Usage**: `theme.colors($color: '')`

	Return all colors in sass map format or a specific color of the current theme. If the color does not exist will return a **transparent**.


### gray
- **Type:** `function`

- **Parameters**:
	- **$offset** <span class="mark">Number (from -1 to 1) or String</span>

- **Usage**: `theme.gray($offset:0)`

	* If the value for **$color-name** is a number then the number must be between -1 and 1 the given number will be passed to [brightness]() method as $intensity.

	* If the value for **$color-name** is a string then this value will be interpreted as the name of the tint of palette

	Function for generating gray color. Gray color is computed between the main colors of the theme (text-color, background-color).
	:::tip
	Gray is 50% of the light between **text-color** and **background-color!**
	:::

	Offset can be used to shift the gray scale to one side or the other from the middle of the color light. Lightening and darkening gray depends on the type of theme!

	```SCSS
	// main colors of our theme:
    // text-color: (#000, #CCC), 
	// background-color: (#FFF, #444)  
	
	@use "ungic.theme" as theme;

	// #867a7a - if light theme 
	// (50% of light because it is the middle of light between #000 and #FFF colors)

	// #8e8282 - if dark theme 
	// (53% of light because it is the middle of light between #444 and #CCC colors)
	@debug theme.gray(); 

	// Lightening by 50% relative to main colors
	// 	#c3bcbc - if light theme (75% of light)
	//	#6b6161 - if dark theme (40% of light)
	@debug theme.gray(.5);
	```

### color
- **Type:** `function`

- **Parameters**:
	- **$color-name** - theme color name <span class="mark">Required</span>
	- **$color-tint** - <span>Number, List, String</span> 
	- **$hue-offset** - offset of hue
	- **$saturation** - offset of saturation

- **Usage**: `theme.color($color-name, $color-tint: 0, $hue-offset: 0, $saturation: 0)`

	Returns the theme color and applies the [brightness]() method to it. 

	* If the value for **$color-name** is number then the number must be between -1 and 1 the given number will be passed to [brightness]() method as $intensity.
	```SCSS
	@use "ungic.theme" as theme;

	@debug theme.color(primary, .9);
	```

	* If the value for **$color-name** is a list then the first item in the list is the name of the palette tint for this color, and the second item of the list can be passed as default value (if the tint is missing from the palette).

	```SCSS
	@use "ungic.theme" as theme;

	@debug theme.color(primary, (lighten, .9));
	```

	* If the value for **$color-name** is a string then this value will be interpreted as the name of the tint of palette
	```SCSS
	@use "ungic.theme" as theme;

	@debug theme.color(primary, lighten);
	```

	* If the value for **$color-name** is a "gray" or "grey" then the [gray]() method will be applied!
	```SCSS
	@use "ungic.theme" as theme;

	@debug theme.color(gray, .5); // the same as theme.gray(.5);
	```

### color-var
- **Type:** `function`

- **Parameters**:
	- **$color-name** - theme color name <span class="mark">Required</span>
	- **$color-tint** - <span>Number, List, String</span> 
	- **$hue-offset** - offset of hue
	- **$saturation** - offset of saturation
	- **$rgb-list** -  <span class="mark">Default: false</span> save var as rgb list

- **Usage**: `theme.color-var($color-name, $color-tint: 0, $hue-offset: 0, $saturation: 0)`

	Works like **color** method, but return a css variable instead of a color

### color-rgb
- **Type:** `function`

- **Parameters**:
	- **$color-name** - theme color name <span class="mark">Required</span>
	- **$color-tint** - <span>Number, List, String</span> 
	- **$hue-offset** - offset of hue
	- **$saturation** - offset of saturation
	- **$rgb-list** -  <span class="mark">Default: false</span> save var as rgb list

- **Usage**: `theme.color-rgb($color-name, $color-tint: 0, $hue-offset: 0, $saturation: 0)`

	Works like **color** method, but return a css variable whose value is a rgb list of color

### gray-var
- **Type:** `function`

- **Parameters**:
	- **$offset** <span class="mark">Number (from -1 to 1) or String</span>

- **Usage**: `theme.gray-var($offset:0)`

	Works like **gray** method, but return a css variable instead of a color


### gray-rgb
- **Type:** `function`

- **Parameters**:
	- **$offset** <span class="mark">Number (from -1 to 1) or String</span>

- **Usage**: `theme.gray-var($offset:0)`

	Works like **gray** method, but return a css variable whose value is a rgb list of color

### as-color
- **Type:** `function`
    
    Same as `color` but always returns the value as a color, even if the `colors-vars-mode` is enabled

### as-gray
- **Type:** `function`
    
    Same as `gray` but always returns the value as a color, even if the `colors-vars-mode` is enabled

### primary, secondary, bgc, extra, warning, success, danger, system, info
- **Type:** `function`

    Quick helpers that wrap the color method

    ```scss
    @function primary($color-tint: 0, $hue-offset: 0, $saturation: 0) {
        @return color(primary, $color-tint, $hue-offset, $saturation);
    }
    ```

### is-inverse
- **Type:** `mixin`, <span class="mark">@content required</span>

- **Using:** `@include theme.is-inverse {...}`

	Apply css rules in inversion mode only! 

### skip-inverse
- **Type:** `mixin`, <span class="mark">@content required</span>

- **Using:**  `@include theme.skip-inverse {...}`

	Apply css rules in not inversion mode only! 

### is-type
- **Type:** `mixin`, <span class="mark">@content required</span>

- **Parameters:** 
	- **$type:** - <span class="mark">String</span> the value must be **dark** or **light**

- **Using:** `@include theme.is-type($type) {...}`

	Apply css rules relative to theme type (dark or light). This mixin will only save css rules for a specific theme type!

### is-dark
- **Type:** `mixin`, <span class="mark">@content required</span>

- **Using:** `@include theme.is-dark {...}`

	Apply css rules exclusively for dark theme. 

### is-light
- **Type:** `mixin`, <span class="mark">@content required</span>

- **Using:** `@include theme.is-light {...}`

	Apply css rules exclusively for light theme. 

### hsl
- **Type:** `function`

- **Returns:** 

	HSL SASS List of values

- **Parameters:**
	- **$color** - Color to split
	- **$strip-unit** - Strip unit
	- **$asmap** - return as sass map (list by default)

- **Specification:** `hsl($color, $strip-unit: true, $asmap: false)`

	Split $color to hsl map.

### lightest
- **Type:** `function`

- **Specification:** `lightest($color1, $color2)`

	Returns the lightest color

### darkest
- **Type:** `function`

- **Specification:** `darkest($color1, $color2)`

	Returns the darkest color

### is-darker
- **Type:** `function`

- **Parameters:**
	- **$this-color** - if this color is darker than the second
	- **$than-this-color** - second color

- **Specification:** `is-darker($this-color, $than-this-color)`

	Checks if the first color is darker than the second

### render-vars($selector: ':root')
- **Type:** `mixin`

    Render color variables. Must be used at the end of the file!