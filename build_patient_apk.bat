@echo off
chcp 65001 >nul
echo ==============================================================
echo       📱 بناء تطبيق عناية للمريض (APK) عبر Expo EAS
echo ==============================================================
echo.
cd /d "%~dp0apps\mobile-patient"
echo 1. التحقق من تسجيل الدخول إلى Expo...
call npx -y eas-cli whoami
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ يرجى تسجيل الدخول إلى حسابك في Expo (التسجيل مجاني على https://expo.dev/signup)
    echo.
    call npx -y eas-cli login
)

echo.
echo 🚀 جاري بدء بناء ملف الـ APK السحابي...
call npx -y eas-cli build -p android --profile preview

pause
