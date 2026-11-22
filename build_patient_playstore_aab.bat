@echo off
chcp 65001 >nul
echo ==============================================================
echo    🚀 بناء حزمة متجر جوجل بلاي (AAB) لتطبيق عناية للمريض
echo ==============================================================
echo.
echo سيتم الآن بناء ملف Android App Bundle (.aab) المعتمد رسمياً للرفع على Google Play Console.
echo.
cd /d "%~dp0apps\mobile-patient"
call npx -y eas-cli build -p android --profile production

pause
