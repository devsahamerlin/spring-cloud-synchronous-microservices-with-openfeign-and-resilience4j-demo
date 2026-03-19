import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BillingService } from '../billing-service';
import { BillSummary } from '../models/bill.model';

@Component({
  selector: 'app-billing',
  imports: [RouterLink, DatePipe],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class Billing implements OnInit {
  private readonly billingService = inject(BillingService);

  bills = signal<BillSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.billingService.getBills().subscribe({
      next: (data) => {
        this.bills.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load bills. Please try again.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  getBillId(bill: BillSummary): number {
    if (bill.id !== undefined) {
      return bill.id;
    }
    // Extract ID from _links.self.href if id is missing in the list response
    const href = bill._links?.self?.href;
    return href ? parseInt(href.substring(href.lastIndexOf('/') + 1), 10) : 0;
  }
}
