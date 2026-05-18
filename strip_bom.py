import os

files = [
  "apps/patient/src/app/(dashboard)/dashboard/page.tsx",
  "apps/patient/src/app/(dashboard)/layout.tsx",
  "apps/patient/src/app/(dashboard)/requests/page.tsx",
  "apps/patient/src/app/(dashboard)/results/page.tsx",
  "apps/patient/src/app/(dashboard)/vitals/page.tsx",
  "apps/patient/src/app/(dashboard)/ai-chat/page.tsx",
  "apps/patient/src/app/(dashboard)/profile/page.tsx",
  "apps/patient/src/app/login/page.tsx",
  "apps/patient/src/components/ai/AiCharacter.tsx",
  "apps/patient/src/lib/supabase/client.ts",
  "apps/admin/src/app/(dashboard)/approvals/page.tsx",
  "apps/admin/src/app/(dashboard)/audit/page.tsx",
  "apps/admin/src/app/(dashboard)/dashboard/page.tsx",
  "apps/admin/src/app/(dashboard)/users/page.tsx",
  "apps/admin/src/app/login/page.tsx",
  "apps/doctor/src/app/login/page.tsx",
  "apps/lab/src/app/login/page.tsx",
  "apps/pharmacy/src/app/login/page.tsx",
]

fixed = 0
clean = 0
for path in files:
    if not os.path.exists(path):
        print(f"SKIP (not found): {path}")
        continue
    with open(path, 'rb') as f:
        raw = f.read()
    if raw[:3] == b'\xef\xbb\xbf':
        # Strip BOM and re-save as clean UTF-8 without BOM
        raw = raw[3:]
        with open(path, 'wb') as f:
            f.write(raw)
        print(f"Fixed BOM: {path}")
        fixed += 1
    else:
        clean += 1

print(f"\nDone. Fixed {fixed} files. {clean} were already clean.")
