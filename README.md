## Description

Proyecto de Devops para docker - terraform - azure

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

Tener cuidado con no borrar package-lock.json, caso contrario usar:

```bash
$ npm install --legacy-peer-deps
```

## Docker

Ejecutar contenedor:

```bash
docker run -d -p 3000:3000 --name microservicio-container -e NOMBRE=TuNombre -e MI_VARIABLE="Variable desde Docker" microservicio:1.0
```

Comprobar ejecución

```bash
docker ps
```

Consultar logs:

```bash
docker logs microservicio-container
```

Eliminar contenedor:

```bash
docker rm microservicio-container
```

Construir nueva versión
```bash
docker build -t ccabrerag/microservicio:1.X .  # 1.2 ultima actualización
```bash

Subir

```bash
docker push ccabrerag/microservicio:1.X .  # 1.2 ultima actualización
```bash


## Azure

Registrar microsoft app:

```bash
az provider register --namespace Microsoft.App --wait
```

Registrar log analytics

```bash
az provider register --namespace Microsoft.OperationalInsights --wait
```

Comprobar registro

```bash
az provider show --namespace Microsoft.App --query registrationState -o tsv
az provider show --namespace Microsoft.OperationalInsights --query registrationState -o tsv
```

## ENV

Cambiar key default y usar en powershell:
```bash
$env:AZURE_KEY_VAULT_URL="https://TU_KEYVAULT.vault.azure.net/"
$env:AZURE_SECRET_NAME="mensaje-secreto"
```

## Git

Respositorio: https://github.com/CarlosCabreraCG/devops-microservices

## Autoría

- Autor - [Carlos Cabrera](https://github.com/CarlosCabreraCG/devops-microservices)
- Website - [Portafolio](https://carloscabreracg.github.io/)

## License

Este repositorio usa nest [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
También la licencia GNU GPLv3
