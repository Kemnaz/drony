import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface AirQualityData {
  Date: string;
  Time: string;
  PM25: number;
  PM10: number;
  IAQ: number;
  HCHO: number;
  CO2: number;
  P: number;
  TIN: number;
  TOUT: number;
  RHIN: number;
  RHOUT: number;
  LAT: number;
  LON: number;
  HDG: number;
  AMSL: number;
  AGL: number;
  MIL: number;
  NO2: number;
  NO: number;
  SO2: number;
  H2S: number;
  CO: number;
  HCN: number;
  HCL: number;
  NH3: number;
  EC: number;
  MRK: string;
}

// Sample data - replace with your actual data
const SAMPLE_DATA: AirQualityData[] = [
  {
    Date: '2024-01-15',
    Time: '14:30:00',
    PM25: 15.2,
    PM10: 28.5,
    IAQ: 85,
    HCHO: 0.02,
    CO2: 420,
    P: 1013.2,
    TIN: 22.5,
    TOUT: 18.3,
    RHIN: 45,
    RHOUT: 52,
    LAT: 50.0647,
    LON: 19.945,
    HDG: 180,
    AMSL: 219,
    AGL: 2,
    MIL: 0,
    NO2: 35,
    NO: 15,
    SO2: 8,
    H2S: 0.5,
    CO: 1.2,
    HCN: 0.1,
    HCL: 0.05,
    NH3: 2.1,
    EC: 0.8,
    MRK: 'OK',
  },
  {
    Date: '2024-01-15',
    Time: '14:35:00',
    PM25: 16.8,
    PM10: 30.1,
    IAQ: 82,
    HCHO: 0.03,
    CO2: 425,
    P: 1013.0,
    TIN: 22.7,
    TOUT: 18.5,
    RHIN: 44,
    RHOUT: 51,
    LAT: 50.0648,
    LON: 19.9451,
    HDG: 182,
    AMSL: 219,
    AGL: 2,
    MIL: 0,
    NO2: 37,
    NO: 16,
    SO2: 9,
    H2S: 0.6,
    CO: 1.3,
    HCN: 0.12,
    HCL: 0.06,
    NH3: 2.3,
    EC: 0.9,
    MRK: 'OK',
  },
];

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'Date',
    'Time',
    'PM25',
    'PM10',
    'IAQ',
    'HCHO',
    'CO2',
    'P',
    'TIN',
    'TOUT',
    'RHIN',
    'RHOUT',
    'LAT',
    'LON',
    'HDG',
    'AMSL',
    'AGL',
    'MIL',
    'NO2',
    'NO',
    'SO2',
    'H2S',
    'CO',
    'HCN',
    'HCL',
    'NH3',
    'EC',
    'MRK',
  ];

  dataSource = new MatTableDataSource(SAMPLE_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Column groups for better organization
  columnGroups = {
    basic: ['Date', 'Time', 'MRK'],
    particulates: ['PM25', 'PM10'],
    airQuality: ['IAQ', 'HCHO', 'CO2'],
    environmental: ['P', 'TIN', 'TOUT', 'RHIN', 'RHOUT'],
    location: ['LAT', 'LON', 'HDG', 'AMSL', 'AGL', 'MIL'],
    gases: ['NO2', 'NO', 'SO2', 'H2S', 'CO', 'HCN', 'HCL', 'NH3', 'EC'],
  };

  // Column labels for better display
  columnLabels: { [key: string]: string } = {
    Date: 'Date',
    Time: 'Time',
    PM25: 'PM2.5 (μg/m³)',
    PM10: 'PM10 (μg/m³)',
    IAQ: 'IAQ',
    HCHO: 'HCHO (mg/m³)',
    CO2: 'CO₂ (ppm)',
    P: 'Pressure (hPa)',
    TIN: 'T In (°C)',
    TOUT: 'T Out (°C)',
    RHIN: 'RH In (%)',
    RHOUT: 'RH Out (%)',
    LAT: 'Latitude',
    LON: 'Longitude',
    HDG: 'Heading (°)',
    AMSL: 'AMSL (m)',
    AGL: 'AGL (m)',
    MIL: 'MIL',
    NO2: 'NO₂ (μg/m³)',
    NO: 'NO (μg/m³)',
    SO2: 'SO₂ (μg/m³)',
    H2S: 'H₂S (μg/m³)',
    CO: 'CO (mg/m³)',
    HCN: 'HCN (μg/m³)',
    HCL: 'HCL (μg/m³)',
    NH3: 'NH₃ (μg/m³)',
    EC: 'EC (μg/cm³)',
    MRK: 'Marker',
  };

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportData() {
    console.log('Export data functionality to be implemented');
    // Implement export functionality (CSV, Excel, etc.)
  }

  getColumnLabel(column: string): string {
    return this.columnLabels[column] || column;
  }

  formatValue(column: string, value: any): string {
    if (value === null || value === undefined) return '-';

    // Format numbers based on column type
    if (typeof value === 'number') {
      if (['LAT', 'LON'].includes(column)) {
        return value.toFixed(4);
      } else if (['PM25', 'PM10', 'TIN', 'TOUT', 'P'].includes(column)) {
        return value.toFixed(1);
      } else if (['HCHO', 'H2S', 'HCN', 'HCL'].includes(column)) {
        return value.toFixed(3);
      } else if (['CO', 'NH3', 'EC'].includes(column)) {
        return value.toFixed(2);
      } else {
        return value.toString();
      }
    }

    return value.toString();
  }
}
