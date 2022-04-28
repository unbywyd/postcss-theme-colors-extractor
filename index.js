const path = require('path');
let colorFinder = require('./colorFinder');
const parser = require('postcss-selector-parser');
const postcss = require('postcss');
module.exports = {
    plugin: (opts = {}) => {
        let options = Object.assign({
            extract: {},
            saveProps: false,
            loaderContext: null,
            root: null
        }, opts);
        options.selector = Object.assign({
            before: true,
            as: 'className',
            value: 'theme',
            replace: ['html', ':root']
        }, options.selector);

        let { before, as, value, replace } = options.selector;
        if (!value || String(value).trim() == '') {
            throw new Error('selector.value cannot be empty');
        }
        let { loaderContext, extract, root: rootPath, saveProps } = options;
        let rootDeclarations = new Map();
        let atDeclaration = new Map();
        const transform = selectors => {
            const node = parser[as]({ value });


            selectors.each(selector => {
                if (parser[as] === undefined) {
                    throw new Error(`${as} method not supported. Use one of the following methods: (attribute, className, id, tag)`)
                }
                let combo = parser.combinator({ value: ' ' });


                /*
                *   We pass through the selector and check if it contains replaceable parts,
                *   if so, replace with the required value for the first time
                *   and any next time, just delete
                */
                let replaced = false;
                selector.each(n => {
                
                    if (replace.includes(String(n).toLocaleLowerCase())) {
                        if (replaced) {                          
                            n.remove();
                        } else {
                            n.replaceWith(node);
                            replaced = true;
                        }
                    }
                });

                if (!replaced) {
                    if (!before) {
                        selector.insertAfter(selector.first, node);
                    } else {
                        selector.prepend(combo);
                        selector.insertBefore(combo, node);
                    }
                }
            });
        };

        function prepareSelector(selector) {
            let result = parser().processSync(selector, { lossless: false });
            let out = parser().processSync(parser(transform).processSync(result), { lossless: false });          
            return out;
        }
        function prepareDecl(decl) {
            let declParent = decl.parent;
            let { selector, parent } = decl.parent;
            let isAtRule = parent.type == 'atrule';

            if (isAtRule) {
                let name = parent.name;
                if (name == 'media') {
                    let slc = prepareSelector(selector);

                    if (!atDeclaration.has(parent.params)) {
                        atDeclaration.set(parent.params, []);
                    }
                    let prev = atDeclaration.get(parent.params);
                    let prevParent = prev.find(e => e.selector == slc);
                    if (prevParent) {
                        prevParent.declarations.push(decl.clone())
                    } else {
                        atDeclaration.get(parent.params).push({
                            selector: slc,
                            declarations: [decl.clone()]
                        });
                    }
                    if (!saveProps) {
                        decl.remove();

                        let isEmpty = declParent.nodes.filter(n => n.type != 'comment').length === 0;

                        if (isEmpty) {
                            declParent.remove(); // Remove empty parent
                        }
                        let isEmptyAtRule = parent.nodes.filter(n => n.type != 'comment').length === 0;

                        if (isEmptyAtRule) {
                            parent.remove(); // Remove empty atRule
                        }
                    }
                }
                // skip keyframes
            } else {
                // Root rules          
                let slc = prepareSelector(selector);
                if (!rootDeclarations.has(slc)) {
                    rootDeclarations.set(slc, []);
                }
                rootDeclarations.get(slc).push(decl.clone());
                if (!saveProps) {
                    decl.remove();
                    let isEmpty = declParent.nodes.filter(n => n.type != 'comment').length === 0
                    if (isEmpty) {
                        declParent.remove();
                    }
                }
            }
        }

        return {
            postcssPlugin: "postcss-theme-colors-extractor",
            Declaration(decl) {
                if (colorFinder(decl.value)) {
                    prepareDecl(decl);
                }
            },
            OnceExit(root, args) {
                if (extract) {
                    let content = '';

                    rootDeclarations.forEach((declarations, selector) => {
                        content += `${selector} {${declarations.map(e => `${e.prop}: ${e.value};`).join('')}}`
                    });

                    atDeclaration.forEach((rules, params) => {
                        let result = '';
                        rules.forEach(rule => {
                            let { declarations, selector } = rule;
                            result += `${selector} {${declarations.map(e => `${e.prop}: ${e.value};`).join('')}}`
                        });

                        content += `@media ${params} {${result}}`;
                    });
                    if ('object' == typeof extract) {

                        let relativePath = path.relative(rootPath || loaderContext.rootContext, opts.loaderContext.resourcePath);

                        let exFileName = path.basename(relativePath, path.extname(relativePath));
                        let prefix = path.normalize(path.dirname(relativePath)).replace(/[\/\\]+/g, '-');

                        let readyName = prefix + '-' + exFileName;

                        let fileNameTemplate = extract.fileName ? extract.fileName : '[name]-theme-[suffix].css';

                        let fileName = fileNameTemplate.replace(/\[name\]/gi, readyName);
                        fileName = fileName.replace(/\[suffix\]/gi, value);
                        args.result.messages.push({
                            type: "asset",
                            file: fileName.toLowerCase(),
                            content
                        });
                    } else if ('function' == typeof extract) {
                        extract({
                            content,
                            loaderContext
                        });
                    }
                } else {
                    rootDeclarations.forEach((declarations, selector) => {
                        let node = postcss.rule();
                        node.selector = selector;
                        node.nodes = declarations;
                        root.append(node);
                    });
                    atDeclaration.forEach((rules, params) => {
                        let atRule = postcss.atRule();
                        atRule.name = 'media';
                        atRule.params = params;

                        let nodes = [];
                        rules.forEach(rule => {
                            let { declarations, selector } = rule;
                            let node = postcss.rule();
                            node.selector = selector;
                            node.nodes = declarations;
                            nodes.push(node);
                        });

                        atRule.nodes = nodes;

                        root.append(atRule);
                    });
                }
            }
        };
    },
    ungicSassThemeIntegrator({ themeName = 'default', themesPath=path.join(__dirname, 'app', 'themes'), themeOptions = {}, includeAs = '*' }) {
        return function (content, loaderContext) {
            const { resourcePath, rootContext } = loaderContext;

            const pathToTheme = path.join(path.relative(path.relative(rootContext, path.dirname(resourcePath)), themesPath), themeName + '.scss').replace(/[\/\\]+/g, '/');

            let sassOptionsList = [];
            for (let key in themeOptions) {
                sassOptionsList.push(`${key}: ${themeOptions[key]}`);
            }
            let sassMap = `(${sassOptionsList.join(',')})`;

            let output = `
              @use "sass:meta";
              @use "sass:map";
              @use "${pathToTheme}" as ungic-theme-config;
              $ungic-theme-config: meta.module-variables(ungic-theme-config);

              $ungic-theme-config: map.merge($ungic-theme-config, ${sassMap});   
              
              @use "ungic-sass-theme" as ${includeAs} with (                      
                $theme: $ungic-theme-config
              );  
              ${content} 
              @include render-vars();`

            return output;
        }
    }
}