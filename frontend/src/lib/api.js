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
    if (!name.trim() || !city_input.trim()) {
        console.error("Field cannot be empty")
        return
    }
    return request("/projects", token, {
        method: "POST",
        body: JSON.stringify({ name, city_input })
    })
}

export function createScenario(token, { name, projectId, moduleId, moduleAmount, tilt, azimuth, nominalPower }) {
    return request(`/projects/${projectId}/scenarios`, token, {
        method: "POST",
        body: JSON.stringify({ name, project_id: projectId, module_id: moduleId, module_amount: parseInt(moduleAmount), tilt: parseFloat(tilt), azimuth: parseFloat(azimuth), nominal_power: nominalPower })
    })
}

export function updateResource(token, endpoint, updates) {
    if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
        console.error("No updates provided")
        return
    }

    return request(endpoint, token, {
        method: "PATCH",
        body: JSON.stringify(updates)
    })
}

export function updateResourceField(token, endpoint, field, value, options = {}) {
    const { trim = false, normalize = (currentValue) => currentValue } = options

    if (value === null || value === undefined) {
        return
    }

    let normalizedValue = normalize(value)

    if (trim && typeof normalizedValue === "string") {
        normalizedValue = normalizedValue.trim()
    }

    return updateResource(token, endpoint, { [field]: normalizedValue })
}

export function updateProject(token, projectId, updates) {
    return updateResource(token, `/projects/${projectId}`, updates)
}

export function deleteProject(token, projectId) {
    return request(`/projects/${projectId}`, token, {
        method: "DELETE"
    })
}

export function deleteScenario(token, projectId, scenarioId) {
    return request(`/projects/${projectId}/scenarios/${scenarioId}`, token, {
        method: "DELETE"
    })
}

export function calculateScenario(token, projectId, scenarioId) {
    return request(`/projects/${projectId}/scenarios/${scenarioId}/calculate`, token, {
        method: "POST"
    })
}

export function getReport(token, projectId, scenarioId) {
    return request(`/projects/${projectId}/scenarios/${scenarioId}/report`, token, {
        method: "GET"
    })
}