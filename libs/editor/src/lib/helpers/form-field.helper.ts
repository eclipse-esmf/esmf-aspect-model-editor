import {DefaultEntity, DefaultEnumeration, DefaultProperty, DefaultTrait, Property} from '@bame/meta-model';

export class FormFieldHelper {
  public static isComplexProperty(property: Property): boolean {
    if (property?.characteristic instanceof DefaultTrait) {
      return property?.characteristic?.baseCharacteristic?.dataType instanceof DefaultEntity;
    }
    return property?.characteristic?.dataType instanceof DefaultEntity;
  }

  public static isEnumerationProperty(property: DefaultProperty): boolean {
    if (property?.characteristic instanceof DefaultTrait) {
      return property?.characteristic?.baseCharacteristic instanceof DefaultEnumeration;
    }
    return property?.characteristic instanceof DefaultEnumeration;
  }
}
