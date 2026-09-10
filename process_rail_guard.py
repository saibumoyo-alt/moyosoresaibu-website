"""Regression guard for responsive process-rail layouts."""
from pathlib import Path
from bs4 import BeautifulSoup

errors=[]
for path in Path('.').rglob('*.html'):
    soup=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
    for rail in soup.select('.process-rail'):
        direct=[node for node in rail.find_all(recursive=False) if getattr(node,'name',None)]
        if len(direct)==4 and 'four-up' not in (rail.get('class') or []):
            errors.append(f'{path}: 4-item .process-rail missing four-up class')

if errors:
    print('FAIL')
    for error in errors:
        print('-',error)
    raise SystemExit(1)

print('PASS: process-rail layouts')
