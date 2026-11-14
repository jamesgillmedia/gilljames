#!/usr/bin/env python3
"""Inlines _src/debug.css and _src/debug.js into opener/ and objects/ index.html between the DBG markers."""
import re, os
here = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(here, 'debug.css')).read().rstrip('\n')
js = open(os.path.join(here, 'debug.js')).read().rstrip('\n')
for name in ('objects', 'opener', 'sound'):
    p = os.path.join(here, '..', name, 'index.html')
    if not os.path.exists(p):
        continue
    s = open(p).read()
    s = re.sub(r'/\*DBG:CSS:BEGIN\*/.*?/\*DBG:CSS:END\*/', lambda m: '/*DBG:CSS:BEGIN*/\n' + css + '\n/*DBG:CSS:END*/', s, flags=re.S)
    s = re.sub(r'/\*DBG:JS:BEGIN\*/.*?/\*DBG:JS:END\*/', lambda m: '/*DBG:JS:BEGIN*/\n' + js + '\n/*DBG:JS:END*/', s, flags=re.S)
    open(p, 'w').write(s)
    print('built', name)
