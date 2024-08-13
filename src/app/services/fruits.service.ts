import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { fruits } from '../../data';
import { Fruit } from '../interfaces/fruit';

@Injectable({
  providedIn: 'root',
})
export class FruitsService {
  getFruits(): Observable<Fruit[]> {
    return of(fruits);
  }
}
