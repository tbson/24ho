# 24HOrder service

## For development environment

### Step 1

Issue a selfsign SSL certificate: use [https://github.com/tbson/localca](https://github.com/tbson/localca) to create one.

### Step 2

Copy all files to `nginx/ssl/app_name` 
Copy all files to `client/ssl` 

Add `- ../../web/24ho/api/public/:/resource/public/24ho` to `volumes` of `nginx` if not exist.

### Step 3

```
./setup app_name domain.test dev
docker-compose build
./up
```

### Step 4

Prepare accounts for logging
```
./exec_api python manage.py collectstatic
./exec_api python manage.py createsuperuser
```

Then go to django admin interface: [https://24ho.test/dadmin/](https://24ho.test/dadmin/)

- Create new user in `Users` section and give this user all permissions.
- Add an administrator in `Administrators` section using newly created user.
- Login: [https://24ho.test/admin/](https://24ho.test/admin/)

## For production environment

### Step 1

Issue a SSL for `domain.com` using Let’s Encrypt.

### Step 2

Add `- /etc/letsencrypt:/resource/ssl` to `volumes` of `nginx` if not exist.

### Step 3

```
./setup app_name domain.com pro
docker-compose build
```
Place `db.sql` file in `docker` folder

Uncomment `# - ./db.sql:/docker-entrypoint-initdb.d/db.sql`

```
./up -d
```
