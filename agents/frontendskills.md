# Frontend Agent Skills & Architecture Guide

## 1. Overview & Agent Role
The **Frontend Agent** is responsible for developing, maintaining, and extending the client-side user interface of the Social Media Web Application. The application is a single-page React app (SPA) featuring social networking capabilities: user authentication, timeline feed with rich media (photos/videos), post interactions (likes, comments, sharing, deletion), user profile customization, follow/unfollow mechanisms, real-time 1-on-1 chat, and real-time activity notifications.

### Primary Domain Responsibilities
- Implementing responsive UI components and pages using React, CSS, and component libraries.
- Managing global and persisted application state via Redux and Redux Thunk.
- Integrating backend RESTful APIs via Axios with request interceptors for JWT authentication.
- Managing real-time bidirectional communication via Socket.IO client (`SocketContext`).
- Handling direct cloud media uploads to ImageKit with authentication tokens.
- Maintaining coding standards, accessibility, and smooth user interactions.

---

## 2. Tech Stack & Dependencies

### Core Framework & Build Tools
- **React (`^18.2.0`)**: Modern React with functional components and hooks (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`).
- **React DOM (`^18.2.0`)**: DOM rendering engine (`ReactDOM.createRoot`).
- **React Scripts (`5.0.1`)**: Create React App tooling for compilation and testing.
- **React Router DOM (`^6.11.1`)**: Client-side declarative routing (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `useParams`, `useNavigate`, `Link`).

### State Management & Async Actions
- **Redux (`^4.2.1`)**: Centralized predictable state container (`legacy_createStore`).
- **React-Redux (`^8.0.5`)**: React bindings for Redux (`Provider`, `useSelector`, `useDispatch`).
- **Redux-Thunk (`^2.4.2`)**: Async middleware for dispatching actions from API calls.

### UI & Styling Libraries
- **Mantine Core & Hooks (`^6.0.21`)**: Modal dialogues and UI primitives (`Modal`, `useMantineTheme`).
- **Emotion (`@emotion/react`, `@emotion/styled` `^11.10.6`)**: Mantine CSS-in-JS dependencies.
- **Material UI Icons (`@mui/icons-material`, `@mui/material` `^5.11.16`)**: System and action icons (Photo, Video, Location, Calendar, Delete, Close, Edit, Settings, Search).
- **Vanilla CSS**: Component-scoped CSS files with CSS custom properties (variables) for consistent colors, shadows, and spacing.

### Networking & Real-Time
- **Axios (`^1.4.0`)**: Promise-based HTTP client with base URL `http://localhost:4000` and Bearer token interceptor.
- **Socket.IO Client (`^4.7.5`)**: Real-time websocket client connecting to the Node.js backend.

---

## 3. Directory & File Structure

```text
client/
├── public/
│   ├── index.html              # HTML5 entry template with root div
│   ├── manifest.json           # Web app manifest
│   ├── rc_logo.jpg             # App branding favicon/logo
│   └── robots.txt              # Search engine crawler policies
├── src/
│   ├── actions/                # Redux async Thunk action creators
│   │   ├── AuthAction.jsx      # logIn, signUp, logOut
│   │   ├── PostAction.jsx      # getTimelinePosts, deletePost
│   │   ├── UploadAction.jsx    # uploadImage, uploadToImageKit, uploadPost
│   │   └── UserAction.jsx      # updateUser, followUser, unFollowUser
│   ├── api/                    # Axios API request modules
│   │   ├── AuthRequest.js      # /auth/login, /auth/register
│   │   ├── MessageRequest.js   # /conversation, /message endpoints
│   │   ├── NotificationRequest.js # /notification endpoints
│   │   ├── PostRequest.js      # /post timeline, like, comment, delete
│   │   ├── UploadRequest.js    # ImageKit auth, direct upload, /upload/
│   │   └── UserRequest.js      # /user CRUD, follow/unfollow, with JWT interceptor
│   ├── Components/             # Reusable UI components & local styling
│   │   ├── Data/               # Mock/initial data for UI demonstration
│   │   │   ├── FollowersData.jsx
│   │   │   ├── PostsData.jsx
│   │   │   └── TrendData.jsx
│   │   ├── FollowersCard/      # Suggested users list
│   │   ├── InfoCard/           # Profile metadata & edit trigger
│   │   ├── LogoSearch/         # Logo & instant user search box
│   │   ├── Post/               # Individual post card (likes, comments, share, delete)
│   │   ├── Posts/              # Timeline/feed post list renderer
│   │   ├── PostShare/          # Post creator (caption, photo, video, location, date)
│   │   ├── PostSide/           # Central column layout for post feed
│   │   ├── ProfileCard/        # User summary card (avatar, cover, stats, link)
│   │   ├── ProfileModal/       # Mantine modal for updating user profile & images
│   │   ├── ProfilePageLeft/    # Left-hand sidebar on Profile page
│   │   ├── profileSide/        # Left-hand sidebar on Home page
│   │   ├── RightSide/          # Right-hand navigation bar, trends, and quick share
│   │   ├── ShareModal/         # Quick modal trigger for PostShare
│   │   ├── TrendCard/          # Trending hashtags showcase
│   │   └── UserFollow/         # User item with Follow/Unfollow toggle button
│   ├── context/
│   │   └── SocketContext.jsx   # Global Socket.IO provider and useSocket hook
│   ├── Img/                    # Static image and icon assets
│   ├── Pages/                  # Route-level page views
│   │   ├── auth/               # Login & Sign-up page with tab toggle
│   │   ├── chat/               # Real-time direct messaging page
│   │   ├── home/               # Primary 3-column feed dashboard
│   │   ├── notifications/      # Activity notification center
│   │   └── profile/            # User profile view with custom feed
│   ├── reducers/               # Redux state reducers
│   │   ├── authReducer.jsx     # Auth state, login/signup status, current user profile
│   │   ├── postReducer.jsx     # Post list state, uploading, retrieving flags
│   │   └── index.jsx           # Root combineReducers export
│   ├── store/
│   │   └── ReduxStore.jsx      # Store configuration, thunk middleware, localStorage sync
│   ├── utils/
│   │   └── publicFolder.js     # Public static assets URL resolver
│   ├── App.css                 # Global styling, themes, CSS variables, blur background
│   ├── App.jsx                 # Route definition & conditional navigation
│   ├── App.test.jsx            # Jest tests
│   ├── index.jsx               # React DOM root entry point
│   ├── reportWebVitals.jsx     # Web Vitals metrics collector
│   └── setupTests.jsx          # Test setup configuration
├── package.json
└── README.md
```

---

## 4. Application Architecture & Routing

### Routing Strategy (`App.jsx`)
- Wrapped inside `<BrowserRouter>` at `index.jsx` and `<SocketProvider>` at `App.jsx`.
- Redux selector reads `state.authReducer.authData` (`user`).
- Authentication guards redirect unauthenticated users to `/auth`:
  - `/` -> Redirects to `/home` if logged in, else `/auth`.
  - `/home` -> Renders `<Home />` or redirects to `/auth`.
  - `/auth` -> Renders `<Auth />` or redirects to `/home` if already authenticated.
  - `/profile/:id` -> Renders `<Profile />` for user ID.
  - `/notifications` -> Renders `<Notifications />`.
  - `/chat` -> Renders `<Chat />`.

### Page Layout Paradigms
- **Home View (`Home.jsx`)**: 3-column grid:
  1. Left: `<ProfileSide />` (`LogoSearch`, `ProfileCard`, `FollowersCard`).
  2. Center: `<PostSide />` (`PostShare`, `Posts`).
  3. Right: `<RightSide />` (Navigation icons with badge counters, `TrendCard`, Share modal trigger).
- **Profile View (`Profile.jsx`)**:
  1. Left: `<ProfilePageLeft />` (`LogoSearch`, `InfoCard`, `FollowersCard`).
  2. Center: `<ProfileCard location="profilePage" />`, `<PostSide />` (displays filtered user posts).
  3. Right: `<RightSide />`.
- **Chat View (`Chat.jsx`)**:
  - Two-panel split view: Conversation sidebar (active chats & discovery of new contacts) + Chat viewport with message stream & composer.
- **Notifications View (`Notifications.jsx`)**:
  - Full-width list showing sender avatar, action text, timestamp, read status indicator, and bulk "Mark all read" action.

---

## 5. State Management & Redux Architecture

### Store Setup (`store/ReduxStore.jsx`)
- Built with `legacy_createStore(reducers, persistedState, composeEnhancers(applyMiddleware(thunk)))`.
- Local storage synchronization:
  - `loadFromLocalStorage()` rehydrates store state from key `'store'`.
  - `store.subscribe()` writes state changes to `'store'`.
  - In addition, auth actions sync credentials with `'profile'`.

### Reducers
1. **`authReducer`**:
   - `authData`: `{ user: { _id, email, firstname, lastname, profilePicture, coverPicture, followers, following, ... }, token: string }`
   - `loading`: boolean (for login / signup operations)
   - `error`: boolean
   - `updateLoadng`: boolean (for profile edit operations)
   - Actions handled: `AUTH_START`, `AUTH_SUCCESS`, `AUTH_FAIL`, `UPDATING_START`, `UPDATING_SUCCESS`, `UPDATING_FAIL`, `FOLLOW_USER`, `UNFOLLOW_USER`, `LOG_OUT`.
2. **`postReducer`**:
   - `posts`: Array of post objects.
   - `loading`: boolean (timeline fetch in progress)
   - `uploading`: boolean (post creation in progress)
   - `error`: boolean
   - Actions handled: `UPLOAD_START`, `UPLOAD_SUCCESS`, `UPLOAD_FAIL`, `RETRIEVING_START`, `RETRIEVING_SUCCESS`, `RETRIEVING_FAIL`, `DELETE_POST`.

---

## 6. Real-Time Communication (`SocketContext.jsx`)

### Connection Lifecycle
- Managed by `<SocketProvider user={user?.user}>`.
- Connects to Socket.IO server at `http://localhost:4000`.
- Automatically dispatches `socket.emit('addUser', user._id)` upon connection.
- Listens for `socket.on('getUsers', (users) => setOnlineUsers(users))` to maintain online status.
- Tears down connection and clears event listeners on unmount or user logout.

### Socket Consumption in Components
- **Hook**: `const { socket, onlineUsers } = useSocket() || {};`
- **Chat (`Chat.jsx`)**:
  - Listens for `'receiveMessage'`: appends incoming message if relevant to open chat, marks message as read, refreshes conversations list.
  - Displays green/online status indicator for users present in `onlineUsers`.
- **Notifications & Badges (`RightSide.jsx`, `Notifications.jsx`)**:
  - Listens for `'newNotification'`: increments unread counts and prepends new notification item to active list.

---

## 7. Media & Asset Management

### Dual Upload Strategy
1. **ImageKit Cloud Upload (Recommended for Posts & Videos)**:
   - Request authentication parameters from backend `/post/imagekit/auth`.
   - Client sends multipart `FormData` directly to `https://upload.imagekit.io/api/v1/files/upload`.
   - Returns `{ url, fileId }` saved directly to post record (`newPost.image = url; newPost.imageFileId = fileId`).
   - Supports both images and video formats (`mediaType: 'image' | 'video'`).
2. **Local Static Upload (Profile & Cover Photos)**:
   - Form-data uploaded to backend `/upload/`.
   - Files stored in server's `public/images/`.
   - Resolved on the client via `utils/publicFolder.js`:
     ```javascript
     const configuredPublicFolder = process.env.REACT_APP_PUBLIC_FOLDER || 'http://localhost:4000/images/';
     ```
   - Fallback defaults: `defaultProfile.png` and `defaultCover.jpg`.

---

## 8. API Client & Endpoints (`client/src/api/`)

All requests use Axios instance with `baseURL: 'http://localhost:4000'`.
`UserRequest.js` registers a request interceptor appending `Authorization: Bearer <token>` from `localStorage.getItem('profile')`.

### Endpoint Mapping Reference
| API File | Method | Endpoint | Description |
|---|---|---|---|
| `AuthRequest.js` | POST | `/auth/login` | Authenticate existing user |
| `AuthRequest.js` | POST | `/auth/register` | Register new user account |
| `UserRequest.js` | GET | `/user` | Fetch all registered users |
| `UserRequest.js` | GET | `/user/:id` | Fetch specific user profile details |
| `UserRequest.js` | PUT | `/user/:id` | Update profile information & pictures |
| `UserRequest.js` | PUT | `/user/:id/follow` | Follow a user |
| `UserRequest.js` | PUT | `/user/:id/unfollow` | Unfollow a user |
| `PostRequest.js` | GET | `/post/:id/timeline` | Get user & followed users feed |
| `PostRequest.js` | PUT | `/post/:id/like_dislike` | Like or remove like from post |
| `PostRequest.js` | PUT | `/post/:id/comment` | Add comment to post |
| `PostRequest.js` | DELETE | `/post/:id` | Delete post by ID |
| `UploadRequest.js` | GET | `/post/imagekit/auth` | Retrieve ImageKit auth credentials |
| `UploadRequest.js` | POST | `/post` | Create new post record |
| `UploadRequest.js` | POST | `/upload/` | Upload static file to server storage |
| `NotificationRequest.js` | GET | `/notification/:userId` | Get user notifications list |
| `NotificationRequest.js` | PUT | `/notification/:id/read` | Mark individual notification as read |
| `NotificationRequest.js` | PUT | `/notification/:userId/read-all` | Mark all notifications as read |
| `MessageRequest.js` | GET | `/conversation/:userId` | Fetch user conversations |
| `MessageRequest.js` | POST | `/conversation` | Start or retrieve conversation |
| `MessageRequest.js` | GET | `/message/:conversationId` | Fetch messages in conversation |
| `MessageRequest.js` | POST | `/message` | Send a new message |
| `MessageRequest.js` | PUT | `/message/:conversationId/read` | Mark conversation messages as read |

---

## 9. Coding Standards & Conventions

1. **Component Design**:
   - Write modern React functional components with JSX extension (`.jsx`).
   - Keep components modular, self-contained, and accompanied by their matching CSS file (e.g. `ComponentName.jsx` + `ComponentName.css`).
2. **State & Effects**:
   - Use `useSelector` and `useDispatch` for global state.
   - Always clean up event listeners and socket subscriptions in `useEffect` return functions.
3. **Form Handling**:
   - Provide explicit input `name` attributes, controlled component bindings or `useRef` for text areas.
   - Clean reset handlers for media upload inputs.
4. **Code Formatting**:
   - Follow root `.editorconfig` (2 spaces indentation, LF line endings, UTF-8).
   - Comply with Prettier standards (single quotes, semicolons, trailing commas in ES5).

---

## 10. Development Recipes & Workflows

### Recipe: Adding a New Page
1. Create new folder in `client/src/Pages/myNewPage/`.
2. Create `MyNewPage.jsx` and `MyNewPage.css`.
3. Register the route in `client/src/App.jsx` under `<Routes>` with auth protection check (`user ? <MyNewPage /> : <Navigate to='../auth' />`).
4. Add navigation icon or link in `client/src/Components/RightSide/RightSide.jsx`.

### Recipe: Adding a Redux State Slice
1. Define action types in corresponding `actions/` file.
2. Implement async thunk using API function and `dispatch({ type, data })`.
3. Handle new action types in `reducers/` updating immutable state.
4. Export updated reducer through `reducers/index.jsx`.

### Recipe: Adding a New Socket Event
1. Identify the event name emitted by backend `socket.io`.
2. In the target component, consume socket using `const { socket } = useSocket();`.
3. In a `useEffect` hook:
   ```javascript
   useEffect(() => {
     if (!socket) return;
     const handler = (data) => { /* handle data */ };
     socket.on('eventName', handler);
     return () => socket.off('eventName', handler);
   }, [socket]);
   ```
