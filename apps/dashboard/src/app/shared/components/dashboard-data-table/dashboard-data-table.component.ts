import { Component, DestroyRef, computed, inject, input,output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EllipsisVertical, LucideAngularModule, Pencil, Plus, Search, Trash2 } from 'lucide-angular';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { LanguageService } from '@elevate/theme';
import { DashboardTableColumn, DashboardTableConfig } from './dashboard-data-table.config';
import { environment } from '../../../../environments/environment';

const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=300&auto=format&fit=crop';
const UPLOADS_BASE = `${environment.baseUrl.replace('/api/v1', '')}/uploads`;

@Component({
  selector: 'app-dashboard-data-table',
  imports: [LucideAngularModule, MenuModule, Paginator, ReactiveFormsModule, TableModule, TranslatePipe],
  templateUrl: './dashboard-data-table.component.html',
  host: { class: 'block w-full min-w-0 pb-24 lg:pb-12' },
})
export class DashboardDataTableComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);

  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly MoreVerticalIcon = EllipsisVertical;
  readonly EditIcon = Pencil;
  readonly DeleteIcon = Trash2;

  readonly config = input.required<DashboardTableConfig>();
  readonly data = input.required<unknown[] | null>();
   readonly add = output<void>();
  readonly edit = output<any>();
  readonly delete = output<any>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly first = signal(0);
  readonly searchTerm = signal('');

  readonly rows = computed(() => this.config().rowsPerPage ?? 12);
  readonly hasImage = computed(() => !!this.config().imageAccessor);

  readonly hasLoaded = computed(() => this.data() !== null);

  readonly filteredRows = computed(() => {
    const term = this.searchTerm();
    const config = this.config();
    const rows = this.data() ?? [];


    if (!term) {
      return rows;
    }

    return rows.filter((row) =>
      config.searchAccessor(row).toLowerCase().includes(term)
    );
  });

  readonly pagedRows = computed(() => {
    const rows = this.filteredRows();
    const pageSize = this.rows();
    const start = this.clampFirst(this.first(), rows.length, pageSize);

    return rows.slice(start, start + pageSize);
  });

  readonly totalRecords = computed(() => this.filteredRows().length);
  readonly showPaginator = computed(
    () => this.totalRecords() > this.rows()
  );

  readonly mobileActionItems = computed<MenuItem[]>(() => {
    this.languageService.currentLang();

    return [
      {
        label: this.translate.instant('DASHBOARD.TABLE.ACTIONS.EDIT'),
        icon: 'pi pi-pencil',
      },
      {
        label: this.translate.instant('DASHBOARD.TABLE.ACTIONS.DELETE'),
        icon: 'pi pi-trash',
      },
    ];
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        map((value) => value.trim().toLowerCase()),
        debounceTime(200),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.searchTerm.set(value);
        this.first.set(0);
      });
  }

  onPageChange(event: PaginatorState): void {
    this.first.set(event.first ?? 0);
  }

  formatCellValue(column: DashboardTableColumn, row: unknown): string {
    const value = column.value(row);

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const formattedValue = String(value);
    const suffix = column.suffixKey ? this.translate.instant(column.suffixKey) : '';

    return suffix ? `${formattedValue} ${suffix}` : formattedValue;
  }

  getColumnClass(column: DashboardTableColumn): string {
    return column.hideOnMobile ? 'hidden md:table-cell' : '';
  }

  getCellClass(column: DashboardTableColumn, row: unknown): string {
    return [this.getColumnClass(column), column.cellClass?.(row)]
      .filter(Boolean)
      .join(' ');
  }

  imageUrl(row: unknown): string {
    const image = this.config().imageAccessor?.(row);
    if (!image) return '';
    return image.startsWith('http') ? image : `${UPLOADS_BASE}/${image}`;
  }

  fallbackImage(target: EventTarget | null): void {
    if (target instanceof HTMLImageElement) {
      target.src = IMAGE_FALLBACK;
    }
  }

  private clampFirst(first: number, total: number, rows: number): number {
    if (total <= rows) {
      return 0;
    }

    const lastPageFirst = Math.floor((total - 1) / rows) * rows;
    return Math.min(first, lastPageFirst);
  }
}
