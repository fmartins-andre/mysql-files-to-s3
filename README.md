# mysql-files-to-firebase-str

A app/microservice to upload mysql blobs/files to google firebase storage and get its individual links and save the results objecto to MongoDB Atlas.

## How to install

- `git clone ...`
- `yarn install`

#### Dependencies

- `mysql2`
- `xhr2`
- `firebase-admin`
- `firebase`
- `@firebase/app-types"`
- `node-gzip`
- `zlib`
- `mongodb`
- `crypto-js`

It already needs some other dependencies installed on the server/container

- `libreoffice-writer`: Version 6 or above, to convert the files;
- `default-jre`: Needed by LibreOffice;
- `ttf-liberation`: Fonts to assure compatibility.

## How it works

Just run it with a JSON configuration file and it's done!

#### Configuration file

```
{
  "crypto_key": "KbPpimb@N4caximb0c49y$B&E)HcQWnZ",
  "mysql": {
    "query": "SELECT 'HELLO WORD'",
    "connectionParameters": {
      "host": "myhost",
      "port": "3306",
      "database": "mydatabase",
      "user": "myusername",
      "password": "mypassword"
    }
  },
  "mongo": {
    "db": "my_db",
    "collection": "my_collection",
    "connectionParameters": {
      "uri": "mongodb+srv://myusername:mypassword@...",
      "options": {
        "useNewUrlParser": true,
        "useUnifiedTopology": true
      }
    }
  },
  "firebaseConfig": {
    "apiKey": "AIza...",
    "authDomain": "myproject...",
    "databaseURL": "https://myproject...",
    "projectId": "",
    "storageBucket": "myproject...",
    "messagingSenderId": "583...",
    "appId": "1:583826...",
    "measurementId": "G-LR...",
    "defaultPrefix": "my_files_folder",
    "fileRetention": 0
  },
  "firebaseServiceAccount": {
    "type": "service_account",
    "project_id": "myproject",
    "private_key_id": "55bc766dcd34...",
    "private_key": ...,
    "client_email": "firebase-adminsdk...",
    "client_id": "1129...",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/..."
  }
}

```

- Section `crypto_key`: Secret key to be used do salt or cypher a message;
- Section `mysql`: All the configurations related to MySQL, including the select statement;
- Section `mongo`: All the connection parameters to the MongoDB Cloud instance;
- Section `firebaseConfig`: All the parameters to work with Google Firebase. Get it from Firebase Config Panel;
  - `defaultPrefix`: Firebase Storage folder to be used. It needs to be added manually here;
  - `fileRetention`: when the local reference to the file is lost (no longer needed), how many days the file needs to be available on cloud.
- Section `firebaseServiceAccount`: settings to authenticate Firebase. Get it from Firebase Config Panel.

You can pass a configuration file path as argument to the script. If called with no arguments, the script will try to load a file named `config.json` from it's same folder.

#### How to run it

- `yarn start`: it'll load the default configuration file path.
- `yarn start path/to/my/config.json`: it'll load the given file.

#### Docker

1. Build: `docker build -t mysql-files-to-firebase-str .`
2. Run: `docker run --rm --mount type=bind,source="$(pwd)"/src/config.json,target=/app/src/config.json,readonly --mount type=bind,source="$(pwd)"/files,target=/app/files mysql-files-to-firebase-str`

###### Notes

- Give the container a name at the build time (`-t mysql-files-to-firebase-str`), it will make things easier to run afterwards.
- Mount the configuration file at the run time (`type=bind,source="$(pwd)"/src/config.json,target=/app/src/config.json,readonly`) to make it work:
  - On Linux or MacOS, the `$(pwd)` variable will expand to the current directory;
  - Mount the configuration file to the default configuration path `/app/src/config.json`.
  - You can pass a configuration path as argument, but you need to be sure you mounted the configuration file that matches this path.

## Scope

This app will:

0. log every step to stdout;
1. load a configuration file;
2. get data from a MySQL database;
3. clean up the data;
4. save the data as RTF files;
5. convert the RTF files to PDF;
6. remove the RTF files;
7. upload the PDF files to Firebase Storage;
8. remove the PDF files;
9. remove non needed files from Firebase Storage;
10. save the results in the MongoDB Cloud instance.

Nothing more, nothing less.

## Why?

I need something exactly like this to make some files available to download in a programmatic manner.
The MonoDB part is a particular requisite cause the service that use these files already works wit MongoDB Cloud, so, it easier to me make it this way.
