import {
  LngLat,
  Map,
  MapEvent,
  MapMouseEvent,
  NavigationControl,
  MapRef,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TripPattern, TripQuery, TripQueryVariables } from '../../gql/graphql.ts';
import { NavigationMarkers } from './NavigationMarkers.tsx';
import { LegLines } from './LegLines.tsx';
import { useMapDoubleClick } from './useMapDoubleClick.ts';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ContextMenuPopup } from './ContextMenuPopup.tsx';
import { GeometryPropertyPopup } from './GeometryPropertyPopup.tsx';
import RightMenu from './RightMenu.tsx';
import { findSelectedDebugLayers } from '../../util/map.ts';
import { FeatureSelectPopup } from './FeatureSelectPopup.tsx';
import { useReachability } from '../../hooks/useReachability.ts';
import { Marker } from 'react-map-gl/maplibre'; // <- Marker importieren
import maplibregl from 'maplibre-gl';


const styleUrl = import.meta.env.VITE_DEBUG_STYLE_URL;

type PopupData = { coordinates: LngLat; feature: any };
type FeatureSelectData = { coordinates: LngLat; features: any[] };

export function MapView({
                          tripQueryVariables,
                          setTripQueryVariables,
                          tripQueryResult,
                          selectedTripPatternIndexes,
                          loading,
                        }: {
  tripQueryVariables: TripQueryVariables;
  setTripQueryVariables: (variables: TripQueryVariables) => void;
  tripQueryResult: TripQuery | null;
  selectedTripPatternIndexes: number[];
  loading: boolean;
}) {
  const onMapDoubleClick = useMapDoubleClick({ tripQueryVariables, setTripQueryVariables });
  const [showContextPopup, setShowContextPopup] = useState<LngLat | null>(null);
  const [showPropsPopup, setShowPropsPopup] = useState<PopupData | null>(null);
  const [showFeatureSelectPopup, setShowFeatureSelectPopup] = useState<FeatureSelectData | null>(null);
  const [interactiveLayerIds, setInteractiveLayerIds] = useState<string[]>([]);
  const [cursor, setCursor] = useState<string>('auto');

  // 🔹 Hook für Reachability
  const { points: reachabilityPoints, compute: computeReachability } = useReachability();

  // 🔹 Trigger: whenever "to" marker changes
  useEffect(() => {
    const coords = tripQueryVariables.to?.coordinates;

    if (
      !coords ||
      typeof coords.latitude !== 'number' ||
      typeof coords.longitude !== 'number'
    ) {
      return; // noch nicht bereit
    }

    computeReachability(coords.latitude, coords.longitude, 4, 400);
  }, [tripQueryVariables.to]);


  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('auto'), []);
  const showFeaturePropPopup = (
    e: MapMouseEvent & {
      features?: any[];
    },
  ) => {
    if (e.features) {
      if (e.features.length === 1) setShowPropsPopup({ coordinates: e.lngLat, feature: e.features[0] });
      if (e.features.length > 1) setShowFeatureSelectPopup({ coordinates: e.lngLat, features: e.features });
    }
  };
  const panToWorldEnvelopeIfRequired = (e: MapEvent) => {
    const map = e.target;
    if (map.getZoom() < 2) {
      const source = map.getSource('stops') as any;
      map.fitBounds(source.bounds, { animate: false });
    }
  };

  const onLoad = (e: MapEvent) => {
    const map = e.target;
    map.addControl(new maplibregl.AttributionControl(), 'bottom-left');
  };

  function handleMapLoad(e: MapEvent) {
    panToWorldEnvelopeIfRequired(e);
    const selected = findSelectedDebugLayers(e.target);
    setInteractiveLayerIds(selected);
    onLoad(e);
  }

  const mapRef = useRef<MapRef>(null);

  return (
    <div className="map-container below-content">
      <Map
        attributionControl={false}
        mapLib={maplibregl}
        mapStyle={styleUrl}
        onDblClick={onMapDoubleClick}
        onContextMenu={(e) => setShowContextPopup(e.lngLat)}
        interactiveLayerIds={interactiveLayerIds}
        cursor={cursor}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={showFeaturePropPopup}
        hash={true}
        touchPitch={false}
        dragRotate={false}
        onLoad={handleMapLoad}
        ref={mapRef}
      >
        <NavigationControl position="top-left" />
        <NavigationMarkers
          setCursor={setCursor}
          tripQueryVariables={tripQueryVariables}
          setTripQueryVariables={setTripQueryVariables}
          loading={loading}
        />
        <RightMenu position="top-right" setInteractiveLayerIds={setInteractiveLayerIds} mapRef={mapRef?.current} />
        {tripQueryResult?.trip.tripPatterns.length &&
          selectedTripPatternIndexes.map((index) => {
            const tripPattern = tripQueryResult.trip.tripPatterns[index];
            return tripPattern ? <LegLines key={`trippattern-${index}`} tripPattern={tripPattern as TripPattern} /> : null;
          })}

        {/* 🔹 Reachability Markers */}
        {reachabilityPoints.map((f, i) => {
          const [lon, lat] = f.geometry.coordinates;
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

          return (
            <Marker key={i} latitude={lat} longitude={lon}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: f.properties.color,
                  border: '1px solid #000',
                }}
              />
            </Marker>
          );
        })}


        {showContextPopup && (
          <ContextMenuPopup
            tripQueryVariables={tripQueryVariables}
            setTripQueryVariables={setTripQueryVariables}
            coordinates={showContextPopup}
            onClose={() => setShowContextPopup(null)}
          />
        )}
        {showPropsPopup?.feature?.properties && (
          <GeometryPropertyPopup
            coordinates={showPropsPopup?.coordinates}
            properties={showPropsPopup?.feature?.properties}
            onClose={() => setShowPropsPopup(null)}
          />
        )}
        {showFeatureSelectPopup && (
          <FeatureSelectPopup
            {...showFeatureSelectPopup}
            setShowPropsPopup={setShowPropsPopup}
            onClose={() => setShowFeatureSelectPopup(null)}
          />
        )}
      </Map>
    </div>
  );
}
