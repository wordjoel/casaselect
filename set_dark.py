import os

pwa_file = 'src/components/PWASimulator.tsx'
with open(pwa_file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('const [isDark, setIsDark] = useState(false);', 'const [isDark, setIsDark] = useState(true);')
content = content.replace('className="space-y-6 select-none simulator-root"', 'className="space-y-6 select-none simulator-root dark"')

with open(pwa_file, 'w', encoding='utf-8') as f:
    f.write(content)
