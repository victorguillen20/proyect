import { Observable } from 'rxjs';
import { Movement } from '../models/movement.model';
import { ReportResponse } from '../models/report.model';
import { Page } from '../models/page.model';

export abstract class MovementRepository {
  abstract getAll(search?: string, page?: number, size?: number): Observable<Page<Movement>>;
  abstract getById(id: number): Observable<Movement>;
  abstract create(movement: Movement): Observable<Movement>;
  abstract update(id: number, movement: Movement): Observable<Movement>;
  abstract delete(id: number): Observable<void>;
  abstract getReport(
    startDate: string,
    endDate: string,
    clientId?: string
  ): Observable<ReportResponse>;
}
