import requests

url = "http://127.0.0.1:8000/api/v1/super-admin/organizations"

payload = {
    "name": "PowerShell Test Organization",
    "code": "PS-TEST-001",
    "status": "Active",
    "admin_first_name": "PowerShell",
    "admin_last_name": "Admin",
    "admin_email": "pstestadmin001@example.com",
    "admin_password": "TestPassword123"
}

# Get token from environment is not available here,
# so print the payload first.
print("PAYLOAD:")
print(payload)