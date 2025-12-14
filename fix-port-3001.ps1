# Port 3001'i temizle - Hızlı çözüm

Write-Host "🔍 Port 3001 temizleniyor..." -ForegroundColor Yellow

try {
    $connections = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction Stop
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $pids) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "⚠️  Process bulundu: PID $pid - $($process.ProcessName)" -ForegroundColor Red
            Stop-Process -Id $pid -Force
            Write-Host "✅ Process $pid durduruldu" -ForegroundColor Green
        }
    }
    
    Start-Sleep -Seconds 1
    
    # Kontrol et
    $remaining = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "❌ Port hala kullanımda!" -ForegroundColor Red
    } else {
        Write-Host "✅ Port 3001 temizlendi!" -ForegroundColor Green
        Write-Host "`nŞimdi 'npm run dev' komutunu çalıştırabilirsiniz." -ForegroundColor Cyan
    }
} catch {
    Write-Host "✅ Port 3001 zaten temiz" -ForegroundColor Green
    Write-Host "`nŞimdi 'npm run dev' komutunu çalıştırabilirsiniz." -ForegroundColor Cyan
}

