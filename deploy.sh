#!/bin/bash

# --- KONFIGURASI ---
PROJECT_ID=$(gcloud config get-value project)
APP_NAME="fuenzer-research"
# Region Free Tier Cloud Run (2 juta request/bulan gratis):
# - us-central1 (Iowa)
# - us-west1 (Oregon)
# - us-east1 (South Carolina)
REGION="us-central1"

# Menggunakan standar Artifact Registry (pkg.dev)
REPO_NAME="fuenzer-research-repo"
IMAGE_URL="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$APP_NAME:latest"

echo "Memulai Deployment..."

# [OTOMATISASI] Membuat repositori Artifact Registry jika belum ada
echo "[0/3] Memeriksa Repositori Google Cloud..."
gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID &>/dev/null
if [ $? -ne 0 ]; then
    echo "Membuat repositori baru..."
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Repositori Docker Fuenzer Research" \
        --project=$PROJECT_ID
fi

# Build Docker Image secara lokal
echo "[1/3] Membangun Docker Image..."
docker build -t $IMAGE_URL .

# Push/Kirim Docker Image ke Google Artifact Registry
echo "[2/3] Mengunggah Image ke Google Cloud..."
docker push $IMAGE_URL

# Deploy ke Google Cloud Run
echo "[3/3] Deploy aplikasi ke internet..."
gcloud run deploy $APP_NAME \
    --image $IMAGE_URL \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --max-instances=1

# Pembersihan otomatis Image lama (Untagged)
echo "Membersihkan image lama agar storage aman..."

# Mencari digests (ID unik) dari semua image yang tidak memiliki tag di repositori tersebut
UNTAGGED_IMAGES=$(gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$APP_NAME \
    --filter="NOT tags:*" \
    --format="get(package.version)")

if [ -z "$UNTAGGED_IMAGES" ]; then
    echo "✅ Tidak ada image lama yang menumpuk."
else
    echo "Menghapus image lama..."
    for IMAGE_DIGEST in $UNTAGGED_IMAGES; do
        # Menghapus versi lama secara paksa (-q untuk silent, --delete-tags jika ada ketergantungan)
        gcloud artifacts versions delete $IMAGE_DIGEST \
            --repository=$REPO_NAME \
            --location=$REGION \
            --package=$APP_NAME \
            --quiet
    done
    echo "✅ Pembersihan selesai! Hanya menyisakan versi terbaru."
fi

echo "✅ Deployment Selesai!"
