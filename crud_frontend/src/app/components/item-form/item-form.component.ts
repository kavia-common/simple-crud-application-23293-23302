import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Item } from '../../models/item';

/**
 * PUBLIC_INTERFACE
 * Standalone form component to create or edit items.
 * Validates required fields and integrates with ApiService.
 */
@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.css'
})
export class ItemFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['']
  });

  mode = signal<'create' | 'edit'>('create');
  itemId = signal<number | null>(null);

  get title() {
    return this.mode() === 'edit' ? 'Edit Item' : 'New Item';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isNaN(id)) {
        this.mode.set('edit');
        this.itemId.set(id);
        this.fetchItem(id);
      }
    }
  }

  private fetchItem(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id).subscribe({
      next: (item: Item) => {
        this.form.patchValue({
          name: item.name ?? '',
          description: item.description ?? ''
        });
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Failed to load item.');
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) return;

    const payload = {
      name: this.form.value.name as string,
      description: (this.form.value.description as string) ?? ''
    };

    this.saving.set(true);
    this.error.set(null);

    if (this.mode() === 'edit' && this.itemId()) {
      this.api.update(this.itemId()!, payload).subscribe({
        next: () => this.afterSave(),
        error: err => this.handleSaveError(err)
      });
    } else {
      this.api.create(payload).subscribe({
        next: () => this.afterSave(),
        error: err => this.handleSaveError(err)
      });
    }
  }

  private afterSave(): void {
    this.saving.set(false);
    this.router.navigate(['/items']);
  }

  private handleSaveError(err: unknown): void {
    this.saving.set(false);
    this.error.set('Failed to save item.');
    console.error(err);
  }
}
