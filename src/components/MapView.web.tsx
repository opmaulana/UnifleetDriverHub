import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

const DEFAULT_REGION = {
  latitude: -7.5,
  longitude: 36.5,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

const MapView = React.forwardRef(({ style, children, initialRegion }: any, ref: any) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Expose methods to match native ref methods
  React.useImperativeHandle(ref, () => ({
    animateToRegion: (region: any, duration?: number) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'PAN_TO',
            data: {
              latitude: region.latitude,
              longitude: region.longitude,
              zoom: region.latitudeDelta < 1 ? 10 : 6,
            },
          },
          '*'
        );
      }
    },
    fitToCoordinates: (coordinates: any[], options?: any) => {
      if (coordinates && coordinates.length > 0) {
        let sumLat = 0;
        let sumLng = 0;
        coordinates.forEach(c => {
          sumLat += c.latitude;
          sumLng += c.longitude;
        });
        const avgLat = sumLat / coordinates.length;
        const avgLng = sumLng / coordinates.length;

        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'PAN_TO',
              data: {
                latitude: avgLat,
                longitude: avgLng,
                zoom: 10,
              },
            },
            '*'
          );
        }
      }
    },
  }));

  // Parse children markers
  const markersData = React.useMemo(() => {
    return React.Children.toArray(children)
      .filter((child: any) => child && child.props && child.props.coordinate)
      .map((child: any, index) => {
        const { coordinate, identifier, title, description, onPress, statusColor, initials: propInitials, selected: propSelected } = child.props;
        const markerId = identifier || title || description || `marker-${index}`;
        
        // 1. Direct props resolve (bulletproof)
        let color = statusColor || '#7F8C8D';
        let initials = propInitials || '';
        let isSelected = propSelected !== undefined ? propSelected : false;

        // 2. Traversal fallback if props are missing
        if (!statusColor || !propInitials) {
          if (child.props.children) {
            const innerView = child.props.children;
            if (innerView && innerView.props && innerView.props.style) {
              const flattenedStyle = StyleSheet.flatten(innerView.props.style);
              if (flattenedStyle && (flattenedStyle as any).backgroundColor) {
                if (!statusColor) color = (flattenedStyle as any).backgroundColor;
              }
              if (flattenedStyle && (flattenedStyle as any).borderWidth > 0) {
                if (propSelected === undefined) isSelected = true;
              }
            }
            // Extract text initials if a custom Text child exists
            const innerChildren = React.Children.toArray(innerView.props.children);
            const textChild: any = innerChildren.find(
              (c: any) => c && c.props && typeof c.props.children === 'string'
            );
            if (textChild && !propInitials) {
              initials = textChild.props.children;
            }
          }
        }

        // Fallback initials calculation
        if (!initials && markerId) {
          const clean = markerId.replace(/[^a-zA-Z0-9]/g, '').trim();
          initials = clean.substring(0, 2).toUpperCase();
        } else if (!initials) {
          initials = 'TR';
        }

        return {
          id: markerId,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          color,
          initials,
          selected: isSelected,
          onPress,
        };
      });
  }, [children]);

  // Parse children polylines
  const polylinesData = React.useMemo(() => {
    return React.Children.toArray(children)
      .filter((child: any) => child && child.props && child.props.coordinates)
      .map((child: any) => ({
        coordinates: child.props.coordinates,
        strokeColor: child.props.strokeColor || '#C0392B',
        strokeWidth: child.props.strokeWidth || 4,
      }));
  }, [children]);

  // Sync markers with Leaflet map
  useEffect(() => {
    if (isMapLoaded && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_MARKERS',
          data: markersData.map(m => ({
            id: m.id,
            latitude: m.latitude,
            longitude: m.longitude,
            color: m.color,
            initials: m.initials,
            selected: m.selected,
          })),
        },
        '*'
      );
    }
  }, [markersData, isMapLoaded]);

  // Sync polylines with Leaflet map
  useEffect(() => {
    if (isMapLoaded && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_POLYLINES',
          data: polylinesData,
        },
        '*'
      );
    }
  }, [polylinesData, isMapLoaded]);

  // Handle click messages from inside the iframe map
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MARKER_CLICKED') {
        const marker = markersData.find(m => m.id === event.data.id);
        if (marker && marker.onPress) {
          marker.onPress();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [markersData]);

  // Leaflet map code inside an iframe
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #F8F9FA; }
        .custom-marker {
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-weight: 800;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.35);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        /* Override Leaflet icon wrapper borders */
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-zoom-anim .leaflet-zoom-animated {
          transition: transform 0.25s cubic-bezier(0,0,0.25,1);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const initialLat = ${initialRegion?.latitude || DEFAULT_REGION.latitude};
        const initialLng = ${initialRegion?.longitude || DEFAULT_REGION.longitude};
        
        const map = L.map('map', { zoomControl: false }).setView([initialLat, initialLng], 6);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);
 
        L.control.zoom({ position: 'topright' }).addTo(map);
 
        let markerMap = {};
        let activePolylines = [];
 
        window.addEventListener('message', (event) => {
          if (!event.data || typeof event.data !== 'object') return;
          const { type, data } = event.data;
          
          if (type === 'UPDATE_MARKERS' && Array.isArray(data)) {
            const currentIds = new Set(data.map(m => m.id).filter(Boolean));
            
            // Remove old markers
            Object.keys(markerMap).forEach(id => {
              if (!currentIds.has(id)) {
                map.removeLayer(markerMap[id]);
                delete markerMap[id];
              }
            });
 
            // Update or add markers
            data.forEach(m => {
              if (!m.id) return;
              const size = m.selected ? 36 : 28;
              const border = m.selected ? '3px solid #FFFFFF' : '2px solid #FFFFFF';
              const scale = m.selected ? 'scale(1.2)' : 'scale(1)';
              
              const icon = L.divIcon({
                className: 'custom-div-icon',
                html: \`<div class="custom-marker" style="background-color: \${m.color}; width: \${size}px; height: \${size}px; font-size: \${m.selected ? 12 : 9}px; border: \${border}; transform: \${scale};">\${m.initials}</div>\`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
              });
 
              if (markerMap[m.id]) {
                markerMap[m.id].setLatLng([m.latitude, m.longitude]);
                markerMap[m.id].setIcon(icon);
              } else {
                const marker = L.marker([m.latitude, m.longitude], { icon })
                  .addTo(map)
                  .on('click', () => {
                    window.parent.postMessage({ type: 'MARKER_CLICKED', id: m.id }, '*');
                  });
                markerMap[m.id] = marker;
              }
            });
          } else if (type === 'UPDATE_POLYLINES' && Array.isArray(data)) {
            // Remove old polylines
            activePolylines.forEach(pl => map.removeLayer(pl));
            activePolylines = [];
            
            // Add new polylines
            data.forEach(pl => {
              if (pl.coordinates && pl.coordinates.length > 0) {
                const leafletCoords = pl.coordinates.map(c => [c.latitude, c.longitude]);
                const polyline = L.polyline(leafletCoords, {
                  color: pl.strokeColor || '#C0392B',
                  weight: pl.strokeWidth || 4,
                  opacity: 0.85
                }).addTo(map);
                activePolylines.push(polyline);
              }
            });
          } else if (type === 'PAN_TO') {
            map.setView([data.latitude, data.longitude], data.zoom || 8, { animate: true, duration: 0.8 });
          }
        });
 
        window.parent.postMessage({ type: 'MAP_LOADED' }, '*');
      </script>
    </body>
    </html>
  `;

  // Monitor map load and push initial state
  useEffect(() => {
    const handleLoadMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MAP_LOADED') {
        setIsMapLoaded(true);
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'UPDATE_MARKERS',
              data: markersData.map(m => ({
                id: m.id,
                latitude: m.latitude,
                longitude: m.longitude,
                color: m.color,
                initials: m.initials,
                selected: m.selected,
              })),
            },
            '*'
          );
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'UPDATE_POLYLINES',
              data: polylinesData,
            },
            '*'
          );
        }
      }
    };
    window.addEventListener('message', handleLoadMessage);
    return () => window.removeEventListener('message', handleLoadMessage);
  }, [markersData, polylinesData]);

  return (
    <View style={[style, styles.container]}>
      <iframe
        ref={iframeRef}
        srcDoc={mapHtml}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Operations Live Telemetry Map"
        onLoad={() => {
          setIsMapLoaded(true);
        }}
      />
    </View>
  );
});

MapView.displayName = 'MapView';

export const Marker = ({ children }: any) => <>{children}</>;
export const Polyline = ({ coordinates, strokeColor, strokeWidth }: any) => <>{null}</>;
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
});

export default MapView;
