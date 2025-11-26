# tests/integration/delete-fragment-wrong-user.hurl
# User A creates a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`test-data`

HTTP/1.1 201
[Captures]
id: jsonpath "$.fragment.id"

DELETE http://localhost:8080/v1/fragments/{{id}}
[BasicAuth]
user2@email.com:password2

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
