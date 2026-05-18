import sys, re, os

# Set stdout to UTF-8
sys.stdout.reconfigure(encoding='utf-8')

path = "apps/patient/src/app/(dashboard)/dashboard/page.tsx"
with open(path, 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8')
arabic = re.findall(r'[\u0600-\u06ff]+', text)
print(f"File size: {len(raw)} bytes")
print(f"Arabic strings found ({len(arabic)} total):")
for a in arabic[:10]:
    print(f"  - {a}")
