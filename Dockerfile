# ---- Build Stage: Frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Build Stage: Backend ----
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /api ./cmd/api

# ---- Production Stage ----
FROM alpine:3.19
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy backend binary
COPY --from=backend-builder /api ./api

# Copy SINTA dictionary
COPY --from=backend-builder /app/backend/data ./data

# Copy frontend build output (to be served by the backend or a reverse proxy)
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 8080

CMD ["./api"]
