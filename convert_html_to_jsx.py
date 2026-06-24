import os
import re

components_map = {
    'dashboard_casa_select_premium/code.html': 'src/components/DashboardFinanceiro.tsx',
    'propriedades_casa_select_premium/code.html': 'src/components/PropertyOverview.tsx',
    'financeiro_casa_select_premium/code.html': 'src/components/AnalyticsReports.tsx',
    'calend_rio_casa_select_premium/code.html': 'src/components/CalendarAgenda.tsx',
    'login_casa_select_premium/code.html': 'src/components/DocumentsSettings.tsx'
}

def html_to_jsx(html):
    jsx = html
    jsx = jsx.replace('class=', 'className=')
    jsx = jsx.replace('for=', 'htmlFor=')
    jsx = jsx.replace('viewbox', 'viewBox')
    jsx = jsx.replace('stroke-width', 'strokeWidth')
    jsx = jsx.replace('preserveaspectratio', 'preserveAspectRatio')
    jsx = jsx.replace('vector-effect', 'vectorEffect')
    jsx = jsx.replace('stroke-linecap', 'strokeLinecap')
    jsx = jsx.replace('stroke-linejoin', 'strokeLinejoin')
    jsx = jsx.replace('fill-rule', 'fillRule')
    jsx = jsx.replace('clip-rule', 'clipRule')
    jsx = jsx.replace('xmlns:xlink', 'xmlnsXlink')
    
    # Fix self closing tags
    jsx = re.sub(r'<(img[^>]*?)(?<!/)>', r'<\1 />', jsx)
    jsx = re.sub(r'<(input[^>]*?)(?<!/)>', r'<\1 />', jsx)
    jsx = re.sub(r'<(hr[^>]*?)(?<!/)>', r'<\1 />', jsx)
    jsx = re.sub(r'<(br[^>]*?)(?<!/)>', r'<\1 />', jsx)
    jsx = re.sub(r'<(path[^>]*?)(?<!/)>', r'<\1 />', jsx)
    jsx = re.sub(r'<(rect[^>]*?)(?<!/)>', r'<\1 />', jsx)
    jsx = re.sub(r'<(circle[^>]*?)(?<!/)>', r'<\1 />', jsx)
    
    # Style object
    # style="width: 50%; height: 100%" -> style={{width: '50%', height: '100%'}}
    def style_repl(match):
        style_str = match.group(1)
        rules = [r.strip() for r in style_str.split(';') if r.strip()]
        react_rules = []
        for r in rules:
            if ':' in r:
                k, v = r.split(':', 1)
                k = k.strip()
                v = v.strip().replace("'", '"')
                # camelCase conversion for CSS keys
                parts = k.split('-')
                k = parts[0] + ''.join(x.title() for x in parts[1:])
                react_rules.append(f"{k}: '{v}'")
        return 'style={{' + ', '.join(react_rules) + '}}'

    jsx = re.sub(r'style="([^"]*)"', style_repl, jsx)
    
    # Remove HTML comments that cause JSX errors
    jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx, flags=re.DOTALL)
    
    return jsx

base_dir = r"C:\Users\wordi\Downloads\stitch_casa_select_ui_refactor\stitch_casa_select_ui_refactor"
dest_dir = r"C:\Users\wordi\Downloads\kobayashi-property-os"

for src_file, dest_file in components_map.items():
    src_path = os.path.join(base_dir, src_file)
    if not os.path.exists(src_path):
        print("Not found:", src_path)
        continue
    
    with open(src_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extract main content
    match = re.search(r'<main[^>]*>(.*?)</main>', html_content, re.DOTALL)
    if match:
        main_content = match.group(0)
    else:
        # Fallback to body
        match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL)
        if match:
            main_content = match.group(1)
        else:
            main_content = html_content
    
    jsx_content = html_to_jsx(main_content)
    
    # Wrap in React component
    component_name = os.path.basename(dest_file).split('.')[0]
    
    react_code = f"""import React from 'react';

const {component_name} = () => {{
  return (
    <div className="w-full h-full overflow-y-auto pb-24 text-on-background animate-in fade-in duration-700 bg-background">
      {{/* Injecting Casa Select Premium Layout */}}
      {jsx_content}
    </div>
  );
}};

export default {component_name};
"""
    
    dest_path = os.path.join(dest_dir, dest_file)
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(react_code)
    print(f"Updated {dest_file}")
