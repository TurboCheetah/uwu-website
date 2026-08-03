export interface AuthFeedback {
  kind: "success" | "error";
  title: string;
  description: string;
}

export function getAuthFeedback(status: number): AuthFeedback {
  switch (status) {
    case 200:
      return {
        kind: "success",
        title: "Authorized",
        description: "Your invite code has been validated",
      };
    case 400:
      return {
        kind: "error",
        title: "Invite code required",
        description: "Enter an invite code and try again",
      };
    case 401:
      return {
        kind: "error",
        title: "Invalid invite code",
        description: "Please check your invite code and try again",
      };
    case 503:
      return {
        kind: "error",
        title: "Invite service unavailable",
        description: "Please try again later",
      };
    default:
      return {
        kind: "error",
        title: "Something went wrong",
        description: "Please try again later",
      };
  }
}
