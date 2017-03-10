import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServerStatComponent } from './components/ServerStat';

@NgModule({
    bootstrap: [ServerStatComponent],
    declarations: [ServerStatComponent],
    imports: [BrowserModule]
})
export class ServerStatModule {
    constructor() {}
}