This is a ExpressJS project bootstrapped with [`npx express-generator`](https://expressjs.com/en/starter/generator.html).

## Getting Started

First, run the development server:

```bash
npm start
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.


## How to run Locally

1. Clone the repository from the github repo
2. Run `npm install` to install the dependencies
3. Run `npm start` to start the development server
4. Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.
5. you need to setup .env file in root directory of the project. taht incude database connection string and other 
api keys.
```bash
  PG_USER=
  PG_HOST=
  PG_DATABASE=
  PG_PASSWORD=
  PG_PORT=
  AGENT_API_KEY=
```
5. for testing api you can use postman or curl or any other api testing tool.
6. example api endoint path is http://localhost:3001/users/process-portfolio
  this require a body with portfolio url and after successfull upload you will see the profile details of the user from portfolio url or as response.



## Intro to project how to retrieve structured data from the portfolio site 
  it works in 3 steps 
  ```bash
1. Get Html Context from portfolio URL

2. From Html Context parse data into information like name, skill etc in JSON format

3. Save Parse data into sql Database
```

## Detail About 
### 1. Get Html Context from portfolio URL
  for scrapping htmlContext we use puppetter package to open url in closed browser and get body context from the html page after success loading of the web page.
  so it will return htmlcontext

### 2. Parse HtmlContext to Information
  for this i used LLM (google apis), that accepts htmlContext and prompt, after process it will return the Json format.

  ```bash
  const prompt = `Extract all relevant user data from the following portfolio web page HTML. Always return ONLY a clean, valid JSON object in the EXACT format below. If any value is missing, set it to null (for objects/strings) or [] (for arrays). Do not include markdown, code blocks, or any extra text. If you cannot extract the data, return null or empty arrays as appropriate.

  Return in this format:
  {
    "name": "",
    "title": "",
    "contact": {
      "email": "",
      "phone": "",
      "linkedin": ""
    },
    "skills": [
    ],
    "experience": {
      "years": "0",
      "details": "",
      "clients": [
      ]
    },
    "testimonials": [
      {
      }
    ],
    "additional_info": [
    ]
  }

  HTML:\n${htmlText}`;
  ```
  we can update the prompt for more information also.

### 3. Save Information (JSON Data ) into db
  for saving JSON data we used sql Database to store informaation into sql table.
  for basic info we created only 2 table user and testimonials.
  following are the table structure. 
  relation between user and testimonials is hasmany (user has many testimonials).

  ```bash
  CREATE TABLE "testimonials" (
    "id" SERIAL,
    "user_id" INTEGER NOT NULL,
    "author" VARCHAR(250) NULL,
    "text" TEXT NULL,
    CONSTRAINT "PK_testimonials" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" SERIAL,
    "name" VARCHAR(250) NULL,
    "title" VARCHAR(250) NOT NULL,
    "email" VARCHAR(250) NULL,
    "mobile" CHARACTER(20) NULL,
    "portfolio_link" VARCHAR(250) NULL,
    "skill_summary" TEXT NULL,
    "experience_years" TEXT NULL,
    "experience_details" TEXT NULL,
    "experience_clients" TEXT NULL,
    "additional_info" TEXT NULL,
    CONSTRAINT "PK_users" PRIMARY KEY ("id")
);
```

Thats it.
note: for actual implementation we have to scale and manage or introduce job kind of system also.


Thanks





