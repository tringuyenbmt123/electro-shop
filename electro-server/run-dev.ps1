# ============================================================================= 
# RUN ELECTRO SHOP SERVER - DEVELOPMENT MODE
# =============================================================================

Write-Host "🚀 Starting Electro Shop Server..." -ForegroundColor Cyan

# Set JAVA_HOME
$env:JAVA_HOME = "D:\JDK11"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Load environment variables from .env file
Write-Host "📦 Loading environment variables from .env..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^([^=#]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($key -and $value -and -not $key.StartsWith('#')) {
                Set-Item -Path "env:$key" -Value $value
                Write-Host "  ✓ $key" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "⚠️  .env file not found! Using PowerShell environment variables..." -ForegroundColor Red
}

# Run the application
Write-Host ""
Write-Host "🎯 Running application with dev profile..." -ForegroundColor Cyan
java "-Dspring.profiles.active=dev" -jar target\electro-0.0.1-SNAPSHOT.jar
