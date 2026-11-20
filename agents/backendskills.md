# Backend Agent Skills & Architecture Guide

## 1. Overview & Agent Role
The **Backend Agent** is responsible for architecting, implementing, securing, and maintaining the server-side services, databases, real-time communication channels, and external cloud integrations for the Social Media Web Application. The backend is an Express.js application powered by Node.js, utilizing MongoDB (via Mongoose) as the primary data store, Socket.IO for real-time duplex communication, ImageKit for cloud media storage, and JSON Web Tokens (JWT) for stateless authentication.

### Primary Domain Responsibilities
- Architecting robust, scalable RESTful APIs following standard HTTP status codes and REST conventions.
- Modeling MongoDB schemas with Mongoose, ensuring data integrity, indexing, and performant aggregation queries.
- Managing real-time WebSocket connections, online presence mapping, and push event distribution via Socket.IO.
- Handling secure media storage pipelines using ImageKit API with server-side validation and client-upload signatures.
- Securing application endpoints with JWT authentication middleware, password encryption (Bcrypt), and authorization guards.
- Maintaining clean ES Module code patterns, error handling, and comprehensive logging.

---

## 2. Tech Stack & System Architecture

### Runtime & Core Frameworks
- **Node.js**: Asynchronous event-driven JavaScript runtime (ES Modules mode with `"type": "module"`).
- **Express.js (`^4.18.2`)**: Web application framework handling routing, middleware, and request/response lifecycles.
- **HTTP (`http.createServer`)**: Native Node HTTP server wrapping the Express app to enable shared Socket.IO connectivity on a single port.

### Database & ODM
- **MongoDB**: NoSQL document database.
- **Mongoose (`^7.0.5`)**: Object Data Modeling (ODM) library providing schema validation, casting, relationships, and aggregation pipelines.

### Real-Time & Networking
- **Socket.IO (`^4.7.5`)**: Real-time event-based server supporting CORS for `http://localhost:3000`.
- **CORS (`^2.8.5`)**: Cross-Origin Resource Sharing middleware.
- **Body-Parser (`^1.20.2`)**: Request parsing with 30mb payloads for large JSON/URL-encoded requests.

### Authentication & Cryptography
- **JsonWebToken (`^9.0.0`)**: Sign and verify authentication tokens.
- **Bcrypt (`^5.1.0`)**: Password salting (rounds: 10) and one-way hashing.

### Media & Cloud Storage
- **ImageKit Node SDK (`^6.0.0`)**: Cloud-based media management for image and video hosting, authentication parameter generation, and asset deletion.
- **Multer (`^1.4.5-lts.1`)**: Multipart form-data handling supporting both memory storage buffers and local disk storage.

---

## 3. Directory & File Structure

```text
Server/
├── config/
│   └── imagekit.js             # ImageKit SDK client initialization and config
├── Controllers/                # Business logic and request orchestration
│   ├── AuthController.js       # User registration and login
│   ├── ConversationController.js # Chat thread creation and querying
│   ├── MessageController.js    # Message creation, retrieval, and read receipts
│   ├── NotificationController.js # Activity notifications & socket dispatches
│   ├── PostController.js       # Post CRUD, ImageKit auth, timeline aggregation, likes, comments
│   └── UserController.js       # User profile CRUD, follow/unfollow logic
├── Middleware/
│   └── authMiddleWare.js       # JWT extraction and validation middleware
├── Models/                     # Mongoose schema definitions
│   ├── conversationModel.js    # Chat thread schema (members, lastMessage)
│   ├── messageModel.js         # Chat message schema (text, senderId, read status)
│   ├── notificationModel.js    # Activity notification schema (types: like, follow, message)
│   ├── postModel.js            # Post schema (caption, image, video, likes, comments)
│   └── userModel.js            # User profile schema (credentials, bio, social graph)
├── public/
│   └── images/                 # Local directory for static asset fallback and user avatars
├── Routes/                     # Express router definitions
│   ├── AuthRoute.js            # /auth/register, /auth/login
│   ├── ConversationRoute.js    # /conversation endpoints
│   ├── MessageRoute.js         # /message endpoints
│   ├── NotificationRoute.js    # /notification endpoints
│   ├── PostRoute.js            # /post endpoints
│   ├── UploadRoute.js          # /upload endpoint (local disk storage)
│   └── UserRoute.js            # /user endpoints
├── Socket/
│   └── socket.js               # Socket.IO initialization, user mapping, and targeted emission
├── .env                        # Private environment variables (gitignored)
├── .env.example                # Template for required environment variables
├── index.js                    # Server entry point, middleware assembly, database connection
├── package.json
└── package-lock.json
```

