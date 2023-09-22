import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Weather } from './weather.model';
import { GetAll, List } from './get-all.model';
import { CardDataService } from '../card/card-data.service';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  constructor(private http: HttpClient, private cardData: CardDataService) {}

  apiKey = '8d9445cab37f8906d9588c8b9977dd08';
  lat = 0;
  lon = 0;

  getGeoLocationByCityName(cityName: string) {
    const geoLocatorUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${this.apiKey}`;
    this.http
      .get<{ lat: number; lon: number }[]>(geoLocatorUrl)
      .pipe(
        map((response) => {
          if (response.length > 0) {
            const { lat, lon } = response[0];
            return { lat, lon };
          } else {
            throw new Error('Nincs válasz a városra');
          }
        })
      )
      .subscribe((filteredData) => {
        this.lat = filteredData.lat;
        this.lon = filteredData.lon;
        this.getWeatherInformationByGeoData();
      });
  }

  getWeatherInformationByGeoData() {
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&appid=${this.apiKey}`;
    this.http
      .get<GetAll>(forecastUrl)
      .pipe(
        map((response) =>
          response.list
            .map((item: List) => ({
              dt_txt: item.dt_txt,
              temp: item.main.temp,
              humidity: item.main.humidity,
              weather: item.weather[0].main,
              windSpeed: item.wind.speed,
            }))
            .filter(
              (item: Weather) =>
                item.dt_txt.charAt(11) === '1' && item.dt_txt.charAt(12) === '2'
            )
        )
      )
      .subscribe((filteredResponse) => {
        this.cardData.setCardsData(filteredResponse);
      });
  }
}
