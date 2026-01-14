import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MovementRepository } from '../../../domain/ports/movement.repository';
import { ReportItem } from '../../../domain/models/report.model';
import { Page } from '../../../domain/models/page.model';
import { Movement } from '../../../domain/models/movement.model';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report.component.html',
  styles: [''],
})
export class ReportComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  clientId: string = '';
  
  searchTerm: string = '';
  private searchTerms = new Subject<string>();

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  reportData: ReportItem[] = [];
  hasSearched = false;

  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' = 'info';
  showNotification: boolean = false;

  constructor(private movementRepository: MovementRepository) {}

  ngOnInit() {
    this.loadAllMovements();
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadAllMovements();
    });
  }

  showToast(type: 'success' | 'error' | 'info', message: string) {
    this.notificationType = type;
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  onSearchChange(term: string): void {
    this.searchTerms.next(term);
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  loadAllMovements() {
    this.movementRepository.getAll(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: (pageData: Page<Movement>) => {
        this.updateReportData(pageData.content);
        this.totalElements = pageData.totalElements;
        this.totalPages = pageData.totalPages;
      },
      error: (err) => {
        console.error('Error fetching movements for report', err);
        this.reportData = [];
      }
    });
  }

  changePage(newPage: number): void {
      if (newPage >= 0 && newPage < this.totalPages) {
          this.currentPage = newPage;
          this.loadAllMovements();
      }
  }

  private updateReportData(movements: Movement[]) {
      this.reportData = movements.map(m => {
        let dateVal = 'N/A';
        try {
          if (m.date) {
            dateVal = new Date(m.date).toLocaleDateString();
          }
        } catch (e) {
          console.error('Date parsing error', e);
        }

        return {
          "Fecha": dateVal,
          "Cliente": m.account?.client?.name || 'N/A',
          "Numero Cuenta": m.account?.accountNumber,
          "Tipo": m.account?.accountType || 'N/A',
          "Saldo Inicial": (m.balance || 0) - (m.value || 0),
          "Estado": m.account?.status,
          "Movimiento": m.value,
          "Saldo Disponible": m.balance || 0
        };
      });
  }

  generateReport() {
    if (!this.startDate || !this.endDate) {
      this.showToast('info', 'Por favor seleccione un rango de fechas');
      return;
    }

    this.movementRepository.getReport(this.startDate, this.endDate, this.clientId)
      .subscribe({
        next: (response) => {
          if (response.data) {
             this.reportData = response.data;
             this.totalElements = response.data.length; 
             this.totalPages = 1;
             this.currentPage = 0;
          }

          if (response.pdfBase64) {
             this.downloadPdf(response.pdfBase64);
             this.showToast('success', 'El reporte se generó correctamente');
          } else {
             if (!response.data || response.data.length === 0) {
                 this.showToast('info', 'No se encontraron registros para el reporte');
             }
          }
        },
        error: (err) => {
          console.error('Error generating PDF', err);
          this.showToast('error', 'Ocurrió un error al generar el reporte');
        }
      });
  }

  downloadPdf(base64: string) {
      const link = document.createElement('a');
      link.href = 'data:application/pdf;base64,' + base64;
      link.download = `reporte-${new Date().getTime()}.pdf`;
      link.click();
  }
}

