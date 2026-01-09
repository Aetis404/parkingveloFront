import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient) {}

  testApi() {
    return this.http.get('https://jsonplaceholder.typicode.com/posts/1');
  }
}
