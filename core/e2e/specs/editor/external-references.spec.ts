import {expect, Page, test} from '@playwright/test';
import {
  API_BASE_URL,
  MODELS_API_ROUTE,
  NAMESPACES_URL,
  SAMM_VERSION_ACTUAL,
  setUpDefaultRoutes,
  VALIDATE_API_URL,
} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_workspaceBtn} from '../../support/constants';

/**
 * Regression tests for elements referenced from other Aspect Model files.
 *
 * AME only loads the directly referenced elements (and the files those elements depend on one level deeper);
 * deeper validation is done recursively by the SDK in the backend. These tests make sure that such
 * references are shown as external elements and never turn into local elements of the opened model.
 */

const head = (ns: string, extra = '') => `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
${extra}@prefix : <urn:samm:${ns}:1.0.0#> .
`;

const ASPECT_A =
  head('org.a', '@prefix b: <urn:samm:org.b:1.0.0#> .\n') +
  ':AspectA a samm:Aspect ; samm:properties ( b:propB ) ; samm:operations ( ) ; samm:events ( ) .\n';
const FILE_B = head('org.b', '@prefix c: <urn:samm:org.c:1.0.0#> .\n') + ':propB a samm:Property ; samm:characteristic c:CharC .\n';
const FILE_C_DEEP = head('org.c', '@prefix d: <urn:samm:org.d:1.0.0#> .\n') + ':CharC a samm-c:SingleEntity ; samm:dataType d:EntityD .\n';
const FILE_C_FLAT = head('org.c') + ':CharC a samm:Characteristic ; samm:dataType xsd:string .\n';
const FILE_D =
  head('org.d') + ':EntityD a samm:Entity ; samm:properties ( :propD ) .\n:propD a samm:Property ; samm:characteristic samm-c:Text .\n';

const SAME_NS_ASPECT =
  head('org.a') + ':AspectA a samm:Aspect ; samm:properties ( :propOther ) ; samm:operations ( ) ; samm:events ( ) .\n';
const SAME_NS_OTHER_FILE =
  head('org.a') +
  ':propOther a samm:Property ; samm:characteristic :CharOther .\n:CharOther a samm:Characteristic ; samm:dataType xsd:string .\n';

type WorkspaceFile = {namespace: string; fileName: string; content: string};

const files = (entries: Record<string, string>): WorkspaceFile[] =>
  Object.entries(entries).map(([namespace, content]) => ({namespace, fileName: `${namespace}.ttl`, content}));

/**
 * Mocks /models/batch like the backend: every requested URN is answered with the file that defines it.
 * Without `ignoreMissing=true` the whole request fails with 422 if an element is missing or if a returned file references
 * a namespace that is not in the workspace; with it, missing elements are skipped and such files are returned as they are.
 */
async function routeBatch(page: Page, workspace: WorkspaceFile[], ignoreMissingFlags: string[] = []): Promise<string[]> {
  const requested: string[] = [];
  const known = new Set(workspace.map(f => f.namespace));
  const referencesMissingNamespace = (content: string) =>
    [...content.matchAll(/<urn:samm:([\w.]+):\d/g)].some(
      ([, namespace]) => !namespace.startsWith('org.eclipse.esmf.samm') && !known.has(namespace),
    );
  await page.route(`**${API_BASE_URL}/models/batch**`, async route => {
    const ignoreMissing = new URL(route.request().url()).searchParams.get('ignoreMissing');
    ignoreMissingFlags.push(ignoreMissing);
    const entries = route.request().postDataJSON() as {aspectModelUrn: string}[];
    const result = [];
    for (const {aspectModelUrn} of entries) {
      requested.push(aspectModelUrn);
      const namespace = aspectModelUrn.replace('urn:samm:', '').split(':')[0];
      const localName = aspectModelUrn.split('#')[1];
      const file = workspace.find(f => f.namespace === namespace && f.content.includes(`:${localName} a `));
      if (file && (ignoreMissing === 'true' || !referencesMissingNamespace(file.content))) {
        result.push({
          aspectModelUrn,
          aspectModel: file.content,
          absoluteName: `${namespace}:1.0.0:${file.fileName}`,
          fileName: file.fileName,
          modelVersion: SAMM_VERSION_ACTUAL,
        });
      } else if (ignoreMissing !== 'true') {
        await route.fulfill({status: 422, json: {error: {code: 422, message: `Aspect Model not found for URN '${aspectModelUrn}'`}}});
        return;
      }
    }
    await route.fulfill({json: result});
  });
  return requested;
}

