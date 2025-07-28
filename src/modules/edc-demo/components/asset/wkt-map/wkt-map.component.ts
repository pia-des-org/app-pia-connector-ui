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
      disableGlobalEditMode: () => void;
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
  private drawnLayers = L.featureGroup();

  ngAfterViewInit(): void {
    this.initMap();
    this.enableDrawingTools();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.drawnLayers.addTo(this.map);
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

    this.map.on('pm:create', (e: any) => {
      this.drawnLayers.addLayer(e.layer);
      this.map.pm.disableGlobalEditMode();
      this.emitWktFromAllLayers();
    });

    this.map.on('pm:edit', () => {
      this.emitWktFromAllLayers();
    });

    this.map.on('pm:remove', (e: any) => {
      this.emitWktFromAllLayers();
    });
  }

  private emitWktFromAllLayers(): void {
    const geometries: GeoJSON.Geometry[] = [];

    this.drawnLayers.eachLayer((layer: any) => {
      const geoJson = layer.toGeoJSON() as GeoJSON.Feature;
      if (geoJson.geometry) {
        geometries.push(geoJson.geometry);
      }
    });

    const geometryCollection = {
      type: 'GeometryCollection',
      geometries
    };

    const wkt = wellknown.stringify(geometryCollection as any);
    this.wktChange.emit(wkt);

  }


}
