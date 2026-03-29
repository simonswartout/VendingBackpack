---
description: Manually build and push Docker images to GHCR using the current Git commit
---
# Manual GHCR Push Workflow

This workflow manually compiles the Backend and Frontend Dockerfiles, dynamically tags them with your current Git commit hash (`sha-1234567`), and pushes them directly to the GitHub Container Registry.

> [!IMPORTANT]
> The very first step of this workflow will log you into GitHub.

1. First, tell the user to manually run `docker login ghcr.io` in their own terminal because you cannot securely pass their PAT on their behalf. Wait for them to confirm they have successfully logged in. Once they say they are logged in, proceed to step 2.

2. Build the Backend Docker Image
// turbo
```powershell
$SHA = git rev-parse --short HEAD
Write-Host "Building Backend as sha-$SHA"
docker build -t "ghcr.io/aldervon-systems/vendingbackpack/backend:sha-$SHA" ./Backend
```

2. Build the Frontend Docker Image
// turbo
```powershell
$SHA = git rev-parse --short HEAD
Write-Host "Building Frontend as sha-$SHA"
docker build -t "ghcr.io/aldervon-systems/vendingbackpack/frontend-next:sha-$SHA" ./Frontend-Next
```

3. Push the Backend Docker Image to GHCR
// turbo
```powershell
$SHA = git rev-parse --short HEAD
Write-Host "Pushing Backend sha-$SHA"
docker push "ghcr.io/aldervon-systems/vendingbackpack/backend:sha-$SHA"
```

4. Push the Frontend Docker Image to GHCR
// turbo
```powershell
$SHA = git rev-parse --short HEAD
Write-Host "Pushing Frontend sha-$SHA"
docker push "ghcr.io/aldervon-systems/vendingbackpack/frontend-next:sha-$SHA"
```
