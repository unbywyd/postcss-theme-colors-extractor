# Ungic SASS utils

**ungic-sass-utils** - this is a Dart SASS module which contains a set of helper methods.

## Get Started

First add [ungic-sass-utils](https://npmjs.com/package/ungic-sass-utils) npm package to your project

```
npm install "ungic-sass-utils"
```

and use it as a module in your sass projects:

```
@use "ungic-sass-utils" as un-utils;

// or
@use "ungic-sass-utils" as *;
```

## Documentation

### str-replace
- **Type:** `function`

- **Parameters:**
	- **$string** - string to be searched
	- **$search** - search value
	- **$replace** - replacement value
	- **$global** <span class="mark">Boolean</span> - global replacement, if false - replace only the first matching element

- **Usage:** `un-utils.str-replace($string, $search, $replace: '', $global: true)`

	This method searches and replaces the value in the string and returns the result.

### insert-nth
- **Type:** `function`

- **Parameters:**
	- **$list** <span class="mark">List</span> - sass list to which the item should be inserted
	- **$index** <span class="mark">Number</span> - list item index where the new item will be inserted
	- **$value** - new value to be inserted

- **Usage:** `un-utils.insert-nth($list, $index, $value)`

	This method inserts a new item by index into the sass list and returns the result.

	```SCSS
	$list: (1,3,4);

	// 1, 2, 3, 4
	@debug un-utils.insert-nth($list, 2, 2);
	```

### remove-nth
- **Type:** `function`

- **Parameters:**
	- **$list** <span class="mark">List</span> - sass list from which to remove the item by its index
	- **$index** <span class="mark">Number</span> - index of list item

- **Usage:** `un-utils.remove-nth($list, $index)`

This method removes a value from the list by its index

### replace-nth($list, $index, $replaceable_value)
- **Type:** `function`

- **Parameters:**
	**$list** <span class="mark">List</span>  - sass list in which to replace the list item
	**$index** <span class="mark">Number</span> - index of the item to be replaced
	**$replaceable_value** - New list item

- **Usage:** `un-utils.replace-nth($list, $index, $replaceable_value)`

	Replace a specific list item by its index


### deep-merge
- **Type:** `function`

- **Parameters:**
	- **$source-map** - <span class="mark">Map</span>
	- **$secondary-map** - <span class="mark">Map</span>

- **Usage:** `un-utils.deep-merge($source-map, $secondary-map)`

	Method for deep merging of two sass maps

### merge
- **Type:** `function`

- **Parameters:**
	- **$maps...** - <span>Maps</span>

- **Usage:** `un-utils.merge($maps...)`

	Merge any number of sass maps using the [deep-merge]() method

### px
- **Type:** `function`

- **Parameters:**
	- **$num** - <span>Number</span>

- **Usage:** `un-utils.px($num)`

	Return value in px

	```SCSS
	@use "ungic.utils" as un-utils;

	// the result will be 16px
	@debug un-utils.px(16px);
	@debug un-utils.px(16em);
	@debug un-utils.px(16vh);
	@debug un-utils.px(16%);
	@debug un-utils.px(16);
	```

### em
- **Type:** `function`

- **Parameters:**
	- **$px** - <span>Number</span> - the value to be converted
	- **$def** - <span>Number</span> - relative to this number

- **Usage:** `un-utils.em($px, $def)`

	```SCSS
	@use "ungic.utils" as un-utils;

	@debug un-utils.em(16px, 18px); // 0.8888888889em
	```

### inv
- **Type:** `function`

- **Parameters:**
	- **$number** <span class="mark">Number</span>

- **Usage:** `un-utils.inv($number)`

	Returns an inverted number

### negative
- **Type:** `function`

- **Parameters:**
	- **$number** <span class="mark">Number</span>

- **Usage:** `un-utils.negative($number)`

	Returns a negative number


### unit-merge
- **Type:** `function`

- **Parameters:**
	- **$number** <span class="mark">Number</span>
	- **$unit**	<span>Unit</span>

- **Usage:** `un-utils.unit-merge($number, $unit)`

	Returns the merged number with the unit

### strip-unit
- **Type:** `function`

- **Parameters:**
	- **$number** <span class="mark">Number</span>

- **Usage:** `un-utils.strip-unit($number)`

	Returns a number without a unit

### char
- **Type:** `function`

- **Parameters:**
	- **$character-code** <span class="mark">Charcode</span>

- **Usage:** `un-utils.char($character-code)`

	Adds a backslash to the charcode

	```SCSS
	@use "ungic.utils" as un-utils;

	@debug un-utils.char(f10); // "\f10"
	```

## Utils for RTLCSS plugin

**Note!** These tools use comments as required by the [RTLCSS](https://rtlcss.com/) plugin, and therefore, in order for this to work, you need to enable the "save comments" option in the sass compiler!

**Webpack** and **sass-loader** the configuration could be as follows:

```js
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
                    postcssOptions: (loaderContext) => {
                        let plugins = [
                            require("postcss-rtl")(), // you can use this plugin, it also uses the RTLCSS plugin
                            require("autoprefixer")()
                        ]
                        return {
                            plugins
                        }
                    
                    }
                },
                {
                    loader: "sass-loader",
                    options: {
                        implementation: require("sass"),
                        sassOptions: {
                            outputStyle: "expanded", // Perhaps this can also help keep the structure of the comments
                            sourceComments: true // Saving comments 
                        }
                    }
                }
            ]
        }
    ]
}
```

### dir
- **Type:** `function`

- **Parameters:**
	- **$ltr** value for LTR
	- **$rtl** value for RTL

- **Usage:** `un-utils.dir($ltr, $rtl)`

	Returns the value depending on the direction mode

	```SCSS
	@use "ungic.utils" as un-utils;

	body {
		font-family: un-utils.dir("Roboto", "Rubik")
	}
	```

	```css
	[dir=ltr] body {
		font-family: "Roboto"
	}

	[dir=rtl] body {
		font-family: "Rubik"
	}
	```

### rtli, rtl-ignore
- **Type:** `function`

- **Parameters:**
	- **$val** 

- **Usage:** `un-utils.rtli($val)`

	This function indicates that this property will be ignored by the rtlcss plugin

	```SCSS
	@use "ungic.utils" as *;

	body {
		border-left: 10px;
		margin-left: rtli(10px);
	}
	```

	```css
	[dir=ltr] body {
		border-left: 10px
	}
	[dir=rtl] body {
		border-right: 10px
	}
	
	body {
		/* This property was not processed */
		margin-left: 10px
	}
	```
	

### rtl-prepend
- **Type:** `function`

- **Parameters:**
	- **$value** - the default value to be assigned in LTR mode
	- **$rtl-prepend** - the value to be prepended into the RTL mode
	- **$sep** - separator

- **Usage:** `un-utils.rtl-prepend($value, $rtl-prepend, $sep:' ')`

	Insert the value before the default value in RTL mode

	```SCSS
	@use "ungic.utils" as un-utils;

	$font-family: un-utils.rtl-prepend('-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', 'Heebo', ',');
	```

### rtl-append
- **Type:** `function`

- **Parameters:**
	- **$value** - the default value to be assigned in LTR mode
	- **$rtl-prepend** - the value to be appended into the RTL mode
	- **$sep** - separator

- **Usage:** `un-utils.rtl-append($value, $rtl-append, $sep: ' ')`

	Insert the value after the default value in RTL mode