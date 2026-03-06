import os

replacements = {
    '#4A5D23': '#2D6A4F',  # Meetings/Calendar -> Action Forest Green
    '#6B5E62': '#2563EB',  # Email -> Royal Blue
    '#5C5039': '#4F46E5',  # Documents -> Indigo
    '#8E735B': '#D97706',  # Notes -> Amber
    '#3B5B50': '#0891B2',  # Tasks/Checklists -> Cyan/Ocean
    '#517A8A': '#0284C7',  # Activities/Clock -> Sky Blue
    '#8C5E3C': '#EA580C',  # Opportunities -> Burnt Orange
    '#8E413B': '#DC2626',  # Voice -> Crimson
    '#D4AF37': '#9333EA',  # AI Assistant -> Amethyst
}

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()

                new_content = content
                
                # Special case for DollarSign so it doesn't conflict exactly with Meetings if they both became #2D6A4F
                # We can leave DollarSign as #2D6A4F as it's the primary brand green, it's fine if they match.
                
                for old, new in replacements.items():
                    new_content = new_content.replace(old, new)
                    new_content = new_content.replace(old.lower(), new)
                    
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)

process_directory('src/app/components')
print('Updated to distinct colors.')
