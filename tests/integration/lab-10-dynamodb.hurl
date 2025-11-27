# @reset-session
# tests/integration/lab-10-dynamodb.hurl

# ============================================
# Lab 10 – DynamoDB Integration Test
# ============================================

# --------------------------------------------
# 1. POST JSON fragment
# --------------------------------------------
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{
  "service": "DynamoDB"
}

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# --------------------------------------------
# 2. GET JSON fragment metadata
# --------------------------------------------
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.ownerId" matches ".+"

# --------------------------------------------
# 3. POST Markdown fragment
# --------------------------------------------
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1

`DynamoDB is great.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# --------------------------------------------
# 4. GET Markdown fragment metadata
# --------------------------------------------
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.ownerId" matches ".+"

# --------------------------------------------
# 5. GET all fragments (IDs only)
# --------------------------------------------
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"

# --------------------------------------------
# 6. DELETE first fragment
# --------------------------------------------
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# --------------------------------------------
# 7. GET deleted fragment → expect 404
# --------------------------------------------
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# --------------------------------------------
# 8. GET fragments list again → only second remains
# --------------------------------------------
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not contains "{{fragment1_id}}"
jsonpath "$.fragments" contains "{{fragment2_id}}"
