# Aspect Model Editor Code Conventions
The following document contains a compilation of conventions and guidelines to format, structure and write code for the
SDS Aspect Model Editor.

## General Conventions
Our code conventions are based on the [Google Typescript Style Guide](https://google.github.io/styleguide/tsguide.html) but
detailed and adjusted for the needs of the SDS Aspect Model Editor.

## Copyright header
See [CONTRIBUTING](CONTRIBUTING.md)

## Code Recommendations

This project uses the library [Prettier](https://www.npmjs.com/package/prettier) and should also be created with it, so that a clear code can be created.

## Documentation

### Developer Documentation
Developer documentation is put into a README.md placed in the project root. This should contain documentation like:
* Checking out the source code and getting it to run/build
* Mandatory (external system) dependencies and how to set them up (e.g. databases)
* Configuration options and how to apply them
* General important concepts that are relevant to working on the project but are not directly obvious from the source code
  itself. Links to further readings and information, e.g. wiki or other external sources.

### User documentation
User documentation (this includes technical documentation on how to use an application or tool from the Aspect Model Editor) should be on
its own.
It is written in AsciiDoc, rendered with [Antora](https://antora.org) and the generated static content is
publically hosted for direct user access.
The source files of the documentation are placed in a subfolder /documentation from the project root.
Documentation is structured so that it can be processed by Antora. This e.g. involves structuring the documentation files
according to [Antora's specification](https://docs.antora.org/antora/2.3/organize-content-files/) and organizing resources
so that Antora [can handle them](https://docs.antora.org/antora/2.3/page/resource-id/).
[AsciiDoc's syntax](https://docs.antora.org/antora/2.3/asciidoc/asciidoc/) is pretty close to Markdown, however it is
way more targeted towards writing fully fledged documents and with its multitude of backends (HTML, PDF, ...) it is a
very good source format.
Publishing is realized by means of [Github pages](https://docs.antora.org/antora/2.3/publish-to-github-pages/).

### High Level Documentation
Technical documentation targeted towards components and architecture should be accessible via the developer documentation.
Corresponding discussions on design etc. can be placed in the project wiki on
[Github](https://github.com/OpenManufacturingPlatform/sds-aspect-model-editor/wiki).
