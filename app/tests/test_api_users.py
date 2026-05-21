import pytest

def test_register_user(create_user, register_user):
    assert register_user.status_code == 200 # TODO: change to 201
    assert register_user.json().get("username") == create_user.get("username")


def test_login_user(login_user):
    assert login_user.status_code == 200
    assert login_user.json().get("access_token") is not None


def test_get_users(client, register_user):
    response = client.get("/users/")
    usernames = [user.get("username") for user in response.json()]

    assert response.status_code == 200
    assert register_user.json().get("username") in usernames


def test_update_user_info(client, auth_token, register_user):
    user_id = register_user.json().get("id")
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.patch(f"/users/{user_id}", headers=headers, json={"username": "newusername"})

    assert response.status_code == 200
    assert response.json().get("username") == "newusername"


def test_update_user_info_bad_token(client, register_user):
    user_id = register_user.json().get("id")
    headers = {"Authorization": f"Bearer bad_token"}
    response = client.patch(f"/users/{user_id}", headers=headers, json={"username": "newusername"})

    assert response.status_code == 401
    

def test_delete_user(client, auth_token, register_user):
    user_id = register_user.json().get("id")
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.delete(f"/users/{user_id}", headers=headers)
    user_ids_in_db = [user.get("id") for user in client.get("/users/").json()]

    assert response.status_code == 200
    assert user_id not in user_ids_in_db


def test_delete_user_bad_token(client, register_user):
    user_id = register_user.json().get("id")
    headers = {"Authorization": f"Bearer bad_token"}
    response = client.delete(f"/users/{user_id}", headers=headers)

    assert response.status_code == 401