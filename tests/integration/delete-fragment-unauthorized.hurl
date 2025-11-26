# tests/integration/delete-fragment-unauthorized.hurl
DELETE http://localhost:8080/v1/fragments/whatever

HTTP/1.1 401

[Asserts]
jsonpath "$.status" == "error"
