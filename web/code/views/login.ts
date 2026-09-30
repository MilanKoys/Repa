const emailElement = document.querySelector("#email");
const passwordElement = document.querySelector("#password");
const submitElement = document.querySelector("#submit");

const API_SIGN_IN_ENDPOINT: string = "/auth/login";
const API_URL: string = "http://localhost:4200";
const POST_METHOD: string = "POST";

const INVALID_ATTRIBUTE: string = "invalid";

const CHANGE_EVENT: string = "change";
const CLICK_EVENT: string = "click";

let email: string = "";
let password: string = "";

bindDetail(emailElement, (value) => (email = value));
bindDetail(passwordElement, (value) => (password = value));

async function bindDetail(
  element: Element | null,
  callback: (value: string) => void,
) {
  if (element) {
    element.addEventListener(CHANGE_EVENT, (event: Event) => {
      const customEvent: CustomEvent = event as CustomEvent;
      callback(customEvent.detail);
    });
  }
}

if (submitElement) {
  submitElement.addEventListener(CLICK_EVENT, () => {
    if (emailElement) {
      emailElement.removeAttribute(INVALID_ATTRIBUTE);

      if (!email.length) {
        emailElement.setAttribute(INVALID_ATTRIBUTE, "Email is required");
      }
    }

    if (passwordElement) {
      passwordElement.removeAttribute(INVALID_ATTRIBUTE);

      if (!password.length) {
        passwordElement.setAttribute(INVALID_ATTRIBUTE, "Password is required");
      }
    }

    fetch(`${API_URL}${API_SIGN_IN_ENDPOINT}`, {
      method: POST_METHOD,
      body: JSON.stringify({ email, password }),
    })
      .then((rawResponse) => rawResponse.json())
      .then((response) => {
        console.log(response);
      });
  });
}