---

## 4. Server Lifecycle & Middleware Pipeline

### Bootstrap Sequence (`index.js`)
1. Create Express application instance: `const app = express();`.
2. Wrap application in HTTP server: `const server = createServer(app);`.
3. Initialize Socket.IO engine: `initSocket(server);`.
4. Register static asset handlers:
   - `app.use(express.static('public'));`
   - `app.use('/images', express.static('images'));`
5. Configure request body parsers (`bodyParser.json` & `bodyParser.urlencoded` with `limit: '30mb'`).
6. Apply `cors()` to allow cross-origin requests from the React client.
7. Connect to MongoDB using `mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })`.
8. Upon successful DB connection, listen on `process.env.PORT` (default `4000`).

### Authentication Middleware (`Middleware/authMiddleWare.js`)
- Inspects incoming `Authorization` header (`Bearer <token>`).
- Decodes token using `jwt.verify(token, process.env.JWT_KEY)`.
- Injects verified user ID into `req.body._id = decoded?.id`.
- Rejects unverified requests or proceeds to next route handler.

---

## 5. Database Models & Schema Specifications

### 1. User Model (`Models/userModel.js`)
Collection: `Users`
- `email` (String, required, unique)
- `password` (String, required, hashed with bcrypt)
- `firstname` (String, required)
- `lastname` (String, required)
- `isAdmin` (Boolean, default: `false`)
- `profilePicture` (String) - filename or URL
- `coverPicture` (String) - filename or URL
- `about` (String) - short user bio
- `livesin` (String) - city of residence
- `worksAt` (String) - workplace
- `country` (String) - country
- `relationship` (String) - marital or relationship status
- `followers` (Array of user ID strings)
- `following` (Array of user ID strings)
- *Timestamps*: `createdAt`, `updatedAt`

### 2. Post Model (`Models/postModel.js`)
Collection: `Posts`
- `userId` (String, required) - author's User ID
- `desc` (String) - post text caption
- `likes` (Array of user ID strings)
- `image` (String) - ImageKit URL or static file path
- `imageFileId` (String) - ImageKit file identifier for remote deletion
- `mediaType` (String, enum: `['image', 'video']`, default: `'image'`)
- `comments` (Array of subdocuments):
  - `userId` (String)
  - `name` (String)
  - `text` (String)
  - `createdAt` (Date, default: `Date.now`)
- *Timestamps*: `createdAt`, `updatedAt`

### 3. Notification Model (`Models/notificationModel.js`)
Collection: `Notifications`
- `recipientId` (String, required) - target user receiving the notification
- `senderId` (String, required) - user performing the action
- `type` (String, enum: `['like', 'follow', 'message']`, required)
- `postId` (String, optional) - associated post ID if type is 'like'
- `conversationId` (String, optional) - associated chat thread ID if type is 'message'
- `text` (String) - descriptive text (e.g. "liked your post", "started following you")
- `isRead` (Boolean, default: `false`)
- *Timestamps*: `createdAt`, `updatedAt`

### 4. Conversation Model (`Models/conversationModel.js`)
Collection: `Conversations`
- `members` (Array of String, required) - array containing the two participant user IDs
- `lastMessage` (String) - preview text of latest message
- *Timestamps*: `createdAt`, `updatedAt`

### 5. Message Model (`Models/messageModel.js`)
Collection: `Messages`
- `conversationId` (String, required)
- `senderId` (String, required)
- `text` (String, required)
- `isRead` (Boolean, default: `false`)
- *Timestamps*: `createdAt`, `updatedAt`

---

## 6. REST API Endpoints Specification

### Authentication (`/auth`)
- **`POST /auth/register`**
  - Body: `{ email, password, firstname, lastname, ... }`
  - Validates duplicate email. Hashes password using bcrypt. Issues JWT token.
  - Returns: `{ user, token }` (Status 200).
