import { NavigationService } from "../services/navigation.js";

const navigationService: NavigationService = NavigationService.inject();

const outlet: null | HTMLElement = document.querySelector("#outlet");

if (outlet) navigationService.register(outlet);
