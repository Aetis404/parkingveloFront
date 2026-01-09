import { CoordonneesDTO } from './coordonnees.model'

export interface VeloDTO {
  id: number;
  nom : string;
  quantite : number;
  description : string;
  coordonnees: CoordonneesDTO;
}