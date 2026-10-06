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

import {Page, Request, expect} from '@playwright/test';
import {FORMAT_API_URL} from './api-mocks';

/** Extracts the Turtle content of the multipart request sent to the format endpoint. */
export function extractTurtleFromFormatRequest(request: Request): string {
  const body = request.postDataBuffer()?.toString('utf-8') ?? '';
  const start = body.indexOf('\r\n\r\n');
  if (start < 0) return body;
  const end = body.lastIndexOf('\r\n--');
  return body.slice(start + 4, end > start ? end : undefined);
}

/**
 * Simulates the ESMF SDK formatter, which ignores the order of the source file: the statements are returned in reverse
 * alphabetical order of their subjects (the prefixes stay on top).
 */
export function shuffleTurtleStatements(turtle: string): string {
  const prefixes: string[] = [];
  const statements: string[][] = [];
  for (const line of turtle.split('\n')) {
    if (line.startsWith('@prefix')) {
      prefixes.push(line);
    } else if (/^\S/.test(line)) {
      statements.push([line]);
    } else if (statements.length && line.trim()) {
      statements[statements.length - 1].push(line);
    }
  }
  const blocks = statements.map(lines => lines.join('\n')).sort((a, b) => b.localeCompare(a));
  return `${prefixes.join('\n')}\n\n${blocks.join('\n\n')}\n`;
}

/**
 * WebKit does not expose the content of Blobs in multipart request bodies to Playwright. This remembers the last Blob
 * appended to a FormData in the page, so the mocked backend can read it in every browser.
 */
function captureFormDataBlobs(): void {
  const w = window as any;
  if (w.__ameFormDataPatched) return;
  w.__ameFormDataPatched = true;
  const append = FormData.prototype.append;
  FormData.prototype.append = function (this: FormData, name: string, value: any, ...rest: any[]) {
    if (value instanceof Blob) {
      w.__ameLastFormDataBlob = value.text();
    }
    return (append as any).call(this, name, value, ...rest);
  } as any;
}

async function formatRequestTurtle(page: Page, request: Request): Promise<string> {
  const turtle = extractTurtleFromFormatRequest(request);
  if (turtle.trim()) return turtle;
  return page.evaluate(() => (window as any).__ameLastFormDataBlob ?? '');
}

/** Routes the format endpoint to a formatter which reorders the statements (like the real backend does). */
export async function routeShufflingFormatter(page: Page): Promise<string[]> {
  const requests: string[] = [];
  await page.addInitScript(captureFormDataBlobs);
  await page.evaluate(captureFormDataBlobs).catch(() => {});
  await page.route(FORMAT_API_URL, async route => {
    const turtle = await formatRequestTurtle(page, route.request());
    requests.push(turtle);
    await route.fulfill({status: 200, contentType: 'text/plain', body: shuffleTurtleStatements(turtle)});
  });
  return requests;
}

export const textViewContent = (page: Page) => page.getByTestId('text-view-content');

export async function openTextView(page: Page): Promise<void> {
  // notifications (toasts) may lie above the toggle
  await page.getByTestId('editor-view-text').locator('button').dispatchEvent('click');
  await expect(page.getByTestId('canvas-area')).toHaveAttribute('data-view-mode', 'text');
  await expect(textViewContent(page)).toBeVisible();
}

export async function openGraphView(page: Page): Promise<void> {
  await page.getByTestId('editor-view-graph').locator('button').dispatchEvent('click');
  await expect(page.locator('#graph')).toBeVisible();
}

/** The text of the read-only Turtle editor (CodeMirror renders one element per line). */
export async function getTextViewText(page: Page): Promise<string> {
  await expect(page.getByTestId('text-view-loading')).toHaveCount(0);
  return page.locator('.cm-content .cm-line').evaluateAll(lines => lines.map(line => line.textContent ?? '').join('\n'));
}

/** Local names of the subjects in the order in which they are written, e.g. [':AspectDefault', ':property1']. */
export function subjectOrder(turtle: string): string[] {
  return [...turtle.matchAll(/^(\S*:\S+)\s+a\s/gm)].map(match => match[1]);
}

export function countOccurrences(text: string, search: string | RegExp): number {
  const regex = typeof search === 'string' ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : search;
  return [...text.matchAll(regex)].length;
}
