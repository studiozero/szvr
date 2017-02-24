# What the hell is a knol?

It's a term I'm borrowing from Google. It's an 'atom' of knowledge in our site.

If you want to include a knol in your template you should :

* Create a knol in the `knol` directory at the root of the site. It's just Markdown, but please be sure to include the YAML data at the top. The minimum required is date, author and description.
* Using a `.json` file in the `./src` directory, you can construct custom pages. To include a knol, add the filename to the `_contents` array at the root of the object e.g.

```json
    {
      "_template" : "custom.pug",
      "_knols" : ['what_is_studio_zero', 'some_other_file']
    }
```

* You can access the JS object of the knol in your template by accesssing `_knols.[title]` e.g.

```jade
    h2 _knols.what_is_studio_zero.title
    p.description !{_knols.what_is_studio_zero.html}
        span.author _knols.what_is_studio_zero.attributes.author
```
**NB** You need to use the `!{}` syntax to output the actual HTML from the markdown in your content, otherwise it escapes all the characters. This can be useful for code samples.

They will then be made available to templates which can access them by addressing `_knols.knol_title`
