$SUPABASE_URL = "https://bvhdeqbonkmfxdndwgge.supabase.co"
$SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTkzNjAxOCwiZXhwIjoyMDkxNTEyMDE4fQ.rTXsRKvZwcYMYDjynbg88DBQZguXXePiQRZvbqyGXjQ"

$headers = @{
    "apikey"        = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type"  = "application/json"
}

$users = @(
    @{ email="patient@test.com";  password="123456"; role="patient";  full_name="Ahmed Patient";   address="Alger Centre" }
    @{ email="doctor@test.com";   password="123456"; role="doctor";   full_name="Dr. Youcef Benali"; address="Bab El Oued"; specialty="Medecine Generale" }
    @{ email="labo@test.com";      password="123456"; role="lab";      full_name="Labo El Nour";     address="Zeralda" }
    @{ email="pharmacie@test.com"; password="123456"; role="pharmacy"; full_name="Pharmacie Chifa";  address="Hussein Dey" }
    @{ email="admin@test.com";    password="123456"; role="admin";    full_name="Admin Systeme";    address="Alger" }
)

foreach ($u in $users) {
    Write-Host ""
    Write-Host ">> Creating: $($u.email)" -ForegroundColor Cyan

    $meta = @{ role=$u.role; full_name=$u.full_name }
    $body = @{
        email         = $u.email
        password      = $u.password
        email_confirm = $true
        user_metadata = $meta
    } | ConvertTo-Json -Depth 5

    try {
        $res = Invoke-RestMethod `
            -Uri "$SUPABASE_URL/auth/v1/admin/users" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop

        $uid = $res.id
        Write-Host "   OK - ID: $uid" -ForegroundColor Green

        Start-Sleep -Milliseconds 800

        $profileData = @{
            full_name       = $u.full_name
            address         = $u.address
            approval_status = "approved"
            verified        = $true
        }
        if ($u.specialty) { $profileData["specialty"] = $u.specialty }

        $patchHeaders = $headers.Clone()
        $patchHeaders["Prefer"] = "return=minimal"

        Invoke-RestMethod `
            -Uri "$SUPABASE_URL/rest/v1/profiles?id=eq.$uid" `
            -Method PATCH `
            -Headers $patchHeaders `
            -Body ($profileData | ConvertTo-Json -Depth 3) | Out-Null

        Write-Host "   Profile updated OK" -ForegroundColor Green

    } catch {
        $msg = $_.ErrorDetails.Message
        if ($msg -match "already been registered" -or $msg -match "already exists") {
            Write-Host "   SKIP - already exists" -ForegroundColor Yellow
        } else {
            Write-Host "   ERROR: $msg" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  TEST ACCOUNTS:"
Write-Host "  patient@test.com  / 123456"
Write-Host "  doctor@test.com   / 123456"
Write-Host "  labo@test.com      / 123456"
Write-Host "  pharmacie@test.com / 123456"
Write-Host "  admin@test.com    / 123456"
Write-Host "========================================" -ForegroundColor Magenta
