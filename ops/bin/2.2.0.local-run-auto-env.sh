#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

ENV_FILE="${1:-.env}"
IMAGE_NAME="${IMAGE_NAME:-demopartnerbooking}"
CONTAINER_NAME="${CONTAINER_NAME:-${IMAGE_NAME}-local}"
PORT="${PORT:-3000}"
APP_ENVIRONMENT="${APP_ENVIRONMENT:-development}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[ERROR] Cannot find env file: ${ENV_FILE}" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

mapfile -t ARG_NAMES < <(
  awk '/^ARG[[:space:]]+/ {
    line=$0
    sub(/^ARG[[:space:]]+/, "", line)
    sub(/=.*/, "", line)
    print line
  }' Dockerfile | sort -u
)

build_args=()
missing_args=()

for var in "${ARG_NAMES[@]}"; do
  if [[ "${!var+x}" == "x" ]]; then
    build_args+=(--build-arg "${var}=${!var}")
  else
    missing_args+=("${var}")
    build_args+=(--build-arg "${var}=")
  fi
done

if (( ${#missing_args[@]} > 0 )); then
  echo "[WARN] Missing values in ${ENV_FILE} for Docker ARG(s): ${missing_args[*]}"
fi

echo "[INFO] Remove old local container/image (if any)"
docker rm -f "${CONTAINER_NAME}" 2>/dev/null || true
docker rmi -f "${IMAGE_NAME}" 2>/dev/null || true

echo "[INFO] Build image ${IMAGE_NAME}"
docker build . -t "${IMAGE_NAME}" "${build_args[@]}"

echo "[INFO] Run container ${CONTAINER_NAME} at localhost:${PORT}"
docker run --name "${CONTAINER_NAME}" -e APP_ENVIRONMENT="${APP_ENVIRONMENT}" -p "${PORT}:80" "${IMAGE_NAME}"
