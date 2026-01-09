import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { ReservationDTO } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/v1/reservation';

  constructor(private http: HttpClient) {}

  getAllReservations(): Observable<ReservationDTO[]> {
    console.log('Service: Appel GET à', this.apiUrl);
    return this.http.get<ReservationDTO[]>(this.apiUrl).pipe(
      tap(data => console.log('Service: Données reçues', data)),
      catchError(error => {
        console.error('Service: Erreur', error);
        throw error;
      })
    );  
  }

  getReservationById(id: number): Observable<ReservationDTO> {
    return this.http.get<ReservationDTO>(`${this.apiUrl}/${id}`);
  }

  createReservation(reservation: ReservationDTO): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(this.apiUrl, reservation);
  }

  updateReservation(reservation: ReservationDTO): Observable<ReservationDTO> {
    const utilisateurId = reservation.utilisateurId;
    const veloId = reservation.veloId;
    return this.http.put<ReservationDTO>(`${this.apiUrl}/${utilisateurId}/${veloId}`, reservation);
  }

  deleteReservation(utilisateurId: number, veloId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${utilisateurId}/${veloId}`);
  }
}