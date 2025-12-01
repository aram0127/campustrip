export const getToken = () => {
  return (
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
  );
};

export const getRefreshToken = () => {
  return (
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken")
  );
};

export const setTokens = (
  accessToken: string,
  refreshToken: string,
  remember: boolean
) => {
  // 기존에 저장된 토큰이 있다면 꼬이지 않게 삭제
  removeTokens();

  if (remember) {
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    sessionStorage.setItem("authToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
  }
};

export const updateTokens = (accessToken: string, refreshToken: string) => {
  // 현재 토큰이 저장된 위치를 파악하여 그곳의 값을 갱신 (인터셉터용)
  if (localStorage.getItem("refreshToken")) {
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    sessionStorage.setItem("authToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
  }
};

export const removeTokens = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("refreshToken");
};
