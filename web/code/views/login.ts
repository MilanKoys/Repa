import type { InputTextComponent } from "../components/input-text/input-text.js";
import { AuthentificationService } from "../services/authentification.js";

type InputTextSelector = null | InputTextComponent;
type ButtonSelector = null | HTMLButtonElement;

const SIGN_IN_REDIRECT: string = "/";

const INVALID_ATTRIBUTE: string = "invalid";

const CHANGE_EVENT: string = "change";
const CLICK_EVENT: string = "click";

const authService: AuthentificationService = AuthentificationService.inject();

const session = await authService.loadSession();

if (session) location.href = SIGN_IN_REDIRECT;

const emailElement: InputTextSelector = document.querySelector("#email");
const passwordElement: InputTextSelector = document.querySelector("#password");
const submitElement: ButtonSelector = document.querySelector("#submit");
const loadingElement: ButtonSelector = document.querySelector("#loading");
const errorElement: ButtonSelector = document.querySelector("#error");

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

function toggleLoading(loading: boolean) {
  if (loading) {
    if (loadingElement) loadingElement.classList.remove("hidden!");
  } else {
    if (loadingElement) loadingElement.classList.add("hidden!");
  }
}

function toggleError(toggle: boolean) {
  if (toggle) {
    if (errorElement) errorElement.classList.remove("hidden");
  } else {
    if (errorElement) errorElement.classList.add("hidden");
  }
}

function validateForm() {
  let error: boolean = false;

  if (emailElement) {
    emailElement.removeAttribute(INVALID_ATTRIBUTE);
    if (emailElement.validationMessage) error = true;

    if (!email.length) {
      emailElement.setAttribute(INVALID_ATTRIBUTE, "Email is required");
      error = true;
    }
  }

  if (passwordElement) {
    passwordElement.removeAttribute(INVALID_ATTRIBUTE);

    if (!password.length) {
      passwordElement.setAttribute(INVALID_ATTRIBUTE, "Password is required");
      error = true;
    }
  }

  return error;
}

if (submitElement) {
  submitElement.addEventListener(CLICK_EVENT, () => {
    toggleLoading(true);
    toggleError(false);

    if (validateForm()) {
      toggleLoading(false);
      return;
    }

    authService
      .login(email, password)
      .then((response) => {
        toggleLoading(false);
        location.href = SIGN_IN_REDIRECT;
      })
      .catch((error) => {
        if (error) {
          toggleLoading(false);
          toggleError(true);
        }
      });
  });
}
