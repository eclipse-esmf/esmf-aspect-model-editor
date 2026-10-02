/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

export abstract class DraggablePort {
  abstract makeDraggable(element: HTMLDivElement, dragElement: HTMLDivElement): void;
}

export abstract class InformationHandlingPort {
  abstract openSettingsDialog(): void;
  abstract openHelpDialog(): void;
  abstract openNotificationDialog(): void;
}

/** Opens the settings dialog. Implemented by the settings feature. */
export abstract class SettingsDialogPort {
  abstract open(): void;
}

export abstract class ShapeSettingsPort {
  abstract editModel(elementModel: any): void;
  abstract editSelectedCell(): void;
}

export abstract class ShapeSettingsStatePort {
  abstract isShapeSettingOpened(): boolean;
  abstract closeShapeSettings(): void;
}

export abstract class GraphSettingsPort {
  abstract formatShapes(enableHierarchicalLayout?: boolean): void;
  abstract updateGraph(callback: () => void): void;
  abstract removeUnnecessaryLanguages(languages: string[]): void;
}
