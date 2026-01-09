import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { VeloService } from '../../services/velo.service';
import { UtilisateurService } from '../../services/utilisateur.service';
import { ReservationDTO } from '../../models/reservation.model';
import { VeloDTO } from '../../models/velo.model';
import { UtilisateurDTO } from '../../models/utilisateur.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, PageEvent , MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core'; 

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nom', 'utilisateur', 'quantite', 'actions'];
  
  dataSource = new MatTableDataSource<ReservationDTO>([]);
  
  paginatedData: ReservationDTO[] = []; 
  totalItems = 0;
  currentPage = 0;
  pageSize = 5;

  filterValue: string = '';

  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  loading = false;
  error: string | null = null;

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      
      this.paginator.page.subscribe((pageEvent: PageEvent) => {
        console.log('Changement de page: ', pageEvent);
        this.onPageChange(pageEvent);
      });
    }
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
      this.sort.sortChange.subscribe(() => {
        this.updatePaginatedData();
      });
    }
  }

  onPageChange(pageEvent: PageEvent): void {
    console.log('Page size changé à:', pageEvent.pageSize);
    console.log('Page index changé à:', pageEvent.pageIndex);
    
    this.pageSize = pageEvent.pageSize;
    this.currentPage = pageEvent.pageIndex;
    this.updatePaginatedData();
  }

  loadReservations(): void {
    this.loading = true;
    this.error = null;
    
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.totalItems = data.length;
        this.updatePaginatedData();
        
        if (this.paginator) {
          this.paginator.pageSize = 5;
          this.paginator.length = data.length;
          this.paginator.pageIndex = 0;
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des vélos';
        this.loading = false;
        console.error(err);
        this.showSnackBar('Erreur lors du chargement des données', 'error');
      }
    });
  }

  updatePaginatedData(): void {
    if (!this.dataSource.data.length) {
      this.paginatedData = [];
      return;
    }
    
    let filteredData = this.dataSource.data;

    if (this.filterValue) {
      filteredData = this.dataSource.data.filter(reservation => {
        const searchableContent = `
          ${reservation.velo?.nom || ''}
          ${reservation.utilisateur?.mail || ''}
          ${reservation.reservation || ''}
        `.toLowerCase();
        
        return searchableContent.includes(this.filterValue);
      });
    }

    this.totalItems = filteredData.length;

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    this.paginatedData = filteredData.slice(startIndex, endIndex);
    
    console.log(`Affichage ${startIndex} à ${endIndex} sur ${this.dataSource.data.length} total`);
  }

  ajouterReservation(): void {
    const dialogRef = this.dialog.open(DialogReservationComponent, {
      width: 'auto',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationService.createReservation(result).subscribe({
          next: (newReservation) => {
            this.loadReservations(); // Recharger toutes les réservations pour obtenir les données complètes
            this.showSnackBar('Réservation ajoutée avec succès', 'success');
          },
          error: (err) => {
            console.error(err);
            const errorMessage = err.error || 'Erreur lors de l\'ajout';
            this.showSnackBar(errorMessage, 'error');
          }
        });
      }
    });
  }

  editerReservation(reservation: ReservationDTO): void {
    const dialogRef = this.dialog.open(DialogReservationComponent, {
      width: 'auto',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true,
      data: { mode: 'edit', reservation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationService.updateReservation(result).subscribe({
          next: (updatedReservation) => {
            this.loadReservations(); // Recharger pour obtenir les données complètes
            this.showSnackBar('Réservation modifiée avec succès', 'success');
          },
          error: (err) => {
            console.error(err);
            const errorMessage = err.error || 'Erreur lors de la modification';
            this.showSnackBar(errorMessage, 'error');
          }
        });
      }
    });
  }
  
  deleteReservation(reservation : any): void {
    if (confirm('Voulez-vous vraiment supprimer cette réservation ?')) {
        const utilisateurId = reservation.utilisateur?.id;
        const veloId = reservation.velo?.id;
        
        // Vérifier que les deux IDs sont présents
        if (utilisateurId === undefined || veloId === undefined) {
        this.showSnackBar('Erreur: Réservation invalide (IDs manquants)', 'error');
        return;
        }
        this.reservationService.deleteReservation(utilisateurId,veloId).subscribe({
            next: () => {
            const updatedData = this.dataSource.data.filter(r => 
                r.utilisateur?.id !== utilisateurId || r.velo?.id !== veloId
            );
            this.dataSource.data = updatedData;
            this.totalItems = updatedData.length;
            this.updatePaginatedData();
            
            if (this.paginator) {
                this.paginator.length = updatedData.length;
            }
            
            this.showSnackBar('Parking vélo supprimé avec succès', 'success');
            },
            error: (err) => {
            this.error = 'Erreur lors de la suppression';
            console.error(err);
            this.showSnackBar('Erreur lors de la suppression', 'error');
            }
        });
    }
  }

  applyFilter(event: Event): void {
    this.filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.currentPage = 0;

    console.log('Application du filtre:', this.filterValue);

    this.updatePaginatedData();
  
    if (this.paginator) {
      this.paginator.firstPage();
      this.paginator.length = this.totalItems;
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  formatCoordinate(coord: number | undefined): string {
    return coord ? coord.toFixed(6) : 'N/A';
  }
}

@Component({
  selector: 'dialog-reservation',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule
  ],
  template: `
    <div class="ultra-modern-dialog">
      <div class="gradient-header">
        <div class="icon-box">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h1>{{ data.mode === 'edit' ? 'Modifier la réservation' : 'Ajouter une réservation' }}</h1>
      </div>

      <div class="form-body">
        <div class="field">
          <label>Parking de vélo</label>
          <select [(ngModel)]="reservationData.veloId" required>
            <option [value]="null" disabled>Sélectionner un parking</option>
            <option *ngFor="let velo of velos" [value]="velo.id">
              {{ velo.nom }} (Capacité: {{ velo.quantite }})
            </option>
          </select>
        </div>

        <div class="field">
          <label>Utilisateur</label>
          <select [(ngModel)]="reservationData.utilisateurId" required>
            <option [value]="null" disabled>Sélectionner un utilisateur</option>
            <option *ngFor="let utilisateur of utilisateurs" [value]="utilisateur.id">
              {{ utilisateur.mail }} ({{ utilisateur.nom }} {{ utilisateur.prenom }})
            </option>
          </select>
        </div>

        <div class="field">
          <label>Quantité de vélos réservés</label>
          <input type="number" min="1" [(ngModel)]="reservationData.reservation" placeholder="Ex: 1" required>
        </div>
      </div>

      <div class="actions-bar">
        <button class="btn-annuler" (click)="dialogRef.close()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Annuler
        </button>
        <button class="btn-action" (click)="enregistrer()" [disabled]="!isValid()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ data.mode === 'edit' ? 'Enregistrer' : 'Créer' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ultra-modern-dialog {
      width: 520px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .gradient-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 48px 40px;
      text-align: center;
    }

    .icon-box {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    .gradient-header h1 {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }

    .form-body {
      padding: 40px;
      background: #ffffff;
    }

    .field {
      margin-bottom: 24px;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    .field label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
    }

    .field input,
    .field select {
      width: 100%;
      padding: 14px 18px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 15px;
      color: #111827;
      background: #f9fafb;
      box-sizing: border-box;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
    }

    .field select {
      cursor: pointer;
    }

    .field input:hover,
    .field select:hover {
      border-color: #d1d5db;
      background: #ffffff;
    }

    .field input:focus,
    .field select:focus {
      outline: none;
      border-color: #667eea;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .field input::placeholder {
      color: #9ca3af;
    }

    .actions-bar {
      padding: 24px 40px;
      background: #f9fafb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .btn-annuler {
      flex: 1;
      padding: 14px 24px;
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      color: #6b7280;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-annuler:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
      color: #374151;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .btn-action {
      flex: 1;
      padding: 14px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-action:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
    }

    .btn-action[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-annuler svg,
    .btn-action svg {
      width: 16px;
      height: 16px;
    }
  `]
})
export class DialogReservationComponent implements OnInit {

  reservationData: any = {
    utilisateurId: null,
    veloId: null,
    reservation: 1
  };

  velos: VeloDTO[] = [];
  utilisateurs: UtilisateurDTO[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogReservationComponent>,
    private veloService: VeloService,
    private utilisateurService: UtilisateurService
  ) {
    if (data.mode === 'edit' && data.reservation) {
      this.reservationData = {
        utilisateurId: data.reservation.utilisateur?.id,
        veloId: data.reservation.velo?.id,
        reservation: data.reservation.reservation
      };
    } else if (data.mode === 'create' && data.preselectedVelo) {
      // Pré-sélectionner le vélo si fourni depuis la carte
      this.reservationData.veloId = data.preselectedVelo.id;
    }
  }

  ngOnInit(): void {
    this.veloService.getAllVelos().subscribe({
      next: (data) => this.velos = data,
      error: (err) => console.error('Erreur chargement vélos', err)
    });

    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (data) => this.utilisateurs = data,
      error: (err) => console.error('Erreur chargement utilisateurs', err)
    });
  }

  isValid(): boolean {
    return !!(this.reservationData.veloId && this.reservationData.utilisateurId && this.reservationData.reservation);
  }

  enregistrer(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.reservationData);
    }
  }
}