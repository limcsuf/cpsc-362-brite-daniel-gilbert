    @echo off
    set "TARGET_LOCATION_CLIENT=C:\Users\TheDr\OneDrive\Documents\cpsc-362-brite-daniel-gilbert/client"
    set "TARGET_LOCATION_SERVER=C:\Users\TheDr\OneDrive\Documents\cpsc-362-brite-daniel-gilbert/server"
    powershell.exe -Command "Start-Process -FilePath powershell.exe -Verb RunAs -ArgumentList '-NoExit -Command Set-Location -LiteralPath \"%TARGET_LOCATION_CLIENT%\"'"
    powershell.exe -Command "Start-Process -FilePath powershell.exe -Verb RunAs -ArgumentList '-NoExit -Command Set-Location -LiteralPath \"%TARGET_LOCATION_SERVER%\"'"