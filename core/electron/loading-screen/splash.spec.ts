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

import {describe, it, expect, beforeEach} from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import {JSDOM} from 'jsdom';

describe('splash.html', () => {
  let document: Document;

  beforeEach(() => {
    const html = fs.readFileSync(path.join(__dirname, 'splash.html'), 'utf-8');
    const dom = new JSDOM(html);
    document = dom.window.document;
  });

  describe('document structure', () => {
    it('should have a valid html element', () => {
      expect(document.documentElement).not.toBeNull();
    });

    it('should have a head element', () => {
      expect(document.head).not.toBeNull();
    });

    it('should have a body element', () => {
      expect(document.body).not.toBeNull();
    });

    it('should have the title "Loading..."', () => {
      expect(document.title).toBe('Loading...');
    });
  });

  describe('loader element', () => {
    it('should contain a .loader div', () => {
      const loader = document.querySelector('.loader');

      expect(loader).not.toBeNull();
      expect(loader!.tagName.toLowerCase()).toBe('div');
    });
  });

  describe('text element', () => {
    it('should contain a .text paragraph', () => {
      const text = document.querySelector('.text');

      expect(text).not.toBeNull();
      expect(text!.tagName.toLowerCase()).toBe('p');
    });

    it('should contain the loading message text', () => {
      const text = document.querySelector('.text');

      expect(text!.textContent).toContain('Loading Aspect Model Editor...');
    });

    it('should contain an img inside .text', () => {
      const img = document.querySelector('.text img');

      expect(img).not.toBeNull();
    });

    it('should have the correct alt text on the icon image', () => {
      const img = document.querySelector('.text img') as HTMLImageElement;

      expect(img.alt).toBe('Aspect Model Editor Icon');
    });

    it('should have a base64 encoded src on the icon image', () => {
      const img = document.querySelector('.text img') as HTMLImageElement;

      expect(img.src).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('styles', () => {
    it('should contain a style element in the head', () => {
      const style = document.querySelector('head style');

      expect(style).not.toBeNull();
    });

    it('should define body styles', () => {
      const style = document.querySelector('head style');

      expect(style!.textContent).toContain('body');
    });

    it('should define .loader styles', () => {
      const style = document.querySelector('head style');

      expect(style!.textContent).toContain('.loader');
    });

    it('should define .text styles', () => {
      const style = document.querySelector('head style');

      expect(style!.textContent).toContain('.text');
    });

    it('should define the spin keyframe animation', () => {
      const style = document.querySelector('head style');

      expect(style!.textContent).toContain('@keyframes spin');
    });

    it('should set background-color on body', () => {
      const style = document.querySelector('head style');

      expect(style!.textContent).toContain('background-color');
    });

    it('should define border-radius on .loader (circular shape)', () => {
      const style = document.querySelector('head style');

      expect(style!.textContent).toContain('border-radius: 50%');
    });

    it('should define animation on .loader', () => {
      const style = document.querySelector('head style');

      expect(style!.textContent).toContain('animation: spin');
    });
  });

  describe('element counts', () => {
    it('should have exactly one .loader element', () => {
      const loaders = document.querySelectorAll('.loader');

      expect(loaders.length).toBe(1);
    });

    it('should have exactly one .text element', () => {
      const texts = document.querySelectorAll('.text');

      expect(texts.length).toBe(1);
    });

    it('should have exactly one img element', () => {
      const images = document.querySelectorAll('img');

      expect(images.length).toBe(1);
    });
  });
});
