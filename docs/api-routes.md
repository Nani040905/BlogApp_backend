# 🔌 REST API Routes & Endpoints Directory

This document lists all REST API endpoints available in the **BlogApp Backend**, classified by role scope.

---

## 🌐 Public / Guest Scopes (`/common-api`)

Unified public actions, visitor queries, and general session validation pathways.

### 1. Read All Active Articles
*   **Path**: `GET /common-api/articles`
*   **Access**: Public (Unauthenticated)
*   **Returns**: Active articles in reverse chronological order (`createdAt: -1`), populated with author metadata.
*   **Response Shape**:
    ```json
    {
      "message": "public articles",
      "payload": [
        {
          "_id": "6a0b50e4b3d9d9bd2e2ec661",
          "title": "Introduction to Tailwind v4",
          "category": "Tech",
          "content": "Tailwind CSS v4 is a major release...",
          "comments": [],
          "author": {
            "_id": "6a0b50e4b3d9d9bd2e2ec662",
            "firstName": "Jane",
            "lastName": "Doe",
            "profileImageUrl": "https://..."
          },
          "isArticleActive": true,
          "createdAt": "2026-05-19T04:00:00Z"
        }
      ]
    }
    ```

### 2. Login User
*   **Path**: `POST /common-api/login`
*   **Access**: Public (Unauthenticated)
*   **Body**:
    ```json
    {
      "email": "user@blogapp.com",
      "password": "Password123"
    }
    ```
*   **Response**: Sets secure cookie `token` and returns a success payload:
    ```json
    {
      "message": "login success",
      "payload": {
        "_id": "6a0b50e4b3d9d9bd2e2ec661",
        "firstName": "John",
        "lastName": "Doe",
        "email": "user@blogapp.com",
        "role": "USER",
        "profileImageUrl": "https://...",
        "isActive": true
      }
    }
    ```

### 3. Logout User
*   **Path**: `GET /common-api/logout`
*   **Access**: Public (Clears Cookie)
*   **Response**: Resets cookie variables and outputs a success payload.

### 4. Check Auth Session
*   **Path**: `GET /common-api/check-auth`
*   **Access**: Public (Lenient validation)
*   **Returns**: Evaluates active cookies.
    *   If valid: `{ "message": "authenticated", "payload": decodedToken, "isAuthenticated": true }`
    *   If invalid/missing: `{ "message": "not authenticated", "payload": null, "isAuthenticated": false }` (No 401 response issued to prevent browser errors).

---

## 📖 Reader / User Scopes (`/user-api`)

Actions restricted to readers (`USER`).

### 1. Register User Profile
*   **Path**: `POST /user-api/users`
*   **Access**: Public
*   **Payload Format**: `multipart/form-data`
*   **Form Fields**: `firstName`, `lastName`, `email`, `password`, and optional image file `profileImageUrl`.
*   **Response (201)**:
    ```json
    {
      "message": "user created",
      "payload": {
        "_id": "6a0b50e4b3d9d9bd2e2ec663",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "reader@blogapp.com",
        "role": "USER",
        "profileImageUrl": "https://...",
        "isActive": true
      }
    }
    ```

### 2. Read Dashboard Feed
*   **Path**: `GET /user-api/articles`
*   **Access**: Guarded (`verifyToken("USER")`)
*   **Returns**: All active articles.

### 3. Comment on an Article
*   **Path**: `PUT /user-api/articles`
*   **Access**: Guarded (`verifyToken("USER")`)
*   **Body**:
    ```json
    {
      "articleId": "6a0b50e4b3d9d9bd2e2ec661",
      "user": "6a0b50e4b3d9d9bd2e2ec663",
      "comment": "Outstanding write-up! Really helpful."
    }
    ```
*   **Response**: Returns the updated article containing the populated comment.

---

## ✍️ Writer / Author Scopes (`/author-api`)

Actions restricted to creators (`AUTHOR`).

### 1. Register Author Profile
*   **Path**: `POST /author-api/users`
*   **Payload**: `multipart/form-data` (Similar to user registration, automatically setting role to `AUTHOR`).

### 2. Create Article
*   **Path**: `POST /author-api/articles`
*   **Access**: Guarded (`verifyToken("AUTHOR")`)
*   **Body**:
    ```json
    {
      "author": "6a0b50e4b3d9d9bd2e2ec662",
      "title": "Deploying React 19",
      "category": "Tech",
      "content": "Deploying React 19 applications requires..."
    }
    ```
*   **Response (210)**: Success payload.

### 3. Edit Article
*   **Path**: `PUT /author-api/articles`
*   **Access**: Guarded (`verifyToken("AUTHOR")`)
*   **Body**: Includes `articleId`, `title`, `content`, `category`, and `author`.

### 4. Delete Article (Soft Delete)
*   **Path**: `DELETE /author-api/articles/authorId/:authorId/articleId/:articleId`
*   **Access**: Guarded (`verifyToken("AUTHOR")` + owner verification)
*   **Action**: Sets `isArticleActive: false`. The article is hidden from readers but remains visible in the author's dashboard.

### 5. Restore Article
*   **Path**: `PATCH /author-api/articles/authorId/:authorId/articleId/:articleId`
*   **Action**: Sets `isArticleActive: true`.

---

## ⚙️ Administration Scopes (`/admin-api`)

Platform moderation and metrics actions, restricted to administrators (`ADMIN`).

### 1. Get All Articles
*   **Path**: `GET /admin-api/articles`
*   **Access**: Guarded (`verifyToken("ADMIN")`)
*   **Returns**: All articles in the database (including soft-deleted ones) with author metadata.

### 2. Get Users / Authors lists
*   **Paths**: `GET /admin-api/users`, `GET /admin-api/authors`
*   **Returns**: Complete registries matching target roles (excluding passwords).

### 3. Toggle User Active Status (Block/Unblock)
*   **Path**: `PUT /admin-api/toggle-user-status/:userId`
*   **Access**: Guarded (`verifyToken("ADMIN")`)
*   **Body**: `{ "isActive": false }` (or `true` to unblock)
*   **Action**: Updates account status. If set to `false`, the user is immediately logged out and barred from access.

### 4. Toggle Article Active Status
*   **Path**: `PUT /admin-api/toggle-article-status/:articleId`
*   **Body**: `{ "isArticleActive": false }`
*   **Action**: Toggles article visibility globally.