async function load(page: Page, workspace: WorkspaceFile[], model = ASPECT_A) {
  await setUpDefaultRoutes(page);
  const ignoreMissingFlags: string[] = [];
  const requested = await routeBatch(page, workspace, ignoreMissingFlags);
  const app = new AppHelper(page);
  await app.visitDefault(false);
  await app.loadModel(model);
  return {app, requested, ignoreMissingFlags};
}

const inspect = (page: Page) =>
  page.evaluate(() => {
    const loadedFiles = (window as any)['angular.LoadedFilesService'];
    const graph = (window as any)['angular.maxgraphAttributeService'].graph;
    const currentKeys: string[] = loadedFiles.currentLoadedFile.cachedFile.getKeys();
    const elements = loadedFiles.filesAsList
      .flatMap((f: any) => f.cachedFile.getKeys().map((key: string) => f.cachedFile.get(key)))
      .filter(Boolean)
      .map((el: any) => ({urn: el.aspectModelUrn as string, extern: loadedFiles.isElementExtern(el) as boolean}));
    const cells = graph.getChildCells(graph.getDefaultParent(), true, false).map((cell: any) => {
      const element = cell.getMetaModelElement?.()?.element;
      return {urn: element?.aspectModelUrn as string, extern: element ? (loadedFiles.isElementExtern(element) as boolean) : false};
    });
    const unresolved: string[] = loadedFiles.filesAsList
      .filter((f: any) => f.unresolved)
      .flatMap((f: any) => f.cachedFile.getKeys())
      .sort();
    return {currentKeys, elements, cells, unresolved};
  });

test.describe('External references', () => {
  test('only direct references and their direct dependencies are requested', async ({page}) => {
    const {requested} = await load(page, files({'org.b': FILE_B, 'org.c': FILE_C_DEEP, 'org.d': FILE_D}));

    expect(requested).toContain('urn:samm:org.b:1.0.0#propB');
    expect(requested).toContain('urn:samm:org.c:1.0.0#CharC');
    expect(requested.some(urn => urn.startsWith('urn:samm:org.d:'))).toBe(false);
  });

  test('a referenced element of another namespace is shown as external element', async ({page}) => {
    const {app} = await load(page, files({'org.b': FILE_B, 'org.c': FILE_C_DEEP, 'org.d': FILE_D}));
    const {currentKeys, cells} = await inspect(page);

    expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
    expect(cells).toContainEqual({urn: 'urn:samm:org.b:1.0.0#propB', extern: true});
    expect(cells.filter(c => c.urn?.startsWith('urn:samm:org.a:')).map(c => c.urn)).toEqual(['urn:samm:org.a:1.0.0#AspectA']);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm:properties (b:propB)');
    expect(rdf).not.toMatch(/^:(?!AspectA)\w+ a samm:/m);
  });

  test('a missing file one level deeper does not create local elements', async ({page}) => {
    const {app} = await load(page, files({'org.b': FILE_B}));
    const {currentKeys, cells} = await inspect(page);

    expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
    expect(cells).toContainEqual({urn: 'urn:samm:org.b:1.0.0#propB', extern: true});
    expect(await app.getUpdatedRDF()).toContain('samm:properties (b:propB)');
  });

  test('a referenced element from another file of the same namespace is shown as external element', async ({page}) => {
    const {app} = await load(page, [{namespace: 'org.a', fileName: 'Other.ttl', content: SAME_NS_OTHER_FILE}], SAME_NS_ASPECT);
    const {currentKeys, elements, cells} = await inspect(page);

    expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
    expect(elements).toContainEqual({urn: 'urn:samm:org.a:1.0.0#propOther', extern: true});
    expect(elements).toContainEqual({urn: 'urn:samm:org.a:1.0.0#CharOther', extern: true});
    expect(cells).toContainEqual({urn: 'urn:samm:org.a:1.0.0#propOther', extern: true});

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm:properties (:propOther)');
    expect(rdf).not.toContain(':propOther a samm:Property');
  });

  test('loading fails visibly when the backend answers with an error', async ({page}) => {
    await setUpDefaultRoutes(page);
    await page.route(`**${API_BASE_URL}/models/batch**`, route =>
      route.fulfill({status: 422, json: {error: {code: 422, message: "Aspect Model not found for URN 'urn:samm:org.b:1.0.0#propB'"}}}),
    );
    const app = new AppHelper(page);
    await app.visitDefault(false);

    const result = await page.evaluate(
      rdf =>
        new Promise<string>(resolve =>
          (window as any)['angular.fileHandlingService'].loadModel(rdf).subscribe({
            next: () => resolve('loaded'),
            error: () => resolve('failed'),
          }),
        ),
      ASPECT_A,
    );

    expect(result).toBe('failed');
    await expect(page.getByText("Aspect Model not found for URN 'urn:samm:org.b:1.0.0#propB'")).toBeVisible();
    expect(await page.evaluate(() => (window as any)['angular.LoadedFilesService'].currentLoadedFile)).toBeFalsy();
  });

  test('missing references are requested with ignoreMissing so that the model can still be opened', async ({page}) => {
    const {ignoreMissingFlags} = await load(page, files({'org.c': FILE_C_FLAT}));

    expect(ignoreMissingFlags.length).toBeGreaterThan(0);
    expect(ignoreMissingFlags.every(flag => flag === 'true')).toBe(true);
  });
});

