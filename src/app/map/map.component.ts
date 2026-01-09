import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { VeloService } from '../services/velo.service';
import { VeloDTO } from '../models/velo.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { DialogReservationComponent } from '../html/reservations/reservation.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationService } from '../services/reservation.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit {
  map!: L.Map;
  markers: L.Marker[] = [];
  
  MapX = 47.3947; 
  MapY = 0.6850;
  
  loading = false;
  error: string | null = null;
  parkings: VeloDTO[] = [];

  constructor(
    private veloService: VeloService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.loadParkings();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    this.map = L.map('map').setView([this.MapX, this.MapY], 19);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = customIcon;
  }

  loadParkings(): void {
    this.loading = true;
    this.error = null;

    this.veloService.getAllVelos().subscribe({
      next: (data) => {
        console.log('Parkings chargés:', data);
        this.parkings = data;
        this.loading = false;
        
        setTimeout(() => {
          this.map.invalidateSize();
          this.addMarkersToMap();
        }, 0);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Erreur lors du chargement des parkings';
        this.loading = false;
        
      }
    });
  }

  addMarkersToMap(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    if (!this.map) {
      console.warn('Carte non initialisée');
      return;
    }

    const bounds: L.LatLngBoundsExpression = [];

    this.parkings.forEach((parking) => {
      const lat = Number(parking.coordonnees?.latitude);
      const lon = Number(parking.coordonnees?.longitude);

      if (isNaN(lat) || isNaN(lon)) {
        console.warn('Parking sans coordonnées valides:', parking);
        return;
      }

      const marker = L.marker([lat, lon]).addTo(this.map);
      
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #6B7CE1; font-size: 16px;">${parking.nom}</h3>
          <p style="margin: 5px 0;"><strong>Description:</strong> ${parking.description || 'Non spécifiée'}</p>
          <p style="margin: 5px 0;"><strong>Capacité:</strong> ${parking.quantite} places</p>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">
            <strong>Coordonnées:</strong><br>
            Lat: ${lat.toFixed(6)}<br>
            Lon: ${lon.toFixed(6)}
          </p>
          <button 
            id="reserver-${parking.id}" 
            style="
              width: 100%;
              margin-top: 10px;
              padding: 10px 16px;
              background-color: #6B7CE1;
              color: white;
              border: none;
              border-radius: 4px;
              font-weight: 500;
              cursor: pointer;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
              transition: all 0.3s cubic-bezier(.4,0,.2,1);
            "
            onmouseover="this.style.backgroundColor='#5a6bcf'; this.style.boxShadow='0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12)';"
            onmouseout="this.style.backgroundColor='#6B7CE1'; this.style.boxShadow='0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12)';"
          >
            Réserver ce parking
          </button>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('popupopen', () => {
        const button = document.getElementById(`reserver-${parking.id}`);
        if (button) {
          button.addEventListener('click', () => this.ouvrirReservation(parking));
        }
      });
      
      this.markers.push(marker);
      bounds.push([lat, lon]);
    });


    console.log(`${this.markers.length} markers ajoutés à la carte`);
  }

  ouvrirReservation(parking: VeloDTO): void {
    const dialogRef = this.dialog.open(DialogReservationComponent, {
      width: 'auto',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { mode: 'create', preselectedVelo: parking }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationService.createReservation(result).subscribe({
          next: () => {
            this.showSnackBar('Réservation créée avec succès', 'success');
            this.loadParkings(); // Recharger pour mettre à jour les capacités
          },
          error: (err) => {
            console.error(err);
            const errorMessage = err.error || 'Erreur lors de la création de la réservation';
            this.showSnackBar(errorMessage, 'error');
          }
        });
      }
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}