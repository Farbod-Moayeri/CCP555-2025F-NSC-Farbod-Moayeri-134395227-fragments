# tests/integration/delete-fragment.hurl
# Create a fragment first
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`hello world`

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.id" exists
jsonpath "$.fragment.ownerId" exists

# Capture the id
[Captures]
id: jsonpath "$.fragment.id"

# Delete the fragment
DELETE http://localhost:8080/v1/fragments/{{id}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "deleted"
jsonpath "$.fragment.id" not exists

# Confirm it is gone
GET http://localhost:8080/v1/fragments/{{id}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
