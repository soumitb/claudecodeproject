def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


class TestRegister:
    def test_register_success(self, client):
        resp = client.post("/auth/register", json={"email": "user@example.com", "password": "secret123"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "user@example.com"
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client):
        client.post("/auth/register", json={"email": "user@example.com", "password": "secret123"})
        resp = client.post("/auth/register", json={"email": "user@example.com", "password": "other"})
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    def test_register_invalid_email(self, client):
        resp = client.post("/auth/register", json={"email": "not-an-email", "password": "secret123"})
        assert resp.status_code == 422

    def test_register_missing_password(self, client):
        resp = client.post("/auth/register", json={"email": "user@example.com"})
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client, registered_user):
        resp = client.post(
            "/auth/login",
            data={"username": registered_user["email"], "password": registered_user["password"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, registered_user):
        resp = client.post(
            "/auth/login",
            data={"username": registered_user["email"], "password": "wrongpassword"},
        )
        assert resp.status_code == 401

    def test_login_unknown_email(self, client):
        resp = client.post(
            "/auth/login",
            data={"username": "nobody@example.com", "password": "secret"},
        )
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        resp = client.post("/auth/login", data={})
        assert resp.status_code == 422


class TestMe:
    def test_me_success(self, client, registered_user, auth_headers):
        resp = client.get("/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == registered_user["email"]

    def test_me_no_token(self, client):
        resp = client.get("/auth/me")
        assert resp.status_code == 401

    def test_me_invalid_token(self, client):
        resp = client.get("/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        assert resp.status_code == 401
