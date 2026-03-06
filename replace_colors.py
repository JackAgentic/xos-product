import os
import re

color_map = {
    '#60899B': '#0B3D2E',
    '#60899b': '#0B3D2E',
    '#2c4a52': '#081C15',
    '#2C4A52': '#081C15',
    '#e8f1f5': '#F2E9E4',
    '#E8F1F5': '#F2E9E4',
    '#b0d4e1': '#D4AF37',
    '#B0D4E1': '#D4AF37',
    '#3d6370': '#2D6A4F',
    '#3D6370': '#2D6A4F',
    '#1d3840': '#040E0A',
    '#1D3840': '#040E0A',
    '#3a5a64': '#1B4332',
    '#3A5A64': '#1B4332',
}

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in color_map.items():
        content = content.replace(old, new)
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            replace_in_file(os.path.join(root, file))

print("Done.")
