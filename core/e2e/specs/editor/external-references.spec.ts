import {expect, Page, test} from '@playwright/test';
import {API_BASE_URL, SAMM_VERSION_ACTUAL, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';

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

/** Mocks /models/batch like the backend: every requested URN is answered with the file that defines it. */
async function routeBatch(page: Page, workspace: WorkspaceFile[]): Promise<string[]> {
  const requested: string[] = [];
  await page.route(`**${API_BASE_URL}/models/batch`, async route => {
    const entries = route.request().postDataJSON() as {aspectModelUrn: string}[];
    const result = [];
    for (const {aspectModelUrn} of entries) {
      requested.push(aspectModelUrn);
      const namespace = aspectModelUrn.replace('urn:samm:', '').split(':')[0];
      const localName = aspectModelUrn.split('#')[1];
      const file = workspace.find(f => f.namespace === namespace && f.content.includes(`:${localName} a `));
      if (file) {
        result.push({
          aspectModelUrn,
          aspectModel: file.content,
          absoluteName: `${namespace}:1.0.0:${file.fileName}`,
          fileName: file.fileName,
          modelVersion: SAMM_VERSION_ACTUAL,
        });
      }
    }
    await route.fulfill({json: result});
  });
  return requested;
}

async function load(page: Page, workspace: WorkspaceFile[], model = ASPECT_A) {
  await setUpDefaultRoutes(page);
  const requested = await routeBatch(page, workspace);
  const app = new AppHelper(page);
  await app.visitDefault(false);
  await app.loadModel(model);
  return {app, requested};
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
    return {currentKeys, elements, cells};
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

  test('loading fails visibly when the backend cannot resolve a direct reference', async ({page}) => {
    await setUpDefaultRoutes(page);
    await page.route(`**${API_BASE_URL}/models/batch`, route =>
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

  // Known gap: the backend never answers 200 without a requested element, but if it did, AME would replace the
  // reference with a randomly named local Property. Remove `test.fail` once a reference placeholder exists.
  test('a direct reference missing in a successful response stays a reference', async ({page}) => {
    test.fail();
    const {app} = await load(page, files({'org.c': FILE_C_FLAT}));
    const {currentKeys} = await inspect(page);

    expect(currentKeys).toEqual(['urn:samm:org.a:1.0.0#AspectA']);
    expect(await app.getUpdatedRDF()).toContain('samm:properties (b:propB)');
  });
});
