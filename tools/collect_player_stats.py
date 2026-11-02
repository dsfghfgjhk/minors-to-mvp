"""Collect public aggregate counts for the status page; never publish individual rows."""
import concurrent.futures, datetime, json, os, urllib.request, urllib.error
BASE='https://xdoumdgrsbnmktpcvgxd.supabase.co/rest/v1/'
KEY='sb_publishable_QCL89LDJdRqOf6FOYoRvtw_62zXa0yL'
RETIRED='&id=not.like.j-*'
now=datetime.datetime.now(datetime.timezone.utc)
day=(now+datetime.timedelta(hours=9)).date()
days=[str(day-datetime.timedelta(days=i)) for i in range(13,-1,-1)]
def request(path,count=False):
    req=urllib.request.Request(BASE+path,headers={'apikey':KEY,**({'Prefer':'count=exact'} if count else {})},method='HEAD' if count else 'GET')
    try:
        with urllib.request.urlopen(req,timeout=15) as r:
            if count:return int(r.headers['content-range'].split('/')[-1])
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(str(e.code)+' '+e.read().decode('utf-8','replace')[:1000]) from e
def rows(path):
    out=[];off=0
    while True:
        batch=request(path+'&order=ts.asc,id.asc&limit=1000&offset='+str(off));out+=batch
        if len(batch)<1000:return out
        off+=len(batch)
def collect():
    jobs={'sAll':lambda:request('starts?select=id&limit=1',True),'cAll':lambda:request('careers?select=id&limit=1'+RETIRED,True),
          'starts':lambda:rows('starts?select=day,ts,pos&day=gte.'+days[0]),'careers':lambda:rows('careers?select=day&day=gte.'+days[0]+RETIRED)}
    data={'v':1,'day':str(day),'days':days,'at':int(now.timestamp()*1000),'errors':[]}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures={pool.submit(fn):k for k,fn in jobs.items()}
        for f in concurrent.futures.as_completed(futures):
            k=futures[f]
            try:data[k]=f.result()
            except Exception as e:
                data[k]=None;data['errors'].append(k+': '+str(e));print(k,type(e).__name__,str(e))
    starts=data.pop('starts');careers=data.pop('careers')
    data['sDay']=[sum(r['day']==d for r in starts) for d in days] if starts is not None else None
    data['cDay']=[sum(r['day']==d for r in careers) for d in days] if careers is not None else None
    data['hours']=[sum(datetime.datetime.fromtimestamp(r['ts']/1000,datetime.timezone.utc).hour==(i-9)%24 and r['day']==str(day) for r in starts) for i in range(24)] if starts is not None else None
    data['positions']={};data['recent']=None
    if starts is not None:
        data['recent']=sum(r['ts']>=data['at']-3600000 for r in starts)
        for r in starts:
            if r['day']==str(day):data['positions'][r['pos']]=data['positions'].get(r['pos'],0)+1
    else:data['positions']=None
    return data
if __name__=='__main__':
    data=collect();os.makedirs('out/data/stats',exist_ok=True)
    json.dump(data,open('out/data/stats/latest.json','w'),ensure_ascii=False)
    print('snapshot',data['day'],'errors',len(data['errors']))
