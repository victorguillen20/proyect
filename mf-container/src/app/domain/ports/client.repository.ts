import { Observable } from 'rxjs';
import { Client } from '../models/client.model';
import { Page } from '../models/page.model';

export abstract class ClientRepository {
  abstract getAll(search?: string, page?: number, size?: number): Observable<Page<Client>>;
  abstract getById(id: number): Observable<Client>;
  abstract create(client: Client): Observable<Client>;
  abstract update(id: number, client: Client): Observable<Client>;
  abstract delete(id: number): Observable<void>;
}
