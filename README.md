# PLATFORM
# Setup

1. Get the latest code

2. Do `npm install`

3. Create a new postgres database 

4. Make a copy of the knexfile

```
cp knexfile.js.sample knexfile.js
```

5. Edit `knexfile.js` as needed

6. Make a copy of .env.sample and edit as needed

```
cp .env.sample .env
```

7. Run the initial migration

```
./node_modules/knex/bin/cli.js migrate:latest
```

8. Run the seed

```
./node_modules/knex/bin/cli.js seed:run
```
