Installation
------------

Run 'npm install' to install the dependencies, and you're good to go.


Usage
-----

ebook.js <spec.json>


Notes
-----

PLEASE DO NOT DISTRIBUTE THE RESULTING EPUB FILES UNLESS YOU ARE THE AUTHOR OF OR OWNS
THE RIGHTS TO ALL THE MATERIAL THEY CONTAIN.

Ebook specifications should be placed in the 'specs' directory and cover-related files
in 'specs/covers'. Each specification is a simple JSON file that contains the book
title (also used as the output filename), content creator, a list of content
transformation filters which are applied sequentially, cover files (if any) and
book contents. The contents are a list of objects, with each entry specifying the
title and URI of the data comprising a chapter. The exact nature of the URI depends
on the chosen input filter. The names of available input filters start by 'from-' by
convention and are typically specified as the first element in each filter chain.

The following input filters are included:

* from-reddit-post: The source is a valid HTTP or HTTPS Reddit post URL.
* from-local-markdown: The source is a filename relative to the location of ebook.js
* from-local-html: The source is a filename relative to the location of ebook.js

As well as the following output filters:

* epub: The output will be written to an epub file in the same location as ebook.js
        with the name derived from the specified book title.

* html: The output will be written to a merged self-contained HTML file in the same
        location as ebook.js with the name derived from the specified book title.
