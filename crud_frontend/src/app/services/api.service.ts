import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/item';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class ApiService {
  /** Base url for the Items API */
  private readonly baseUrl = `${environment.apiBaseUrl}/api/items`;
  private readonly http = inject(HttpClient);

  /** PUBLIC_INTERFACE
   * Get all items.
   * Returns an observable of Item array.
   */
  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl);
  }

  /** PUBLIC_INTERFACE
   * Get item by id.
   * @param id numeric identifier
   */
  getById(id: number | string): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  /** PUBLIC_INTERFACE
   * Create a new item.
   * @param item item payload
   */
  create(item: Omit<Item, 'id' | 'createdAt'>): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, item);
  }

  /** PUBLIC_INTERFACE
   * Update an existing item.
   * @param id item id
   * @param item partial payload
   */
  update(id: number | string, item: Partial<Omit<Item, 'id'>>): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/${id}`, item);
  }

  /** PUBLIC_INTERFACE
   * Delete an item by id.
   * @param id item id
   */
  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
