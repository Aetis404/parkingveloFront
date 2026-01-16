import { Routes } from '@angular/router';
import { UtilisateurComponent } from './html/utilisateur/utilisateur.component';
import { ConnexionComponent } from './html/connexion/connexion.component';
import { VeloListComponent } from './components/velo-list/velo-list.component';
import { ReservationComponent } from './html/reservations/reservation.component';
import { MapComponent } from './map/map.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'velos', pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'velos', component: VeloListComponent, canActivate: [authGuard] },
  { path: 'reservations', component: ReservationComponent, canActivate: [authGuard] },
  { path: 'utilisateurs', component: UtilisateurComponent, canActivate: [authGuard] },
  { path: 'map', component: MapComponent, canActivate: [authGuard] }
];