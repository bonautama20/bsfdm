import React, { useMemo, useState } from "react";
import { feature } from "topojson-client";
import topology from "../assets/data/id-provinces.topo.json";

// Indonesia provinces map (MIT-licensed topojson, see data/indonesiaProvinces.js
// for attribution) rendered as a simple equirectangular projection — accurate
// enough at Indonesia's latitude span and avoids pulling in a full d3-geo/
// react-simple-maps dependency just to draw 38 shapes.
const OBJECT_KEY = Object.keys(topology.objects)[0];
const FEATURES = feature(topology, topology.objects[OBJECT_KEY]).features;

function ringToPoints(ring, minLon, maxLat) {
  return ring.map(([lon, lat]) => `${(lon - minLon).toFixed(3)},${(maxLat - lat).toFixed(3)}`).join(" L ");
}

function geometryToPath(geometry, minLon, maxLat) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .map((poly) => poly.map((ring) => `M ${ringToPoints(ring, minLon, maxLat)} Z`).join(" "))
    .join(" ");
}

const bounds = FEATURES.reduce(
  (b, f) => {
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    polys.forEach((poly) => poly.forEach((ring) => ring.forEach(([lon, lat]) => {
      if (lon < b.minLon) b.minLon = lon;
      if (lon > b.maxLon) b.maxLon = lon;
      if (lat < b.minLat) b.minLat = lat;
      if (lat > b.maxLat) b.maxLat = lat;
    })));
    return b;
  },
  { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity }
);

const VIEW_W = bounds.maxLon - bounds.minLon;
const VIEW_H = bounds.maxLat - bounds.minLat;

const PROVINCE_PATHS = FEATURES.map((f) => ({
  name: f.properties.PROVINSI,
  d: geometryToPath(f.geometry, bounds.minLon, bounds.maxLat),
}));

export default function CommunityMap({ counts = {}, selected = null, onSelect }) {
  const [hovered, setHovered] = useState(null);

  const maxCount = useMemo(() => Math.max(1, ...Object.values(counts)), [counts]);

  const colorFor = (name) => {
    const c = counts[name] || 0;
    if (c === 0) return "#E3E9E2";
    const t = 0.28 + 0.62 * (c / maxCount);
    return `rgba(1, 97, 60, ${t.toFixed(2)})`;
  };

  const activeName = hovered || selected;
  const activeCount = activeName ? counts[activeName] || 0 : null;

  return (
    <div className="community-map">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label="Peta sebaran komunitas pembudidaya maggot di Indonesia">
        {PROVINCE_PATHS.map((p) => (
          <path
            key={p.name}
            d={p.d}
            fill={colorFor(p.name)}
            stroke={selected === p.name ? "#01613C" : "#fff"}
            strokeWidth={selected === p.name ? 1.4 : 0.6}
            className="cm-province"
            onMouseEnter={() => setHovered(p.name)}
            onMouseLeave={() => setHovered((h) => (h === p.name ? null : h))}
            onClick={() => onSelect?.(selected === p.name ? null : p.name)}
          >
            <title>{`${p.name}: ${counts[p.name] || 0}`}</title>
          </path>
        ))}
      </svg>
      {activeName && (
        <div className="cm-tooltip">
          <b>{activeName}</b> — {activeCount} pembudidaya
        </div>
      )}
    </div>
  );
}
