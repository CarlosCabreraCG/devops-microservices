#!/usr/bin/env bash
set -Eeuo pipefail

# Despliega una nueva versión del microservicio NestJS:
# 1) construye la imagen Docker
# 2) la publica en Docker Hub
# 3) actualiza Azure Container Apps con Azure CLI
#
# Uso:
#   DOCKERHUB_USER=usuario DOCKERHUB_REPOSITORY=terraform-docker-nestjs \
#   AZURE_RESOURCE_GROUP=rg-mi-proyecto AZURE_CONTAINER_APP=ca-mi-proyecto-abcde \
#   ./scripts/deploy.sh
#
# Opcional:
#   TERRAFORM_DIR=../terraform
#   AZURE_SUBSCRIPTION_ID=...
#   IMAGE_TAG=...
#
# La imagen de Docker Hub debe ser pública, salvo que ya hayas configurado
# credenciales de registro privado en Azure Container Apps.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "${APP_DIR}"

log() { printf '\n[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
fail() { printf '\nERROR: %s\n' "$*" >&2; exit 1; }

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "No se encontró el comando requerido: $1"
}

require_command docker
require_command az

DOCKERHUB_USER="${DOCKERHUB_USER:-}"
DOCKERHUB_REPOSITORY="${DOCKERHUB_REPOSITORY:-devops-microservices}"
AZURE_RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-}"
AZURE_CONTAINER_APP="${AZURE_CONTAINER_APP:-}"
TERRAFORM_DIR="${TERRAFORM_DIR:-}"
AZURE_SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-}"

# Si se proporciona la carpeta de Terraform, intenta obtener los nombres
# directamente de sus outputs. También se pueden pasar como variables.
if [[ -n "${TERRAFORM_DIR}" ]]; then
  require_command terraform
  TERRAFORM_DIR_ABS="$(cd -- "${APP_DIR}/${TERRAFORM_DIR}" 2>/dev/null && pwd)" \
    || fail "No existe TERRAFORM_DIR: ${TERRAFORM_DIR}"

  [[ -n "${AZURE_RESOURCE_GROUP}" ]] || \
    AZURE_RESOURCE_GROUP="$(terraform -chdir="${TERRAFORM_DIR_ABS}" output -raw resource_group_name)"
  [[ -n "${AZURE_CONTAINER_APP}" ]] || \
    AZURE_CONTAINER_APP="$(terraform -chdir="${TERRAFORM_DIR_ABS}" output -raw container_app_name)"
fi

[[ -n "${DOCKERHUB_USER}" ]] || fail "Define DOCKERHUB_USER."
[[ -n "${AZURE_RESOURCE_GROUP}" ]] || fail "Define AZURE_RESOURCE_GROUP o configura TERRAFORM_DIR."
[[ -n "${AZURE_CONTAINER_APP}" ]] || fail "Define AZURE_CONTAINER_APP o configura TERRAFORM_DIR."

# Usa el commit actual como etiqueta reproducible. Si no hay Git/commit,
# utiliza fecha y hora UTC.
if [[ -z "${IMAGE_TAG:-}" ]]; then
  if command -v git >/dev/null 2>&1 && git -C "${APP_DIR}" rev-parse --short HEAD >/dev/null 2>&1; then
    IMAGE_TAG="$(git -C "${APP_DIR}" rev-parse --short HEAD)"
  else
    IMAGE_TAG="$(date -u '+%Y%m%d%H%M%S')"
  fi
fi

IMAGE="${DOCKERHUB_USER}/${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}"

log "Validando sesión de Azure..."
if ! az account show >/dev/null 2>&1; then
  log "No hay sesión de Azure CLI. Iniciando az login..."
  az login
fi

if [[ -n "${AZURE_SUBSCRIPTION_ID}" ]]; then
  log "Seleccionando suscripción de Azure..."
  az account set --subscription "${AZURE_SUBSCRIPTION_ID}"
fi

log "Validando Docker Hub..."
# Docker solicitará credenciales de forma interactiva si aún no hay sesión.
if ! docker info 2>/dev/null | grep -q 'Username:'; then
  docker login
fi

log "Construyendo imagen ${IMAGE}..."
docker build --platform linux/amd64 -t "${IMAGE}" .

log "Publicando imagen en Docker Hub..."
docker push "${IMAGE}"

log "Actualizando Azure Container App ${AZURE_CONTAINER_APP}..."
az containerapp update \
  --name "${AZURE_CONTAINER_APP}" \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --image "${IMAGE}" \
  --output none

APP_URL="$(az containerapp show \
  --name "${AZURE_CONTAINER_APP}" \
  --resource-group "${AZURE_RESOURCE_GROUP}" \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)"

log "Despliegue solicitado correctamente."
printf '\nImagen publicada: %s\n' "${IMAGE}"
if [[ -n "${APP_URL}" && "${APP_URL}" != "None" ]]; then
  printf 'URL de la aplicación: https://%s\n' "${APP_URL}"
  printf 'Pruebas sugeridas:\n'
  printf '  https://%s/hello\n' "${APP_URL}"
  printf '  https://%s/variable\n' "${APP_URL}"
  printf '  https://%s/secreto\n' "${APP_URL}"
  printf '  https://%s/imagen\n' "${APP_URL}"
fi
