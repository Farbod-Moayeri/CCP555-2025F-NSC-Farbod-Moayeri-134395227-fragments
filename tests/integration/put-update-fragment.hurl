# tests/integration-new/put-update-fragment.hurl

# Create
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Original`

HTTP/1.1 201
[Captures]
location: header "Location"

# Update
PUT {{location}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Updated`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# GET updated
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
body == "Updated"
