import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

export default function Map({ lat, lon, zoom = 13, className }) {
    const containerRef = useRef(null)
    const mapRef = useRef(null)
    const markerRef = useRef(null)

    useEffect(() => {
        if (!containerRef.current || lat == null || lon == null) return

        if (!mapRef.current) {
            const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([lat, lon], zoom)

            L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
                maxZoom: 20,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }).addTo(map)

            markerRef.current = L.marker([lat, lon]).addTo(map)
            mapRef.current = map
        } else {
            mapRef.current.setView([lat, lon], zoom)
            markerRef.current?.setLatLng([lat, lon])
        }
    }, [lat, lon, zoom])

    useEffect(() => {
        return () => {
            mapRef.current?.remove()
            mapRef.current = null
        }
    }, [])

    if (lat == null || lon == null) return null

    return <div ref={containerRef} className={className} />
}
