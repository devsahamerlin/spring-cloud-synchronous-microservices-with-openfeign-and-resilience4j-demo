import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { BillingService } from '../billing-service';
import { BillDetail } from '../models/bill.model';

@Component({
  selector: 'app-billing-details',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './billing-details.html',
  styleUrl: './billing-details.css',
})
export class BillingDetails implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly route = inject(ActivatedRoute);

  bill = signal<BillDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.billingService.getBillById(id).subscribe({
      next: (data) => {
        this.bill.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load bill details. Please try again.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  get total(): number {
    return (
      this.bill()?.productItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ) ?? 0
    );
  }
}
