import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { VeloDTO } from '../models/velo.model';

@Injectable({
  providedIn: 'root'
})
export class VeloService {
  private apiUrl = 'http://localhost:8080/api/v1/velo';

  constructor(private http: HttpClient) {}

  getAllVelos(): Observable<VeloDTO[]> {
    console.log('Service: Appel GET à', this.apiUrl);
    return this.http.get<VeloDTO[]>(this.apiUrl).pipe(
      tap(data => console.log('Service: Données reçues', data)),
      catchError(error => {
        console.error('Service: Erreur', error);
        throw error;
      })
    );  
  }

  getVeloById(id: number): Observable<VeloDTO> {
    return this.http.get<VeloDTO>(`${this.apiUrl}/${id}`);
  }

  createVelo(velo: VeloDTO): Observable<VeloDTO> {
    return this.http.post<VeloDTO>(this.apiUrl, velo);
  }

  updateVelo(id: number, velo: VeloDTO): Observable<VeloDTO> {
    return this.http.put<VeloDTO>(`${this.apiUrl}/${id}`, velo);
  }

  deleteVelo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}