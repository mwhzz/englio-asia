param([switch]$Trust)
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$certificateDirectory = Join-Path $projectDirectory '.card-autofill.local'
$configurationPath = Join-Path $certificateDirectory 'tls.json'
New-Item -ItemType Directory -Path $certificateDirectory -Force | Out-Null

if (-not (Test-Path -LiteralPath $configurationPath)) {
    $certificate = New-SelfSignedCertificate -DnsName 'localhost' `
        -CertStoreLocation 'Cert:\CurrentUser\My' -Type SSLServerAuthentication `
        -FriendlyName 'ENGLIO card autofill localhost test' `
        -KeyExportPolicy Exportable -NotAfter (Get-Date).AddDays(30) `
        -TextExtension @('2.5.29.19={critical}{text}ca=0')
    $passphrase = [Guid]::NewGuid().ToString('N') + [Guid]::NewGuid().ToString('N')
    $password = ConvertTo-SecureString -String $passphrase -AsPlainText -Force
    Export-PfxCertificate -Cert $certificate -FilePath (Join-Path $certificateDirectory 'localhost.pfx') -Password $password | Out-Null
    Export-Certificate -Cert $certificate -FilePath (Join-Path $certificateDirectory 'localhost.cer') | Out-Null
    $pem = "-----BEGIN CERTIFICATE-----`n" + [Convert]::ToBase64String($certificate.RawData, [Base64FormattingOptions]::InsertLineBreaks) + "`n-----END CERTIFICATE-----`n"
    [IO.File]::WriteAllText((Join-Path $certificateDirectory 'localhost.pem'), $pem)
    @{ passphrase = $passphrase; thumbprint = $certificate.Thumbprint } | ConvertTo-Json | Set-Content -LiteralPath $configurationPath -Encoding UTF8
}

if ($Trust) {
    # Run this switch only after the user approves the Windows trust-store change.
    Import-Certificate -FilePath (Join-Path $certificateDirectory 'localhost.cer') -CertStoreLocation 'Cert:\CurrentUser\Root' | Out-Null
    Write-Output 'Localhost certificate trusted for the current Windows user.'
} else {
    Write-Output 'Localhost HTTPS certificate prepared. Windows trust has not been changed.'
}
