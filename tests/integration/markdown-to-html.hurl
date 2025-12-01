# tests/integration-new/markdown-to-html.hurl

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1

`# Title`

HTTP/1.1 201
[Captures]
location: header "Location"

GET {{location}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/html; charset=utf-8"
body contains "<h1>Title</h1>"
