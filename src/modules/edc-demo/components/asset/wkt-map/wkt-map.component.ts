import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import * as L from 'leaflet';

declare module 'leaflet' {
  interface Map {
    pm: {
      addControls: (options?: any) => void;
      enableDraw: (type: string, options?: any) => void;
      disableDraw: () => void;
    };
  }

  namespace PM {
    interface DrawOptions {
      snappable?: boolean;
      templineStyle?: any;
    }
  }
}
import 'leaflet.pm';
import * as wellknown from 'wellknown';

@Component({
  selector: 'app-wkt-map',
  templateUrl: './wkt-map.component.html',
  styleUrls: ['./wkt-map.component.scss']
})
export class WktMapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Output() wktChange = new EventEmitter<string>();

  private map!: L.Map;
  private drawnLayer?: L.Layer;

  ngAfterViewInit(): void {
    this.initMap();
    this.enableDrawingTools();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private enableDrawingTools(): void {
    this.map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: true,
      drawPolyline: true,
      drawPolygon: true,
      drawRectangle: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true
    });

    // Listen for shape creation
    this.map.on('pm:create', (e: any) => {
      // Clear previous layer if any
      if (this.drawnLayer) {
        this.map.removeLayer(this.drawnLayer);
      }

      this.drawnLayer = e.layer;

      const geojson = e.layer.toGeoJSON();
      const wkt = wellknown.stringify(geojson.geometry);
      this.wktChange.emit(wkt);
    });

    // Listen for edits (only first layer supported for now)
    this.map.on('pm:edit', () => {
      if (this.drawnLayer) {
        const geojson = (this.drawnLayer as any).toGeoJSON();
        const wkt = wellknown.stringify(geojson.geometry);
        this.wktChange.emit(wkt);
      }
    });

    // Listen for deletions
    this.map.on('pm:remove', () => {
      this.drawnLayer = undefined;
      this.wktChange.emit('');
    });
  }
}
