import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movie {
  title: string;
  year: number;
  actors: string[];
}

export interface Recommendation {
  title: string;
  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';
  getMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/movies`);
  }

  getActors(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/actors`);
  }

  getRecommendations(actorName: string): Observable<Recommendation[]> {
    const encodedName = encodeURIComponent(actorName);
    return this.http.get<Recommendation[]>(
      `${this.apiUrl}/recommendations/${encodedName}`
    );
  }

  addActor(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/actors`, { name });
  }

  addMovie(title: string, year: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/movies`, { title, year });
  }

  addRelationship(actorName: string, movieTitle: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/relationships`, {
      actorName,
      movieTitle,
    });
  }
}
