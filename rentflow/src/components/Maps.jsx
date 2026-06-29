import { useEffect, useRef, useState } from 'react'

const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return }
    if (!MAP_KEY) { reject(new Error('No API key')); return }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_KEY}&libraries=places`
    s.async = true
    s.onload = () => resolve(window.google.maps)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// Read-only map showing a geocoded location
export function PropertyMap({ location }) {
  const ref = useRef(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!location) return
    loadGoogleMaps().then(maps => {
      const geocoder = new maps.Geocoder()
      geocoder.geocode({ address: location }, (results, gstatus) => {
        if (gstatus === 'OK' && ref.current) {
          const pos = results[0].geometry.location
          const map = new maps.Map(ref.current, {
            center: pos, zoom: 15,
            styles: darkMapStyle,
            disableDefaultUI: false,
            mapTypeControl: false,
          })
          new maps.Marker({ position: pos, map, title: location })
          setStatus('ok')
        } else {
          setError('Could not geocode location')
          setStatus('error')
        }
      })
    }).catch(() => { setStatus('no-key') })
  }, [location])

  if (status === 'no-key') return (
    <div className="map-container" style={{ flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 32 }}>🗺️</span>
      <span style={{ fontSize: 13 }}>Set VITE_GOOGLE_MAPS_API_KEY to show map</span>
      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{location}</span>
    </div>
  )

  if (error) return (
    <div className="map-container">
      <span style={{ color: 'var(--danger)', fontSize: 13 }}>⚠ {error}</span>
    </div>
  )

  return <div ref={ref} className="map-container" style={{ background: 'var(--bg3)' }} />
}

// Autocomplete input for property creation
export function PlacesAutocomplete({ value, onChange }) {
  const inputRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!MAP_KEY) { setReady(false); return }
    loadGoogleMaps().then(maps => {
      if (!inputRef.current) return
      const ac = new maps.places.Autocomplete(inputRef.current, { types: ['geocode'] })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        if (place.formatted_address) onChange(place.formatted_address)
        else if (place.name) onChange(place.name)
      })
      setReady(true)
    }).catch(() => setReady(false))
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="form-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={ready ? 'Start typing an address…' : 'Enter location'}
      />
      {!MAP_KEY && (
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text3)' }}>
          Maps key not set
        </span>
      )}
    </div>
  )
}

// Dark map style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a24' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a0a0b8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a24' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111118' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#252535' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#252535' }] },
]
