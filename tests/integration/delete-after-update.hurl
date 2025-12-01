# tests/integration-new/delete-after-update.hurl

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Will delete`

HTTP/1.1 201
[Captures]
location: header "Location"

DELETE {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# Confirm gone
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
