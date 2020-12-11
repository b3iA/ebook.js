# Ebook.js

Is a fast tool for easily defining flexible ebook processing pipelines. Source data from local files or remote sources are collated, filtered, transformed and emitted as EPUB, HTML 5 or LaTeX which can be used to produce publication-quality PDFs.

## Installation

This tool requires Node.JS and its package manager NPM to be installed. For detailed instructions on how to obtain, install and configure Node and NPM on your system, refer to the [official website](https://nodejs.org).

When ready, run the command `npm install` in the root directory of the cloned repository. This will download and install the project dependencies. The tool is now ready for use.

## Usage

    node ebook.js <spec.json> [clean]

If the optional parameter `clean` is specified, all files relating to the chapters of the specified spec are removed from the cache and no other operation is performed.

Note that all input files are expected to be encoded as UTF-8. Similarly, all intermediate and output files are also UTF-8 encoded.

## License

MIT

## Operation

Ebook.js is responsible for applying user-defined serial filter pipelines on chapter content in parallel and concatenating the output of each pipeline into one or more finished ebook(s). If the chapter content comes from a remote source, the source data is cached locally to reduce server load. If multiple chapters use the same remote source, the involved pipelines automatically block until the first download completes and all the requests can be served from the cache. The data-flow can be illustrated as:

<pre style="line-height: 1.1">
┌─────────┐   ┌──────────┐
│  ebook  │   │          │
│  spec.  ├──>│ ebook.js │                                                             ┌──────┐
│ (.json) │   │      ┌───┼─────────────────────────────────────────────────────────┬──>│ HTML │
└─────────┘   └──┬───┼───┘                                                         │   └──────┘
                 │   └─────────────────────────────────────────────────────────┐   │
                 │                                                             │   │   ┌──────┐
 ┌───────────┐   │   ┌─────────────┐    ┌───────────┐          ┌───────────┐   │   ├──>│ EPUB │
 │ chapter 1 ├───┼──>│  chapter 1  │    │ transform │          │ transform │   │   │   └──────┘
 │    src    │   ├──>│ inp. filter ├───>│ filter #1 ├─ · · · ─>│ filter #N ├───┤   │
 └───────────┘   │   └─────────────┘    └───────────┘          └───────────┘   │   │   ┌───────┐
                 │                                                             │   └──>│ LaTeX │
     · · ·       ├── · · · · · · · · · · · · · · · · · · · · · · · · · · · · ──┤       └┬──────┘
                 │                                                             │        │
 ┌───────────┐   │   ┌─────────────┐    ┌───────────┐          ┌───────────┐   │    LuaLaTeX
 │ chapter N ├───┼──>│  chapter N  │    │ transform │          │ transform │   │        │   ┌─────┐
 │    src    │   └──>│ inp. filter ├───>│ filter #1 ├─ · · · ─>│ filter #N ├───┘        └──>│ PDF │ 
 └───────────┘       └─────────────┘    └───────────┘          └───────────┘                └─────┘
</pre>

## Specifications

An ebook specification is a simple JSON file containing meta-data and a list of chapters. They have the following format:

* `title (string)`  
Used as the book title and as the basis for the output filename.
* `creator (string)`  
The name of the author. Embedded into output meta-data and used for by-lines.
* `filters (array of strings OR object of named filter arrays)`  
Names of filters to be appled to each chapter sequentially, or a set of named filter name arrays. When the latter option is used, each chapter must include a "filter" reference. The name of a filter is equivalent to its filename, sans extension. While filters are executed sequentially, chapters are processes in parallel. Each filter chain should begin with an input filter that obtains the material for each chapter and makes it available for further processing by subsequent filters. Source filters  have names beginning with 'from-' by convention. The following filters are included:
    * Source filters:
        * `from-local-html`  
Read the chapter data from a local (X)HTML file, given a filename relative to the root directory.
        * `from-local-markdown`  
Read the chapter data from a local Markdown file, given a filename relative to the root directory.
        * `from-hfy-archive`  
Downloads and caches the chapter contents from a HFY Archive post given a source URL.
        * `from-reddit-post`  
Downloads and caches the chapter contents from a Reddit post given a source URL. Since Reddits JSON API is used - so that post tagged NSFW can be automatically retrieved - URL-shorteners (like http://redd.it) are not supported. To use such resources, first resolve the actual Reddit link by visiting the URL in a browser. Submission continuations in comments are automatically detected and concatenated with the main submission text before further processing.
        * `from-url`  
Downloads and caches the full response from an arbitrary URL. It is the responsibility of the user to insert additional filters in the processing chain that extracts the content, and presents it as a DOM that is useable
with subsequent filters, if desired.
    * Transform filters:
        * `clean-reddit`  
Removes HTML comment elements, CSS classes on any other element and replaces any HTTP/HTTPS link to reddit with its text. Links to other domains are retained.
        * `custom-break-to-hr`  
Different series use a variety of ways to indicate breaks / segments or pauses in the text. This filter harmonizes all known instances of this into `<hr />` elements, which can then be further processed by the typography filter (see below)
        * `finalize`  
Removal of DOM elements by other filters tends to leave surrounding text blocks containing newlines. This can lead to undesirable formatting in output formats where whitespace is not completely ignored (latex). This filter removes such blocks if and only if they're redundant (i.e. more than one such block occurs in a row). It also removes any completely empty paragraphs.
        * `no-preamble`  
Removes any post content preceding the first horizontal rule, if the total length of the content does not exceed 2500 characters. The threshold value has been determined empirically and works for most of the content in the test corpus. The default maximum preable length can be changed with the parameter `no-preamble-threshold`, which can be specified for either the spec, one or more chapters, or both. If both are specified, the chapter parameter takes precedence (see the spec for 'Blessed Are The Simple' for an example).
        * `print-dom`  
Makes no changes, but displays a visual representation of the DOM at the point in the filtering chain in which it's inserted. Very handy for tracking down when and why undesirable DOM transformations are performed.
        * `typography`  
Replaces opening and closing quotes and apostrophes with right / left versions, replaces '...' with proper ellipsises, removes redundant, leading or trailing horizontal rules and replaces the ones remaining with asterisms. Note that unicode characters are used rather than HTML entities, since practically all EPUB readers have problems rendering these correctly. Conversely, not using entites can be correctly handled by all modern browsers.
    * Ebook-specific filters (see the 'Examples' section below for a full list)
* `filename (string)`  
Specifies the base name for emitted output files. Omits extension, since that is appended by each output plugin (see below) as appropriate.
* `output (string or array of strings)`  
Used to specify one or more integrations filters that build output files based on the filtered chapter contents. If only a single type of output is desired, a single filter can be specified, i.e. "epub". Multiple output files can be generated by specifying a filter chain, i.e. `["epub", "html"]`. Output filters are processed in order, just like per-chapter filter chains. The following output filters are included:
    * `epub`  
Emits an EPUB file in the root directory with the name `[title]`.epub
    * `latex`  
Emits a LuaLaTex file with the name `[title]`.tex. If a Patreon link is included in the cover XHTML file, it is automatically extracted and added to the cover page and thus also included in generated PDFs.
    * `html`  
Emits a HTML file in the root directory with the name `[title]`.html. The generated file has no external dependencies and can be uploaded or viewed as-is.
    * `css (string)`  
Additional CSS that will be appended to the CSS template ('templates/style.css') before it is included in any generated HTML or EPUB files.
    * `content (array of objects)`  
Each element of the array is an object describing a chapter. Each of these instances contains the following fields:
        * `title (string)`  
The chapter title. Used to generate headings and when building TOCs.
        * `byline (string, optional)`  
If specified, this will add an author byline to this chapter. This can be used to support collected content by various authors with full per-chapter attribution.
        * `src (string)`  
The source location of the material for the given chapter. This can be any value appropriate to the chosen input filter (see above).
        * `filter (string, optional)`  
If a set of filter chains have been specified, this reference to a chain by name is mandatory. This feature can be used to support multi-source or variably filtered content.  

It is possible to add aditional user-defined parameters to each chapter, which can be used to influence the operation of filters in the relevant processing chain. This has many potential uses, notably to sub-select chapter content in situations where content for multiple chapters originates from the same source URL. For an example of this, see the spec and content filter implementation for The Salvation War.
	      
## Examples

The included test corpus comprises 32 works, totalling 2140 chapters and 31305 pages (as PDF).

|Work                                       | Has filter |
|-------------------------------------------|:----------:|
|All Sapiens Go To Heaven                   |Yes         |
|Billy-Bob Space Trucker                    |Yes         |
|Blessed Are The Simple                     |Yes         |
|Builders In The Void: Peace / War          |Yes         |
|Chrysalis                                  |Yes         |
|Clint Stone: Freedom / Rebellion / Warpath |Yes         |
|Corridors                                  |Yes         |
|Deathworld Origins                         |Yes         |
|Everybody Loves Large Chests               |Yes         |
|Good Training                              |Yes         |
|Guttersnipe                                |Yes         |
|Henosis                                    |Yes         |
|HFY Anthology                              |Yes         |
|Humans Don't Make Good Pets                |Yes         |
|MIA                                        |Yes         |
|Memories of Creature 88                    |No          |
|Pact                                       |Yes         |
|Perspective                                |Yes         |
|QED                                        |Yes         |
|Salvage                                    |Yes         |
|Savage Divinity                            |Yes         |
|Stone Burners                              |Yes         |
|The Deathworlders                          |Yes         |
|The Fourth Wave                            |Yes         |
|The Good Student                           |No          |
|The Lost Minstrel                          |Yes         |
|The Salvation War: Armageddon / Pantheocide|Yes         |
|The Xiu Chang Saga                         |Yes         |
|Worm                                       |Yes         |

## Authoring filters

Each filter is implemented as a Node.JS module, and placed in the `filters` directory. Each filter module must export exactly one function:

`function apply(params, next)`  

* `params (object)`  
Represents the current task to be performed by the filter. Has the following members:
    * `spec (object)`  
Represents the loaded specification file and contains members as described above.
    * `chap (object)`  
A reference to the spec.contents elements this filter is to process (if used as a chapter filter), or null (if used as an output filter).
    * `dom (object)`  
A Cheerio DOM object. For more information on how to work with
Cheerio, refer to [the documentation](https://github.com/cheeriojs/cheerio).
    * `is_cleaning (bool)`  
If this flag is set to true, the filter *must* initialize `param.chap.id` and call `params.clean()` with `param.chap.id` as an argument, then immediately return without fetching the source data.
* `next (function())`  
A function that must be called by the filter when it completes and any modifications to "params.chap.dom" have been completed.

Thus, a minimal valid filter implementation (that does nothing) is:

```javascript
function apply(params, next)
{
    params.chap.id = 'A valid globally unique filename for this chapter, sans extension';
    
    if(params.is_cleaning)
    {
    	params.clean(params.chap.id);
    	return;
    }
    
    // Perform any required operations on 'params.dom'
    
    next();
}

module.exports =
{
    apply: apply
};
```

If the filter is written to be used as an input - the first filter in a pipeline - its name should by convention begin with `from-`, and it then has two additional responsibilities:

```javascript
function apply(params, next)
{
    var chap = params.chap;

    // Create a unique (per book) id. This will be used both
    // as an XML/HTML element identifier and as a chapter filename
    // in the case of EPUB output, and is thus subject to the
    // union of the restriction imposed on all of the above. I suggest
    // ensuring that it contains only alphanumerics, dashes and underscores.
    chap.id = sanitize(chap.src);

    if(params.is_cleaning)
    {
    	params.clean(params.chap.id);
    	return;
    }

    // Create the HTML DOM subsequent filters will operate on:
    chap.dom = cheerio.load('');

    next();
}
```

## DOM Structure

Almost all intermediary filters and all output filters expects a constrained DOM layout. It is the responsibility of any source filter (or a specialised intermediary filter) to harmonise any input data to conform to the following convention:

The DOM operated on by filters is a HTML fragment, not a full document. It should consist of nothing but a series of paragraphs, possibly interdispersed by one or more horizontal rules.

Text in each paragraph can be bolded by using nested `<strong>` tags and italisized by using `<em>`. Fixed width blocks can be included by using either `<pre>` or `<code>`. Ordered and unordered lists are supported via `<ol>` and `<ul>` respectively, linebreaks can be introduced with `<br>` but are strongly discouraged. Empty lines are NOT supported. Struck out text can use either `<s>`, `<del>` or `<strike>` and text can be centered with the `<center>` tag. Basic tables are supported via the `<table>` tag. Nested tables are supported as is colspan, although rowspan is not.

The only tag permitted outside an enclosing root-level paragraph are horizontal rules which will be converted to a section break appropriate for each type of output file. Paragraphs should never be nested.

All styling information, scripts, comments and meta-data should be stripped. Unsupported tags should be converted to the closest supported tag or discarded.

In the following example of a valid intermediary DOM, nested tags have been indented for clarity, but inserting unnessary linebreaks or whitespace textnodes into a DOM object is generally discouraged.

```HTML
<root>
    <p>The first paragraph of the text.</p>
    <p>This paragraph will be followed by additional spacing and an asterism:</p>
    <hr/>
    <table>
        <tr>
            <td><strong>Feature</strong></td>
            <td><strong>Supported</strong></td>
        </tr>
        <tr>
            <td>Headers</td>
            <td>If all elements in a row are bold, the row is made a header</td>
        </tr>
        <tr>
        	<td colspan="2">Partition</td>
        </tr>
    </table>
    <p>
        <pre>
            DISCLAIMER: This is not a exhaustive example.
        </pre>
        You're free to use <strong>bold</strong> or <em>italic</em> text. On the
        other hand, you <strike>can</strike> cannot use:
        <ul>
            <li>Headings</li>
            <li>Font tags or any other styling markup or attributes</li>
            <li>HTML entities and character references. Both should be converted to their
                utf-8 encoded equivalents.
            </li>
        </ul>
        While this may seem restrictive, it has proved sufficient to faithfully represent
        the current test corpus, while keeping all filters interoperable and the implementational
        complexity relatively low. It also helps to ensure that the same material is as visually
        equivalent across all supported output formats as possible.
    </p>
</root>
```

## Creating PDF files

Creating PDF files from the emitted .tex source requires you to have a working TexLive installation. For information on how to obtain, install and configure TexLive on your system, refer to the [official website](https://www.tug.org/texlive/).

Additionally, the following tex packages are required. You may have to install these separately, depending on your chosen version of TexLive. Installing TexLive's 'latex-extra' package is recommended:

* [fontspec](https://ctan.org/pkg/fontspec)
* [tocloft](https://ctan.org/pkg/tocloft)
* [hyperref](https://ctan.org/pkg/hyperref)
* [csquotes](https://ctan.org/pkg/csquotes)
* [microtype](https://ctan.org/pkg/microtype)
* [needspace](https://ctan.org/pkg/needspace)
* [tabulary](https://ctan.org/pkg/tabulary)
* [booktabs](https://ctan.org/pkg/booktabs)
* [pbox](https://ctan.org/pkg/pbox)

To build a PDF, perform the following steps:

1. If the PDF has been built before, delete the relevant .aux, .log, .out and .toc files.
2. Run `lualatex` on the relevant .tex file *twice*. A second pass is required to guarantee correct page numbers and links in the ToC after adjustments made in the first pass.
3. Optionally use `qpdf` to optimize the resulting PDF file.

As an example, a rudimentary Bash script to automate the procedure might look like:

```bash
#!/bin/sh
if [ -f "$1.aux" ]; then rm "$1.aux"; fi
if [ -f "$1.log" ]; then rm "$1.log"; fi
if [ -f "$1.out" ]; then rm "$1.out"; fi
if [ -f "$1.toc" ]; then rm "$1.toc"; fi
lualatex "$1.tex"
lualatex "$1.tex"
qpdf --linearize --stream-data=compress "$1.pdf" "$1.opt"
mv "$1.opt" "$1.pdf"
```