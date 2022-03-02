/**
 * Model that shows a list of validation errors of a .ttl file.
 */
export class SemanticError {
  constructor(
    public resultMessage: string,
    public focusNode: string,
    public resultPath: string,
    public resultSeverity: string,
    public value: string
  ) {}
}

export class SyntacticError {
  constructor(public originalExceptionMessage: string, public lineNumber: number, public columnNumber: number) {}
}

export class ProcessingError {
  constructor(public message: string) {}
}
