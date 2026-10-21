﻿﻿# server.ps1 - 出口管制筛查 API 代理 (PowerShell 版)
# 无需 Node.js，Windows 原生 PowerShell 即可运行

param([int]$Port = 3000)

$API_HOST    = "data.trade.gov"
$SCRIPT_DIR  = Split-Path -Parent $MyInvocation.MyCommand.Path

function Log($msg) {
    Write-Host "$(Get-Date -Format 'HH:mm:ss')  $msg"
}

# ---------- MIME 类型 ----------
$MIME = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript"
    ".css"  = "text/css"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".ico"  = "image/x-icon"
}

# ---------- 启动 HTTP 监听 ----------
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

$fullUser = ([System.Security.Principal.WindowsIdentity]::GetCurrent()).Name

$started = $false
try {
    $listener.Start()
    $started = $true
} catch {}

if (-not $started) {
    # 检查 URL ACL 是否已注册
    $aclCheck = cmd /c "netsh http show urlacl url=http://127.0.0.1:$Port/" 2>&1
    $aclExists = ($aclCheck -match "登録済み|予約済み|Reserved")
    $portCheck = netstat -ano 2>$null | Select-String ":$Port " | Select-String "LISTENING"

    if (-not $aclExists) {
        Log "URL 権限を登録中 (管理者権限が必要)..."
        $netshResult = cmd /c "netsh http add urlacl url=http://127.0.0.1:$Port/ user=$fullUser" 2>&1
        if ($netshResult -match "正常に追加|added successfully") {
            Log "  URL 権限登録完了"
            try {
                $listener.Start()
                $started = $true
            } catch {
                Log "  登録後も起動失敗: $($_.Exception.Message)"
            }
        } else {
            Log "  URL 権限登録失敗: $netshResult"
        }
    }

    if (-not $started -and $portCheck) {
        Log "ポート $Port は既に使用されています"
        $portPid = ($portCheck -split '\s+')[-1]
        Log "  占用 PID: $portPid"
        Log "  終了コマンド: taskkill /F /PID $portPid"
    }
}

if (-not $started) {
    Log "FATAL: ポート $Port でリッスンできません"
    if (-not $aclExists) {
        Log "  管理者として一度実行して権限を登録してください"
        Log "  netsh http add urlacl url=http://127.0.0.1:$Port/ user=$fullUser"
    }
    if ($portCheck) {
        Log "  またはポートを占有しているプロセスを終了してください"
    }
    Read-Host "按 Enter 退出"
    exit 1
}

Log "=========================================="
Log "  出口管制筛查工具已启动 (PowerShell)"
Log "  http://127.0.0.1:$Port"
Log "  API: $API_HOST"
Log "=========================================="

Start-Process "http://127.0.0.1:$Port"

# ---------- 解析 Query String ----------
function ParseQuery($query) {
    $apiKey = ""
    $cleanParams = New-Object System.Collections.ArrayList
    $q = $query.TrimStart('?')
    if ($q) {
        foreach ($pair in $q.Split('&')) {
            $eq = $pair.IndexOf('=')
            if ($eq -gt 0) {
                $k = $pair.Substring(0, $eq)
                $v = $pair.Substring($eq + 1)
                if ($k -eq "api_key") {
                    $apiKey = [Uri]::UnescapeDataString($v)
                } else {
                    [void]$cleanParams.Add($pair)
                }
            } elseif ($pair -and ($pair -ne "api_key")) {
                # key without value
                [void]$cleanParams.Add($pair)
            }
        }
    }
    $cleanQuery = ""
    if ($cleanParams.Count -gt 0) {
        $cleanQuery = "?" + ($cleanParams -join '&')
    }
    return @{ ApiKey = $apiKey; CleanQuery = $cleanQuery }
}

# ---------- 发送 JSON 响应 ----------
function SendJson($response, $json) {
    $response.ContentType = "application/json; charset=utf-8"
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

# ---------- 代理 API 请求 ----------
function ProxyApi($request, $response) {
    $query = $request.Url.Query
    $path  = $request.Url.AbsolutePath

    $pq = ParseQuery $query
    $apiKey     = $pq.ApiKey
    $cleanQuery = $pq.CleanQuery

    $apiPath = $path -replace "^/api", ""
    $apiUrl  = "https://$API_HOST$apiPath$cleanQuery"

    Log "[req] $apiUrl"

    try {
        $headers = @{ "Accept" = "application/json" }
        if ($apiKey) {
            $headers["subscription-key"] = $apiKey
            Log "[auth] subscription-key: $($apiKey.Substring(0, [Math]::Min(8, $apiKey.Length)))..."
        }

        $ProgressPreference = 'SilentlyContinue'
        $apiResult = Invoke-WebRequest -Uri $apiUrl -Headers $headers `
            -Method GET -UseBasicParsing -ErrorAction Stop

        Log "[status] $($apiResult.StatusCode)"
        $response.StatusCode = [int]$apiResult.StatusCode
        $response.ContentType = "application/json"
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($apiResult.Content)
        $response.OutputStream.Write($bytes, 0, $bytes.Length)

    } catch [System.Net.WebException] {
        $errResp = $_.Exception.Response
        if ($errResp) {
            $errStatus = [int]$errResp.StatusCode
            Log "[status] $errStatus"
            $response.StatusCode = $errStatus
            $response.ContentType = "application/json"
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $reader = New-Object System.IO.StreamReader($errResp.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            $reader.Close()
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($errBody)
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            Log "[error] $($_.Exception.Message)"
            $response.StatusCode = 502
            SendJson $response ('{"error":"API request failed","detail":"' + $_.Exception.Message.Replace('"',"'") + '"}')
        }
    } catch {
        Log "[error] $($_.Exception.Message)"
        $response.StatusCode = 502
        SendJson $response ('{"error":"' + $_.Exception.Message.Replace('"',"'") + '"}')
    }
}

# ---------- 静态文件服务 ----------
function ServeStatic($request, $response) {
    $path = $request.Url.AbsolutePath
    $filePath = if ($path -eq "/") { "/export_screening.html" } else { $path }
    $fullPath = Join-Path $SCRIPT_DIR $filePath

    # 防路径穿越
    if (-not $fullPath.StartsWith($SCRIPT_DIR, [System.StringComparison]::OrdinalIgnoreCase)) {
        $response.StatusCode = 403
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        return
    }

    if (Test-Path $fullPath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
        $contentType = if ($MIME.ContainsKey($ext)) { $MIME[$ext] } else { "application/octet-stream" }
        $response.StatusCode = 200
        $response.ContentType = $contentType
        $content = [System.IO.File]::ReadAllBytes($fullPath)
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $response.ContentType = "text/html; charset=utf-8"
        $msg = "<h1>404 - Not Found</h1>"
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
}

# ---------- 主循环 ----------
while ($listener.IsListening) {
    try {
        $context  = $listener.GetContext()
        $request  = $context.Request
        $response = $context.Response

        # CORS 预检
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        # API 代理
        if ($request.Url.AbsolutePath.StartsWith("/api/")) {
            ProxyApi $request $response
        } else {
            ServeStatic $request $response
        }

        $response.Close()
    } catch {
        break
    }
}

$listener.Stop()
Log "服务已停止"
