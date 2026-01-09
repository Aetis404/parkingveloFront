import { VeloDTO } from './velo.model'
import { UtilisateurDTO } from './utilisateur.model'

export interface ReservationDTO {
  utilisateurId?: number;
  veloId?: number;
  velo?: VeloDTO;
  utilisateur?: UtilisateurDTO;
  reservation: number;
}