test.describe('Missing references (placeholders)', () => {
  const MISSING_CHARACTERISTIC_ASPECT =
    head('org.a', '@prefix b: <urn:samm:org.b:1.0.0#> .\n') +
    ':AspectA a samm:Aspect ; samm:properties ( :localProp ) ; samm:operations ( ) ; samm:events ( ) .\n' +
    ':localProp a samm:Property ; samm:characteristic b:CharX .\n';

  const cellStyle = (page: Page, urn: string) =>
    page.evaluate(cellUrn => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const cell = graph
        .getChildCells(graph.getDefaultParent(), true, false)
        .find((c: any) => c.getMetaModelElement?.()?.element?.aspectModelUrn === cellUrn);
      return cell ? {strokeColor: cell.style?.strokeColor, dashed: cell.style?.dashed} : null;
    }, urn);

  test('a missing direct property stays a reference and is shown as placeholder', async ({page}) => {
    const {app} = await load(page, []);
    const {currentKeys, cells, unresolved} = await inspect(page);

    expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
    expect(unresolved).toEqual(['urn:samm:org.b:1.0.0#propB']);
    expect(cells).toContainEqual({urn: 'urn:samm:org.b:1.0.0#propB', extern: true});
    expect(await cellStyle(page, 'urn:samm:org.b:1.0.0#propB')).toEqual({strokeColor: '#E83F22', dashed: true});
    await expect(page.getByTestId('unresolvedShapeIcon')).toHaveCount(1);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm:properties (b:propB)');
    expect(rdf).not.toMatch(/^:(?!AspectA)\w+ a samm:/m);
  });

  test('a warning lists the missing direct references', async ({page}) => {
    await load(page, []);

    await expect(page.getByText('Referenced elements not found')).toBeVisible();
    await expect(page.getByText(/not defined in the workspace: urn:samm:org\.b:1\.0\.0#propB\./)).toBeVisible();
  });

  test('a missing characteristic is kept as reference instead of being dropped', async ({page}) => {
    const {app} = await load(page, [], MISSING_CHARACTERISTIC_ASPECT);
    const {currentKeys, unresolved} = await inspect(page);

    expect(currentKeys.sort()).toEqual(['urn:samm:org.a:1.0.0#AspectA', 'urn:samm:org.a:1.0.0#localProp']);
    expect(unresolved).toEqual(['urn:samm:org.b:1.0.0#CharX']);
    expect(await app.getUpdatedRDF()).toMatch(/:localProp a samm:Property\s*;\s*samm:characteristic b:CharX/);
  });

  test('a missing element of the own namespace stays a reference', async ({page}) => {
    const {app} = await load(page, [], SAME_NS_ASPECT);
    const {currentKeys, unresolved} = await inspect(page);

    expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
    expect(unresolved).toEqual(['urn:samm:org.a:1.0.0#propOther']);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('samm:properties (:propOther)');
    expect(rdf).not.toContain(':propOther a samm:Property');
  });

  test('a placeholder cannot be opened', async ({page}) => {
    await load(page, []);
    await expect(page.getByText('Referenced elements not found')).toBeVisible();

    await page.evaluate(() => {
      const graph = (window as any)['angular.maxgraphAttributeService'].graph;
      const cell = graph
        .getChildCells(graph.getDefaultParent(), true, false)
        .find((c: any) => c.getMetaModelElement?.()?.element?.aspectModelUrn === 'urn:samm:org.b:1.0.0#propB');
      graph.getSelectionModel().setCell(cell);
      graph.fireEvent({
        name: 'doubleClick',
        getName: () => 'doubleClick',
        getProperty: (key: string) => (key === 'cell' ? cell : undefined),
        isConsumed: () => false,
      });
    });

    await expect(page.getByText('Element not found')).toBeVisible();
    await expect(page.getByText('The referenced element urn:samm:org.b:1.0.0#propB is not defined in the workspace')).toBeVisible();
  });

  test('a missing file one level deeper does not trigger a warning', async ({page}) => {
    await load(page, files({'org.b': FILE_B}));
    const {cells, unresolved} = await inspect(page);

    expect(unresolved).toEqual(['urn:samm:org.c:1.0.0#CharC']);
    expect(cells).toContainEqual({urn: 'urn:samm:org.b:1.0.0#propB', extern: true});
    await expect(page.getByTestId('unresolvedShapeIcon')).toHaveCount(0);
    await page.waitForTimeout(500);
    await expect(page.getByText(/Referenced elements not found|unresolvedReferencesTitle/)).toHaveCount(0);
  });
});

/**
 * The real backend rejects models with missing references: validation answers 409 with `unresolvedElements`,
 * and `/models` and `/models/batch` answer 422 unless `ignoreMissing=true` is sent. These tests mock exactly that
 * behaviour and make sure that such models can still be opened from every entry point.
 */
test.describe('Opening models with missing references', () => {
  const OTHER_ASPECT = head('org.x') + ':AspectX a samm:Aspect ; samm:properties ( ) ; samm:operations ( ) ; samm:events ( ) .\n';
  const PROP_B = 'urn:samm:org.b:1.0.0#propB';
  const WORKSPACE = [
    {namespace: 'org.a', fileName: 'AspectA.ttl', content: ASPECT_A, urn: 'urn:samm:org.a:1.0.0#AspectA'},
    {namespace: 'org.x', fileName: 'AspectX.ttl', content: OTHER_ASPECT, urn: 'urn:samm:org.x:1.0.0#AspectX'},
  ];

  async function routeLikeRealBackend(page: Page, validationError?: {message: string; unresolvedElements?: string[]}) {
    await setUpDefaultRoutes(page);
    await routeBatch(page, WORKSPACE);
    await page.route(VALIDATE_API_URL, route => {
      const missingReference = route.request().postDataBuffer()?.toString().includes('b:propB');
      if (validationError || missingReference) {
        const error = validationError ?? {message: `Element '${PROP_B}' does not exist in a file.`, unresolvedElements: [PROP_B]};
        return route.fulfill({status: 409, json: {error: {code: 409, ...error}}});
      }
      return route.fulfill({json: {violationErrors: []}});
    });
    await page.route(MODELS_API_ROUTE, route => {
      if (route.request().method() !== 'GET') return route.fallback();
      const file = WORKSPACE.find(f => f.urn === route.request().headers()['aspect-model-urn']);
      if (!file) return route.fulfill({status: 404, json: {error: {code: 404, message: 'Not found'}}});
      if (new URL(route.request().url()).searchParams.get('ignoreMissing') !== 'true' && file.content.includes('b:propB')) {
        return route.fulfill({status: 422, json: {error: {code: 422, message: 'Aspect model resolution failed'}}});
      }
      return route.fulfill({json: {content: file.content, sourceLocation: `file:/workspace/${file.fileName}`}});
    });
    await page.route(`**${NAMESPACES_URL}`, route =>
      route.fulfill({
        json: Object.fromEntries(
          WORKSPACE.map(f => [
            f.namespace,
            [
              {
                version: '1.0.0',
                models: [{name: f.fileName, model: f.fileName, aspectModelUrn: f.urn, version: SAMM_VERSION_ACTUAL, existing: true}],
              },
            ],
          ]),
        ),
      }),
    );
  }

  test('a pasted or uploaded model is opened although the validation reports missing references', async ({page}) => {
    await routeLikeRealBackend(page);
    const app = new AppHelper(page);
    await app.visitDefault(false);

    await app.loadModel(ASPECT_A);
    const {currentKeys, unresolved} = await inspect(page);

    expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
    expect(unresolved).toEqual([PROP_B]);
    await expect(page.getByTestId('unresolvedShapeIcon')).toHaveCount(1);
    await expect(page.getByText('Referenced elements not found')).toBeVisible();
    await expect(page.getByText(/Error/).filter({hasText: 'does not exist in a file'})).toHaveCount(0);
  });

  test('a model with other validation errors is still rejected', async ({page}) => {
    await routeLikeRealBackend(page, {message: 'Syntax error in line 3'});
    const app = new AppHelper(page);
    await app.visitDefault(false);

    const result = await page.evaluate(
      rdf =>
        new Promise<string>(resolve =>
          (window as any)['angular.fileHandlingService'].loadModel(rdf).subscribe({
            next: () => resolve('loaded'),
            error: () => resolve('failed'),
          }),
        ),
      ASPECT_A,
    );

    expect(result).toBe('failed');
    await expect(page.getByText('Syntax error in line 3')).toBeVisible();
  });

  test.describe('saving', () => {
    const UNRESOLVED_ERROR = {
      error: {code: 409, message: `Element '${PROP_B}' does not exist in a file.`, focusNode: PROP_B, unresolvedElements: [PROP_B]},
    };
    const save = (page: Page) =>
      page.evaluate(
        () =>
          new Promise(resolve =>
            (window as any)['angular.fileHandlingService'].saveAspectModelToWorkspace().subscribe({complete: resolve}),
          ),
      );

    test.beforeEach(async ({page}) => {
      await routeLikeRealBackend(page);
      const app = new AppHelper(page);
      await app.visitDefault(false);
      await app.loadModel(ASPECT_A);
      await expect(page.getByTestId('unresolvedShapeIcon')).toHaveCount(1);
    });

    for (const step of ['format', 'save'] as const) {
      test(`a rejected ${step} names the missing elements like the warning on load`, async ({page}) => {
        let saveRequests = 0;
        await page.route(`**${API_BASE_URL}/models/format`, route =>
          step === 'format'
            ? route.fulfill({status: 409, json: UNRESOLVED_ERROR})
            : route.fulfill({contentType: 'text/plain', body: route.request().postDataBuffer()?.toString() ?? ''}),
        );
        await page.route(MODELS_API_ROUTE, route => {
          if (route.request().method() !== 'POST') return route.fallback();
          saveRequests++;
          // The backend answers the save as text; the error body is JSON nevertheless.
          return route.fulfill({status: 409, contentType: 'text/plain', body: JSON.stringify(UNRESOLVED_ERROR)});
        });

        await save(page);

        const error = page.locator('.toast-error');
        await expect(error).toHaveCount(1);
        await expect(error.locator('.toast-title')).toHaveText('Referenced elements not found');
        await expect(error.locator('.toast-message')).toContainText(
          `The model could not be saved. The following referenced elements are not defined in the workspace: ${PROP_B}.`,
        );
        await expect(page.getByText(/File does not exist/)).toHaveCount(0);
        expect(saveRequests).toBe(step === 'format' ? 0 : 1);
      });
    }
  });

  test.describe('workspace', () => {
    const fileRow = (page: Page) => page.getByTestId('workspace-file-AspectA.ttl');

    test.beforeEach(async ({page}) => {
      await routeLikeRealBackend(page);
      const app = new AppHelper(page);
      await app.visitDefault(false);
      await app.loadModel(OTHER_ASPECT);
      await page.locator(SELECTOR_workspaceBtn).click({force: true});
      await expect(fileRow(page)).toBeVisible();
    });

    test('a file referencing a missing namespace is marked with a warning instead of an error', async ({page}) => {
      await expect(fileRow(page)).toHaveClass(/unresolved/);
      await expect(fileRow(page)).not.toHaveClass(/errored/);
      await expect(fileRow(page).locator('.content mat-icon')).toHaveText('warning');

      await fileRow(page).hover();
      await expect(page.locator('.mat-mdc-tooltip-show')).toContainText('org.b:1.0.0');
      await expect(page.locator('.mat-mdc-tooltip-show')).toContainText('placeholders');
    });

    test('the file can be opened and its missing elements are shown as placeholders', async ({page}) => {
      await fileRow(page).hover();
      await fileRow(page).getByTestId('openFileMenu').click();
      await page.getByTestId('fileMenuOpenSubMenuButton').hover();
      await page.getByTestId('fileMenuLoadAspectModelNewTabButton').click();

      await expect(page.locator('[data-testid="editor-tab"]')).toHaveCount(2, {timeout: 10000});
      await expect(page.getByTestId('unresolvedShapeIcon')).toHaveCount(1, {timeout: 10000});
      const {currentKeys, unresolved} = await inspect(page);
      expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
      expect(unresolved).toEqual([PROP_B]);
    });
  });
});
