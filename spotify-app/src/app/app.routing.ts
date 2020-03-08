import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './navpages/main/main.component';
import {HomeComponent} from './navpages/home/home.component';
import {BaseComponent} from './navpages/base/base.component';
import {StartComponent} from './navpages/base/start/start.component';
import {DetailComponent} from './navpages/base/detail/detail.component';
import {SearchComponent} from './navpages/search/search.component';
import {AuthComponent} from './navpages/auth/auth.component';

const appRoutes: Routes = [
  {path: '', redirectTo: '/main', pathMatch: 'full'},
  {path: 'main', component: MainComponent},
  {path: 'home', component: HomeComponent},
  {
    path: 'base', component: BaseComponent, children: [
      {path: '', component: StartComponent},
      {path: ':id', component: DetailComponent}
    ]
  },
  {path: 'auth', component: AuthComponent},
  {path: 'search', component: SearchComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]

})
export class AppRoutingModule {

}
