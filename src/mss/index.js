require('zone.js/dist/zone');
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ServerStatModule } from './serverStat.module';

platformBrowserDynamic().bootstrapModule(ServerStatModule);