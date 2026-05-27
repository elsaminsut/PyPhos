import pytest

def test_create_project(new_project, create_project):
    assert create_project.status_code == 200 # TODO: change to 201
    assert create_project.json().get("name") == new_project.get("name")


def test_get_projects(auth_client, register_user, create_project):
    response = auth_client.get("/projects/")
    project_names = [project.get("name") for project in response.json()]

    assert response.status_code == 200
    assert len(project_names) > 0
    assert create_project.json().get("name") in project_names
    assert create_project.json().get("location") is not None
    assert create_project.json().get("user_id") == register_user.json().get("id")


def test_update_project_info(auth_client, create_project):
    project = create_project.json()
    project_id = project.get("id")
    response = auth_client.patch(f"/projects/{project_id}", json={"name": "newname"})

    assert response.status_code == 200
    assert response.json().get("name") == "newname"
    assert response.json().get("location") == project.get("location")


def test_update_project_info_bad_token(client, create_project):
    project_id = create_project.json().get("id")
    bad_headers = {"Authorization": f"Bearer bad_token"}
    response = client.patch(f"/projects/{project_id}", headers=bad_headers, json={"name": "newname"})

    assert response.status_code == 401
    

def test_delete_project(auth_client, create_project):
    project = create_project.json()
    project_id = project.get("id")
    response = auth_client.delete(f"/projects/{project_id}")
    project_ids_in_db = [project.get("id") for project in auth_client.get("/projects/").json()]

    assert response.status_code == 200
    assert project_id not in project_ids_in_db


def test_delete_user_bad_token(auth_client, create_project):
    project_id = create_project.json().get("id")
    bad_headers = {"Authorization": f"Bearer bad_token"}
    response = auth_client.delete(f"/projects/{project_id}", headers=bad_headers)

    assert response.status_code == 401