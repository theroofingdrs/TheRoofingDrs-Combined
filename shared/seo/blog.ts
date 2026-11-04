// Existing public publishing endpoint. No credentials or private records are used.
export const PUBLIC_BLOG_API = 'https://gubvelngdohrfvqeeabu.supabase.co/functions/v1/crm-public-blog';
type BlogPost = {slug:string;title:string;excerpt:string;seoTitle?:string;seoDescription?:string;publishedAt?:string};
export function residentialBlogMetadata(article: BlogPost) {
  return { title:article.seoTitle || (article.title + ' | The Roof Doctors Blog'), description:article.seoDescription || article.excerpt,
    canonicalPath:'/blog/'+article.slug, ogType:'article' as const,
    schemaJson:{'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description:article.excerpt,datePublished:article.publishedAt || '2026-10-31',dateModified:article.publishedAt || '2026-10-31',mainEntityOfPage:'https://theroofingdrs.com/residential/blog/'+article.slug,author:{'@type':'Organization',name:'The Roof Doctors'},publisher:{'@type':'Organization',name:'The Roof Doctors'}} };
}
const cache = new Map<string,{expires:number; rows:any[]}>();
const pending = new Map<string,Promise<any[]>>();
export async function publishedBlogPost(division:'TRD'|'CRD',slug:string):Promise<{available:boolean;post?:any}> {
  try {
    const cached=cache.get(division);
    let rows=cached && cached.expires>Date.now()?cached.rows:undefined;
    if(!rows){
      let request=pending.get(division);
      if(!request){request=(async()=>{const response=await fetch(PUBLIC_BLOG_API+'?division='+division,{signal:AbortSignal.timeout(3000)});if(!response.ok)throw Error('Public feed unavailable');const data=await response.json();if(!Array.isArray(data))throw Error('Invalid public feed');cache.set(division,{expires:Date.now()+60000,rows:data});return data;})();pending.set(division,request);}
      try{rows=await request;}finally{pending.delete(division);}
    }
    return{available:true,post:rows.find(row=>row.slug===slug)};
  }catch{return{available:false};}
}
export function publishedResidentialMetadata(row:any) {
  return residentialBlogMetadata({slug:String(row.slug),title:String(row.title),excerpt:String(row.excerpt||''),seoTitle:row.seo_title?String(row.seo_title):undefined,seoDescription:row.seo_description?String(row.seo_description):undefined,publishedAt:String(row.published_at||row.created_at||'')});
}
