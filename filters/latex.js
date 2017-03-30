var cheerio = require('cheerio');
var fs = require('fs');

function l_esc(txt)
{
	return txt.replace(/%/g, '\\%')
			  .replace(/\$/g, '\\$')
			  .replace(/#/g, '\\#')
			  .replace(/_/g, '\\_')
			  .replace(/\{/g, '\\{')
			  .replace(/\}/g, '\\}')
              .replace(/&/g, '\\&');
}

function filter(p, txt)
{
	return l_esc(p.unescape_html(txt).replace(/—/g, '---')
	                                 .replace(/–/g, '-'))
	                                 .replace(/\\([^%\$#_\{\}&])/gm, '{\\textbackslash}$1')
	                                 .replace(/\\$/g, '{\\textbackslash}')
							         .replace(/~/g, '{\\textasciitilde}')
							         .replace(/\^/g, '{\\textasciicircum}')
                                     .replace(/…/g, '{\\ldots}');
}

function tolatex(p, $, e, brk)
{
	var latex = '';

	e.contents().each(function(i, el)
	{
		var elem = $(el);
        var l = '';
        
		// console.log(id + el.type);

		if(el.type === 'text')
			l += filter(p, el.data);
		else if(el.type === 'tag')
		{
			if(el.name === 'em')
				l += '\\textit{' + tolatex(p, $, elem) + '}';
			else if(el.name === 'strong')
			    l += '\\textbf{' + tolatex(p, $, elem) + '}';
			else if(el.name === 'pre' || el.name === 'code')
				l += '\\monosp{' + tolatex(p, $, elem).replace(/\n/g, '\\\\*') + '}';
			else if(el.name === 'a')
				l += '\\href{' + l_esc(el.attribs['href']) + '}{' + tolatex(p, $, elem) + '}';
			else if(el.name === 'p')
			{
				var t = tolatex(p, $, elem);

				if(elem.attr('class') === 'center')
				{
				    if(t === '⁂')
					    l += '\\asterism\n';
				    else
					    l += '\\begin{center}' + t + '\\end{center}';
				}
				else
				    l += t.replace(/\n\n?/g, '\n') + (t.indexOf('\\star') > -1 ? '' : '\n');
			}
            else if(el.name === 'blockquote')
                l += '\\begin{displayquote}\n' + tolatex(p, $, elem) + '\n\\end{displayquote}';
			else if(el.name === 'span')
				l += tolatex(p, $, elem);
			else if(el.name === 'li')
				l += '\\item ' + tolatex(p, $, elem);
			else if(el.name === 'ul')
				l += '\\begin{itemize}' + tolatex(p, $, elem) + '\n\\end{itemize}';
			else if(el.name === 'ol')
				l += '\\begin{enumerate}' + tolatex(p, $, elem) + '\n\\end{enumerate}';
			else if(el.name === 'br')
				l += '\\\\*\n';
			else if(el.name === 's' || el.name === 'del' || el.name === 'strike')
				l += '\\sout{' + tolatex(p, $, elem) + '}';
			else if(el.name === 'sup')
				l += '\\textsuperscript{' + tolatex(p, $, elem) + '}';
			else
			{
				console.log('LaTeX: Unhandled tag: ' + el.name);
				l += tolatex(p, $, elem);
			}
		}
		
	    latex += el.type !== 'tag' || el.name !== 'p' ? l.replace(/\n\n?/g, '\n') : l;
	});

	return latex;
}

function apply(params, next)
{
    var spec = params.spec;
    var oname = 'output/' + spec.filename + '.tex';
    var title = l_esc(spec.title);
    var creator = l_esc(spec.creator);
    var n_re = /\n/g;
    var d_str = (new Date()).toUTCString();
    var latex = [
		'\\documentclass[a4paper,10pt]{article}',
		'',
		'\\usepackage{fontspec,xunicode}',
		'\\usepackage[normalem]{ulem}',
		'\\usepackage{tocloft}',
		'\\usepackage{hyperref}',
		'\\usepackage{csquotes}',
		'\\usepackage{microtype}',
		'\\usepackage{needspace}',
		'',
		'\\title{' + title.replace(n_re, '\\\\\n') + '}',
		'\\author{By ' + creator + (spec.patreon ? '\\\\ Donate securely to the author at \\href{' + l_esc(spec.patreon) + '}{Patreon}' : '') + '}',
		'\\date{}',
		'',
		'\\hypersetup{',
		'  pdftitle = {' + title.replace(n_re, ' - ') + '},',
		'  pdfauthor = {' + spec.creator + '},',
        '  pdfproducer = {EbookJS},',
        '  colorlinks = true,',
        '  linkcolor = [rgb]{0.09,0.15,0.588},',
        '  urlcolor = [rgb]{0.09,0.15,0.588},',
        '  pdfborder = {0 0 0}',
		'}',
		'',
		'\\setlength{\\parskip}{\\baselineskip}',
		'\\setlength{\\parindent}{0pt}',
		'\\linespread{1.2}',
		'\\raggedright',
		'\\defaultfontfeatures{Ligatures=TeX}',
		'\\setmainfont[',
		'	Path = ../templates/,',
		'	Extension = .ttf,',
		'	Ligatures = TeX,',
		'	BoldFont = LiberationSerif-Bold,',
		'	ItalicFont = LiberationSerif-Italic,',
		'	BoldItalicFont = LiberationSerif-BoldItalic',
		']{LiberationSerif-Regular}',
		'\\setmonofont[',
		'	Path = ../templates/,',
		'	Scale = 0.85,',
		'	Extension = .ttf,',
		'	Ligatures = TeX,',
		'	BoldFont = LiberationMono-Bold,',
		'	ItalicFont = LiberationMono-Italic,',
		'	BoldItalicFont = LiberationMono-BoldItalic',
		']{LiberationMono-Regular}',
		'',
		'\\def\\asterism{\\par\\begin{center}\\scalebox{2}{$\\cdots$}\\end{center}}',
		'',
		'\\newcommand{\\monosp}[1]{\\texttt{{#1}}\\vspace{5mm}}',
		'\\renewcommand{\\cftsecfont}{\\normalfont}',
		'\\renewcommand{\\cftsecpagefont}{\\normalfont}',
		'\\renewcommand{\\cftsecpresnum}{\\begin{lrbox}{\\@tempboxa}}',
		'\\renewcommand{\\cftsecaftersnum}{\\end{lrbox}}',
		'\\renewcommand{\\cftsecleader}{\\cftdotfill{\\cftdotsep}}',
		'\\renewcommand{\\contentsname}{Contents\\linebreak}',
		'\\setcounter{secnumdepth}{-2}',
		'',
		'\\begin{document}',
        '\\pagestyle{plain}',
		'',
        '\\addcontentsline{toc}{section}{\\protect{Title}}',
        '\\sectionmark{Title}',
		'\\maketitle',
		'\\thispagestyle{empty}',
		'\\vfill',
		'\\begin{center}Automatically typeset in\\\\Liberation Serif and Mono\\\\by EbookJS on ' + d_str.substr(5, d_str.length) + '\\end{center}',
		'',
		'\\clearpage',
        '\\pagenumbering{Roman}',
		'\\tableofcontents',
		'',
		'\\clearpage',
        '\\newcounter{storedpage}',
        '\\setcounter{storedpage}{\\value{page}}',
        '\\pagenumbering{arabic}',
        '\\setcounter{page}{\\value{storedpage}}'
	].join('\n');

    console.log('Building ' + oname);

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];
        var title = l_esc(chap.title);

        latex += '\n\\clearpage\n\\section{' + title + '}\n';

        if(chap.byline)
        	latex += '\\vspace{-2em}By ' + l_esc(chap.byline) + '\\vspace{1em}\\\\*\n';

        latex += tolatex(params, chap.dom, chap.dom.root());
    }

    latex += '\\end{document}'

    fs.writeFileSync(oname, latex, 'utf-8');
    next();
}

module.exports =
{
    apply: apply
};
