# tests/integration/lab-9-s3.hurl
# 1. Create a text fragment stored in S3
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Hello S3!`

HTTP/1.1 201

# Capture the Location header
[Captures]
url: header "Location"


# 2. GET the fragment via the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == "Hello S3!"


# 3. DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200


# 4. GET again — should now be gone
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
