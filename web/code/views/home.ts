import { AuthentificationService, Role } from "../services/authentification.js";
import { NavigationService } from "../services/navigation.js";

const TEACHER_DEDFAULT_ROUTE: string = "review-queue";
const STUDENT_DEDFAULT_ROUTE: string = "home";

const navigationService: NavigationService = NavigationService.inject();
const authService: AuthentificationService = AuthentificationService.inject();

const userProfile = await authService.loadUserProfile();

const outlet: null | HTMLElement = document.querySelector("#outlet");

if (outlet) navigationService.register(outlet);

if (userProfile) {
  switch (userProfile.role) {
    case Role.Teacher:
      navigationService.navigate(TEACHER_DEDFAULT_ROUTE);
      break;
    case Role.Student:
      navigationService.navigate(STUDENT_DEDFAULT_ROUTE);
      break;
  }
}
