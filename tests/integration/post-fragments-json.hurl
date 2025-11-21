# tests/integration/post-fragments-json.hurl

# 1) POST a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
user1@email.com:password1

{
  "msg": "Hello JSON!"
}

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

[Captures]
location: header "Location"

# 2) GET JSON fragment metadata
GET {{location}}/info

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.type" == "application/json"
header "Content-Type" == "application/json; charset=utf-8"

# 3) GET raw JSON fragment
GET {{location}}

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "application/json"
jsonpath "$.msg" == "Hello JSON!"
