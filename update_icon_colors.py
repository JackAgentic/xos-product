import os

replacements = {
    # OverviewView.tsx & ClientHeaderCard.tsx & FactFindCard.tsx & ActivitiesCard.tsx
    # Defaulting them from whatever they are right now back to the new natural palette
    '<DollarSign className="w-5 h-5 text-gray-600" />': '<DollarSign className="w-5 h-5 text-[#2D6A4F]" />',
    '<FileText className="w-5 h-5 text-gray-600" />': '<FileText className="w-5 h-5 text-[#5C5039]" />',
    '<CalendarDays className="w-5 h-5 text-gray-600" />': '<CalendarDays className="w-5 h-5 text-[#4A5D23]" />',
    '<Clock className="w-5 h-5 text-gray-600" />': '<Clock className="w-5 h-5 text-[#517A8A]" />',
    '<Target className="w-5 h-5 text-gray-600" />': '<Target className="w-5 h-5 text-[#8C5E3C]" />',
    
    # Background pills around those header icons (which got changed to bg-gray-100 earlier)
    'bg-gray-100 rounded-sm flex items-center justify-center"><Clock': 'bg-[#517A8A]/10 rounded-sm flex items-center justify-center"><Clock',
    'bg-gray-100 rounded-sm flex items-center justify-center"><Target': 'bg-[#8C5E3C]/10 rounded-sm flex items-center justify-center"><Target',
    
    # Same inside ActivitiesCard.tsx which duplicates some items
    'bg-gray-100 rounded-sm flex items-center justify-center">\n            <Clock className="w-5 h-5 text-gray-600" />': 'bg-[#517A8A]/10 rounded-sm flex items-center justify-center">\n            <Clock className="w-5 h-5 text-[#517A8A]" />',

    # In ClientHeaderCard.tsx AI Summary Sparkles
    'bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">\n                <Sparkles className="w-5 h-5 text-[#0B3D2E]" />': 'bg-[#D4AF37]/10 rounded-sm flex items-center justify-center flex-shrink-0">\n                <Sparkles className="w-5 h-5 text-[#D4AF37]" />',
    '<Sparkles className="w-5 h-5 text-[#0B3D2E]" />': '<Sparkles className="w-5 h-5 text-[#D4AF37]" />',
    'bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-[#0B3D2E]" />': 'bg-[#D4AF37]/10 rounded-sm flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-[#D4AF37]" />',

    # In FactFindCard.tsx Checklist list icon 
    'bg-[#F2E9E4]/50 rounded-sm flex items-center justify-center">\n              <ClipboardList className="w-6 h-6 text-[#0B3D2E]" />': 'bg-[#3B5B50]/10 rounded-sm flex items-center justify-center">\n              <ClipboardList className="w-6 h-6 text-[#3B5B50]" />',

    # In OverviewView.tsx and ActivitiesCard lists (the small ones)
    '<CalendarIcon className="w-4 h-4 text-[#0B3D2E]" />': '<CalendarIcon className="w-4 h-4 text-[#4A5D23]" />',
    '<FileText className="w-4 h-4 text-gray-600" />': '<FileText className="w-4 h-4 text-[#5C5039]" />',
    '<Mail className="w-4 h-4 text-gray-600" />': '<Mail className="w-4 h-4 text-[#6B5E62]" />',
}

files = [
    'src/app/components/OverviewView.tsx',
    'src/app/components/ClientHeaderCard.tsx',
    'src/app/components/FactFindCard.tsx',
    'src/app/components/ActivitiesCard.tsx'
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()

        for old, new in replacements.items():
            content = content.replace(old, new)
            
        with open(filepath, 'w') as f:
            f.write(content)

print("Updated natural icon colors")