- **`POST /auth/login`**
  - Body: `{ email, password }`
  - Verifies user existence and bcrypt password match. Issues JWT token.
  - Returns: `{ user, token }` (Status 200).

### User Management (`/user`)
- **`GET /user/`**
  - Fetches all users with passwords stripped from output.
- **`GET /user/:id`**
  - Fetches single user by ID with password stripped.
- **`PUT /user/:id`** *(Protected: `authMiddleWare`)*
  - Body: `{ _id, password, firstname, lastname, profilePicture, ... }`
  - Verifies `id === _id`. Hashes new password if provided. Re-issues fresh JWT token.
  - Returns: `{ user, token }`.
- **`DELETE /user/:id`** *(Protected: `authMiddleWare`)*
  - Allows account owner or admin (`currentUserAdminStatus: true`) to delete user.
- **`PUT /user/:id/follow`** *(Protected: `authMiddleWare`)*
  - Body: `{ _id }` (follower ID).
  - Updates target user's `followers` and sender's `following`. Dispatches follow notification.
- **`PUT /user/:id/unfollow`** *(Protected: `authMiddleWare`)*
  - Body: `{ _id }` (follower ID).
  - Pulls IDs from respective `followers` and `following` arrays.

### Posts & Feed (`/post`)
- **`GET /post/imagekit/auth`**
  - Generates client-side upload signature and authentication parameters (`token`, `expire`, `signature`, `publicKey`).
- **`POST /post`** *(Multer memory upload for single file `'image'`)*
  - Body: `{ userId, desc, image, imageFileId, mediaType }`
  - If direct file buffer present in `req.file`, uploads to ImageKit `/posts` folder.
  - Creates post record in DB.
- **`GET /post/:id`**
  - Retrieves single post record.
- **`PUT /post/:id`**
  - Updates caption or media. If new `imageFileId` differs, deletes previous cloud asset from ImageKit.
- **`DELETE /post/:id`**
  - Validates user ownership (`post.userId === userId || _id`). Deletes file from ImageKit via `imagekit.deleteFile(post.imageFileId)`, then removes post document.
- **`PUT /post/:id/like_dislike`**
  - Body: `{ userId }`.
  - Toggles user ID in `likes` array. When adding like, creates notification for post owner.
- **`PUT /post/:id/comment`**
  - Body: `{ userId, name, text }`.
  - Appends comment subdocument to post.
- **`GET /post/:id/timeline`**
  - Complex MongoDB Aggregation query:
    1. Finds posts where `userId` is the current user.
    2. Performs `$lookup` on `posts` collection matching target user's `following` array against `userId`.
    3. Concatenates both lists and sorts by `createdAt` descending.

### Notifications (`/notification`)
- **`GET /notification/:userId`**
  - Fetches notifications where `recipientId === userId`, populated with sender's `firstname`, `lastname`, and `profilePicture`, sorted newest first.
- **`PUT /notification/:id/read`**
  - Marks single notification as `isRead: true`.
- **`PUT /notification/:userId/read-all`**
  - Marks all notifications for user as read.

### Direct Messaging & Conversations (`/conversation` & `/message`)
- **`POST /conversation`**
  - Body: `{ senderId, receiverId }`.
  - Retrieves existing conversation containing both members or creates a new one. Populates peer user details.
- **`GET /conversation/:userId`**
  - Returns all conversations where `members` includes `userId`, sorted by `updatedAt` descending.
- **`POST /message`**
  - Body: `{ conversationId, senderId, text }`.
  - Creates message document. Updates conversation `lastMessage`.
  - Emits real-time socket event `'receiveMessage'` to recipient socket.
  - Generates message notification.
- **`GET /message/:conversationId`**
  - Fetches chronological message stream for conversation.
- **`PUT /message/:conversationId/read`**
  - Marks unread messages sent by peer user as read.

### Static File Upload (`/upload`)
- **`POST /upload/`** *(Multer disk storage)*
  - Stores uploaded file in local filesystem under `public/images/`.

---

## 7. Real-Time Socket Architecture (`Socket/socket.js`)

