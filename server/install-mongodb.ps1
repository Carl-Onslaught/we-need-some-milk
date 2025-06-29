# Download MongoDB
$url = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.14-signed.msi"
$output = "$PSScriptRoot\mongodb.msi"
Invoke-WebRequest -Uri $url -OutFile $output

# Install MongoDB
Start-Process msiexec.exe -ArgumentList "/i `"$output`" /qn" -Wait

# Create data directory
New-Item -ItemType Directory -Force -Path "C:\data\db"

# Start MongoDB
Start-Process "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" -ArgumentList "--dbpath C:\data\db"
