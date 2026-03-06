import glob
import re

files = glob.glob('src/app/components/*Modal*.tsx')

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Step 1: Change the footer div to align right
    content = re.sub(
        r'(<div className="sticky bottom-0[^"]*?flex(?: items-center)? gap-[2-4][^"]*)"\s*>',
        lambda m: m.group(1).replace('flex-1', '') + ' justify-end">\n' if 'justify-end' not in m.group(1) else m.group(1) + '">\n',
        content
    )

    # Alternatively, find sticky bottom-0 container and inject justify-end
    content = content.replace('className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 flex gap-3"', 'className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-end gap-3"')
    content = content.replace('className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3"', 'className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end gap-3"')
    
    # Also replace any padding differences
    content = content.replace('flex gap-4 justify-end', 'flex justify-end gap-3')

    # Step 2: Remove flex-1 from buttons that had it
    content = content.replace('className="flex-1 ', 'className="')

    # Step 3: Change button padding and add text-sm font-medium
    # Cancel buttons
    content = content.replace(
        'px-4 py-2 border border-gray-200', 
        'px-4 py-1.5 text-sm font-medium border border-gray-200'
    )
    # Primary buttons (Add Client, etc.)
    # Example: px-4 py-2 bg-[#0B3D2E] text-white rounded-sm hover:bg-[#2D6A4F]
    content = content.replace(
        'px-4 py-2 bg-[#0B3D2E]', 
        'px-4 py-1.5 text-sm font-medium bg-[#0B3D2E]'
    )
    content = re.sub(
        r'px-4 py-2 bg-(?:teal-\d+|\[#0B3D2E\]|\[#D4AF37\])',
        lambda m: 'px-4 py-1.5 text-sm font-medium ' + m.group(0).split(' ', 2)[2],
        content
    )
    
    # Catch any remaining px-4 py-2
    content = content.replace('px-4 py-2 bg-gray-100', 'px-4 py-1.5 text-sm font-medium bg-gray-100')

    # For any cases where fonts were bold, change to medium
    content = content.replace('text-base font-bold', 'text-sm font-medium')
    content = content.replace('font-bold', 'font-medium')
    content = content.replace('text-lg font-semibold', 'text-base font-semibold')
    content = content.replace('text-xl font-semibold', 'text-lg font-medium')

    with open(filepath, 'w') as f:
        f.write(content)

print("Updated modal buttons")
