import {Injectable} from '@angular/core';
import {MxGraphService} from '@bame/mx-graph';
import {RdfModel} from '@bame/rdf/utils';
import {ConfigurationService, Settings} from '@bame/settings-dialog';
import {SemanticError, SyntacticError, ProcessingError, NotificationsService} from '@bame/shared';

@Injectable({
  providedIn: 'root',
})
export class ModelValidatorService {
  private settings: Settings;

  constructor(
    private mxGraphService: MxGraphService,
    private configurationService: ConfigurationService,
    private notificationsService: NotificationsService
  ) {
    this.settings = this.configurationService.getSettings();
    this.notificationsService.clearNotifications();
  }
  /*
   * This method will return true if at least one error is critical, otherwise false.
   * In this category are included structural errors.
   */
  checkForCriticalErrors(validationErrors: Array<SemanticError | SyntacticError | ProcessingError>, rdfModel: RdfModel): boolean {
    const metaModelNames = rdfModel.BAMMC().getMetaModelNames();
    const criticalErrors = validationErrors.filter((error: any) => error?.resultMessage && metaModelNames.includes(error.resultPath));

    return criticalErrors.length !== 0;
  }

  /*
   * Informs user about the errors that are correctable.
   * In this category are included syntactic,processing and semantic errors.
   */
  notifyCorrectableErrors(validationErrors: Array<SemanticError | SyntacticError | ProcessingError>): void {
    validationErrors.forEach((error: any) => {
      if (error.originalExceptionMessage) {
        this.notifySyntacticError(error);
      } else if (error.message) {
        this.notifyProcessingError(error);
      } else {
        this.notifySemanticError(error);
      }
    });
  }

  private notifySyntacticError(error: SyntacticError) {
    this.notificationsService.validationError(error.originalExceptionMessage);
  }

  private notifyProcessingError(error: ProcessingError) {
    this.notificationsService.validationError(error.message);
  }

  private notifySemanticError(error: SemanticError) {
    this.notificationsService.validationError(
      `Error on element ${error.focusNode ? error.focusNode.split('#')[1] + ': ' + error.resultMessage : error.resultMessage}`,
      null,
      `editor/select/${error.focusNode}`,
      5000,
      !this.settings.showValidationPopupNotifications
    );
    this.mxGraphService.showValidationErrorOnShape(error.focusNode);
  }
}
