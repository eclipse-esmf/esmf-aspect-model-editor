import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EditorCanvasComponent} from './components/editor-canvas/editor-canvas.component';

const routes: Routes = [
  {
    path: 'editor',
    component: EditorCanvasComponent,
    children: [
      {
        path: 'select/:urn',
        component: EditorCanvasComponent,
      },
    ],
  },
  {
    path: 'help',
    loadChildren: () => import(`./components/help/help.module`).then(module => module.HelpModule),
  },
  {
    path: '',
    redirectTo: 'editor',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
