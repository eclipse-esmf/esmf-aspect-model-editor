# Code Overview

## Table of Contents

- [Technologies](#technologies)
- [Project architecture](#project-architecture)
- [Code key points](#code-key-points)
- [how `model-loader.service.ts` works](#how-model-loaderservicets-works)

## Technologies

To start contributing you need to have a basic knowledge about:

- [Resource Description Framework (RDF)](https://www.w3.org/RDF/)
- [n3.js](https://rdf.js.org/N3.js/)
  - [N3 Parser](https://rdf.js.org/N3.js/docs/N3Parser.html) - Parses an RDF string into quads which can be stores into a N3 Store
  - [N3 Store](https://rdf.js.org/N3.js/docs/N3Store.html) - Place where to CRUD the quads parsed from an DRF or created
  - [N3 Writer](https://rdf.js.org/N3.js/docs/N3Writer.html) - Takes a N3 Store and parses it into RDF text
  - [N3 Util](https://rdf.js.org/N3.js/docs/N3Util.html) - Utils to easy work with what n3 and RDF offers
- [SAMM](https://eclipse-esmf.github.io/samm-specification/2.2.0/index.html) - Library upon RDF
- MxGraph - Library to create interactive UI graphs
  - [Deprecated Github Repository](https://github.com/jgraph/mxgraph?tab=readme-ov-file) - here can be fund examples on how things are done
  - [MaxGraph Github Repository](https://github.com/maxGraph/maxGraph) - this repository is open source and was taken by the community. The progress is slow but at least there is a progress
- [Aspect Model Loader]() - _Documentation to be made_
- [Electron](https://www.electronjs.org/docs/latest/) - Technology used to run a frontend application as a native desktop application

## Project architecture

_This project was created using Nx and Angular as the base frontend framework, so the file structure is nothing out of the ordinary for an Angular Dev._

The application files are located in the `core` folder. Inside this folder any command can be run.

The main structure of interest is

- core
  - apps
- ame
  - electron-libs
  - libs
    - aspect-explorer
    - aspect-model-loader _(library extracted from [Aspect Model Loader]() which will be removed in the future from this project and be imported as a npm library)_
    - cache
      - src/lib
        - [loaded-files.service.ts](#loaded-filesservicets)
    - connection
      - src/lib
        - multi-shape-connection-handlers
        - single-shape-connection-handlers
    - editor
    - instantiator _(will be removed and it's files will be moved in other appropriate service)_
    - loader-filters
    - meta-model _(which is not an appropriate name now. it's contents should be moved or the library renamed)_
    - mx-graph
    - namespace-manager
    - rdf _(should be checked and if possible, removed)_
    - settings-dialog
    - shared
    - sidebar
    - vocabulary _(should be removed)_

### apps -> ame

Contains only the container type components and the routing system

### electron-libs

Contains all scripts related to electron. From application start to menus, creating new windows and communication with the angular application.
The scripts are somehow basic for an electron application, so nothing out of the ordinary from what is found in [Electron](https://www.electronjs.org/docs/latest/) documentation.

### libs -> aspect-explorer

- `rdf-list` contains helper functions to create rdf:list types in RDF (N3 Store). It was created to work with SAMM elements
- `rdf-node` contains helper functions to add new entries in N3 Store. It was created to work with SAMM elements
- `visitor` contains services designed to export SAMM elements in rdf format. Every service handles it's element and it's children

### libs -> loaded-files.service.ts

This service it's a cache for the loaded files. It contains helper functions based on the loaded files and the elements inside those. Every file is of type `NamespaceFile`.

`NamespaceFile` keeps track of the elements inside the file, elements inside the N3 Store, name and namespace.

### libs -> connection

- `multi-shape-connection-handlers` contains the services responsible with the connection between 2 elements in MxGraph and in the elements from `aspect-model-loader`
- `single-shape-connection-handlers` contains the services responsible for the +(plus) button from an MxGraph element.

### libs -> editor

Besides the dialog components there are 2 main section from the interface

1. `editor-dialog` which contains the forms from the right sidebar when an element is double clicked
2. `editor-toolbar` which contains the functionalities from the toolbar, like exports...

### libs -> loader-filters

This library contains the functionalities for the filtered graphs.

- One of the filters is `property-filter` which displays only `properties` and `entities`.
- The `default-filter` is the base one where all elements are displayed

### libs -> mxGraph

- `services -> render-models`: services used when an element is updated.
- `mx-graph.service.ts`: services which services as a wrapper for mxGraph with functionalities created for SAMM elements
- `mx-graph-shape-overlay.service.ts`: service which creates and updates the `+` button(s) from an element
- `mx-graph-setup.service.ts`: this services serve a an init for mxGraph. Sets the layout and the boundaries of the graph scene
- `mxgraph-renderer.service.ts`: used when a model is loaded. It is based on BFS to get on every element and render them and their connections

### namespace-manager

- this library is about the components used for exporting and importing namespaces from and in workspace

### sidebar

- here resides all functionalities regarding workspace and new elements

## Code key points

### URN, aspectModelUrn

- as described in [SAMM documentation](https://eclipse-esmf.github.io/samm-specification/2.2.0/index.html) it has the following structure
  ```
  urn:samm:<namespace>:<version>#<element-name>
  ```

### Namespace in AME

- in Aspect Model Editor and possibly in Aspect Model Loader the term namespace refers at the combination between SAMM namespace and SAMM version `<namespace>`:`<version>`

### absoluteName _(deprecated)_

- this naming and the use of it's value is semi-deprecated because with the introduction of SAMM Java SDK 2.2.0, the file handling is done using `aspectModelUrn`
- absoluteName is a combination between SAMM `namespace`, `version` and `file name` so the final form should be
  `<namespace>`:`<version>`:`<file-name>.ttl`

### Isolated element

- an isolated element is an element which doesn't belong to the main structure (where the aspect is the root) and doesn't have a parent

### Blank nodes or anonymous nodes

- blank nodes are elements without a name
- these elements usually have as a subject in n3 `_n3:<number>`
- in a turtle file they are represented as follows

  ```
  # the element beginning and ending with square brackets is an anonymous node (or blank node).
  samm:characteristic a [
    a samm-c:SingleEntity ;
    samm:preferredName "spatial position characteristic"@en ;
    samm:description "Represents a single position in space with optional z coordinate."@en ;
    samm:dataType :SpatialPosition
  ].

  # n3 representation would look like
  samm:characteristic a _n3:43 .

  _n3:43 a samm-c:SingleEntity ;
    samm:preferredName "spatial position characteristic"@en ;
    samm:description "Represents a single position in space with optional z coordinate."@en ;
    samm:dataType :SpatialPosition .
  ```

### RDF lists

```
# how it's in SAMM
:entityName samm:properties ( :property1 property2 ) .

# how it's represented in rdf n3
:entityName samm:properties _n3:20 .

_n3:20 rdf:first :property1;
       rdf:rest _n3:21 .

_n3:21 rdf:first :property2;
       rdf:rest rdf:nil .
```

## how `model-loader.service.ts` works

- for models which doesn't import elements from other models
  1. The file content is parsed by aspect-model-loader and creates the elements (DefaultAspect, DefaultProperty, etc...)
  2. A `NamespaceFile` model is created and saved in `LoadedFilesService`
  3. If there are isolated elements, they are loaded and saved in cache
  4. The structure(s) are passed to renderer
  5. The model is rendered
- for models which imports elements from other models
  1. The file is parsed and the namespaces are extracted
  2. Filters the models by namespace and the external elements
  3. The content from current file and the imports files are passed all together to aspect-model-loader to create a single `RdfModel` and a single cache. Lets call them `main rdfModel` and `main cache`
  4. In the same time, a `RdfModel` is created for each file separately using aspect-model-loader
  5. By intersecting the data from the `main rdfModel` and the file `rdfModel` a `NamespaceFile` is created for each loaded file with a separate `rdfModel` and a separate `cache`
  6. If there are isolated elements in current file, they are loaded and saved in cache
  7. The structure(s) from current file are passed to renderer
  8. The model is rendered with the external elements only
