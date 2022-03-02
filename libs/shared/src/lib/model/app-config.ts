import {CoreConfig} from '@bci-web-core/core';

/**
 * A Configuration class which extends CoreConfig
 */
export class AppConfig extends CoreConfig {
  constructor(
    public environment: string,
    public bameService: string,
    public editorConfiguration: string,
    public assetLocation: string,
    public oldMinBammVersion: string,
    public oldMaxBammVersion: string,
    public minBammVersion: string,
    public currentBammVersion: string,
    public copyrightYear: string
  ) {
    super();
  }
}
