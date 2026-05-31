let profilePhotoUri: string | null = null;
let userName: string | null = null;
let authToken: string | null = null;

export function setProfilePhotoUri(uri: string | null) {
  profilePhotoUri = uri;
}

export function getProfilePhotoUri() {
  return profilePhotoUri;
}

export function setUserName(name: string | null) {
  userName = name;
}

export function getUserName() {
  return userName;
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}
