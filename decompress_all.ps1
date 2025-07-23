Add-Type -AssemblyName System.IO.Compression

function Decompress-GzFiles {
    param([string]$Path)
    
    Get-ChildItem -Path $Path -Recurse -Filter "*.gz" | ForEach-Object {
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
            
            Write-Host "Decompressed: $($_.FullName) -> $outputFile"
        }
        catch {
            Write-Host "Error decompressing $($_.FullName): $($_.Exception.Message)"
        }
    }
}

Write-Host "Starting recursive decompression..."
Decompress-GzFiles -Path "."
Write-Host "Recursive decompression complete!"
