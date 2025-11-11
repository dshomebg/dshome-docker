Когато се прибереш в къщи:
Опция 1: Clone в нова папка (препоръчвам)
# 1. Отвори PowerShell или Git Bash
# 2. Навигирай където искаш проекта
cd E:\  # или C:\Projects\ или където искаш

# 3. Clone repo
git clone https://github.com/dshomebg/dshome-docker.git

# 4. Влез в папката
cd dshome-docker

# 5. Следвай SETUP-NEW-COMPUTER.md стъпка по стъпка
# Файлът е в: newdocs/SETUP-NEW-COMPUTER.md
Опция 2: Copy на съществуващата папка
# 1. Copy цялата папка E:\001-DS-DOCKER\dshome-docker на USB/Network drive
# 2. На home компютър paste-ни я където искаш
# 3. Влез в папката
cd <новата-локация>/dshome-docker

# 4. Уверi се че Docker Desktop е инсталиран и работи
# 5. Стартирай:
docker compose -f docker/docker-compose.dev.yml up -d
📖 Кратка версия за home setup:
Инсталирай (ако нямаш):
Git
Node.js 20.x
Docker Desktop
Clone проекта:
git clone https://github.com/dshomebg/dshome-docker.git
cd dshome-docker
Стартирай Docker:
docker compose -f docker/docker-compose.dev.yml up -d --build
Setup database:
cd packages/backend
npx drizzle-kit push:pg
Тествай:
Backend: http://localhost:4000/api/health
Admin: http://localhost:3001/admin
Детайлите са в newdocs/SETUP-NEW-COMPUTER.md!
🎊 Успех с home setup-а! Ако имаш проблеми, провери troubleshooting секцията в SETUP-NEW-COMPUTER.md или COMMON_ISSUES.md!