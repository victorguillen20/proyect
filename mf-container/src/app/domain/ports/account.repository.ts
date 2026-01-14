import { Observable } from 'rxjs';
import { Account } from '../models/account.model';
import { Page } from '../models/page.model';

export abstract class AccountRepository {
  abstract getAll(search?: string, page?: number, size?: number): Observable<Page<Account>>;
  abstract getById(id: number): Observable<Account>;
  abstract create(account: Account): Observable<Account>;
  abstract update(id: number, account: Account): Observable<Account>;
  abstract delete(id: number): Observable<void>;
}
