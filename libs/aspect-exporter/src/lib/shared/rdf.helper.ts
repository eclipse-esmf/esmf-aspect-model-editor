export class RdfHelper {
  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  static isString(value) {
    return typeof value === 'string' || (typeof value === 'object' && value.constructor === String);
  }

  static isNumber(value) {
    return typeof value === 'number' || (typeof value === 'object' && value.constructor === Number);
  }
}
