# Instrukcje wdrożeniowe aplikacji eMigrena

## 1. Konfiguracja bazy danych (Supabase)
✅ Wykonane:
- Utworzono bazę danych: emigrena-prod
- Database URL: postgresql://postgres:Migrena2025PL@db.xmaeareywhvnguiduhho.supabase.co:5432/postgres

## 2. Konfiguracja DNS dla subdomeny
✅ Wykonane:
- Dodano rekord CNAME dla dobrostan.pawelrozynski.com

## 3. Konfiguracja Netlify
Do wykonania:
1. Połącz repozytorium GitHub:
   - Zaloguj się do Netlify
   - New site from Git > GitHub > Wybierz repozytorium replit-emigrena

2. Skonfiguruj ustawienia:
   - Build command: `npm run build`
   - Publish directory: `dist/public`

3. Dodaj zmienne środowiskowe w Settings > Environment variables:
   ```
   DATABASE_URL=postgresql://postgres:Migrena2025PL@db.xmaeareywhvnguiduhho.supabase.co:5432/postgres
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