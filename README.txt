Installation
------------

Run 'npm install' to install the dependencies, and you're good to go.


Usage
-----

reddit2epub.js <spec.json>


Notes
-----

PLEASE DO NOT DISTRIBUTE THE RESULTING EPUB FILES UNLESS YOU ARE THE AUTHOR OF OR OWNS
THE RIGHTS TO ALL THE MATERIAL THEY CONTAIN.

Ebook specifications should be placed in the 'specs' directory and cover-related files
in 'specs/covers'. Each specification is a simple JSON file that contains the book
title (also used as the output filename), content creator, a list of content
transformation filters which are applied sequentially, cover files (if any) and
book contents. The contents are a list of objects, with each entry specifying the
title and Reddit URL of a chapter. Chapters will be emitted in the order they're
specified.

This has only been tested on Linux, but should work equally well on OSX. If you want
to run this on Windows, well... Good luck.
