# babel-plugin-svgr-unique-id

一个 babel 插件，使用 `useId` 替换 svgr 生成的 svg 组件的 id

## 为什么？

假设下面的 svg 在一个页面上使用了多次，defs 中的 linearGradient 也就重复了多次；然后 defs 内部引用了这些 id，会导致 svg 展示出现问题。这个问题可以通过 svgo 中的 cleanupIDs 生成随机的 id 解决。

但是在 SSR 中，会出现 hydration 错误的问题，需要服务器端生成的 id 和客户端渲染的 id 一致。

所以生成 id 最好的方法是通过 `useId` hooks 生成。

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
     viewBox="0 0 32 32"><!-- Icon from All by undefined - undefined -->
    <defs>
        <linearGradient id="vscodeIconsFileTypeFlareact0" x1="305.289" x2="307.299" y1="875.967" y2="848.006"
                        gradientTransform="translate(-290 -846)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#ffebc8"/>
            <stop offset="1" stop-color="#ffa95f"/>
        </linearGradient>
        <linearGradient id="vscodeIconsFileTypeFlareact1" x1="305.465" x2="306.435" y1="873.262" y2="859.512"
                        gradientTransform="translate(-290 -846)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fab743"/>
            <stop offset="1" stop-color="#ee6f05"/>
        </linearGradient>
    </defs>
    <path fill="url(#vscodeIconsFileTypeFlareact0)"
          d="M26.614 20.792c-.41 5.46-5.52 9.56-11.39 9.17s-10.27-5.13-9.84-10.58c.57-7.52 12-17.37 12-17.37c-3.66 10 10 8.82 9.23 18.78"/>
    <path fill="url(#vscodeIconsFileTypeFlareact1)"
          d="M10.554 22.742a5 5 0 0 0 4.8 5.189h.026a5.1 5.1 0 0 0 5.58-4.49c.29-3.7-4.52-9.2-4.52-9.2c1.034 5.101-5.506 3.631-5.886 8.501"/>
</svg>
```

## TODO

处理这样的 svg:

```svg
<svg height="150" width="400">
    <ellipse className=".el1" cx="200" cy="70" rx="85" ry="55" fill="url(#grad1)" />
    <ellipse className=".el2" cx="200" cy="70" rx="85" ry="55" fill="url(#grad2)" />
    <style>
        {'.el1 { fill: url(#grad1); } .el2 { fill: url(#grad2); }'}
    </style>
    <style>
        {'.el1{fill:url(#grad1);}.el2{fill:url(#grad2);}'}
    </style>
    <defs>
        <style>
            {'.el1 { fill: url(#grad1); }'}
            {'.el2 { fill: url(#grad2); }'}
        </style>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
        </linearGradient>
    </defs>
</svg>
```
