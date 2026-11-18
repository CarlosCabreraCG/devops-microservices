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

Eliminar:

```bash
docker rm microservicio-container
```

## Git

Respositorio: https://github.com/CarlosCabreraCG/devops-microservices

## Autoría

- Autor - [Carlos Cabrera](https://github.com/CarlosCabreraCG/devops-microservices)
- Website - [Portafolio](https://carloscabreracg.github.io/)

## License

Este repositorio usa nest [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
También la licencia GNU GPLv3
