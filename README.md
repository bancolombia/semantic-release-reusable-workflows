# Semantic Release Reusable Workflows

Este proyecto proporciona un workflow reutilizable de GitHub Actions para automatizar el versionamiento semántico y la creación de releases utilizando [semantic-release](https://github.com/semantic-release/semantic-release).

## 📋 Descripción del Proyecto

Este repositorio contiene herramientas y configuraciones para implementar **Semantic Release** en proyectos open source, permitiendo:

- ✅ Versionamiento automático basado en commits (Conventional Commits)
- ✅ Generación automática de CHANGELOG
- ✅ Creación de GitHub Releases
- ✅ Gestión de ramas de mantenimiento (LTS)
- ✅ Soporte para prelanzamientos (alpha, beta, next)
- ✅ Dos modos de operación: **standard** e **issue-label**

## 🏗️ Estructura del Proyecto

```
semantic-release-reusable-workflows/
├── .github/
│   └── workflows/
│       ├── tool-semantic-release.yaml        # Workflow principal reutilizable
│       └── tool-load_properties_repository.yaml
├── Tools/
│   └── Semantic-Release/
│       ├── release.config.js                 # Configuración de semantic-release
│       └── semantic-release/
│           ├── create-release-branch.js      # Script para crear ramas de mantenimiento
│           ├── release-rules.js              # Reglas personalizadas de release
│           └── writerChangelog.js            # Formateador personalizado de CHANGELOG
└── README.md
```

## 🚀 Modos de Operación

### 1. Modo Standard (`standard`)

Analiza los commits siguiendo la convención de [Conventional Commits](https://www.conventionalcommits.org/) para determinar automáticamente el tipo de release.

**Tipos de commit soportados:**
- `feat`: Nueva funcionalidad (no genera release por sí solo)
- `fix`: Corrección de bugs (no genera release por sí solo)
- `perf`: Mejoras de rendimiento (no genera release por sí solo)
- `featurerelease`: Genera release **MINOR** (nueva funcionalidad)
- `fixpatchrelease`: Genera release **PATCH** (corrección)
- `securitypatchrelease`: Genera release **PATCH** (seguridad)
- `breakingrelease`: Genera release **MAJOR** (cambio incompatible)
- Commits con `BREAKING CHANGE` o `breaking: true`: Generan release **MAJOR**

### 2. Modo Issue-Label (`issue-label`)

Determina el tipo de release basándose en etiquetas de issues vinculados al Pull Request.

**Mapeo de etiquetas a tipos de release:**
*Etiquetas de Categorías**
- `c: documentation`
- `c: feature`
- `c: bug`
- `c: vulnerability`

**Etiquetas Generales**
- `g: good first issue`
- `g: help wanted` 
- `g: in triage` 
- `g: assigned for triage` 
- `g: question`

**Etiquetas de Resolución**
- `r: duplicade`
- `r: fixed`
- `r: solved`
- `r: invalid`
- `r: timeout`
- `r: wontfix`

## 📝 Cómo Usar

### Configuración Básica

1. **Crear un workflow en tu repositorio** (`.github/workflows/semantic-release.yml`):

```yaml
name: Semantic-Release

on:
  push:
    branches:
        - trunk
        - main
        - '**.x'
        - 'stable/**'
        - alpha
        - beta
    paths-ignore:
        - 'docs/**'

permissions:
  contents: write # to be able to publish a GitHub release
  issues: write # to be able to comment on released issues
  pull-requests: write # to be able to comment on released pull requests
  id-token: write # to enable use of OIDC for npm provenance

jobs:
  load-vars:
    uses: bancolombia/semantic-release-reusable-workflows/.github/workflows/tool-load_properties_repository.yaml@trunk
    secrets: inherit

  call-workflow-semantic-release:
    needs: load-vars
    if: ${{ needs.load-vars.outputs.SEMREL_MODE != 'disabled' }}
    uses: bancolombia/semantic-release-reusable-workflows/.github/workflows/tool-semantic-release.yaml@trunk
    secrets: inherit
    with:
      semantic_version: ${{ needs.load-vars.outputs.SEMREL_VERSION }}
      semantic_release_mode: ${{ needs.load-vars.outputs.SEMREL_MODE }}
```

Este workflow utiliza dos jobs:
- **`load-vars`**: Carga las propiedades del repositorio y determina la configuración
- **`call-workflow-semantic-release`**: Ejecuta el release solo si `SEMREL_MODE != 'disabled'`

2. **Configurar propiedades del repositorio**:

Las siguientes propiedades deben configurarse en tu repositorio de GitHub (Settings → Custom properties):

**Propiedades requeridas:**
- `SEMREL_MODE`: Modo de operación (`standard`, `issue-label`, o `disabled`)
- `SEMREL_VERSION`: Versión de semantic-release a usar (`latest` o una versión específica como `v1.0.0`)

**Propiedades opcionales:**
- `SEMREL_FILE_VER`: Archivo donde se guarda la versión (default: `version.txt`)
- `SEMREL_PATH_CHANGELOG`: Ruta al archivo CHANGELOG (default: `CHANGELOG.md`)
- `SEMREL_COMMENT_COMMIT`: Mensaje del commit de release (default: automático)
- `SEMREL_PRERELEASE_TRUNK_TAG`: Tag para prelanzamientos en trunk (ej: `beta`)
- `SEMREL_PRERELEASE_BETA_TAG`: Tag para rama beta
- `SEMREL_PRERELEASE_ALPHA_TAG`: Tag para rama alpha
- `SEMREL_LTS_TYPE`: Tipo de soporte LTS (`major` o `minor`)
- `SEMREL_CUSTOM_NAME_STABLE`: Patrón personalizado para ramas stable

3. **Configurar secretos necesarios**:

El workflow requiere acceso a una GitHub App con los permisos adecuados. Configura los siguientes secretos en tu repositorio:

- `SEMREL_GITHUB_APP_ID`: ID de tu GitHub App
- `SEMREL_GITHUB_APP_PRIVATE_KEY`: Clave privada de tu GitHub App

Para crear una GitHub App:
1. Ve a Settings → Developer settings → GitHub Apps → New GitHub App
2. Otorga los permisos: `contents: write`, `issues: write`, `pull-requests: write`
3. Genera una clave privada
4. Instala la App en tu organización/repositorio

### Flujo de Trabajo Completo

Una vez configurado, el workflow se ejecuta automáticamente cuando:
- Se hace push a las ramas configuradas (`trunk`, `main`, `stable/**`, etc.)
- Los cambios no están en rutas ignoradas (como `docs/**`)
- El modo no está configurado como `disabled`

### Ejemplo con Modo Standard

Configura las propiedades del repositorio:
- `SEMREL_MODE=standard`
- `SEMREL_VERSION=latest`

**Flujo de trabajo:**
1. Haz commits siguiendo Conventional Commits
2. Al hacer push a `trunk`, el workflow analiza los commits
3. Si encuentra un tipo de release válido, crea automáticamente:
   - Nueva versión en `version.txt`
   - Entrada en CHANGELOG
   - GitHub Release con notas de la versión
   - Tag de git

### Ejemplo con Modo Issue-Label

Configura las propiedades del repositorio:
- `SEMREL_MODE=issue-label`
- `SEMREL_VERSION=latest`

**Flujo de trabajo:**
1. Crea un issue con una etiqueta `c:*` (ej: `c:new-feature`)
2. Crea un PR que referencie el issue en la descripción (ej: `Closes #123`)
3. Al hacer merge del PR a `trunk`:
   - El workflow lee la etiqueta del issue
   - Crea un commit vacío con el tipo correspondiente
   - Ejecuta semantic-release para crear la versión
   - Opcionalmente cierra el issue si se usó una keyword de cierre

## 🌿 Ramas Soportadas

### Ramas principales:
- `trunk` / `main` / `master` / `facade`: Ramas de desarrollo principal
- `stable/X.Y.x` o `stable/X.x`: Ramas de mantenimiento LTS (se crean automáticamente)

### Ramas de prelanzamiento:
- `alpha`: Prelanzamientos alpha
- `beta`: Prelanzamientos beta
- `next`: Siguiente versión menor
- `next-major`: Siguiente versión mayor

## 🔧 Características Avanzadas

### Creación Automática de Ramas LTS

Cuando se configura `SEMREL_LTS_TYPE`, el sistema crea automáticamente ramas de mantenimiento:

- `SEMREL_LTS_TYPE=major`: Crea ramas `stable/X.x` en releases MAJOR
- `SEMREL_LTS_TYPE=minor`: Crea ramas `stable/X.Y.x` en releases MAJOR o MINOR

### Personalización del CHANGELOG

El CHANGELOG generado incluye:
- Tipo de cambio traducido al español
- Enlaces a commits y Pull Requests
- Autor de cada cambio
- Agrupación por módulo/scope
- Formato personalizado según el tipo de release

### Límite de Notas de Release

Para evitar superar el límite de la API de GitHub (125,000 caracteres), las notas de release se truncan automáticamente si exceden este tamaño.

## 📦 Releases del Proyecto

Los archivos de configuración se distribuyen como un archivo ZIP adjunto a los releases de GitHub. El workflow descarga automáticamente estos archivos según la versión especificada.

## 🔒 Permisos Requeridos

El workflow requiere los siguientes permisos:
- `contents: write` - Para crear releases y commits
- `issues: write` - Para comentar en issues
- `pull-requests: write` - Para comentar en PRs
- `id-token: write` - Para OIDC/npm provenance

## 📚 Referencias

- [Semantic Release](https://github.com/semantic-release/semantic-release)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)

## 👥 Contacto

Oficina Open Source - Bancolombia  
📧 oficina_open_source@bancolombia.com.co
