import pytest

def test_register_user(create_user, register_user):
    assert register_user.status_code == 200 # TODO: change to 201
    assert register_user.json().get("email") == create_user.get("email")


def test_login_user(login_user):
    assert login_user.status_code == 200
    assert login_user.json().get("access_token") is not None


def test_update_user_info(auth_client, register_user):
    response = auth_client.patch("/api/users", json={"email": "newemail@example.com"})

    assert response.status_code == 200
    assert response.json().get("email") == "newemail@example.com"


def test_update_user_info_bad_token(client, register_user):
    headers = {"Authorization": f"Bearer bad_token"}
    response = client.patch("/api/users", headers=headers, json={"email": "newemail@example.com"})

    assert response.status_code == 401


def test_delete_user(auth_client, register_user):
    response = auth_client.delete("/api/users")
    assert response.status_code == 200

    # the token is for a now-deleted user, so it should no longer authenticate
    me_response = auth_client.get("/api/users/me")
    assert me_response.status_code == 401


def test_delete_user_bad_token(client, register_user):
    headers = {"Authorization": f"Bearer bad_token"}
    response = client.delete("/api/users", headers=headers)

    assert response.status_code == 401