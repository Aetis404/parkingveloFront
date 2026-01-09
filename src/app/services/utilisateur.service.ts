import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { UtilisateurDTO } from '../models/utilisateur.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8080/api/v1/utilisateur';

  constructor(private http: HttpClient) {}

  getAllUtilisateurs(): Observable<UtilisateurDTO[]> {
    console.log('Service: Appel GET à', this.apiUrl);
    return this.http.get<UtilisateurDTO[]>(this.apiUrl).pipe(
      tap(data => console.log('Service: Données reçues', data)),
      catchError(error => {
        console.error('Service: Erreur', error);
        throw error;
      })
    );  
  }

  getUtilisateurById(id: number): Observable<UtilisateurDTO> {
    return this.http.get<UtilisateurDTO>(`${this.apiUrl}/${id}`);
  }

  createUtilisateur(utilisateur: UtilisateurDTO): Observable<UtilisateurDTO> {
    return this.http.post<UtilisateurDTO>(this.apiUrl, utilisateur);
  }

  updateUtilisateur(id: number, utilisateur: UtilisateurDTO): Observable<UtilisateurDTO> {
    return this.http.put<UtilisateurDTO>(`${this.apiUrl}/${id}`, utilisateur);
  }

  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
