# Despliegue Escalable de un Microservicio en una Arquitectura Cloud aprovisionada con Terraform

## 1. Descripción del proyecto

Este proyecto implementa un microservicio desarrollado con **Node.js y NestJS**, desplegado en una infraestructura Cloud de **Microsoft Azure**, aprovisionada mediante **Terraform**.

La aplicación está contenerizada con Docker y publicada en Docker Hub. Su despliegue y actualización se realizan mediante un proceso automatizado de CI/CD.

El microservicio integra servicios de Azure para gestionar secretos y archivos, además de conectarse a una base de datos PostgreSQL existente.

## 2. Tecnologías utilizadas

- **Node.js:** entorno de ejecución.
- **NestJS:** framework para el desarrollo del microservicio.
- **TypeScript:** lenguaje de programación.
- **Docker:** contenerización de la aplicación.
- **Docker Hub:** almacenamiento de imágenes Docker.
- **Microsoft Azure:** plataforma Cloud.
- **Azure Container Apps:** ejecución y escalabilidad del contenedor.
- **Azure Container Apps Environment:** entorno de ejecución.
- **Azure Log Analytics:** recopilación de registros.
- **Azure Key Vault:** almacenamiento y consulta de secretos.
- **Azure Blob Storage:** almacenamiento de imágenes.
- **Azure Managed Identity:** autenticación entre servicios de Azure.
- **Terraform:** aprovisionamiento de infraestructura como código.
- **PostgreSQL:** base de datos relacional.
- **CI/CD:** automatización del despliegue y actualización de la aplicación.

## 3. Arquitectura del proyecto

La solución utiliza una arquitectura basada en servicios administrados de Azure.

```text
                  Usuario
                     |
                     v
              Azure Container Apps
                     |
                     v
              Microservicio NestJS
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
   Key Vault    Blob Storage   PostgreSQL
       |             |             |
       v             v             v
   Secretos       Imágenes     Consulta de datos

                     ^
                     |
              Imagen Docker
                     |
                 Docker Hub

Terraform ----------------> Infraestructura Azure
CI/CD --------------------> Actualización del contenedor
```

Terraform se encarga de crear y configurar los recursos de Azure. El microservicio se ejecuta dentro de Azure Container Apps, que permite administrar revisiones, réplicas y escalabilidad.

## 4. Funcionalidades del microservicio

