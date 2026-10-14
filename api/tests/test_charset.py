from fastapi import status
from fastapi.testclient import TestClient

from app.main import app


def test_json_response_declares_utf8_charset() -> None:
    """业务响应的 Content-Type 必须带 charset=utf-8，否则 PowerShell 5.1 会按 ISO-8859-1 解码中文。"""
    response = TestClient(app).get("/health")

    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"] == "application/json; charset=utf-8"


def test_utf8_json_response_round_trips_chinese() -> None:
    """响应体保持 UTF-8 原字节，中文不被转义成 \\uXXXX。"""
    response = app.router.default_response_class({"display_name": "课程管理员"})

    assert '"display_name":"课程管理员"' in response.body.decode("utf-8")
