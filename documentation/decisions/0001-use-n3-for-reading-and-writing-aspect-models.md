# Use n3 for reading and writing aspect models

## Context and Problem Statement

In order to construct a valid Aspect Model using Turtle Syntax, the graph generated needs to be transformed within the framework.

_A graph necessitates resolving the following elements:_

* Blank Nodes: Refer to new graph links that need resolution.
* rdf:rest and rdf:first: These are utilized for crafting descriptions of lists and similar structures.
* rdf:nil: Represents an empty list or similar structure.
The purpose of this design decision is to determine the most suitable converter capable of addressing these issues efficiently and operating stably without requiring further modifications.

## Considered Options

### [RdfJs N3 parser](https://github.com/rdfjs/N3.js)

This is an RDF library designed for JavaScript. It comes equipped with dedicated readers and writers specifically for Turtle models, allowing for the creation of Turtle files using its writer functionality. However, it lacks a formatter for Turtle files.

_Advantages:_

* All logic is fully contained within the frontend, maintaining a clear separation from the backend.
* The system is capable of creating Turtle files independently, with no reliance on the backend.

_Disadvantages:_

* There might be potential performance issues within the browser.
* The required extensive custom code for conversion could be prone to errors → may lead to bugs!
* The absence of a formatter can make the Turtle challenging to interpret for the user.

#### Effort

Currently, no additional effort is needed since it’s already implemented. However, quantifying the effort to address potential bugs that might arise is challenging.

#### Risks clearly

There's a noticeable risk of encountering bugs due to the customized nature of the converter, as it might lack implementations for some options.

### [RDF Parse](https://github.com/rubensworks/rdf-parse.js)

This is an RDF library for JavaScript utilizing N3. It possesses parsing capabilities for creating Turtle models but lacks a formatter for Turtle files.

_Advantages:_

* All logic is seamlessly integrated into the frontend, eliminating dependency on the backend for Turtle file creation.
* This library is comparatively lighter than N3, enhancing efficiency.

_Disadvantages:_

* The browser might encounter performance bottlenecks.
* Utilization of RDF Parse mandates the inclusion of N3 code.
* The necessity for extensive custom code for conversion can be a breeding ground for bugs.
* The absence of a formatter may hinder user experience, as it renders Turtle files somewhat cryptic and challenging to read.

#### Risks clearly

There exists an inherent risk of bugs stemming from the converter's customized nature, potentially due to the lack of implementation of some options.

## Decision Outcome

After evaluating the available options, we have decided to employ the N3 library due to its comprehensive feature set for handling Turtle models and its seamless integration into the frontend, thus allowing for enhanced development flexibility and user experience.
