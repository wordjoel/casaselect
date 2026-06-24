import os
import re

pwa_file = 'src/components/PWASimulator.tsx'
with open(pwa_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="space-y-6 select-none"', 'className="space-y-6 select-none simulator-root"')
content = content.replace('className="w-[330px] h-[690px] rounded-[48px] relative flex flex-col overflow-hidden transition-all duration-300"', 'className="w-[330px] h-[690px] rounded-[48px] relative flex flex-col overflow-hidden transition-all duration-300 simulator-body"')

if 'import "../pwa-mobile.css";' not in content:
    content = content.replace('import React from "react";', 'import React from "react";\nimport "../pwa-mobile.css";')

with open(pwa_file, 'w', encoding='utf-8') as f:
    f.write(content)
