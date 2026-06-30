import { useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

export function useApi(endpoint) {
    const { token } = useContext(AuthContext)
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!token) return

        setLoading(true)
        setData(null)
        setError(null)

        const fetchContent = async () => {
            try {
                const response = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!response.ok) {
                    setError(response.status)
                    return
                }
                const json = await response.json()
                setData(json)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchContent()
    }, [token, endpoint])

    return { data, loading, error }
}