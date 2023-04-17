import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs';

@Component({
  templateUrl: './samm-migration.component.html',
  styleUrls: ['./samm-migration.component.scss'],
})
export class SammMigrationComponent {
  public get status$() {
    return this.activatedRoute.queryParams.pipe(map(params => params?.status || 'checking'));
  }

  constructor(private activatedRoute: ActivatedRoute) {}
}
