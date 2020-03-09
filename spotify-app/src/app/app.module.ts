import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';

import {AppRoutingModule} from './app.routing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar/navbar.component';
import { MainComponent } from './navpages/main/main.component';
import { AuthComponent } from './navpages/auth/auth.component';
import { BaseComponent } from './navpages/base/base.component';
import { SearchComponent } from './navpages/search/search.component';
import { StartComponent } from './navpages/base/start/start.component';
import { DetailComponent } from './navpages/base/detail/detail.component';
import { HomeComponent } from './navpages/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MainComponent,
    AuthComponent,
    BaseComponent,
    SearchComponent,
    StartComponent,
    DetailComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-CSRF-Token',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
