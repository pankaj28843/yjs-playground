import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import { Component, OnInit } from '@angular/core';

function getRandomString(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'yjs-playground';

  ngOnInit() {
    const ydoc = new Y.Doc();
    const graphId = 'myGraphId';
    const persistence = new IndexeddbPersistence(graphId, ydoc);

    persistence.once('synced', () => {
      console.log('initial content loaded', clusterNodes.length);
    });

    const clusterNodes = ydoc.getArray<string>('clusterNodes');
    clusterNodes.observe((event) => {
      // Log a delta every time the type changes
      // Learn more about the delta format here: https://quilljs.com/docs/delta/
      console.log('delta:', event.changes.delta);
    });

    const webrtcProvider = new WebrtcProvider(graphId, ydoc);
    console.log(webrtcProvider);

    const wsProvider = new WebsocketProvider(
      'ws://localhost:1234',
      graphId,
      ydoc
    );

    wsProvider.on('status', (event: any) => {
      console.log(clusterNodes.toJSON());

      console.log(event.status); // logs "connected" or "disconnected"
    });

    setInterval(() => {
      if (Math.random() > 0.5) {
        const address = getRandomString(32);
        console.log('will add new node', address);
        clusterNodes.insert(0, [address]);
      }
    }, 1000);
  }
}
