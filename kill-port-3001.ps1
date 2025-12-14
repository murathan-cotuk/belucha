# Port 3001'i kullanan process'leri bul ve kill et

Write-Host "🔍 Port 3001'i kullanan process'ler aranıyor..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }

if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $pids) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "⚠️  Process bulundu: PID $pid - $($process.ProcessName)" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Process $pid durduruldu" -ForegroundColor Green
        }
    }
    
    Start-Sleep -Seconds 1
    Write-Host "`n✅ Port 3001 temizlendi!" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3001 kullanılmıyor" -ForegroundColor Green
}

Write-Host "`nŞimdi 'npm run dev' komutunu çalıştırabilirsiniz." -ForegroundColor Cyan

