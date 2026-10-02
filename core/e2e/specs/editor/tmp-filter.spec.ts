import {test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {readFixture} from '../../support/drag-drop-utils';
test('filter', async ({page}) => {
  const app = new AppHelper(page);
  await app.visitDefault();
  await app.loadModel(readFixture('default-models/aspect-default.txt'));
  await app.shapeExists('property1');
  const state = () => page.evaluate(() => {
    const g = (window as any)['angular.maxgraphAttributeService'].graph;
    const lf = (window as any)['angular.LoadedFilesService'].currentLoadedFile;
    const aspect = lf.aspect ?? lf.cachedFile.get(lf.cachedFile.getKeys().find((k: string) => k.endsWith('AspectDefault')));
    return {cells: g.getChildCells(g.getDefaultParent()).length, props: aspect?.properties?.length, char: aspect?.properties?.[0]?.characteristic?.name};
  });
  console.log('start', JSON.stringify(await state()));
  await page.evaluate(() => (window as any)._filter.renderByFilter('properties'));
  await page.waitForTimeout(2500);
  console.log('props', JSON.stringify(await state()));
  await page.evaluate(() => (window as any)._filter.renderByFilter('default'));
  await page.waitForTimeout(2500);
  console.log('default', JSON.stringify(await state()));
});
