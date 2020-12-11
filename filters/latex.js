const cheerio = require('cheerio');
const fs = require('fs');

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

function replace_at(txt, idx, repl)
{
	return txt.substr(0, idx) + repl + txt.substr(idx + repl.length);
}

function newline_allowed(txt, idx)
{
	for(let b = idx - 1; b >= 0; b--)
	{
		if(txt[b] === '\n')
			return false;
		else if(!/(\s|\*|\\)/.test(txt[b]))
			return true;
		else if(txt[b] === '*' && b > 0 && txt[b-1] === '\\' && b > 1 && txt[b-2] === '\\')
			return false;
	}
	
	return true;
}

function filter(p, txt)
{
	return l_esc(p.unescape_html(txt)
			.replace(/—/g, ' -- ')
			.replace(/–/g, '--'))
			.replace(/’/g, '\'')
			.replace(/\\([^%\$#_\{\}&])/gm, '{\\textbackslash}$1')
			.replace(/\\$/g, '{\\textbackslash}')
			.replace(/~/g, '{\\textasciitilde}')
			.replace(/\^/g, '{\\textasciicircum}')
			.replace(/…/g, '{\\ldots}');
}

function get_colspan(cel)
{
	const cs = cel.attr('colspan');
	
	return cs !== undefined ? parseInt(cs, 10) : 1;
}

function table_tolatex(p, $, el)
{
	let l = '';
	let mc = 0;
	let rc = 0;
	let cols = [];
	
	$('tr', el).each((i, e) =>
	{
		const cells = $('td', e);
		const cc = cells.length;
		let cidx = 0;
		
		cells.each((ci, ce) =>
		{
			const cel = $(ce);
			const cs = get_colspan(cel);
			const children = cel.children();
			let align = 'L';
			
			if(children.length > 0 && children[0].type === 'tag' && children[0].name === 'center')
				align = 'C';
			
			cols[cidx] = align;
			cidx += cs;
		});
		
		if(cc > mc)
			mc = cc;
			
		rc++;
	});
	
	l += '\\*\n\\begin{table}[h]\n\\centering\n\\begin{tabulary}{\\textwidth}{@{}' + cols.join('') + '@{}}\n\\toprule\n';
	
	$('tr', el).each((i, e) =>
	{
		let cl = '';
		let cidx = 0;
		let pure_bold = true;
		
		$('td', e).each((ci, ce) =>
		{
			const cel = $(ce);
			const sub = cel.children();
			const colspan = get_colspan(cel);
			const centered = sub.length > 0 && sub[0].type === 'tag' && sub[0].name === 'center';
			const target = $(centered ? sub[0] : ce);
			const sub_t = target.children();
			const bold = sub_t.length > 0 && sub_t[0].type === 'tag' && sub_t[0].name === 'strong';
			const cont = tolatex(p, $, target).trim('\n').trim();
			const is_last = cidx + colspan > mc - 1;
			
			if(cont !== '' && !bold)
				pure_bold = false;
			
			if(colspan === 1)
				cl += '\\pbox[t]{\\textwidth}{' + cont + '}';
			else
				cl += '\\multicolumn{' + colspan + '}{' + (centered ? 'c' : 'l') + (!is_last ? '|' : '') + '}{\\pbox[t]{\\textwidth}{' + cont + '}}';
				
			cidx += colspan;
			
			if(!is_last)
				cl += ' & ';
		});
		
		l += cl + ' \\\\' + (pure_bold && i !== rc - 1 ? ' \\midrule ' : '') + '\n';
	});

	l += '\\bottomrule\n\\end{tabulary}\\end{table}\n';
	
	return l;
}

function tolatex(p, $, e, brk)
{
	let latex = '';
	
	e.contents().each(function(i, el)
	{
		const elem = $(el);
		let l = '';
		
		if(el.type === 'text')
			l += filter(p, el.data);
		else if(el.type === 'tag')
		{
			if(el.name === 'br')
			{
				if(newline_allowed(l, l.length))
					l += '\\\\*\n';
			}
			else if(el.name === 'table')
			{
				l += table_tolatex(p, $, elem);
			}
			else
			{
				// Deal with element types that will (should) have children.
				const inner = tolatex(p, $, elem);
				
				// Drop empty elements.
				if(inner.replace(/\\\\\*/, '').replace(/\s/g, '') === '')
					return;
				
				if(el.name === 'em')
					l += '\\textit{' + inner + '}';
				else if(el.name === 'strong')
					l += '\\textbf{' + inner + '}';
				else if(el.name === 'pre' || el.name === 'code')
					l += '\\monosp{' + inner.replace(/\n{2,}/g, '\\\\[\\baselineskip]').replace(/\n/g, '\\\\*') + '}';
				else if(el.name === 'a')
					l += '\\href{' + l_esc(el.attribs['href']) + '}{' + inner + '}';
				else if(el.name === 'p')
				{
					if(elem.attr('class') !== 'center')
					{
						const align_r = elem.attr('align') === 'right';
						
						if(align_r)
							l+= '\\vspace{1em}\\hspace*{\\fill}\\begin{minipage}{0.75\\textwidth}\\begin{flushright}';
						
						l += newline_allowed(inner, inner.length) ? inner + '\\vspace{1em}\\\\*\n' : inner;
						
						if(align_r)
							l += '\\end{flushright}\\end{minipage}';
					}
					else
					{
						if(inner === '⁂')
							l += '\\asterism\n';
						else
							l += '\\begin{center}' + inner + '\\end{center}';
					}
				}
				else if(el.name === 'blockquote')
					l += '\\begin{displayquote}\n' + inner + '\n\\end{displayquote}';
				else if(el.name === 'span')
					l += inner;
				else if(el.name === 'li')
					l += '\\item ' + inner;
				else if(el.name === 'ul')
					l += '\\begin{itemize}' + inner + '\n\\end{itemize}';
				else if(el.name === 'ol')
					l += '\\begin{enumerate}' + inner + '\n\\end{enumerate}';
				else if(el.name === 'center')
					l += '\\begin{center}' + inner + '\\end{center}';
				else if(el.name === 's' || el.name === 'del' || el.name === 'strike')
					l += '\\sout{' + inner + '}';
				else if(el.name === 'sup')
					l += '\\textsuperscript{' + inner + '}';
				else if(el.name === 'html' || el.name === 'head' || el.name === 'body')
				{
					l += inner;
				}
				else
				{
					console.log('LaTeX: Unhandled tag: ' + el.name);
					l += inner;
				}
			}
		}
		
		latex += l;
	});
	
	return latex;
}

function apply(params, next)
{
	const spec = params.spec;
	const oname = 'output/' + spec.filename + '.tex';
	const title = l_esc(spec.title);
	const creator = l_esc(spec.creator);
	const n_re = /\n/g;
	const d_str = (new Date()).toLocaleDateString('en-GB', 
	{ 
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		timeZoneName: 'short',
		timeZone: 'UTC'
	});
	
	let latex = [
		'\\documentclass[a4paper,10pt]{article}',
		'',
		'\\usepackage{fontspec}',
		'\\usepackage[normalem]{ulem}',
		'\\usepackage{tocloft}',
		'\\usepackage{hyperref}',
		'\\usepackage{csquotes}',
		'\\usepackage{microtype}',
		'\\usepackage{needspace}',
		'\\usepackage{tabulary}',
		'\\usepackage{booktabs}',
		'\\usepackage{pbox}',
		'',
		'\\title{\\textsc{' + title.replace(n_re, '\\\\\n') + '}}',
		'\\author{\\textsc{By ' + creator + '}' + (spec.patreon ? '\\\\ \\small{Donate securely to the author at \\href{' + l_esc(spec.patreon) + '}{Patreon}}' : '') + '}',
		'\\date{}',
		'',
		'\\errorcontextlines4',
		'',
		'\\hypersetup{',
		'  pdftitle = {' + title.replace(n_re, ' - ') + '},',
		'  pdfauthor = {' + creator + '},',
		'  pdfproducer = {Ebook.js (https://github.com/b3iA/ebook.js)},',
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
		'	Extension = .otf,',
		'	Ligatures = TeX,',
		'	BoldFont = LinLibertine-RB,',
		'	ItalicFont = LinLibertine-RI,',
		'	BoldItalicFont = LinLibertine-RBI',
		']{LinLibertine-R}',
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
		'\\def\\asterism{\\par\\begin{center}\\vspace{-1em}\\huge{$\\cdots$}\\end{center}}',
		'',
		'\\newcommand{\\monosp}[1]{\\texttt{{#1}}\\vspace{5mm}}',
		'\\renewcommand{\\cftsecfont}{\\normalfont}',
		'\\renewcommand{\\cftsecpagefont}{\\normalfont}',
		'\\renewcommand{\\cftsecpresnum}{\\begin{lrbox}{\\@tempboxa}}',
		'\\renewcommand{\\cftsecaftersnum}{\\end{lrbox}}',
		'\\renewcommand{\\cftsecleader}{\\cftdotfill{\\cftdotsep}}',
		'\\renewcommand{\\contentsname}{\\textsc{Contents}\\linebreak}',
		'\\renewcommand{\\arraystretch}{1.2}',
		'\\setcounter{secnumdepth}{-2}',
		'',
		'\\begin{document}',
		'\\pagestyle{plain}',
		'',
		'\\addcontentsline{toc}{section}{\\protect{\\textsc{Title}}}',
		'\\sectionmark{Title}',
		'\\maketitle',
		'\\thispagestyle{empty}',
		'\\vfill',
		'\\begin{center}\\textsc{Automatically typeset in\\\\Linux Libertine and Liberation Mono\\\\Using \\href{https://github.com/b3iA/ebook.js}{Ebook.js} on ' + d_str + '}\\end{center}',
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
	
	for(let i = 0; i < spec.contents.length; i++)
	{
		const chap = spec.contents[i];
		const c_title = l_esc(chap.title);
		
		latex += '\n\\clearpage\n\\section{\\textsc{' + c_title + '}}\n';
		
		if(chap.byline)
			latex += '\\vspace{-2em}\\textsc{By ' + l_esc(chap.byline) + '}\\vspace{1em}\\\\*\n';
		
		latex += tolatex(params, chap.dom, chap.dom.root());
	}
	
	latex += '\n\\end{document}'
	
	fs.writeFileSync(oname, latex, 'utf-8');
	next();
}

module.exports =
{
	apply: apply
};
