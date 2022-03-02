import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MxGraphAttributeService,
  MxGraphGeometryProviderService,
  MxGraphService,
  MxGraphSetupService,
  MxGraphShapeOverlayService,
  MxGraphShapeSelectorService,
} from './services';

@NgModule({
  providers: [
    MxGraphAttributeService,
    MxGraphGeometryProviderService,
    MxGraphService,
    MxGraphSetupService,
    MxGraphShapeOverlayService,
    MxGraphShapeSelectorService,
  ],
  exports: [],
  imports: [CommonModule],
})
export class MxGraphModule {}
