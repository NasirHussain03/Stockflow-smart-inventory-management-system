<#
.SYNOPSIS
    Builds and pushes the Inventory Management System Docker images to Docker Hub.
.DESCRIPTION
    This script builds the Docker images for the frontend (client, using production build)
    and the backend (server) services, tags them, and pushes them to the specified Docker registry.
.PARAMETER DockerUsername
    Your Docker Hub or container registry username.
.PARAMETER Tag
    The tag to apply to the images. Defaults to 'latest'.
.PARAMETER SkipPush
    If set, the script will only build and tag the images locally, skipping the push step.
.PARAMETER BuildServer
    Specify whether to build the server image. Defaults to $true.
.PARAMETER BuildClient
    Specify whether to build the client image. Defaults to $true.
.EXAMPLE
    .\build-and-push.ps1 -DockerUsername "myusername"
.EXAMPLE
    .\build-and-push.ps1 -DockerUsername "myusername" -Tag "v1.0.0"
.EXAMPLE
    .\build-and-push.ps1 -DockerUsername "myusername" -SkipPush
#>

param (
    [Parameter(Mandatory=$false, Position=0)]
    [string]$DockerUsername,

    [Parameter(Mandatory=$false)]
    [string]$Tag = "latest",

    [Parameter(Mandatory=$false)]
    [switch]$SkipPush,

    [Parameter(Mandatory=$false)]
    [bool]$BuildServer = $true,

    [Parameter(Mandatory=$false)]
    [bool]$BuildClient = $true
)

$ErrorActionPreference = "Stop"

# Write headers with nice formatting
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "    Inventory Management System - Docker Build    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verify Docker is installed and running
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker command-line tool not found. Please install Docker Desktop and add it to your PATH."
    exit 1
}

Write-Host "[*] Checking Docker Daemon status..." -ForegroundColor Yellow
docker version > $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker daemon is not running. Please start Docker Desktop and try again."
    exit 1
}
Write-Host "[+] Docker daemon is running." -ForegroundColor Green
Write-Host ""

# 2. Get Docker Hub Username if not provided and pushing is required
if (-not $SkipPush -and [string]::IsNullOrEmpty($DockerUsername)) {
    Write-Host "To push images to a registry, you must provide your username." -ForegroundColor Yellow
    $DockerUsername = Read-Host "Enter Docker Hub/Registry Username"
    if ([string]::IsNullOrEmpty($DockerUsername)) {
        Write-Warning "No username provided. Defaulting to -SkipPush (images will only be built locally)."
        $SkipPush = $true
    }
}

# Define image tags
$ServerImage = if ([string]::IsNullOrEmpty($DockerUsername)) { "inventory-server:$Tag" } else { "$DockerUsername/inventory-server:$Tag" }
$ClientImage = if ([string]::IsNullOrEmpty($DockerUsername)) { "inventory-client:$Tag" } else { "$DockerUsername/inventory-client:$Tag" }

# 3. Build Server Image
if ($BuildServer) {
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    Write-Host " Building Backend (Server) Docker Image: $ServerImage" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    
    docker build -t $ServerImage ./server
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build Backend Docker image."
        exit 1
    }
    Write-Host "[+] Backend Docker image built successfully." -ForegroundColor Green
    Write-Host ""
}

# 4. Build Client Image
if ($BuildClient) {
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    Write-Host " Building Frontend (Client) Docker Image: $ClientImage" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    
    # We build the client using Dockerfile.prod since it uses nginx and is production-ready
    docker build -f ./client/Dockerfile.prod -t $ClientImage ./client
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build Frontend Docker image."
        exit 1
    }
    Write-Host "[+] Frontend Docker image built successfully." -ForegroundColor Green
    Write-Host ""
}

# 5. Push to Registry
if (-not $SkipPush) {
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan
    Write-Host " Pushing Docker Images to Registry" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------" -ForegroundColor Cyan

    Write-Host "[*] Checking registry login status..." -ForegroundColor Yellow
    Write-Host "Note: If you have not logged in, please open a separate terminal and run: docker login" -ForegroundColor Gray
    
    if ($BuildServer) {
        Write-Host "[*] Pushing Backend image: $ServerImage ..." -ForegroundColor Yellow
        docker push $ServerImage
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to push Backend image. Make sure you are logged in using 'docker login'."
            exit 1
        }
        Write-Host "[+] Backend image pushed successfully!" -ForegroundColor Green
    }

    if ($BuildClient) {
        Write-Host "[*] Pushing Frontend image: $ClientImage ..." -ForegroundColor Yellow
        docker push $ClientImage
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to push Frontend image. Make sure you are logged in using 'docker login'."
            exit 1
        }
        Write-Host "[+] Frontend image pushed successfully!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "    All Docker images pushed successfully!         " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Yellow
    Write-Host "    Build completed. Pushing was skipped.          " -ForegroundColor Yellow
    Write-Host "    To push manually, run:                         " -ForegroundColor Yellow
    if ($BuildServer) { Write-Host "    docker push $ServerImage" -ForegroundColor Yellow }
    if ($BuildClient) { Write-Host "    docker push $ClientImage" -ForegroundColor Yellow }
    Write-Host "==================================================" -ForegroundColor Yellow
}
