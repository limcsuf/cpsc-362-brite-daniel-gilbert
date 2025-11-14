@echo off
    REM Set the path for the client directory that will be opened in an elevated PowerShell window
    set "TARGET_LOCATION_CLIENT=C:\Users\TheDr\OneDrive\Documents\cpsc-362-brite-daniel-gilbert/client"

    REM Set the path for the server directory that will be opened in another elevated PowerShell window
    set "TARGET_LOCATION_SERVER=C:\Users\TheDr\OneDrive\Documents\cpsc-362-brite-daniel-gilbert/server"

    REM Launch an elevated PowerShell session and automatically navigate to the client folder
    powershell.exe -Command "Start-Process -FilePath powershell.exe -Verb RunAs -ArgumentList '-NoExit -Command Set-Location -LiteralPath \"%TARGET_LOCATION_CLIENT%\"'"

    REM Launch a second elevated PowerShell session and automatically navigate to the server folder
    powershell.exe -Command "Start-Process -FilePath powershell.exe -Verb RunAs -ArgumentList '-NoExit -Command Set-Location -LiteralPath \"%TARGET_LOCATION_SERVER%\"'"
