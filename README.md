# acadabay API

## Environment variables
	PORT
	DB_HOST
	DB_NAME
	DB_USER
	DB_PASSWORD
	JWT_SECRET
	SENDGRID_API_KEY

## Setting up environment

#### 1. **Create a ```.env``` file in the root of the project folder containing the environment variables in the format below**

	<ENVIRONMENT_VARIABLE>=<value>

	Examples:

	PORT=4000
	DB_NAME=<Mysql database name>
	DB_HOST=<Mysql database host>
	JWT_SECRET=<some-super-secret-hash>

#### 2. **Install global dependencies**
*	```$ npm install -g yarn nodemon pm2```

#### 3. **Install local project dependencies**
* 	```$ yarn ```

## yarn scripts
* ```$ yarn dev``` - **Start the local development server**

* ```$ yarn start``` - **Start production server**
* ```$ yarn restart``` - **Restart production server**
* ```$ yarn stop``` - **Stop production server**

* ```$ yarn lint``` - **Show lint errors**
* ```$ yarn fix-lint``` - **Fix all lint errors**
* ```$ yarn test``` - **Run All tests**
* ```$ yarn test--unit``` - **Run unit tests**
* ```$ yarn test--integration``` - **Run integration tests**


## Server status check

A GET request to ``` https://<SERVER_URL>/ ``` should return :
```{ success: true, message: "acadabay API" }```


## API Documentation [Swagger]

``` https://<SERVER_URL>/documentation ```