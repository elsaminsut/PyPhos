import { useContext, useMemo } from 'react'
import { AuthContext } from './AuthContext'
import {
    useApi,
    createProject as createProjectApi,
    updateProjectApi,
    deleteProjectApi,
    createScenarioApi,
    deleteScenarioApi,
    calculateScenarioApi,
    getReportApi,
    getDemoReportApi,
    updateResource,
} from './api'
import {
    getLocalProject,
    getLocalProjects,
    createLocalProject,
    updateLocalProject,
    deleteLocalProject,
    getLocalScenarios,
    getLocalScenario,
    createLocalScenario,
    updateLocalScenario,
    deleteLocalScenario,
    setLocalReport,
} from './localData'

export function useProjects() {
    const { isGuest } = useContext(AuthContext)
    const demoResult = useApi("/api/projects/demo")
    const apiResult = useApi(isGuest ? null : `/api/projects`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const localResult = useMemo(() => getLocalProjects(), [isGuest])
    const projects = isGuest ? localResult : (apiResult.data ?? [])

    return { data: [...(demoResult.data ?? []), ...projects], loading: false, error: null }
}

export function useProject(projectId) {
    const { isGuest } = useContext(AuthContext)

    // Logged-in users: try the real per-user endpoint first (the common case —
    // most projects aren't demos), only falling back to the demo endpoint if
    // that comes back empty.
    const apiResult = useApi(isGuest ? null : `/api/projects/${projectId}`)
    const apiSettledEmpty = !isGuest && !apiResult.loading && !apiResult.data

    // Guests have no token, so they always try the (unauthenticated) demo
    // endpoint first, falling back to their own local storage.
    const demoResult = useApi(isGuest || apiSettledEmpty ? `/api/projects/demo/${projectId}` : null)

    const localResult = useMemo(
        () => (isGuest && !demoResult.loading && !demoResult.data ? getLocalProject(projectId) : null),
        [isGuest, projectId, demoResult.loading, demoResult.data]
    )

    if (!isGuest) {
        if (apiResult.loading) return { data: null, loading: true, error: null }
        if (apiResult.data) return apiResult
        if (demoResult.loading) return { data: null, loading: true, error: null }
        if (demoResult.data) return demoResult
        return apiResult // neither matched - surface the original (more meaningful) error
    }

    if (demoResult.loading) return { data: null, loading: true, error: null }
    if (demoResult.data) return demoResult
    return { data: localResult, loading: false, error: null }
}

export function useCreateProject() {
    const { isGuest, token } = useContext(AuthContext)

    return function createProject(projectData) {
        return isGuest
            ? createLocalProject(projectData)
            : createProjectApi(token, projectData)
    }
}

export function useUpdateProject() {
    const { isGuest, token } = useContext(AuthContext)

    return function updateProject(projectId, updates) {
        return isGuest
            ? updateLocalProject(projectId, updates)
            : updateProjectApi(token, projectId, updates)
    }
}

export function useDeleteProject() {
    const { isGuest, token } = useContext(AuthContext)

    return function deleteProject(projectId) {
        return isGuest
            ? deleteLocalProject(projectId)
            : deleteProjectApi(token, projectId)
    }
}

export function useScenarios(projectId, isDemo) {
    const { isGuest } = useContext(AuthContext)
    const demoEndpoint = isDemo ? `/api/projects/demo/${projectId}/scenarios` : null
    const apiEndpoint = isDemo === false && !isGuest ? `/api/projects/${projectId}/scenarios` : null
    const demoResult = useApi(demoEndpoint)
    const apiResult = useApi(apiEndpoint)
    const localResult = useMemo(
        () => (isDemo === false && isGuest ? getLocalScenarios(projectId) : null),
        [isGuest, isDemo, projectId]
    )

    if (isDemo === undefined) return { data: null, loading: true, error: null }
    if (isDemo) return demoResult
    return isGuest ? { data: localResult, loading: false, error: null } : apiResult
}

export function useScenario(projectId, scenarioId, isDemo) {
    const { isGuest } = useContext(AuthContext)
    const demoEndpoint = isDemo ? `/api/projects/demo/${projectId}/scenarios/${scenarioId}` : null
    const apiEndpoint = isDemo === false && !isGuest ? `/api/projects/${projectId}/scenarios/${scenarioId}` : null
    const demoResult = useApi(demoEndpoint)
    const apiResult = useApi(apiEndpoint)
    const localResult = useMemo(
        () => (isDemo === false && isGuest ? getLocalScenario(scenarioId) : null),
        [isGuest, isDemo, scenarioId]
    )

    if (isDemo === undefined) return { data: null, loading: true, error: null }
    if (isDemo) return demoResult
    return isGuest ? { data: localResult, loading: false, error: null } : apiResult
}

export function useCreateScenario() {
    const { isGuest, token } = useContext(AuthContext)

    return function createScenario(scenarioData) {
        if (isGuest) {
            return createLocalScenario(scenarioData)
        }

        const { name, projectId, module, moduleAmount, tilt, azimuth } = scenarioData
        return createScenarioApi(token, {
            name,
            projectId,
            moduleId: module?.id,
            moduleAmount,
            tilt,
            azimuth,
            nominalPower: module?.nominal_power,
        })
    }
}

export function useUpdateScenario() {
    const { isGuest, token } = useContext(AuthContext)

    return function updateScenario(projectId, scenarioId, updates) {
        return isGuest
            ? updateLocalScenario(scenarioId, updates)
            : updateResource(token, `/projects/${projectId}/scenarios/${scenarioId}`, updates)
    }
}

export function useDeleteScenario() {
    const { isGuest, token } = useContext(AuthContext)

    return function deleteScenario(projectId, scenarioId) {
        return isGuest
            ? deleteLocalScenario(scenarioId)
            : deleteScenarioApi(token, projectId, scenarioId)
    }
}

export function useReport() {
    const { isGuest, token } = useContext(AuthContext)

    return function getReport(projectId, scenarioId, isDemo) {
        if (isDemo) {
            return getDemoReportApi(projectId, scenarioId)
        }

        return isGuest
            ? getLocalScenario(scenarioId)?.report ?? null
            : getReportApi(token, projectId, scenarioId)
    }
}

export function useCalculateReport() {
    const { isGuest, token } = useContext(AuthContext)

    return function calculateReport(projectId, scenarioId) {
        return isGuest
            ? setLocalReport(projectId, scenarioId)
            : calculateScenarioApi(token, projectId, scenarioId)
    }
}
