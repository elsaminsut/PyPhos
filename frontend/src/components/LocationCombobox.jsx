import { useState, useEffect, useContext } from "react"

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

import { AuthContext } from "../lib/AuthContext"
import { searchLocations } from "../lib/api"

const DEBOUNCE_MS = 300

function formatLocation(candidate) {
    if (!candidate) return ""
    return [candidate.name, candidate.admin1, candidate.country_code].filter(Boolean).join(", ")
}

function isSameLocation(a, b) {
    return a?.name === b?.name && a?.country_code === b?.country_code && a?.lat === b?.lat && a?.lon === b?.lon
}

// value: { name, country_code, admin1, lat, lon } | null
export default function LocationCombobox({ id, value, onSelect, ariaInvalid, onBlur, onInputChange }) {
    const { token } = useContext(AuthContext)

    const [query, setQueryState] = useState(() => formatLocation(value))
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    function setQuery(next) {
        setQueryState(next)
        onInputChange?.(next)
    }

    useEffect(() => {
        function syncQuery() {
            setQuery(formatLocation(value))
        }

        syncQuery()
    }, [value])

    useEffect(() => {
        function search() {
            if (!query.trim() || query === formatLocation(value)) {
                setLoading(false)
                return
            }

            setLoading(true)
            const timeout = setTimeout(async () => {
                try {
                    const candidates = await searchLocations(token, query)
                    setResults(candidates ?? [])
                } catch {
                    setResults([])
                } finally {
                    setLoading(false)
                }
            }, DEBOUNCE_MS)

            return () => clearTimeout(timeout)
        }

        return search()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, token])

    return (
        <Combobox
            items={results}
            filter={null}
            inputValue={query}
            onInputValueChange={setQuery}
            value={value}
            onValueChange={onSelect}
            itemToStringLabel={formatLocation}
            itemToStringValue={formatLocation}
            isItemEqualToValue={isSameLocation}
        >
            <ComboboxInput
                id={id}
                placeholder="Search for a city..."
                aria-invalid={ariaInvalid}
                onBlur={onBlur}
            />
            <ComboboxContent>
                <ComboboxEmpty>
                    {loading ? "Searching..." : query.trim() ? "No cities found." : "Type to search for a city"}
                </ComboboxEmpty>
                <ComboboxList>
                    {(candidate) => (
                        <ComboboxItem
                            key={`${candidate.name}-${candidate.country_code}-${candidate.lat}-${candidate.lon}`}
                            value={candidate}
                        >
                            {formatLocation(candidate)}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}