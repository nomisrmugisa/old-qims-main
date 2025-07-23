Add-Type -AssemblyName System.IO.Compression

Get-ChildItem -Path "." -Filter "*.gz" | ForEach-Object {
    $gzFile = $_.FullName
    $outputFile = $gzFile -replace '\.gz$', ''
    
    try {
        $fileStream = [System.IO.File]::OpenRead($gzFile)
        $gzipStream = New-Object System.IO.Compression.GZipStream($fileStream, [System.IO.Compression.CompressionMode]::Decompress)
        $outputStream = [System.IO.File]::Create($outputFile)
        
        $gzipStream.CopyTo($outputStream)
        
        $outputStream.Close()
        $gzipStream.Close()
        $fileStream.Close()
        
        Write-Host "Decompressed: $($_.Name) -> $(Split-Path $outputFile -Leaf)"
    }
    catch {
        Write-Host "Error decompressing $($_.Name): $($_.Exception.Message)"
    }
}

Write-Host "Decompression complete!"
