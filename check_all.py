import sys, re, os
sys.stdout.reconfigure(encoding='utf-8')

files = [
  'apps/patient/src/app/(dashboard)/dashboard/page.tsx',
  'apps/patient/src/app/(dashboard)/layout.tsx',
  'apps/patient/src/app/(dashboard)/requests/page.tsx',
  'apps/patient/src/app/(dashboard)/results/page.tsx',
  'apps/patient/src/app/(dashboard)/vitals/page.tsx',
  'apps/patient/src/app/(dashboard)/profile/page.tsx',
  'apps/patient/src/app/login/page.tsx',
]

for path in files:
    try:
        with open(path, 'rb') as f:
            content = f.read().decode('utf-8')
        arabic = re.findall(r'[\u0600-\u06ff]+', content)
        has_mojibake = bool(re.search(r'[ØÙ§╪]', content))
        status = 'MOJIBAKE!' if has_mojibake else 'OK'
        print(f'[{status}] {os.path.basename(path)}: {len(content)} chars, {len(arabic)} arabic strings')
    except Exception as e:
        print(f'[ERROR] {path}: {e}')
