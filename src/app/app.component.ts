import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FruitListComponent } from './components/fruit-list/fruit-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FruitListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
