class TestUsersMe:
    def test_get_me(self, client, registered_user, auth_headers):
        resp = client.get("/users/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == registered_user["email"]
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data

    def test_get_me_unauthorized(self, client):
        resp = client.get("/users/me")
        assert resp.status_code == 401

    def test_get_me_bad_token(self, client):
        resp = client.get("/users/me", headers={"Authorization": "Bearer bad.token.here"})
        assert resp.status_code == 401
