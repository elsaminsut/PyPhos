import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./auth-context";

const BASE_URL = "/api";

export function useApi(endpoint) {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) return;

    const fetchContent = async () => {
      setLoading(true);
      setData(null);
      setError(null);

      try {
        const response = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          setError(response.status);
          return;
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [token, endpoint]);

  return { data, loading, error };
}

async function request(endpoint, token, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error("API request failed");
    error.status = response.status;
    try {
      error.detail = (await response.json()).detail;
    } catch {
      error.detail = null;
    }
    throw error;
  }

  return response.json();
}

export function searchLocations(token, query) {
  if (!query.trim()) {
    return Promise.resolve([]);
  }
  return request(`/locations/search?q=${encodeURIComponent(query)}`, token, {
    method: "GET",
  });
}

export function createProject(
  token,
  { name, city_input, location, country_code, lat, lon },
) {
  if (!name.trim() || !city_input.trim() || !location || !country_code) {
    console.error("Field cannot be empty");
    return;
  }
  return request("/projects", token, {
    method: "POST",
    body: JSON.stringify({
      name,
      city_input,
      location,
      country_code,
      lat,
      lon,
    }),
  });
}

export function createScenarioApi(
  token,
  { name, projectId, moduleId, moduleAmount, tilt, azimuth, nominalPower },
) {
  return request(`/projects/${projectId}/scenarios`, token, {
    method: "POST",
    body: JSON.stringify({
      name,
      project_id: projectId,
      module_id: moduleId,
      module_amount: parseInt(moduleAmount),
      tilt: parseFloat(tilt),
      azimuth: parseFloat(azimuth),
      nominal_power: nominalPower,
    }),
  });
}

export function updateResource(token, endpoint, updates) {
  if (
    !updates ||
    typeof updates !== "object" ||
    Object.keys(updates).length === 0
  ) {
    console.error("No updates provided");
    return;
  }

  return request(endpoint, token, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function updateResourceField(
  token,
  endpoint,
  field,
  value,
  options = {},
) {
  const { trim = false, normalize = (currentValue) => currentValue } = options;

  if (value === null || value === undefined) {
    return;
  }

  let normalizedValue = normalize(value);

  if (trim && typeof normalizedValue === "string") {
    normalizedValue = normalizedValue.trim();
  }

  return updateResource(token, endpoint, { [field]: normalizedValue });
}

export function updateProjectApi(token, projectId, updates) {
  return updateResource(token, `/projects/${projectId}`, updates);
}

export function deleteProjectApi(token, projectId) {
  return request(`/projects/${projectId}`, token, {
    method: "DELETE",
  });
}

export function updateUser(token, updates) {
  return updateResource(token, "/users", updates);
}

export function deleteUser(token) {
  return request("/users", token, {
    method: "DELETE",
  });
}

export function deleteScenarioApi(token, projectId, scenarioId) {
  return request(`/projects/${projectId}/scenarios/${scenarioId}`, token, {
    method: "DELETE",
  });
}

export function calculateScenarioApi(token, projectId, scenarioId) {
  return request(
    `/projects/${projectId}/scenarios/${scenarioId}/calculate`,
    token,
    {
      method: "POST",
    },
  );
}

export function getReportApi(token, projectId, scenarioId) {
  return request(
    `/projects/${projectId}/scenarios/${scenarioId}/report`,
    token,
    {
      method: "GET",
    },
  );
}

export async function getDemoReportApi(projectId, scenarioId) {
  const response = await fetch(
    `${BASE_URL}/projects/demo/${projectId}/scenarios/${scenarioId}/report`,
  );

  if (!response.ok) {
    const error = new Error("API request failed");
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function downloadReport(token, projectId, scenarioId) {
  const response = await fetch(
    `${BASE_URL}/projects/${projectId}/scenarios/${scenarioId}/report/pdf`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const error = new Error("Failed to download report");
    error.status = response.status;
    throw error;
  }

  return response.blob();
}
