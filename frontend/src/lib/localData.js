// {
//   projects: [
//     {
//       id: "local_1",  // local ID to distinguish from DB ids
//       name: "My Project",
//       city_input: "Berlin",
//       country_code: "DE",
//       lat: 52.5200,
//       lon: 13.4050,
//       user_id: "guest",
//       project_<id>_scenario_ids: ["local_1", "local_2"]
//     }
//   ]
// }
//
// {
//   scenarios: [
//     {
//       id: "local_1",
//       name: "100 modules South",
//       project_id: local_2,
//       module_id: 7,
//       module: {module object},
//       module_amount: 100,
//       tilt: 0,
//       azimuth: 0,
//       installed_power: 39270,
//       losses: 0.13,
//     }
//   ]
// }
//

const LOCAL_PROJECT_SEQ_KEY = "local_project_seq"
const LOCAL_SCENARIO_SEQ_KEY = "local_scenario_seq"

function nextLocalId(type) {
    const seqKey = type === "project" ? LOCAL_PROJECT_SEQ_KEY : LOCAL_SCENARIO_SEQ_KEY
    const seq = Number(localStorage.getItem(seqKey)) || 0
    const next = seq + 1
    localStorage.setItem(seqKey, String(next))
    return `local_${next}`
}

function scenarioIdsKey(projectId) {
    return `project_${projectId}_scenario_ids`
}

export function createLocalProject(projectData) {
    const project = {
        id: nextLocalId("project"),
        name: projectData.name || "",
        city_input: projectData.location || "",
        location: projectData.location || "",
        country_code: projectData.country_code || "",
        lat: projectData.lat ?? null,
        lon: projectData.lon ?? null,
        user_id: "guest",
    }

    localStorage.setItem(`project_${project.id}`, JSON.stringify(project))
    localStorage.setItem(scenarioIdsKey(project.id), JSON.stringify([]))
    return project
}

export function getLocalProject(projectId) {
    return JSON.parse(localStorage.getItem(`project_${projectId}`))
}

export function updateLocalProject(projectId, updates) {
    const project = getLocalProject(projectId)
    if (!project) return null

    const updatedProject = { ...project, ...updates }
    localStorage.setItem(`project_${projectId}`, JSON.stringify(updatedProject))
    return updatedProject
}

export function deleteLocalProject(projectId) {
    const scenarioIds = JSON.parse(localStorage.getItem(scenarioIdsKey(projectId))) || []
    scenarioIds.forEach((scenarioId) => localStorage.removeItem(`scenario_${scenarioId}`))

    localStorage.removeItem(`project_${projectId}`)
    localStorage.removeItem(scenarioIdsKey(projectId))
}

export function createLocalScenario(scenarioData) {
    const { name, projectId, module, moduleAmount, tilt, azimuth } = scenarioData

    const scenario = {
        id: nextLocalId("scenario"),
        name,
        project_id: projectId,
        module_id: module?.id ?? null,
        module: module ?? null,
        module_amount: parseInt(moduleAmount),
        tilt: parseFloat(tilt),
        azimuth: parseFloat(azimuth),
        installed_power: module ? Math.round(parseInt(moduleAmount) * module.nominal_power * 100) / 100 : null,
        losses: 0.13,
    }

    localStorage.setItem(`scenario_${scenario.id}`, JSON.stringify(scenario))

    const idsKey = scenarioIdsKey(projectId)
    const scenarioIds = JSON.parse(localStorage.getItem(idsKey)) || []
    scenarioIds.push(scenario.id)
    localStorage.setItem(idsKey, JSON.stringify(scenarioIds))

    return scenario
}

export function getLocalScenarios(projectId) {
    const scenarioIds = JSON.parse(localStorage.getItem(scenarioIdsKey(projectId))) || []
    return scenarioIds
        .map((scenarioId) => JSON.parse(localStorage.getItem(`scenario_${scenarioId}`)))
        .filter(Boolean)
}

export function updateLocalScenario(scenarioId, updates) {
    const scenario = JSON.parse(localStorage.getItem(`scenario_${scenarioId}`))
    if (!scenario) return null

    const updatedScenario = { ...scenario, ...updates }
    localStorage.setItem(`scenario_${scenarioId}`, JSON.stringify(updatedScenario))
    return updatedScenario
}

export function deleteLocalScenario(scenarioId) {
    const scenario = JSON.parse(localStorage.getItem(`scenario_${scenarioId}`))
    localStorage.removeItem(`scenario_${scenarioId}`)

    if (!scenario) return

    const idsKey = scenarioIdsKey(scenario.project_id)
    const scenarioIds = JSON.parse(localStorage.getItem(idsKey)) || []
    localStorage.setItem(idsKey, JSON.stringify(scenarioIds.filter((id) => id !== scenarioId)))
}
