# Documentation Guide

**Кога кой файл да четеш.**

## 🆕 Нов компютър / Първоначален Setup

### SETUP-NEW-COMPUTER.md
**Чети при:** Настройка на нов компютър, home/work машина, copy на проекта

**Съдържа:**
- Пълна стъпка-по-стъпка инструкция за setup
- Инсталация на всички dependencies (Git, Node.js, Docker)
- Docker Desktop конфигурация и оптимизация
- Клониране и стартиране на проекта
- Database setup и migrations
- Troubleshooting за чести проблеми
- Ежедневен workflow
- Полезни команди

**Пример:**
- "Прибрах се в къщи, искам да setup-на проекта на home компютър"
- "Нов laptop, трябва да setup-на всичко от нула"
- "Колега иска да join-не проекта"
- "Искам да копирам проекта в нова папка"

---

## Винаги Чети в Началото

### 1. ARCHITECTURE.md
**Чети при:** Всяка нова задача

**Съдържа:**
- URLs и портове (production/dev)
- Server access (SSH, passwords)
- Database connections
- API endpoints списък
- Структура на проекта
- Deployment команди

**Пример:** "Ще добавям нов модул" → Чети за структура, portове, DB tables

---

### 2. RULES.md
**Чети при:** Всяка нова задача

**Съдържа:**
- Строги правила които НИКОГА не се нарушават
- Production backend е на порт 3000, НЕ 4000
- НИКОГА не измисляй URLs
- Винаги проверявай миграциите
- Drizzle count() правилен pattern
- Schema sync последователност

**Пример:** "Правя промяна в schema" → Провери правилата за schema changes

---

## Чети Само Когато Трябва

### 3. COMMON_ISSUES.md
**Чети при:** Грешка или нещо не работи

**Съдържа:**
- Migration problems (не се apply-ват, schema mismatch)
- Count query errors
- Nginx 404/502 errors
- Docker deployment issues
- NOT NULL constraint violations
- Quick diagnostics checklist

**Пример:**
- "Грешка при fetch brands" → Чети Count query errors
- "404 на /admin/" → Чети Nginx issues
- "Migration не работи" → Чети Migration problems

---

### 4. WORKFLOWS.md
**Чети при:** Специфична задача

**Съдържа:**
- Deploy to Production
- Database Schema Change
- Rollback Deployment
- Fix Schema Mismatch
- Add New Endpoint
- Update Nginx Config
- Clear and Rebuild Everything
- Database Backup/Restore

**Пример:**
- "Трябва да deploy-на" → Чети Deploy to Production
- "Добавям колона" → Чети Database Schema Change
- "Нов endpoint" → Чети Add New Endpoint

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────┐
│                    ЗАПОЧВАШ ЗАДАЧА?                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  1. Чети ARCHITECTURE.md   │
              │  2. Чети RULES.md          │
              └────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
     ┌──────────────────┐   ┌──────────────────┐
     │  Има грешка?     │   │  Специфична      │
     │                  │   │  задача?         │
     └──────────────────┘   └──────────────────┘
                │                     │
                ▼                     ▼
     ┌──────────────────┐   ┌──────────────────┐
     │ COMMON_ISSUES.md │   │  WORKFLOWS.md    │
     └──────────────────┘   └──────────────────┘
```

---

## Примери

### Пример 1: Нов модул "Coupons"
```
1. Чети ARCHITECTURE.md
   - Виждам структура на DB tables
   - Виждам API endpoints pattern
   - Виждам connection strings

2. Чети RULES.md
   - Schema change правила
   - Count query pattern
   - Controller pattern

3. Започвам работа
   - Създавам schema
   - Създавам controller
   - Създавам routes

4. Ако има грешка → Чети COMMON_ISSUES.md

5. Deploy → Чети WORKFLOWS.md секция "Deploy to Production"
```

### Пример 2: Fix грешка "Cannot read properties of undefined (reading 'count')"
```
1. Чети COMMON_ISSUES.md
   - Намирам "Count Query Errors"
   - Следвам решението

2. Ако не съм сигурен в правилата → Чети RULES.md
   - Drizzle count query pattern

3. Правя промяната

4. Deploy → Чети WORKFLOWS.md секция "Deploy to Production"
```

### Пример 3: Deploy нова версия
```
1. Чети WORKFLOWS.md
   - "Deploy to Production" секция
   - Следвам стъпките точно

2. Ако има проблем след deploy → Чети COMMON_ISSUES.md
   - Docker issues
   - Database connection issues

3. Ако трябва rollback → Чети WORKFLOWS.md
   - "Rollback Deployment" секция
```

---

## Важно

**НЕ четеш цялата документация всеки път.**

**Четеш:**
- ARCHITECTURE + RULES → Винаги в началото
- COMMON_ISSUES → Само при грешка
- WORKFLOWS → Само конкретната секция за задачата

**Цел:** Бързо намираш точната информация без да четеш ненужни неща.

---

**Актуализирано:** 2025-11-11
