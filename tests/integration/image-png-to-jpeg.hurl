# tests/integration-new/image-png-to-jpeg.hurl

# 1) Create a PNG fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1

file,media/sample.png;

HTTP/1.1 201
[Captures]
location: header "Location"


# 2) GET the fragment converted to JPEG
GET {{location}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "image/jpeg"
