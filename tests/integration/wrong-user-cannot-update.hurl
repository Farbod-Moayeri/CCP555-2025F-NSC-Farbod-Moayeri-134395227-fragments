# tests/integration-new/wrong-user-cannot-update.hurl

# User A creates
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Secret`

HTTP/1.1 201
[Captures]
location: header "Location"

# User B tries updating
PUT {{location}}
Content-Type: text/plain
[BasicAuth]
user2@email.com:password2

`Hacked`

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
