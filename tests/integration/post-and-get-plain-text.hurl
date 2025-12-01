# tests/integration-new/post-and-get-plain-text.hurl

POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Hello new test!`

HTTP/1.1 201
[Captures]
location: header "Location"

# GET raw data
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
body == "Hello new test!"
header "Content-Type" startsWith "text/plain"
