import { Component, inject, runInInjectionContext } from '@angular/core';
import { InputComponent } from '../../components';
import { Store } from '@ngxs/store';
import { UserActions, UserState } from '../../store';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Nullable } from '../../types';

interface LoginForm {
  email: FormControl<Nullable<string>>;
  password: FormControl<Nullable<string>>;
}

interface LoginFormValues {
  email: Nullable<string>;
  password: Nullable<string>;
}

@Component({
  selector: 'app-login',
  imports: [InputComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly _store: Store = inject(Store);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  protected readonly form: FormGroup<LoginForm> = this._formBuilder.group({
    email: this._formBuilder.control<Nullable<string>>(null),
    password: this._formBuilder.control<Nullable<string>>(null),
  });

  protected login() {
    const { email, password }: LoginFormValues = this.form.getRawValue();
    if (!email || !password) return;
    this._store.dispatch(new UserActions.Login({ email, password }));
  }
}
