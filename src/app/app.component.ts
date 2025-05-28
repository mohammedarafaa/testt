import { Component, Inject, OnInit, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `<div id="map" style="height: 100vh; width: 100vw;"></div>`,
  styles: []
})
export class AppComponent implements OnInit, AfterViewInit {
  private map: any;
  private L: any;
  private geojsonLayer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Dynamic import of Leaflet
    this.L = await import('leaflet');
    this.initMap();
  }

  ngAfterViewInit() {
    // Ensure map is invalidated after view is initialized
    if (this.map) this.map.invalidateSize();
  }

  private initMap(): void {
    // Initialize map with Egypt center and zoom level
    this.map = this.L.map('map', {
      center: [26.8206, 30.8025],
      zoom: 6,
 zoomControl: true,
    dragging: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    touchZoom: true,
    scrollWheelZoom: true
    });

    // Add tile layer
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      noWrap: true
    }).addTo(this.map);

    // Load GeoJSON data
    this.http.get('/egypt-governorates.geojson').subscribe({
      next: (data: any) => {
        this.geojsonLayer = this.L.geoJSON(data, {
          style: this.styleFeature.bind(this),
          onEachFeature: this.onEachFeature.bind(this),
        }).addTo(this.map);
      },
      error: (err) => {
        console.error('Failed to load GeoJSON:', err);
      }
    });
  }

  private styleFeature(feature: any): any {
    return {
      fillColor: this.getRandomColor(),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7,
    };
  }

private onEachFeature(feature: any, layer: any): void {
  const name = feature.properties?.name || 'محافظة';
  const population = feature.properties?.pollution || 0;
  const populationText = population ? `عدد السكان: ${population.toLocaleString()}` : '';

  // Modern popup content with icons (use Font Awesome or similar)
  const popupContent = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      padding: 10px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      max-width: 220px;
      line-height: 1.5;
    ">
      <h3 style="
        margin: 0 0 8px 0;
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
      ">
        <i class="fas fa-map-marker-alt" style="color: #e74c3c; margin-right: 8px;"></i>
        ${name}
      </h3>
      <p style="margin: 0;">
        <i class="fas fa-users" style="color: #3498db; margin-right: 8px;"></i>
        ${populationText}
      </p>
    </div>
  `;


  layer.bindPopup(popupContent);

  layer.on({
    mouseover: (e: any) => this.highlightFeature(e),
    mouseout: (e: any) => this.resetHighlight(e),
    click: (e: any) => this.zoomToFeature(e),
  });
}


  private highlightFeature(e: any): void {
    const layer = e.target;
    layer.setStyle({
      weight: 3,
      color: '#666',
      fillOpacity: 0.9,
    });

    if (!this.L.Browser.ie && !this.L.Browser.opera && !this.L.Browser.edge) {
      layer.bringToFront();
    }
  }

  private resetHighlight(e: any): void {
    this.geojsonLayer.resetStyle(e.target);
  }

  private zoomToFeature(e: any): void {
    this.map.fitBounds(e.target.getBounds());
  }

  private getRandomColor(): string {

const colors = [
  '#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557', // Original
  '#FF9F1C', '#FFBF69', '#CBF3F0', '#2EC4B6', '#011627', // Added
  '#FF69B4', '#A2D2FF', '#BDE0FE', '#CDB4DB', '#FFC8DD', // Added
  '#06D6A0', '#118AB2', '#EF476F', '#FFD166', '#073B4C', // Added
  '#5E548E', '#9F86C0', '#BE95C4', '#E0B1CB', '#F8F9FA'  // Added
];
 // Adde;

    return colors[Math.floor(Math.random() * colors.length)];
  }
}
