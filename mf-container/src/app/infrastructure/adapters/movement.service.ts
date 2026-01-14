import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovementRepository } from '../../domain/ports/movement.repository';
import { Movement } from '../../domain/models/movement.model';
import { ReportResponse } from '../../domain/models/report.model';
import { Page } from '../../domain/models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovementService extends MovementRepository {
  private apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {
    super();
  }

  getAll(search?: string, page: number = 0, size: number = 10): Observable<Page<Movement>> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Page<Movement>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Movement> {
    return this.http.get<Movement>(`${this.apiUrl}/${id}`);
  }

  create(movement: Movement): Observable<Movement> {
    // Backend expects { ..., account: { accountNumber: X } } probably.
    return this.http.post<Movement>(this.apiUrl, movement);
  }

  update(id: number, movement: Movement): Observable<Movement> {
    return this.http.put<Movement>(`${this.apiUrl}/${id}`, movement);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReport(startDate: string, endDate: string, clientId?: string): Observable<ReportResponse> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    if (clientId) {
      params = params.set('clientId', clientId);
    }
    return this.http.get<ReportResponse>(`${this.apiUrl}/reportes`, { params });
  }
}

