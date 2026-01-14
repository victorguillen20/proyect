import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountRepository } from '../../domain/ports/account.repository';
import { Account } from '../../domain/models/account.model';
import { Page } from '../../domain/models/page.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService extends AccountRepository {
  private apiUrl = `${environment.apiUrl}/cuentas`;

  constructor(private http: HttpClient) {
    super();
  }

  getAll(search?: string, page: number = 0, size: number = 10): Observable<Page<Account>> {
    let params = new HttpParams()
         .set('page', page.toString())
         .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<Page<Account>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/${id}`);
  }

  create(account: Account): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, account);
  }

  update(id: number, account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${id}`, account);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
