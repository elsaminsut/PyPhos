import { useState, useEffect, useContext } from "react"
import { AuthContext } from "./AuthContext"

const BASE_URL = "/api"

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

async function request(endpoint, token, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    })

    if (!response.ok) {
        const error = new Error("API request failed")
        error.status = response.status
        try {
            error.detail = (await response.json()).detail
        } catch {
            error.detail = null
        }
        throw error
    }

    return response.json()
}

export function createProject(token, { name, city_input }) {
    return request("/projects", token, {
        method: "POST",
        body: JSON.stringify({ name, city_input })
    })
}

export function updateProject(token, projectId, updates) {
    return request(`/projects/${projectId}`, token, {
        method: "PATCH",
        body: JSON.stringify(updates)
    })
}