

### Lead Conversion Auto-Creates Account
When calling `POST /api/v1/leads/{id}/convert` without an `account_id`, the API will automatically **create an Account**. You can optionally pass `account_name` in the payload to control the name; otherwise a sensible default is generated from the lead’s name/email.

**Example:**
```http
POST /api/v1/leads/{id}/convert
{
  "account_name": "ACME Corp",
  "opportunity_name": "ACME – Initial Deal",
  "amount": 2500
}
```
The response includes the created `account_id`, `contact_id`, and `opportunity_id`.
