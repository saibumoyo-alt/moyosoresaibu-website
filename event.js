export async function onRequestPost(context){
  const {request,env}=context;
  if(request.headers.get('dnt')==='1') return new Response(null,{status:204});
  let d={}; try{d=await request.json()}catch(e){return new Response(null,{status:204})}
  const safe=(v,n=120)=>String(v??'').slice(0,n);
  if(env.CRO_ANALYTICS){env.CRO_ANALYTICS.writeDataPoint({indexes:[],blobs:[safe(d.name,80),safe(d.path,160),safe(d.href,200),safe(d.from,80),safe(d.intent,80)],doubles:[Date.now()]});}
  return new Response(null,{status:204,headers:{'cache-control':'no-store'}});
}
export function onRequest(){return new Response(null,{status:204})}
