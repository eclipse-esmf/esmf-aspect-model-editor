import {AbstractControl, FormControl} from '@angular/forms';
import {NamespacesCacheService} from '@bame/cache';
import {BaseMetaModelElement} from '@bame/meta-model';
import {RFC2141} from 'urn-lib';
import {DataFactory} from 'n3';
import {RdfModel} from '@bame/rdf/utils';

export class EditorDialogValidators {
  static namingLowerCase(control: AbstractControl) {
    if (!control?.value) {
      return null;
    }
    return /^(\b[a-z]+[a-zA-Z0-9]*)$/.test(control?.value) ? null : {namingLowerCase: true}; //NOSONAR
  }

  static namingUpperCase(control: FormControl) {
    if (!control?.value) {
      return null;
    }

    return /^(\b[A-Z]+[a-zA-Z0-9]*)$/.test(control?.value) ? null : {namingUpperCase: true}; //NOSONAR
  }

  static disabled(control: FormControl) {
    return control?.disabled ? null : {disabled: true};
  }

  static seeURI(control: AbstractControl) {
    if (!control?.value) {
      return null;
    }

    const uriRegEx = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

    const invalidUris: string[] = [];
    let elementsCount = 0;
    control.value.split(',').forEach((value: string) => {
      const parsed = RFC2141.parse(value.trim());
      const validUrn = parsed ? RFC2141.validate(parsed) === null : false;
      const validUrl = uriRegEx.test(value.trim());
      if (!(validUrl || validUrn)) {
        invalidUris.push(value);
      }
      elementsCount++;
    });

    return invalidUris.length > 0
      ? {
          uri: {invalidUris: invalidUris, elementsCount: elementsCount},
        }
      : null;
  }

  static duplicateName(
    namespaceCacheService: NamespacesCacheService,
    metaModelElement: BaseMetaModelElement,
    extRdfModels: Array<RdfModel>
  ) {
    return (control: FormControl) => {
      if (!control?.value) {
        return null;
      }

      if (control.value === metaModelElement.name) {
        return null;
      }

      const nameSpace = metaModelElement.aspectModelUrn?.split('#')[0] + '#';
      const aspectModelUrn = `${nameSpace}${control.value}`;

      const modelElementDefinedInExtRefCachedFile = extRdfModels.find(rdfModel =>
        rdfModel.store.getSubjects(null, DataFactory.literal(control.value), null).find(sub => sub.value === aspectModelUrn)
      );

      if (modelElementDefinedInExtRefCachedFile) {
        return {
          checkShapeNameExtRef: true,
        };
      }

      const modelElementDefinedInCurrentCachedFile = namespaceCacheService
        .getCurrentCachedFile()
        .getEitherElement<BaseMetaModelElement>(aspectModelUrn);

      return modelElementDefinedInCurrentCachedFile && modelElementDefinedInCurrentCachedFile.name !== metaModelElement.name
        ? {
            checkShapeName: true,
          }
        : null;
    };
  }

  static noWhiteSpace(control: FormControl) {
    if (!control?.value) {
      return null;
    }
    const isWhitespace = control.value.indexOf(' ') >= 0;
    return isWhitespace ? {whitespace: true} : null;
  }

  static duplicateNameString(namespacesCacheService: NamespacesCacheService, namespace: string) {
    return (control: FormControl) => {
      if (!control?.value) {
        return null;
      }
      const aspectModelUrn = `${namespace}#${control.value}`;
      return namespacesCacheService.getCurrentCachedFile().getCachedElement<BaseMetaModelElement>(aspectModelUrn)
        ? {
            checkShapeName: true,
          }
        : null;
    };
  }

  static requiredObject(control: AbstractControl) {
    if (!control?.value) {
      return {
        required: true,
      };
    }
    return null;
  }

  static regexValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }

    try {
      new RegExp(control.value);
      return null;
    } catch (e: any) {
      const splitMessage = e?.message?.split(':');
      return {
        regexValidator: {
          message: `${splitMessage[0]}:${splitMessage[2]}`,
        },
      };
    }
  }
}
