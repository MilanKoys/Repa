import { inject, Injectable } from '@angular/core';
import { State, Action, StateContext, StateToken } from '@ngxs/store';
import { UserActions } from './user.actions';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Nullable } from '../../types';

export interface UserStateModel {
  token: Nullable<string>;
}

const defaults: UserStateModel = {
  token: null,
};

export const userStateToken = new StateToken<UserStateModel[]>('user');

@State<UserStateModel>({
  name: userStateToken,
  defaults,
})
@Injectable()
export class UserState {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  @Action(UserActions.Reset)
  reset({ patchState }: StateContext<UserStateModel>) {
    return patchState(defaults);
  }

  @Action(UserActions.Login)
  login(
    { patchState }: StateContext<UserStateModel>,
    payload: UserActions.Login
  ) {
    return this._httpClient
      .post('http://localhost:3000/auth/login', payload)
      .pipe(tap((token) => patchState(token)));
  }
}
