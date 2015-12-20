var cheerio = require('cheerio');
var fs = require('fs');

// Noto Serif
// DejaVu Serif
// Linux Libertine
// Linux Biolinum
var typeface = 'Noto Serif';

function filter(p, txt)
{
	return p.unescape_html(txt).replace(/&lt;/g, '<')
	                           .replace(/&gt;/g, '>')
	                           .replace(/&mdash;/g, '---')
	                           .replace(/&ndash;/g, '-')
							   .replace(/\\/g, '{\\textbackslash}')
							   .replace(/"/g, '\'\'')
                               .replace(/&/g, '{\\and}')
                               .replace(/%/g, '\\%')
                               .replace(/\$/g, '\\$')
                               .replace(/#/g, '\\#')
                               .replace(/_/g, '\\_')
                               .replace(/\{/g, '\\{')
                               .replace(/\}/g, '\\}')
							   .replace(/~/g, '{\\textasciitilde}')
							   .replace(/\^/g, '{\\textasciicircum}')
                               .replace(/…/g, '{\\ldots}')
                               .replace(/\.\.\./g, '{\\ldots}');
}

function tolatex(p, $, e, brk)
{
	var latex = '';
	
	e.contents().each(function(i, el)
	{
		var elem = $(el);
		
		// console.log(id + el.type);
		
		if(el.type === 'text')
			latex += filter(p, el.data);
		else if(el.type === 'tag')
		{
			if(el.name === 'center')
			{
				var sl = tolatex(p, $, elem);
				
				if(sl === '⁂')
					latex += '\\asterism\n';
				else
					latex += '\\begin{center}' + sl + '\\end{center}';
			}
			else if(el.name === 'em')
				latex += '\\textit{' + tolatex(p, $, elem) + '}';
			else if(el.name === 'strong')
				latex += '\\textbf{' + tolatex(p, $, elem) + '}';
			else if(el.name === 'pre' || el.name === 'code')
				latex += '\\texttt{' + tolatex(p, $, elem) + '}';
			else if(el.name === 'a')
				latex += '\\href{' + el.attribs['href'] + '}{' + filter(p, el.children[0]['data']) + '}';
			else if(el.name === 'p')
			{
				var t = tolatex(p, $, elem);
				
				latex += t + (t.indexOf('\\star') > -1 ? '' : '\n');
			}
			else if(el.name === 'span')
				latex += tolatex(p, $, elem);
			else if(el.name === 'br')
				latex += '\n';
			else
			{
				console.log('LaTeX: Unhandled tag: ' + el.name);
				latex += tolatex(p, $, elem);
			}
		}
	});
	
	return latex;
}

function apply(params, next)
{
    var spec = params.spec;
    var oname = spec.title + '.tex';
    var latex = [
		'\\documentclass[a4paper,10pt]{article}',
		'',
		'\\usepackage{fontspec,xunicode}',
		'\\usepackage{hyperref}',
		'\\usepackage{ifxetex}',
		'\\usepackage{tocloft}',
		'\\usepackage{stackengine}',
		'',
		'\\hypersetup{pdfborder = {0 0 0}}',
		'',
		'\\ifxetex',
		'  \\usepackage{fontspec}',
		'  \\defaultfontfeatures{Ligatures=TeX}',
		'  \\setromanfont{' + typeface + '}',
		'\\else',
		'  \\usepackage[T1]{fontenc}',
		'  \\usepackage[utf8]{inputenc}',	
		'\\fi',
		'',
		'\\def\\asterism{\\par\\vspace{1em}{\\centering\\scalebox{0.75}{%',
		'  \\stackon[-0.5pt]{\\bfseries*~*}{\\bfseries*}}\\par}\\vspace{.5em}\\par}',
		'',
		'\\setlength{\\parskip}{\\baselineskip}',
		'\\setlength{\\parindent}{0pt}',
		'\\linespread{1.2}',
		'\\raggedright',
		'',
		'\\renewcommand{\\cftsecfont}{}',
		'\\renewcommand{\\cftsecpagefont}{}',
		'\\renewcommand{\\cftsecpresnum}{\\begin{lrbox}{\\@tempboxa}}',
		'\\renewcommand{\\cftsecaftersnum}{\\end{lrbox}}',
		'\\renewcommand{\\cftsecleader}{\\cftdotfill{\\cftdotsep}}',
		'\\renewcommand{\\contentsname}{Table of contents\\linebreak}',
		'\\setcounter{secnumdepth}{-2}',
		'',
		'\\begin{document}',
		'',
		'\\title{' + spec.title + '}',
		'\\author{' + spec.creator + '}',
		'\\date{}',
		'',
		'\\maketitle',
		'\\pagestyle{empty}',
		'\\thispagestyle{empty}',
		'',
		'\\vfill',
		'',
		'\\begin{center}Set in ' + typeface + '\\end{center}',
		'\\clearpage',
		'\\tableofcontents',
		'\\clearpage',
		'\\pagestyle{plain}',
		'\\pagenumbering{arabic}',
		''
	].join('\n');

    console.log('Building ' + oname);

    for(var i = 0; i < spec.contents.length; i++)
    {
        var chap = spec.contents[i];

        latex += '\\clearpage\n\\section{' + chap.title + '}\n';
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
