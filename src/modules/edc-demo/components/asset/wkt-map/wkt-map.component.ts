import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import * as L from 'leaflet';

/**
 * Module augmentation for Leaflet to support leaflet.pm plugin typings.
 * This adds support for the `map.pm` API and custom drawing options,
 * which are not included in the default Leaflet TypeScript definitions.
 */
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

/**
 * A map component using Leaflet and leaflet.pm to allow users
 * to draw geometries and emit the result as WKT (Well-Known Text).
 *
 * Features:
 * - Supports drawing of polygons, polylines, rectangles, etc.
 * - Emits a GeometryCollection in WKT format after create/edit/remove
 */
@Component({
  selector: 'app-wkt-map',
  templateUrl: './wkt-map.component.html',
  styleUrls: ['./wkt-map.component.scss']
})
export class WktMapComponent implements AfterViewInit {
  /** Reference to the HTML element that will contain the Leaflet map. */
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  /**
   * Emits a WKT string representing the full set of drawn geometries.
   * Triggered after any create/edit/remove action on the map.
   */
  @Output() wktChange = new EventEmitter<string>();

  /** The Leaflet map instance. */
  private map!: L.Map;

  /** Layer group for storing and tracking drawn shapes. */
  private drawnLayers = L.featureGroup();

  /**
   * Lifecycle hook: Initializes map and drawing tools after the view is loaded.
   */
  ngAfterViewInit(): void {
    this.initMap();
    this.enableDrawingTools();
  }

  /**
   * Initializes the Leaflet map and adds a basic OpenStreetMap tile layer.
   */
  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.drawnLayers.addTo(this.map);
  }

  /**
   * Enables drawing/editing tools using leaflet.pm and sets up event listeners
   * for create/edit/delete actions to keep the emitted WKT up to date.
   */
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

  /**
   * Converts all drawn shapes to a GeometryCollection and emits it as a WKT string.
   */
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

