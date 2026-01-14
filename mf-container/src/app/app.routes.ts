import { Routes } from '@angular/router';
import { MainLayoutComponent } from './presentation/layouts/main-layout/main-layout.component';
import { ClientListComponent } from './presentation/pages/client-list/client-list.component';
import { AccountListComponent } from './presentation/pages/account-list/account-list.component';
import { MovementListComponent } from './presentation/pages/movement-list/movement-list.component';
import { ReportComponent } from './presentation/pages/report/report.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'clients', pathMatch: 'full' },
      { path: 'clients', component: ClientListComponent },
      { path: 'accounts', component: AccountListComponent },
      { path: 'movements', component: MovementListComponent },
      { path: 'reports', component: ReportComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
