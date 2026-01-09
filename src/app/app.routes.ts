import { Routes } from '@angular/router';
import { UtilisateurComponent } from './html/utilisateur/utilisateur.component';
import { ConnexionComponent } from './html/connexion/connexion.component';
import { VeloListComponent } from './components/velo-list/velo-list.component';
import { ReservationComponent } from './html/reservations/reservation.component';
import { MapComponent } from './map/map.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'velos', pathMatch: 'full' },
  { path: 'velos', component: VeloListComponent },
  { path: 'reservations', component: ReservationComponent},
  { path: 'utilisateurs', component: UtilisateurComponent},
  { path: 'map', component: MapComponent}
];