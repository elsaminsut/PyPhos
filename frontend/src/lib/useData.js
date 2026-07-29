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
    const apiResult = useApi(isGuest ? null : `/api/projects`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const localResult = useMemo(() => getLocalProjects(), [isGuest])

    return isGuest ? { data: localResult, loading: false, error: null } : apiResult
}

export function useProject(projectId) {
    const { isGuest } = useContext(AuthContext)
    const apiResult = useApi(isGuest ? null : `/api/projects/${projectId}`)
    const localResult = useMemo(
        () => (isGuest ? getLocalProject(projectId) : null),
        [isGuest, projectId]
    )

    return isGuest ? { data: localResult, loading: false, error: null } : apiResult
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

export function useScenarios(projectId) {
    const { isGuest } = useContext(AuthContext)
    const apiResult = useApi(isGuest ? null : `/api/projects/${projectId}/scenarios`)
    const localResult = useMemo(
        () => (isGuest ? getLocalScenarios(projectId) : null),
        [isGuest, projectId]
    )

    return isGuest ? { data: localResult, loading: false, error: null } : apiResult
}

export function useScenario(projectId, scenarioId) {
    const { isGuest } = useContext(AuthContext)
    const apiResult = useApi(isGuest ? null : `/api/projects/${projectId}/scenarios/${scenarioId}`)
    const localResult = useMemo(
        () => (isGuest ? getLocalScenario(scenarioId) : null),
        [isGuest, scenarioId]
    )

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

export function useReport(projectId, scenarioId) {
    const { isGuest, token } = useContext(AuthContext)

    return function getReport(projectId, scenarioId) {
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
