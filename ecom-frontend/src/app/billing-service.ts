import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillDetail, BillSummary } from './models/bill.model';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8888/BILLING-SERVICE/api/bills';

  getBills(): Observable<BillSummary[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(response => response?._embedded?.bills || response?.bills || response || [])
    );
  }

  getBillById(id: number): Observable<BillDetail> {
    return this.http.get<BillDetail>(`${this.baseUrl}/${id}`);
  }
}