### Presence & Routing Engine
- `onlineUsers`: An in-memory `Map` associating `userId` string -> `socket.id`.
- Connection Handler:
  - Listens for `'addUser'` event with `userId`.
  - Stores mapping in `onlineUsers`.
  - Emits `'getUsers'` with list of online user IDs to all connected clients.
- Disconnection Handler:
  - Scans `onlineUsers` on `'disconnect'` to prune stale socket references.
  - Broadcasts updated `'getUsers'` list.
- Helper Function:
  ```javascript
  export const emitToUser = (userId, eventName, payload) => {
    const socketId = onlineUsers.get(userId?.toString());
    if (io && socketId) {
      io.to(socketId).emit(eventName, payload);
    }
  };
  ```

---

## 8. Third-Party Integrations & ImageKit

### Configuration (`config/imagekit.js`)
Configured using environment variables:
```javascript
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});
```

### Media Lifecycle Workflows
1. **Client Direct Upload Flow**:
   - Client calls `GET /post/imagekit/auth`.
   - Backend calls `imagekit.getAuthenticationParameters()` returning `{ token, expire, signature, publicKey }`.
   - Client uploads directly to ImageKit API.
   - Client passes `url` and `fileId` when calling `POST /post`.
2. **Server Buffer Upload Flow**:
   - Client sends multipart file to `POST /post`.
   - Multer retains file in RAM (`multer.memoryStorage()`).
   - Server calls `imagekit.upload({ file: req.file.buffer, fileName: req.file.originalname, folder: '/posts' })`.
3. **Asset Garbage Collection**:
   - Whenever a post is deleted (`deletePost`) or its image is replaced (`updatePost`), the backend invokes `imagekit.deleteFile(post.imageFileId)` inside a try/catch block to avoid leaving orphaned assets in cloud storage.

---

## 9. Coding Standards & Error Handling

1. **Async / Await Pattern**:
   - Every controller method must be wrapped in `try / catch`.
   - Handled errors must return standard status codes (`400` Bad Request, `403` Forbidden, `404` Not Found, `500` Internal Server Error) with descriptive JSON messages.
2. **Security & Validation Rules**:
   - Always strip password hashes before returning user objects (`const { password, ...otherDetails } = user._doc;`).
   - Validate that notifications and messages do not dispatch to self (`recipientId.toString() !== senderId.toString()`).
3. **ES Modules**:
   - Use `import` / `export` syntax exclusively.
   - Relative imports must explicitly include file extensions (e.g. `import UserModel from '../Models/userModel.js'`).
4. **Code Formatting**:
   - 2 spaces indentation, LF line endings, semicolons, single quotes where standard.

---

## 10. Development Recipes & Workflows

### Recipe: Creating a New Model and Route
1. Create `Models/newModel.js` with `mongoose.Schema({ ... }, { timestamps: true })`.
2. Create `Controllers/NewController.js` with CRUD controller handlers.
3. Create `Routes/NewRoute.js` using `express.Router()`.
4. Apply `authMiddleWare` to mutative or protected routes.
5. In `index.js`, import `NewRoute` and register: `app.use('/newroute', NewRoute);`.

### Recipe: Emitting a Real-Time Event to a User
1. Import `emitToUser` from `../Socket/socket.js`.
2. Determine target `recipientId` and event name.
3. Call `emitToUser(recipientId, 'eventName', dataPayload);`.

---

## 11. Environment Variables Reference (`.env`)

| Variable Name | Description | Example Value |
|---|---|---|
| `PORT` | HTTP & Socket server port | `4000` |
| `MONGO_DB` | MongoDB connection URI | `mongodb://localhost:27017/socialmedia` |
| `JWT_KEY` | Secret key for signing JSON Web Tokens | `your_super_secret_jwt_key_12345` |
| `IMAGEKIT_PUBLIC_KEY` | Public key for ImageKit SDK and client auth | `your_imagekit_public_key` |
| `IMAGEKIT_PRIVATE_KEY`| Secret private key for ImageKit operations | `your_imagekit_private_key` |
| `IMAGEKIT_URL_ENDPOINT`| Base URL endpoint for ImageKit CDN | `https://ik.imagekit.io/your_id` |
