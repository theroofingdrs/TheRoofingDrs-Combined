export type Metadata = { title: string; description: string; canonicalPath: string; schemaJson?: unknown; ogType?: string; noIndex?: boolean };
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function applyResidentialMetadata(html: string, metadata: Metadata, homepage = false): string {
  const canonical = 'https://theroofingdrs.com/residential' + (metadata.canonicalPath === '/' ? '/' : metadata.canonicalPath);
  const title = metadata.title.includes('The Roof Doctors') ? metadata.title : metadata.title + ' | The Roof Doctors';
  const put = (matcher: RegExp, tag: string) => { html = html.replace(matcher, ''); html = html.replace(/<\/head>/i, () => tag + '\n</head>'); };
  if (!homepage) {
    put(/<title\b[^>]*>[\s\S]*?<\/title>/gi, `<title>${escape(title)}</title>`);
    put(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/gi, `<meta name="description" content="${escape(metadata.description)}" />`);
    put(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, `<link rel="canonical" href="${escape(canonical)}" />`);
    for (const [property, value] of Object.entries({'og:title':title,'og:description':metadata.description,'og:url':canonical,'og:type':metadata.ogType || 'website'})) put(new RegExp(`<meta\\b(?=[^>]*\\bproperty=["']${property}["'])[^>]*>`, 'gi'), `<meta property="${property}" content="${escape(value)}" />`);
    for (const [name, value] of Object.entries({'twitter:title':title,'twitter:description':metadata.description})) put(new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, 'gi'), `<meta name="${name}" content="${escape(value)}" />`);
  }
  if (metadata.schemaJson) put(/<script\b(?=[^>]*\bid=["']route-schema-jsonld["'])[^>]*>[\s\S]*?<\/script>/gi, `<script id="route-schema-jsonld" type="application/ld+json">${JSON.stringify(metadata.schemaJson).replace(/</g,'\\u003c')}</script>`);
  return html;
}
