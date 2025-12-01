# tests/integration-new/put-wrong-type.hurl

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`ABC`

HTTP/1.1 201
[Captures]
location: header "Location"

# Try updating with JSON
PUT {{location}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{"msg": "nope"}

HTTP/1.1 400
[Asserts]
jsonpath "$.status" == "error"
