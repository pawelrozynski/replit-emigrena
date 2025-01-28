# Instrukcje wdrożeniowe aplikacji eMigrena

## 1. Konfiguracja bazy danych (Supabase)

1. Utwórz konto na Supabase (https://supabase.com)
2. Utwórz nowy projekt:
   - Nazwa: emigrena-prod
   - Region: wybierz najbliższy (np. Frankfurt)
   - Plan: Free tier
3. Po utworzeniu projektu:
   - Zapisz `Database URL` z zakładki Settings > Database
   - Zapisz `anon` i `service_role` keys z zakładki Settings > API

## 2. Konfiguracja DNS dla subdomeny

1. Zaloguj się do panelu zarządzania domeną pawelrozynski.com
2. Dodaj nowy rekord CNAME:
   - Name: dobrostan
   - Value: [nazwa-twojego-projektu].netlify.app
   - TTL: 3600 (lub Auto)

## 3. Konfiguracja Netlify

1. Połącz repozytorium GitHub:
   - Zaloguj się do Netlify
   - New site from Git > GitHub > Wybierz repozytorium replit-emigrena

2. Skonfiguruj ustawienia:
   - Build command: `npm run build`
   - Publish directory: `dist/public`

3. Dodaj zmienne środowiskowe w Settings > Environment variables:
   ```
   DATABASE_URL=[URL z Supabase]
   SENDGRID_API_KEY=[obecny klucz]
   ```

4. Skonfiguruj subdomenę:
   - W Domain settings > Add custom domain
   - Wpisz: dobrostan.pawelrozynski.com
   - Poczekaj na weryfikację DNS (może potrwać do 24h)

## 4. Weryfikacja wdrożenia

1. Sprawdź czy strona działa pod adresem dobrostan.pawelrozynski.com
2. Przetestuj:
   - Logowanie/rejestrację
   - Dodawanie wpisów
   - Panel admina
   - Eksport dokumentacji

## 5. Monitoring i utrzymanie

1. Monitoruj logi w Netlify (Deploys > Deploy log)
2. Sprawdzaj użycie bazy danych w Supabase
3. Monitoruj wysyłkę maili w SendGrid

## Uwagi bezpieczeństwa

1. Nie commituj zmiennych środowiskowych do repozytorium
2. Regularnie rotuj klucze API (po fazie testów)
3. Włącz automatyczne kopie zapasowe w Supabase

Czy chcesz, żebym szczegółowo opisał któryś z tych kroków?
