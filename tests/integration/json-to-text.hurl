# tests/integration-new/json-to-text.hurl

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{"msg":"hello"}

HTTP/1.1 201
[Captures]
location: header "Location"

GET {{location}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" startsWith "text/plain"
body contains "\"msg\": \"hello\""
