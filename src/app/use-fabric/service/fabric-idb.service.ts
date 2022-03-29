import { Inject, Injectable } from '@angular/core';

import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { concatMap, from, shareReplay } from 'rxjs';

import { IDB_VERSION_TOKEN } from 'src/app/services/idb-version.token';

export interface FabricDB extends DBSchema {
  'active-draw': {
    key: string;
    value: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FabricIdbService {
  fabricDB$ = from(
    openDB<FabricDB>('easy-draw-fabric', this.idbVersion, {
      upgrade: (db) => {
        db.createObjectStore('active-draw');
      },
    })
  ).pipe(shareReplay(1));

  constructor(@Inject(IDB_VERSION_TOKEN) private readonly idbVersion: number) {}

  private wrapAction<T extends Promise<any>>(
    action: (db: IDBPDatabase<FabricDB>) => T
  ) {
    return this.fabricDB$.pipe(concatMap((db) => from(action(db))));
  }

  getActiveDraw() {
    return this.wrapAction((db) => db.get('active-draw', 'draw'));
  }

  updateActiveDraw(json: any) {
    return this.wrapAction((db) =>
      db.put('active-draw', JSON.stringify(json), 'draw')
    );
  }
}
