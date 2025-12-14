# Tüm uygulamaları başlatmadan önce port'ları temizle

Write-Host "🧹 Port'lar temizleniyor..." -ForegroundColor Yellow

# Port 3001 (CMS)
try {
    $cmsConnections = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction Stop
    $cmsPids = $cmsConnections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $cmsPids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Port 3001 temizlendi (PID: $pid)" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ Port 3001 zaten temiz" -ForegroundColor Green
}

# Port 3000 (Shop) - opsiyonel
try {
    $shopConnections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction Stop
    $shopPids = $shopConnections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $shopPids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Port 3000 temizlendi (PID: $pid)" -ForegroundColor Green
    }
} catch {
    # Port 3000 kullanılmıyor, sorun değil
}

# Port 3002 (Sellercentral) - opsiyonel
try {
    $sellerConnections = Get-NetTCPConnection -LocalPort 3002 -State Listen -ErrorAction Stop
    $sellerPids = $sellerConnections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $sellerPids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Port 3002 temizlendi (PID: $pid)" -ForegroundColor Green
    }
} catch {
    # Port 3002 kullanılmıyor, sorun değil
}

Start-Sleep -Seconds 1

Write-Host "`n🚀 Uygulamalar başlatılıyor..." -ForegroundColor Cyan
Write-Host "   npm run dev`n" -ForegroundColor White

# npm run dev komutunu çalıştır
npm run dev

