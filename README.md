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
- `c:bug` → `fixpatchrelease` → PATCH release
- `c:vulns` → `securitypatchrelease` → PATCH release (seguridad)
- `c:new-feature` → `featurerelease` → MINOR release
- `c:breaking-change` → `breakingrelease` → MAJOR release

## 📝 Cómo Usar

### Configuración Básica

1. **Crear un workflow en tu repositorio** (`.github/workflows/release.yml`):

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
  contents: write 
  issues: write 
  pull-requests: write 
  id-token: write 

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
```

2. **Configurar propiedades del repositorio** (opcionales):

Las siguientes propiedades se pueden configurar en el repositorio de GitHub:

- `SEMREL_FILE_VER`: Archivo donde se guarda la versión (default: `version.txt`)
- `SEMREL_PATH_CHANGELOG`: Ruta al archivo CHANGELOG (default: `CHANGELOG.md`)
- `SEMREL_COMMENT_COMMIT`: Mensaje del commit de release (default: automático)
- `SEMREL_PRERELEASE_TRUNK_TAG`: Tag para prelanzamientos en trunk (ej: `beta`)
- `SEMREL_PRERELEASE_BETA_TAG`: Tag para rama beta
- `SEMREL_PRERELEASE_ALPHA_TAG`: Tag para rama alpha
- `SEMREL_LTS_TYPE`: Tipo de soporte LTS (`major` o `minor`)
- `SEMREL_CUSTOM_NAME_STABLE`: Patrón personalizado para ramas stable

3. **Configurar secretos necesarios**:

El workflow requiere acceso a:
- `APP_ID_TOOLKIT_INNERSOURCE`: ID de la GitHub App
- `APP_PRIVATEKEY_TOOLKIT_INNERSOURCE`: Clave privada de la GitHub App

### Ejemplo con Modo Standard

```yaml
on:
  push:
    branches:
      - trunk

jobs:
  release:
    uses: bancolombia/semantic-release-reusable-workflows/.github/workflows/tool-semantic-release.yaml@trunk
    with:
      semantic_version: "latest"
      semantic_release_mode: "standard"
    secrets: inherit
```

**Flujo de trabajo:**
1. Haz commits siguiendo Conventional Commits
2. Al hacer push a `trunk`, el workflow analiza los commits
3. Si encuentra un tipo de release válido, crea automáticamente:
   - Nueva versión en `version.txt`
   - Entrada en CHANGELOG
   - GitHub Release con notas de la versión
   - Tag de git

### Ejemplo con Modo Issue-Label

```yaml
on:
  push:
    branches:
      - trunk

jobs:
  release:
    uses: bancolombia/semantic-release-reusable-workflows/.github/workflows/tool-semantic-release.yaml@trunk
    with:
      semantic_version: "latest"
      semantic_release_mode: "issue-label"
    secrets: inherit
```

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
