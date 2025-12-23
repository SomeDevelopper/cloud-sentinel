# Cloud Sentinel Backend

This is the backend for the Cloud Sentinel project, built with FastAPI.

## API Documentation

### Auth Routes

**POST /v1/auth/register** -> Register a new user
*   **Param**:
    *   `user` -> email `str`, password `str`, firstname `str`, lastname `str`, entreprise `str`
*   **Response**:
    *   `{ message: "User created successfully", data: { email: str, firstname: str, lastname: str, entreprise: str, is_active: bool } }`

**POST /v1/auth/login** -> Login and get a token
*   **Param**:
    *   `user` -> email `str`, password `str`
*   **Response**:
    *   `{ access_token: str, token_type: str }`

### User Routes

**GET /v1/user/get_user** -> Get current user info
*   **Param**:
    *   `token` -> (Bearer token in Authorization header)
*   **Response**:
    *   `{ user_id: UUID, email: str, firstname: str, lastname: str, entreprise: str, is_active: bool, ... }`

### Account Routes

**POST /v1/account/** -> Add a cloud account
*   **Param**:
    *   `account` -> account_name `str`, provider `str` (Enum: AWS, AZURE, GCP), access_key_public `str`, secret_key `str`, tenant_id `str` (Optional, for Azure)
*   **Response**:
    *   `{ message: "Account created successfully", data: { id: UUID, account_name: str, provider: str, access_key_public: str, tenant_id: str|None, created_at: datetime } }`

**DELETE /v1/account/{account_id}** -> Delete a cloud account
*   **Param**:
    *   `account_id` -> `str` (path param)
*   **Response**:
    *   `{ message: "Account deleted successfully" }`

**GET /v1/account/** -> List cloud accounts
*   **Param**: None
*   **Response**:
    *   `{ message: "User Account successfully retrived", data: [ { id: UUID, account_name: str, provider: str, ... } ] }`

**GET /v1/account/{account_id}/resources** -> Get resources for an account
*   **Param**:
    *   `account_id` -> `str` (path param)
*   **Response**:
    *   `{ message: "Resources for account {account_id} successfully retrieved", data: [ { id: UUID, cloud_account_id: UUID, resource_type: str, resource_id: str, region: str, detail: dict } ] }`

**GET /v1/account/{account_id}/test_connection** -> Test connection to cloud provider
*   **Param**:
    *   `account_id` -> `str` (path param)
*   **Response**:
    *   `{ message: "Account Information successfully retrived", data: { Account: str, UserId: str, Arn: str } }`

### Scan Routes

**POST /v1/scan/{account_id}/scan-{region}** -> Start a scan
*   **Param**:
    *   `account_id` -> `UUID` (path param)
    *   `region` -> `str` (path param)
*   **Response**:
    *   `{ message: "Scan started successfully", data: { task_id: str } }`

**GET /v1/scan/task/{task_id}** -> Check scan task status
*   **Param**:
    *   `task_id` -> `str` (path param)
*   **Response**:
    *   `{ message: "Task status retrieved", data: { task_id: str, state: str, result: Any, error: Any } }`

## Authentication

This project uses JWT (JSON Web Tokens) for authentication.
1.  Obtain a token via `/v1/auth/login`.
2.  Include the token in the `Authorization` header of subsequent requests:
    ```
    Authorization: Bearer <your_token>
    ```
