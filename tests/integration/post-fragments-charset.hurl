# tests/integration/post-fragments-charset.hurl

# 1) POST a fragment with charset
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8

[BasicAuth]
user1@email.com:password1

`Hello with charset!`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"

[Captures]
location: header "Location"

# ---- FIXED SECTION ----
# 2) GET metadata (not raw fragment!)
GET {{location}}/info

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "application/json"
jsonpath "$.fragment.type" startsWith "text/plain"
