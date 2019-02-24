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

## For production environment

### Step 1

Issue a SSL for `domain.com` using Let’s Encrypt.

### Step 2

Add `- /etc/letsencrypt:/resource/ssl` to `volumes` of `nginx` if not exist.

### Step 3

```
./setup app_name domain.com pro
docker-compose build
./ -d
```
