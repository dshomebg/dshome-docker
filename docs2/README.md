# Инструкции за разработка на модули - DSHome E-Commerce

Тази папка съдържа подробни инструкции за разработка на всеки модул от платформата.

## Структура на документите

Всеки модул има собствен `.md` файл с пълни инструкции за имплементация.

## Налични инструкции

### Catalog Module
- [ ] `PRODUCTS.md` - Products CRUD (най-сложен модул)
- [ ] `FACETED-NAVIGATION.md` - Филтри за категории и търсене
- [ ] `CATALOG-SETTINGS.md` - Настройки на каталога

### Sales Module
- [ ] `ORDERS.md` - Управление на поръчки
- [ ] `CUSTOMERS.md` - Управление на клиенти
- [ ] `COURIERS.md` - Куриери и офиси
- [ ] `ORDER-STATUSES.md` - Статуси на поръчки

### Modules
- [ ] `REVIEWS-QUESTIONS.md` - Отзиви и въпроси
- [ ] `SEO-MODULE.md` - SEO инструменти
- [ ] `DISPLAY-HOOKS.md` - Display hooks система

### Settings & Tools
- [ ] `GENERAL-SETTINGS.md` - Общи настройки
- [ ] `IMAGE-SETTINGS.md` - Настройки за снимки
- [ ] `SHIPPING-CALCULATOR.md` - Калкулатор за доставка

## Формат на инструкциите

Всеки файл съдържа:

1. **Общ преглед** - Какво прави модула
2. **Database Schema** - Таблици и релации
3. **Backend API** - Endpoints и логика
4. **Frontend/Admin UI** - Компоненти и user flow
5. **Бизнес логика** - Специфични правила
6. **Валидации** - Какво трябва да се валидира
7. **Edge cases** - Специални случаи
8. **Testing** - Какво трябва да се тества

## Как да използваш инструкциите

1. Прочети целия файл за модула
2. Започни с Backend (Database + API)
3. Тествай API endpoints
4. Имплементирай Frontend/Admin UI
5. Тествай end-to-end

## Приоритети

### High Priority (Започни от тук)
1. **PRODUCTS.md** - Основен модул, зависимост за много други
2. **ORDERS.md** - Критичен за e-commerce функционалност
3. **CUSTOMERS.md** - Нужен за Orders

### Medium Priority
4. **COURIERS.md** - Нужен за Orders
5. **ORDER-STATUSES.md** - Нужен за Orders
6. **FACETED-NAVIGATION.md** - Важен за UX

### Lower Priority
7. Останалите модули

---

**Създадено:** 2025-11-10
**Статус:** В процес на документиране
