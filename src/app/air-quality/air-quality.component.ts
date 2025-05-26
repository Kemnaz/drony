import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface AirQualityData {
  id: number;
  time: string;
  date: string;
  pm10: number;
  pm2_5: number;
  no2: number;
  so2: number;
  o3: number;
  aqi: number;
  quality_level: string;
  location: string;
  source: string;
  forecast_data?: boolean;
}

@Component({
  selector: 'app-air-quality',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    ReactiveFormsModule
  ],
  templateUrl: './air-quality.component.html',
  styleUrls: ['./air-quality.component.scss'],

})
export class AirQualityComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['select', 'id', 'date', 'time', 'pm2_5', 'pm10', 'no2', 'so2', 'o3', 'aqi', 'quality_level', 'location', 'actions'];
  allColumns: string[] = ['select', 'id', 'date', 'time', 'pm2_5', 'pm10', 'no2', 'so2', 'o3', 'aqi', 'quality_level', 'location', 'source', 'actions'];
  dataSource = new MatTableDataSource<AirQualityData>([]);
  selection = new SelectionModel<AirQualityData>(true, []);
  expandedElement: AirQualityData | null = null;
  isLoading = true;

  displayNameControl = new FormControl('');
  availableLocations: string[] = ['Rzeszów', 'Kraków', 'Warszawa', 'Gdańsk', 'Poznań'];
  selectedLocation = 'Rzeszów';

  columnsToDisplay = new FormControl(this.displayedColumns);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  // Column labels for better display
  columnLabels: { [key: string]: string } = {
    select: '',
    id: 'ID',
    date: 'Data',
    time: 'Czas',
    pm2_5: 'PM2.5 (μg/m³)',
    pm10: 'PM10 (μg/m³)',
    no2: 'NO₂ (μg/m³)',
    so2: 'SO₂ (μg/m³)',
    o3: 'O₃ (μg/m³)',
    aqi: 'AQI',
    quality_level: 'Jakość Powietrza',
    location: 'Lokalizacja',
    source: 'Źródło Danych',
    actions: 'Akcje',
  };

  // Column groups for better organization
  columnGroups = {
    basic: ['id', 'date', 'time', 'location', 'source'],
    particulates: ['pm2_5', 'pm10'],
    gases: ['no2', 'so2', 'o3'],
    quality: ['aqi', 'quality_level'],
    controls: ['select', 'actions'],
  };

  // Quality level colors and thresholds
  airQualityLevels = [
    { name: 'Bardzo dobra', threshold: 20, color: '#58B108' },
    { name: 'Dobra', threshold: 40, color: '#B0DD10' },
    { name: 'Umiarkowana', threshold: 60, color: '#FED93F' },
    { name: 'Dostateczna', threshold: 80, color: '#FE7D10' },
    { name: 'Zła', threshold: 100, color: '#ED1D1D' },
    { name: 'Bardzo zła', threshold: Infinity, color: '#800080' },
  ];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchAirQualityData();

    // Update displayed columns when selection changes
    this.columnsToDisplay.valueChanges.subscribe(selectedColumns => {
      if (selectedColumns && selectedColumns.length) {
        // Always keep select and actions columns
        if (!selectedColumns.includes('select')) {
          selectedColumns.unshift('select');
        }
        if (!selectedColumns.includes('actions')) {
          selectedColumns.push('actions');
        }
        this.displayedColumns = selectedColumns;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom sort for quality level
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'quality_level':
          return this.getQualityLevelSortValue(item.quality_level);
        default:
          return item[property as keyof AirQualityData] as string | number;
      }
    };

    // Custom filter
    this.dataSource.filterPredicate = (data: AirQualityData, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      return Object.keys(data).some(key => {
        const value = data[key as keyof AirQualityData];
        if (value !== null && value !== undefined) {
          return value.toString().toLowerCase().includes(filterValue);
        }
        return false;
      });
    };
  }

  fetchAirQualityData(): void {
    this.isLoading = true;
    const lat = 50.0413;
    const lon = 21.9990;
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        const data = response.hourly;
        const formattedData = data.time.map((time: string, index: number) => {
          const dateTime = new Date(time);
          const aqi = this.calculateAQI(
            data.pm2_5[index],
            data.pm10[index],
            data.nitrogen_dioxide[index],
            data.ozone[index]
          );

          return {
            id: index + 1,
            date: dateTime.toISOString().split('T')[0],
            time: dateTime.toTimeString().substring(0, 8),
            pm10: data.pm10[index],
            pm2_5: data.pm2_5[index],
            no2: data.nitrogen_dioxide[index],
            so2: data.sulphur_dioxide[index],
            o3: data.ozone[index],
            aqi: aqi,
            quality_level: this.getAirQualityLevel(aqi),
            location: this.selectedLocation,
            source: 'Open-Meteo API',
            forecast_data: index > 24
          };
        });
        this.dataSource.data = formattedData;
        this.isLoading = false;
        this.snackBar.open('Dane zostały pomyślnie załadowane', 'OK', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error fetching air quality data:', error);
        this.isLoading = false;
        this.snackBar.open('Błąd podczas ładowania danych. Spróbuj ponownie.', 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  calculateAQI(pm25: number, pm10: number, no2: number, o3: number): number {
    // Simplified AQI calculation based on European standards
    // In a real application, this would be more complex
    const pm25Index = Math.round((pm25 / 25) * 50);
    const pm10Index = Math.round((pm10 / 50) * 50);
    const no2Index = Math.round((no2 / 200) * 50);
    const o3Index = Math.round((o3 / 180) * 50);

    // Take the highest value as the AQI
    return Math.max(pm25Index, pm10Index, no2Index, o3Index);
  }

  getAirQualityLevel(aqi: number): string {
    for (const level of this.airQualityLevels) {
      if (aqi <= level.threshold) {
        return level.name;
      }
    }
    return this.airQualityLevels[this.airQualityLevels.length - 1].name;
  }

  getQualityLevelColor(qualityLevel: string): string {
    const level = this.airQualityLevels.find(l => l.name === qualityLevel);
    return level ? level.color : '#000000';
  }

  getQualityLevelSortValue(qualityLevel: string): number {
    // Convert quality level string to number for sorting
    return this.airQualityLevels.findIndex(l => l.name === qualityLevel);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportData() {
    try {
      const data = this.selection.selected.length > 0
        ? this.selection.selected
        : this.dataSource.data;

      // Convert data to CSV
      const headers = Object.keys(this.columnLabels)
        .filter(key => key !== 'select' && key !== 'actions')
        .map(key => this.columnLabels[key]);

      const rows = data.map(item => {
        return Object.keys(this.columnLabels)
          .filter(key => key !== 'select' && key !== 'actions')
          .map(key => item[key as keyof AirQualityData]);
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `air-quality-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);

      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Dane zostały wyeksportowane', 'OK', { duration: 3000 });
    } catch (error) {
      console.error('Error exporting data:', error);
      this.snackBar.open('Błąd podczas eksportu danych', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  clearFilter() {
    this.input.nativeElement.value = '';
    this.dataSource.filter = '';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  refreshData() {
    this.fetchAirQualityData();
  }

  onLocationChange() {
    this.fetchAirQualityData();
  }

  getColumnLabel(column: string): string {
    return this.columnLabels[column] || column;
  }

  formatValue(column: string, value: any): string {
    if (value === null || value === undefined) return '-';

    // Format numbers based on column type
    if (typeof value === 'number') {
      if (['pm2_5', 'pm10', 'no2', 'so2', 'o3'].includes(column)) {
        return value.toFixed(1);
      } else if (column === 'aqi') {
        return Math.round(value).toString();
      } else {
        return value.toString();
      }
    }

    return value.toString();
  }

  // Selection methods
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: AirQualityData): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  // Action methods
  viewDetails(element: AirQualityData) {
    // In a real application, you would open a dialog with details
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  deleteRow(element: AirQualityData) {
    const index = this.dataSource.data.findIndex(item => item.id === element.id);
    if (index > -1) {
      const data = [...this.dataSource.data];
      data.splice(index, 1);
      this.dataSource.data = data;
      this.snackBar.open('Wiersz został usunięty', 'OK', { duration: 3000 });
    }
  }

  downloadRowData(element: AirQualityData) {
    try {
      const dataStr = JSON.stringify(element, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `air-quality-data-row-${element.id}.json`);
      document.body.appendChild(a);

      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      this.snackBar.open('Dane zostały pobrane', 'OK', { duration: 3000 });
    } catch (error) {
      console.error('Error downloading row data:', error);
      this.snackBar.open('Błąd podczas pobierania danych', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
