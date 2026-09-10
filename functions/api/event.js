const ALLOWED_ORIGINS=new Set([
  'https://moyosoresaibu.com',
  'https://www.moyosoresaibu.com'
]);
const ALLOWED_EVENTS=new Set(['page_view','cta_click','form_submit']);

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
  });
}

export function onRequestGet({env}){
  return json({ok:true,configured:Boolean(env.CRO_ANALYTICS),provider:'Cloudflare Analytics Engine'});
}

export async function onRequestPost(context){
  const {request,env}=context;
  if(request.headers.get('dnt')==='1') return new Response(null,{status:204,headers:{'cache-control':'no-store'}});

  const origin=request.headers.get('origin');
  if(!origin||!ALLOWED_ORIGINS.has(origin)) return new Response(null,{status:403,headers:{'cache-control':'no-store'}});

  const contentType=(request.headers.get('content-type')||'').toLowerCase();
  if(!contentType.startsWith('application/json')) return new Response(null,{status:415,headers:{'cache-control':'no-store'}});
  const contentLength=Number(request.headers.get('content-length')||'0');
  if(Number.isFinite(contentLength)&&contentLength>4096) return new Response(null,{status:413,headers:{'cache-control':'no-store'}});

  let raw='';
  try{ raw=await request.text(); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }
  if(raw.length>4096) return new Response(null,{status:413,headers:{'cache-control':'no-store'}});
  let data={};
  try{ data=JSON.parse(raw); }catch(e){ return new Response(null,{status:204,headers:{'cache-control':'no-store'}}); }

  const safe=(value,max=120)=>String(value??'').replace(/[\r\n\t]/g,' ').slice(0,max);
  const name=safe(data.name,40);
  if(!ALLOWED_EVENTS.has(name)) return new Response(null,{status:204,headers:{'cache-control':'no-store'}});

  const path=safe(data.path,160).split('?')[0].split('#')[0];
  const href=safe(data.href,120).split('?')[0].split('#')[0];
  const from=safe(data.from,40);
  const intent=safe(data.intent,40);

  if(env.CRO_ANALYTICS){
    env.CRO_ANALYTICS.writeDataPoint({
      indexes:[],
      blobs:[name,path,href,from,intent],
      doubles:[Date.now()]
    });
  }
  return new Response(null,{status:204,headers:{'cache-control':'no-store'}});
}

export function onRequestOptions(){
  return new Response(null,{status:204,headers:{'cache-control':'no-store'}});
}
