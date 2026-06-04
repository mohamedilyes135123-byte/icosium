$URL="https://bvhdeqbonkmfxdndwgge.supabase.co"
$KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE"

$APPS = @("doctor", "patient", "lab", "pharmacy", "admin")

foreach ($app in $APPS) {
    Write-Host "Deploying $app with environment variables..."
    Set-Location "c:\Users\SCALLETOS\Desktop\icosiulm\apps\$app"
    vercel --prod --yes -e NEXT_PUBLIC_SUPABASE_URL=$URL -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$KEY -b NEXT_PUBLIC_SUPABASE_URL=$URL -b NEXT_PUBLIC_SUPABASE_ANON_KEY=$KEY
}
