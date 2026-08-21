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
//       report: {report object}
//     }
//   ]
// }
//

const LOCAL_PROJECT_SEQ_KEY = "local_project_seq";
const LOCAL_SCENARIO_SEQ_KEY = "local_scenario_seq";

function nextLocalId(type) {
  const seqKey =
    type === "project" ? LOCAL_PROJECT_SEQ_KEY : LOCAL_SCENARIO_SEQ_KEY;
  const seq = Number(localStorage.getItem(seqKey)) || 0;
  const next = seq + 1;
  localStorage.setItem(seqKey, String(next));
  return `local_${next}`;
}

function scenarioIdsKey(projectId) {
  return `project_${projectId}_scenario_ids`;
}

export function createLocalProject(projectData) {
  if (getLocalProjects().length >= 1) {
    throw new Error("Guests are limited to 1 project");
  }

  const project = {
    id: nextLocalId("project"),
    name: projectData.name || "",
    city_input: projectData.location || "",
    location: projectData.location || "",
    country_code: projectData.country_code || "",
    lat: projectData.lat ?? null,
    lon: projectData.lon ?? null,
    user_id: "guest",
    is_demo: false,
  };

  localStorage.setItem(`project_${project.id}`, JSON.stringify(project));
  localStorage.setItem(scenarioIdsKey(project.id), JSON.stringify([]));
  return project;
}

export function getLocalProjects() {
  const projects = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("project_") && !key.endsWith("_scenario_ids")) {
      const project = JSON.parse(localStorage.getItem(key));
      projects.push({
        ...project,
        scenario_count: getLocalScenarios(project.id).length,
      });
    }
  }
  return projects;
}

export function getLocalProject(projectId) {
  return JSON.parse(localStorage.getItem(`project_${projectId}`));
}

export function updateLocalProject(projectId, updates) {
  const project = getLocalProject(projectId);
  if (!project) return null;

  const updatedProject = { ...project, ...updates };
  localStorage.setItem(`project_${projectId}`, JSON.stringify(updatedProject));
  return updatedProject;
}

export function deleteLocalProject(projectId) {
  const scenarioIds =
    JSON.parse(localStorage.getItem(scenarioIdsKey(projectId))) || [];
  scenarioIds.forEach((scenarioId) => deleteLocalScenario(scenarioId));

  localStorage.removeItem(`project_${projectId}`);
  localStorage.removeItem(scenarioIdsKey(projectId));
}

export function createLocalScenario(scenarioData) {
  const { name, projectId, module, moduleAmount, tilt, azimuth } = scenarioData;

  if (getLocalScenarios(projectId).length >= 3) {
    throw new Error("Guests are limited to 3 scenarios per project");
  }

  const scenario = {
    id: nextLocalId("scenario"),
    name,
    project_id: projectId,
    module_id: module?.id ?? null,
    module: module ?? null,
    module_amount: parseInt(moduleAmount),
    tilt: parseFloat(tilt),
    azimuth: parseFloat(azimuth),
    installed_power: module
      ? Math.round(parseInt(moduleAmount) * module.nominal_power * 100) / 100
      : null,
    report: null,
  };

  localStorage.setItem(`scenario_${scenario.id}`, JSON.stringify(scenario));

  const idsKey = scenarioIdsKey(projectId);
  const scenarioIds = JSON.parse(localStorage.getItem(idsKey)) || [];
  scenarioIds.push(scenario.id);
  localStorage.setItem(idsKey, JSON.stringify(scenarioIds));

  return scenario;
}

export function getLocalScenarios(projectId) {
  const scenarioIds =
    JSON.parse(localStorage.getItem(scenarioIdsKey(projectId))) || [];
  return scenarioIds
    .map((scenarioId) =>
      JSON.parse(localStorage.getItem(`scenario_${scenarioId}`)),
    )
    .filter(Boolean);
}

export function getLocalScenario(scenarioId) {
  return JSON.parse(localStorage.getItem(`scenario_${scenarioId}`));
}

export function updateLocalScenario(scenarioId, updates) {
  const scenario = JSON.parse(localStorage.getItem(`scenario_${scenarioId}`));
  if (!scenario) return null;

  const updatedScenario = { ...scenario, ...updates };
  localStorage.setItem(
    `scenario_${scenarioId}`,
    JSON.stringify(updatedScenario),
  );
  return updatedScenario;
}

export function deleteLocalScenario(scenarioId) {
  const scenario = JSON.parse(localStorage.getItem(`scenario_${scenarioId}`));
  localStorage.removeItem(`scenario_${scenarioId}`);

  if (!scenario) return;

  const idsKey = scenarioIdsKey(scenario.project_id);
  const scenarioIds = JSON.parse(localStorage.getItem(idsKey)) || [];
  localStorage.setItem(
    idsKey,
    JSON.stringify(scenarioIds.filter((id) => id !== scenarioId)),
  );
}

export async function calculateLocalReport(projectId, scenarioId) {
  const project = getLocalProject(projectId);
  const scenario = getLocalScenarios(projectId).find(
    (s) => s.id === scenarioId,
  );
  if (!project || !scenario) return null;

  const calcRequest = {
    lat: project.lat,
    lon: project.lon,
    installed_power: scenario.installed_power,
    tilt: scenario.tilt,
    azimuth: scenario.azimuth,
  };

  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(calcRequest),
  });

  if (!response.ok) {
    throw new Error("Failed to calculate report");
  }

  return response.json();
}

export async function setLocalReport(projectId, scenarioId) {
  const report = await calculateLocalReport(projectId, scenarioId);
  return updateLocalScenario(scenarioId, { report });
}
