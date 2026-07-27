import { useContext } from 'react'
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
    const localResult = getLocalProjects()

    return isGuest ? localResult : apiResult
}

export function useProject(projectId) {
    const { isGuest } = useContext(AuthContext)
    const apiResult = useApi(isGuest ? null : `/api/projects/${projectId}`)
    const localResult = getLocalProject(isGuest ? projectId : null)

    return isGuest ? localResult : apiResult
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
    const localResult = getLocalScenarios(isGuest ? projectId : null)

    return isGuest ? localResult : apiResult
}

export function useScenario(projectId, scenarioId) {
    const { isGuest } = useContext(AuthContext)
    const apiResult = useApi(isGuest ? null : `/api/projects/${projectId}/scenarios/${scenarioId}`)
    const localResult = getLocalScenario(isGuest ? scenarioId : null)

    return isGuest ? localResult : apiResult
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
    const { isGuest } = useContext(AuthContext)
    const apiResult = useApi(isGuest ? null : `/api/projects/${projectId}/scenarios/${scenarioId}/report`)
    const localScenario = getLocalScenario(isGuest ? scenarioId : null)

    return isGuest ? (localScenario?.report ?? null) : apiResult
}

export function useCalculateReport() {
    const { isGuest, token } = useContext(AuthContext)

    return function calculateReport(projectId, scenarioId) {
        return isGuest
            ? setLocalReport(projectId, scenarioId)
            : calculateScenarioApi(token, projectId, scenarioId)
    }
}
