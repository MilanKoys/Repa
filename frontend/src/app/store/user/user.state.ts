import { inject, Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
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

@State<UserStateModel>({
  name: 'user',
  defaults,
})
@Injectable()
export class UserState {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  @Action(UserActions.Reset)
  reset({ patchState }: StateContext<UserStateModel>) {
    patchState(defaults);
  }

  @Action(UserActions.Login)
  login(
    { patchState }: StateContext<UserStateModel>,
    payload: UserActions.Login
  ) {
    this._httpClient
      .post('login', payload)
      .pipe(tap((token) => patchState(token)));
  }
}
