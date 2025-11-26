# tests/integration/delete-fragment-not-found.hurl
DELETE http://localhost:8080/v1/fragments/does-not-exist
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