El microservicio dispone de los siguientes endpoints:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/hello` | Devuelve un mensaje de bienvenida. |
| GET | `/variable` | Permite comprobar la lectura de una variable de entorno. |
| GET | `/secreto` | Obtiene un secreto almacenado en Azure Key Vault. |
| GET | `/imagen` | Recupera y sirve una imagen almacenada en Azure Blob Storage. |
| GET | `/consulta` | Realiza una consulta a PostgreSQL para obtener el usuario con ID 1. |

### Ejemplos de uso

Reemplazar la URL por la URL pública de Azure Container Apps.

```bash
curl https://URL-DE-LA-APLICACION/hello
```

```bash
curl https://URL-DE-LA-APLICACION/variable
```

```bash
curl https://URL-DE-LA-APLICACION/secreto
```

```bash
curl https://URL-DE-LA-APLICACION/imagen
```

```bash
curl https://URL-DE-LA-APLICACION/consulta
```

## 5. Integración con Azure Key Vault

El microservicio obtiene información sensible desde Azure Key Vault, evitando almacenar directamente los secretos en el código fuente.

La integración utiliza una identidad administrada asignada por el usuario (*User Assigned Managed Identity*).

Se configuraron permisos RBAC para que:

- La identidad del microservicio tenga el rol `Key Vault Secrets User`.
- El usuario administrador tenga permisos para gestionar secretos.

La aplicación utiliza las variables de entorno correspondientes para identificar el Key Vault y el secreto que necesita consultar.

## 6. Integración con Azure Blob Storage

Se utiliza Azure Blob Storage para almacenar imágenes y recuperarlas desde el microservicio.

El contenedor de almacenamiento se mantiene privado y el acceso se realiza mediante la identidad administrada.

Se configuró el rol `Storage Blob Data Reader` para que la aplicación pueda leer los archivos almacenados.

El endpoint `/imagen` permite comprobar esta integración.

## 7. Integración con PostgreSQL

El microservicio incorpora una conexión a una instancia PostgreSQL existente.

La conexión se configura mediante variables de entorno, evitando incluir credenciales directamente en el código.

Variables utilizadas:

- `RDS_HOSTNAME`
- `RDS_PORT`
- `RDS_USERNAME`
- `RDS_PASSWORD`
- `RDS_DB_NAME`

El endpoint `/consulta` ejecuta una consulta parametrizada para recuperar el registro del usuario cuyo identificador es `1`.

La integración utiliza TypeORM y el controlador `pg`. No es necesario definir entidades ni cargar relaciones cuando se trabaja directamente con consultas SQL.

La sincronización automática del esquema se mantiene deshabilitada mediante `synchronize: false`, para evitar modificaciones involuntarias en la base de datos existente.

**Nota:** la instancia PostgreSQL debe permitir la conectividad de red desde Azure Container Apps.

## 8. Infraestructura aprovisionada con Terraform

La infraestructura se encuentra definida como código en un repositorio independiente.

Los principales recursos aprovisionados son:

- Resource Group.
- Log Analytics Workspace.
- Container Apps Environment.
- Azure Container App.
- User Assigned Managed Identity.
- Azure Key Vault.
- Azure Storage Account.
- Contenedor de Blob Storage.
- Asignaciones de roles RBAC.

### Configuración de escalabilidad

Azure Container Apps está configurado con los siguientes parámetros:

| Parámetro | Configuración |
|---|---|
| Modo de revisión | Single |
| Réplicas mínimas | 0 |
| Réplicas máximas | 3 |
| Solicitudes concurrentes por regla HTTP | 10 |
| CPU | 0.25 |
| Memoria | 0.5 Gi |
| Ingress | Externo |
| Puerto de la aplicación | 3000 |

La configuración permite escalar horizontalmente el microservicio según la demanda y reducir las réplicas hasta cero cuando no exista actividad.

## 9. Contenerización con Docker

La aplicación se empaqueta en una imagen Docker para garantizar un entorno de ejecución consistente.

La imagen se publica en Docker Hub y posteriormente es utilizada por Azure Container Apps.

Flujo general:

1. Desarrollo y modificación del código NestJS.
2. Construcción de la imagen Docker.
3. Publicación de la imagen en Docker Hub.
4. Actualización de la imagen utilizada por Azure Container Apps.
5. Ejecución de la nueva revisión de la aplicación.

## 10. Automatización del despliegue (CI/CD)

El proyecto dispone de un script de despliegue automatizado que actualiza la imagen del microservicio en Azure Container Apps.

El proceso utiliza las siguientes variables:

| Variable | Descripción |
|---|---|
| `DOCKERHUB_USER` | Usuario de Docker Hub. |
| `DOCKERHUB_REPOSITORY` | Nombre del repositorio de Docker Hub, sin etiqueta. |
| `AZURE_RESOURCE_GROUP` | Nombre del Resource Group de Azure. |
| `AZURE_CONTAINER_APP` | Nombre de Azure Container Apps. |

El proceso permite actualizar la aplicación sin tener que aprovisionar nuevamente toda la infraestructura.

## 11. Estructura de los repositorios

El proyecto está organizado en dos repositorios independientes.

### Repositorio del microservicio NestJS

Contiene el código fuente de la aplicación, sus módulos, controladores, servicios, configuración y archivos necesarios para construir la imagen Docker.

### Repositorio de infraestructura Terraform

Contiene los archivos de infraestructura como código:

- `main.tf`: definición de los recursos de Azure.
- `variables.tf`: declaración de variables de configuración.
- `outputs.tf`: salidas de información de la infraestructura.
- `terraform.tfvars`: valores de configuración del proyecto, si se utiliza.

## 12. Configuración y seguridad

Se aplicaron las siguientes medidas:

- Uso de variables de entorno para configurar la aplicación.
- Almacenamiento de secretos en Azure Key Vault.
- Uso de Managed Identity para acceder a servicios de Azure.
- Asignación de permisos mediante RBAC.
- Contenedor privado en Azure Blob Storage.
- Credenciales de PostgreSQL fuera del código fuente.
- Consultas SQL parametrizadas.
- Sincronización automática de base de datos deshabilitada.

Los archivos `.env` y `.env.production` no deben publicarse en repositorios públicos ni incluirse dentro de la imagen Docker si contienen credenciales.

## 13. Resultados obtenidos

Al finalizar la implementación se consiguió:

1. Desarrollar un microservicio funcional utilizando NestJS.
2. Contenerizar la aplicación mediante Docker.
3. Publicar la imagen en Docker Hub.
4. Aprovisionar infraestructura Cloud mediante Terraform.
5. Desplegar el microservicio en Azure Container Apps.
6. Configurar escalabilidad automática con un mínimo de cero y un máximo de tres réplicas.
7. Integrar Azure Key Vault para la consulta de secretos.
8. Integrar Azure Blob Storage para recuperar imágenes.
9. Conectar el microservicio con una base de datos PostgreSQL existente.
10. Implementar un proceso automatizado de actualización del contenedor mediante CI/CD.

## 14. Conclusión

El proyecto demuestra la implementación de un microservicio escalable en una arquitectura Cloud utilizando infraestructura como código.

La combinación de NestJS, Docker, Docker Hub, Terraform y Azure Container Apps permite desarrollar, contenerizar, desplegar y actualizar una aplicación de manera organizada y automatizada.

Asimismo, la integración con Azure Key Vault, Blob Storage y PostgreSQL demuestra la comunicación del microservicio con servicios externos y administrados, mientras que la configuración de escalabilidad permite adaptar los recursos de ejecución a la demanda de la aplicación.


--------------------------------

## Autoría

- Autor - [Carlos Cabrera](https://github.com/CarlosCabreraCG/devops-microservices)
- Website - [Portafolio](https://carloscabreracg.github.io/)

## License

Este repositorio usa nest [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
También la licencia GNU GPLv3
